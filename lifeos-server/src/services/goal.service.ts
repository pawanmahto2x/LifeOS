import { GoalRepository } from '../repositories/goal.repository';
import { NotFoundError } from '../utils/errors';
import { IGoalDocument } from '../models/goal.model';
import { IAIGoalPlan, IGoalReport } from '../types/goal.types';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { FocusSession } from '../models/focus-session.model';

export class GoalService {
  constructor(private goalRepository: GoalRepository = new GoalRepository()) {}

  private calculateProgress(milestones: any[]): number {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  }

  async create(userId: string, data: any): Promise<IGoalDocument> {
    data.userId = userId;
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

  async generateAIPlan(goalId: string, userId: string): Promise<IAIGoalPlan> {
    const goal = await this.findById(goalId, userId);

    const title = goal.title.toLowerCase();
    let plan: IAIGoalPlan;

    if (
      title.includes('developer') ||
      title.includes('react') ||
      title.includes('code') ||
      goal.category === 'career' ||
      goal.category === 'education'
    ) {
      plan = {
        milestones: [
          'Learn fundamentals',
          'Build 3 side projects',
          'Master advanced concepts',
          'Prepare for interviews',
          'Apply for jobs',
        ],
        tasks: [
          { milestoneIndex: 0, title: 'Read documentation' },
          { milestoneIndex: 0, title: 'Complete online course' },
          { milestoneIndex: 1, title: 'Build a to-do app' },
          { milestoneIndex: 1, title: 'Build a weather app' },
          { milestoneIndex: 1, title: 'Build a clone of a popular site' },
        ],
        habits: [
          { title: 'Code for 1 hour', frequency: 'daily' },
          { title: 'Read tech blogs', frequency: 'weekly' },
        ],
      };
    } else if (
      goal.category === 'health' ||
      goal.category === 'fitness' ||
      title.includes('fit') ||
      title.includes('weight')
    ) {
      plan = {
        milestones: [
          'Set baseline',
          'Establish routine',
          'Increase intensity',
          'Reach target metric',
        ],
        tasks: [
          { milestoneIndex: 0, title: 'Buy workout gear' },
          { milestoneIndex: 0, title: 'Get a gym membership' },
          { milestoneIndex: 1, title: 'Create a meal plan' },
          { milestoneIndex: 2, title: 'Try a new workout class' },
        ],
        habits: [
          { title: 'Workout', frequency: 'daily' },
          { title: 'Drink 2L of water', frequency: 'daily' },
        ],
      };
    } else {
      plan = {
        milestones: [
          'Research & Planning',
          'First Steps',
          'Consistent Action',
          'Review & Adjust',
          'Final Push',
        ],
        tasks: [
          { milestoneIndex: 0, title: 'Gather resources' },
          { milestoneIndex: 0, title: 'Create a schedule' },
          { milestoneIndex: 1, title: 'Complete first milestone task' },
          { milestoneIndex: 3, title: 'Mid-way evaluation' },
        ],
        habits: [
          { title: 'Review goal progress', frequency: 'weekly' },
          { title: 'Spend 30 mins on goal', frequency: 'daily' },
        ],
      };
    }

    return plan;
  }

  async applyAIPlan(
    goalId: string,
    userId: string,
    acceptedPlan: IAIGoalPlan,
  ): Promise<IGoalDocument> {
    const goal = await this.findById(goalId, userId);

    const newMilestones = acceptedPlan.milestones.map((title, index) => ({
      title,
      order: index,
      completed: false,
    }));

    goal.milestones = newMilestones as any;
    goal.progress = this.calculateProgress(goal.milestones);
    await goal.save();

    for (const taskData of acceptedPlan.tasks) {
      await Task.create({
        userId,
        title: taskData.title,
        status: 'Pending',
        priority: 'Medium',
        dueDate: goal.deadline,
      });
    }

    for (const habitData of acceptedPlan.habits) {
      await Habit.create({
        userId,
        title: habitData.title,
        frequency: habitData.frequency === 'daily' ? 'Daily' : 'Weekly',
      });
    }

    return goal;
  }

  async generateGoalReport(goalId: string, userId: string): Promise<IGoalReport> {
    const goal = await this.findById(goalId, userId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tasksCount = await Task.countDocuments({
      userId,
      status: 'Completed',
      updatedAt: { $gte: thirtyDaysAgo },
    });
    const habitsCount = await Habit.countDocuments({ userId, updatedAt: { $gte: thirtyDaysAgo } });
    const focusSessionsCount = await FocusSession.countDocuments({
      userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const report: IGoalReport = {
      goalId,
      progress: {
        previous: Math.max(0, goal.progress - 10),
        current: goal.progress,
      },
      completed: {
        tasks: tasksCount,
        habits: habitsCount,
        focusSessions: focusSessionsCount,
      },
      consistency: {
        general: Math.min(100, (tasksCount + habitsCount + focusSessionsCount) * 2),
      },
      obstacles:
        focusSessionsCount < 5
          ? 'Your progress slowed during weeks with fewer focus sessions. Consider scheduling dedicated focus blocks.'
          : 'You are doing well, but could improve task completion speed.',
      nextMonthPriorities: [
        'Focus on next milestone',
        'Maintain daily habits',
        'Increase focus session duration',
      ],
    };

    return report;
  }
}
