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

  async generateAIPlan(goalId: string, userId: string): Promise<IAIGoalPlan> {
    const goal = await this.findById(goalId, userId);
    const title = goal.title.toLowerCase();
    let plan: IAIGoalPlan;

    if (
      title.includes('developer') ||
      title.includes('full stack') ||
      title.includes('software') ||
      title.includes('coding') ||
      title.includes('react')
    ) {
      plan = {
        milestones: [
          'Strengthen JavaScript Fundamentals',
          'Master Modern React & State Management',
          'Learn Backend Development with Node.js & Express',
          'Database Design & Modeling with MongoDB',
          'Build and Deploy 2 Production-Ready Full-Stack Projects',
          'Portfolio Architecture & Resume Refinement',
          'Interview Preparation & Technical Assessment Practice',
        ],
        tasks: [
          { milestoneIndex: 0, title: 'Deep dive into JS Closures, Promises & Event Loop' },
          { milestoneIndex: 1, title: 'Build a interactive React application with Custom Hooks' },
          { milestoneIndex: 2, title: 'Implement RESTful APIs with JWT authentication in Node.js' },
          { milestoneIndex: 3, title: 'Design normalized and embedded data models in MongoDB' },
          { milestoneIndex: 4, title: 'Deploy full-stack project on cloud hosting with CI/CD' },
        ],
        habits: [
          { title: 'Code for 60 minutes daily', frequency: 'daily' },
          { title: 'Solve 2 technical problem-solving challenges', frequency: 'daily' },
          { title: 'Read engineering documentation for 20 minutes', frequency: 'daily' },
        ],
      };
    } else if (
      title.includes('ai') ||
      title.includes('machine learning') ||
      title.includes('data science') ||
      title.includes('python')
    ) {
      plan = {
        milestones: [
          'Python Mastery & Scientific Computing (NumPy, Pandas)',
          'Mathematics for ML (Linear Algebra, Calculus, Probability)',
          'Classical Machine Learning Algorithms & Scikit-Learn',
          'Deep Learning & Neural Networks with PyTorch',
          'LLM Fine-Tuning & Vector Databases (RAG)',
          'End-to-End MLOps Pipeline & Model Deployment',
        ],
        tasks: [
          {
            milestoneIndex: 0,
            title: 'Complete Python advanced concepts and data manipulation exercises',
          },
          { milestoneIndex: 1, title: 'Implement gradient descent from scratch' },
          { milestoneIndex: 2, title: 'Train and evaluate classification and regression models' },
          {
            milestoneIndex: 4,
            title: 'Build a semantic search application using embeddings and vector search',
          },
        ],
        habits: [
          { title: 'Study ML theory & code for 60 minutes', frequency: 'daily' },
          { title: 'Read 1 research paper or technical blog weekly', frequency: 'weekly' },
        ],
      };
    } else if (
      goal.category === 'health' ||
      goal.category === 'fitness' ||
      title.includes('fit') ||
      title.includes('weight') ||
      title.includes('workout') ||
      title.includes('exercise')
    ) {
      plan = {
        milestones: [
          'Establish Health Baseline & Medical/Screening Clearance',
          'Build Consistent Routine (Weeks 1-4)',
          'Progressive Overload & Habit Solidification (Weeks 5-8)',
          'Reach Milestone Body & Energy Targets (Weeks 9-12)',
        ],
        tasks: [
          { milestoneIndex: 0, title: 'Record starting height, weight, and baseline metrics' },
          { milestoneIndex: 1, title: 'Schedule 3 specific weekly workout times in calendar' },
          { milestoneIndex: 1, title: 'Prepare high-protein, balanced meal plan for the week' },
          { milestoneIndex: 2, title: 'Log workout duration and intensity in Health module' },
        ],
        habits: [
          { title: 'Exercise 4 days per week', frequency: 'weekly' },
          { title: 'Drink at least 2.5L water daily', frequency: 'daily' },
          { title: 'Maintain a consistent 7-8 hour sleep schedule', frequency: 'daily' },
        ],
      };
    } else {
      plan = {
        milestones: [
          'Strategic Planning & Clear Success Criteria',
          'Foundation & Initial Execution',
          'Consistency & Overcoming Plateaus',
          'Review, Refinement & Optimization',
          'Final Milestone Delivery & Celebration',
        ],
        tasks: [
          { milestoneIndex: 0, title: 'Define measurable output criteria for this goal' },
          { milestoneIndex: 1, title: 'Complete first actionable task' },
          { milestoneIndex: 2, title: 'Conduct mid-way evaluation against baseline' },
        ],
        habits: [
          { title: 'Dedicate 45 minutes focused work on goal', frequency: 'daily' },
          { title: 'Weekly progress and obstacle reflection', frequency: 'weekly' },
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

    // Create tasks for accepted plan
    if (acceptedPlan.tasks && acceptedPlan.tasks.length > 0) {
      for (const taskData of acceptedPlan.tasks) {
        await Task.create({
          userId,
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
          title: habitData.title,
          frequency: habitData.frequency === 'weekly' ? 'Weekly' : 'Daily',
          targetDays: habitData.frequency === 'weekly' ? 3 : 7,
        });
      }
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
