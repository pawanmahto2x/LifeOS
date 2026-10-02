import { GoalRepository } from '../repositories/goal.repository';
import { NotFoundError } from '../utils/errors';
import { IGoalDocument } from '../models/goal.model';
import { IAIGoalPlan, IGoalReport } from '../types/goal.types';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { FocusSession } from '../models/focus-session.model';
import { ProviderFactory } from '../ai/provider.factory';
import { aiGoalPlanSchema } from '../ai/schemas/goal-plan.schema';
import { buildGoalPlannerPrompt } from '../ai/prompts/goal-planner.prompt';

export class GoalService {
  constructor(private goalRepository: GoalRepository = new GoalRepository()) {}

  private calculateProgress(milestones: any[]): number {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m) => Boolean(m.completed ?? m.isCompleted)).length;
    return Math.round((completed / milestones.length) * 100);
  }

  async create(userId: string, data: any): Promise<IGoalDocument> {
    data.userId = userId;
    if (data.milestones) {
      data.milestones = data.milestones.map((m: any, idx: number) => ({
        title: m.title,
        completed: Boolean(m.completed ?? m.isCompleted),
        order: m.order ?? idx,
      }));
    }
    data.progress = this.calculateProgress(data.milestones);
    return await this.goalRepository.create(data);
  }

  async findById(id: string, userId: string): Promise<IGoalDocument> {
    const goal = await this.goalRepository.findById(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');
    return goal;
  }

  async findAllByUser(userId: string): Promise<IGoalDocument[]> {
    return await this.goalRepository.findAllByUser(userId);
  }

  async update(id: string, userId: string, data: any): Promise<IGoalDocument> {
    const goal = await this.goalRepository.findById(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');

    if (data.milestones) {
      data.milestones = data.milestones.map((m: any, idx: number) => ({
        _id: m._id,
        title: m.title,
        completed: Boolean(m.completed ?? m.isCompleted),
        order: m.order ?? idx,
      }));
      data.progress = this.calculateProgress(data.milestones);
    }

    const updated = await this.goalRepository.update(id, userId, data);
    if (!updated) throw new NotFoundError('Goal not found');
    return updated;
  }

  async delete(id: string, userId: string): Promise<IGoalDocument> {
    const deleted = await this.goalRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError('Goal not found');
    return deleted;
  }

  private providerFactory = new ProviderFactory();

  async generateAIPlan(goalId: string, userId: string): Promise<IAIGoalPlan> {
    const goal = await this.findById(goalId, userId);

    try {
      const provider = await this.providerFactory.getProvider(userId);
      const { systemPrompt, userPrompt } = buildGoalPlannerPrompt({
        title: goal.title,
        description: goal.description,
        category: goal.category,
        deadline: goal.deadline,
      });

      let attempts = 0;
      let lastError: any = null;

      while (attempts < 2) {
        try {
          const rawOutput = await provider.generateStructured(userPrompt, systemPrompt);

          // Zod Validation
          const parsedPlan = aiGoalPlanSchema.parse(rawOutput);

          // Business Validation
          const milestoneCount = parsedPlan.milestones.length;
          const invalidTasks = parsedPlan.tasks.filter(
            (t) => t.milestoneIndex < 0 || t.milestoneIndex >= milestoneCount,
          );
          if (invalidTasks.length > 0) {
            throw new Error(
              `Business Validation Failed: Tasks reference invalid milestone indices.`,
            );
          }

          return parsedPlan;
        } catch (error: any) {
          lastError = error;
          attempts++;
        }
      }

      throw new Error(
        `Failed to generate a valid AI plan: ${lastError?.message || 'Unknown error'}`,
      );
    } catch (error: any) {
      if (error.name === 'AIConfigurationError') {
        throw new Error(
          'AI provider not configured. Please configure an AI provider in Settings to generate a plan.',
        );
      }
      throw error;
    }
  }

  async applyAIPlan(
    goalId: string,
    userId: string,
    acceptedPlan: IAIGoalPlan,
  ): Promise<IGoalDocument> {
    const goal = await this.findById(goalId, userId);

    // Business validation: Ensure all tasks reference valid milestone indices
    if (acceptedPlan.tasks && acceptedPlan.tasks.length > 0) {
      const milestoneCount = acceptedPlan.milestones.length;
      const invalidTasks = acceptedPlan.tasks.filter(
        (t) => t.milestoneIndex < 0 || t.milestoneIndex >= milestoneCount,
      );
      if (invalidTasks.length > 0) {
        throw new Error('Business Validation Failed: Tasks reference invalid milestone indices.');
      }
    }

    const newMilestones = acceptedPlan.milestones.map((title, index) => ({
      title,
      order: index,
      completed: false,
    }));

    goal.milestones = newMilestones as any;
    goal.progress = this.calculateProgress(goal.milestones);
    await goal.save();

    // Create tasks for accepted plan
    if (acceptedPlan.tasks && acceptedPlan.tasks.length > 0) {
      for (const taskData of acceptedPlan.tasks) {
        let milestoneId;
        if (
          taskData.milestoneIndex !== undefined &&
          taskData.milestoneIndex >= 0 &&
          taskData.milestoneIndex < goal.milestones.length
        ) {
          milestoneId = goal.milestones[taskData.milestoneIndex]._id;
        }
        await Task.create({
          userId,
          goalId: goal._id,
          milestoneId,
          title: taskData.title,
          category: goal.category
            ? goal.category.charAt(0).toUpperCase() + goal.category.slice(1)
            : 'Goals',
          status: 'Pending',
          priority: 'High',
          dueDate: goal.deadline,
        });
      }
    }

    // Create habits for accepted plan (1-3 habits)
    if (acceptedPlan.habits && acceptedPlan.habits.length > 0) {
      for (const habitData of acceptedPlan.habits) {
        await Habit.create({
          userId,
          goalId: goal._id,
          title: habitData.title,
          frequency: habitData.frequency === 'weekly' ? 'Weekly' : 'Daily',
          targetDays: habitData.frequency === 'weekly' ? 3 : 7,
        });
      }
    }

    return goal;
  }

  // LEGACY RULE-BASED IMPLEMENTATION: This currently uses threshold logic and is NOT genuine LLM output. Will be replaced in future phases.
  async generateGoalReport(goalId: string, userId: string): Promise<IGoalReport> {
    const goal = await this.findById(goalId, userId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tasksCount = await Task.countDocuments({
      userId,
      status: 'Completed',
      isDeleted: false,
      completedAt: { $gte: thirtyDaysAgo },
    });
    const habitsCount = await Habit.countDocuments({ userId, isDeleted: false, isActive: true });
    const focusSessions = await FocusSession.aggregate([
      { $match: { userId: goal.userId, completed: true, startedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, count: { $sum: 1 }, totalDuration: { $sum: '$duration' } } },
    ]);
    const focusCount = focusSessions[0]?.count || 0;

    const completedMilestones = goal.milestones.filter((m) => m.completed).length;
    const totalMilestones = goal.milestones.length;

    const report: IGoalReport = {
      goalId,
      progress: {
        previous: Math.max(0, goal.progress - 15),
        current: goal.progress,
      },
      completed: {
        tasks: tasksCount,
        habits: habitsCount,
        focusSessions: focusCount,
      },
      consistency: {
        coding: Math.min(100, focusCount * 6 + tasksCount * 2),
        focus: Math.min(100, focusCount * 8),
        general: Math.min(
          100,
          Math.round(
            (completedMilestones / Math.max(1, totalMilestones)) * 60 + (tasksCount > 0 ? 40 : 0),
          ),
        ),
      },
      obstacles:
        focusCount < 4
          ? `Based on your stored data, your momentum slowed during periods with fewer completed focus sessions (${focusCount} recorded this month). Consider scheduling dedicated deep-work blocks.`
          : `You are maintaining steady momentum with ${focusCount} focus sessions. Focus on completing incomplete milestone tasks.`,
      nextMonthPriorities: [
        `Advance the next active milestone: "${goal.milestones.find((m) => !m.completed)?.title || 'Finalize goal deliverables'}"`,
        'Maintain consistent daily habit check-ins without breaking streaks',
        'Protect at least two 45-minute deep focus sessions every week',
      ],
    };

    return report;
  }
}
