import { DailyMissionRepository } from '../repositories/daily-mission.repository';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { HabitHistory } from '../models/habit-history.model';
import { FocusSession } from '../models/focus-session.model';
import { SleepLog } from '../models/sleep-log.model';
import { MoodLog } from '../models/mood-log.model';
import { DayType, ISupportingGoal, ISubmitReviewInput } from '../types/daily-mission.types';
import { NotFoundError } from '../utils/errors';

export class DailyMissionService {
  constructor(private repo: DailyMissionRepository = new DailyMissionRepository()) {}

  private getStartOfDay(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getEndOfDay(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  async classifyDayType(userId: string): Promise<{ dayType: DayType; reasons: string[] }> {
    const today = this.getStartOfDay();
    const yesterday = this.addDays(today, -1);

    // 1. Get last night's sleep
    const sleep = await SleepLog.findOne({
      userId,
      sleepTime: { $gte: yesterday, $lt: today },
    })
      .sort({ sleepTime: -1 })
      .exec();

    // 2. Get latest mood
    const mood = await MoodLog.findOne({
      userId,
      timestamp: { $gte: this.getStartOfDay(yesterday) },
    })
      .sort({ timestamp: -1 })
      .exec();

    // 3. Count overdue tasks
    const overdueTasks = await Task.countDocuments({
      userId,
      status: { $ne: 'Completed' },
      dueDate: { $lt: today },
    }).exec();

    // 4. Get 7-day productivity trend
    const sevenDaysAgo = this.addDays(today, -7);
    const recentCompleted = await Task.countDocuments({
      userId,
      status: 'Completed',
      completedAt: { $gte: sevenDaysAgo, $lte: today },
    }).exec();
    const recentTotal = await Task.countDocuments({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    }).exec();
    const completionRate = recentTotal > 0 ? (recentCompleted / recentTotal) * 100 : 0;

    const reasons: string[] = [];

    // Recovery Check
    const poorSleep = sleep && ((sleep as any).duration < 5 || (sleep as any).quality === 'Poor');
    if (poorSleep) reasons.push('Sleep was less than 5 hours or quality was poor.');

    const poorMood = mood && (mood as any).score < 4;
    if (poorMood) reasons.push('Recent mood score was low.');

    const overwhelmed = overdueTasks >= 5 && completionRate < 40;
    if (overwhelmed) reasons.push('High number of overdue tasks with declining productivity.');

    if (poorSleep || poorMood || overwhelmed) {
      if (reasons.length === 0) reasons.push('Prioritizing recovery based on recent metrics.');
      return { dayType: 'recovery', reasons };
    }

    // High-Focus Check
    const goodSleep =
      sleep &&
      (sleep as any).duration >= 7 &&
      ((sleep as any).quality === 'Good' || (sleep as any).quality === 'Excellent');
    const goodMood = mood && (mood as any).score >= 7;
    const goodProductivity = completionRate > 60;

    if (goodSleep && goodMood && goodProductivity) {
      reasons.push('Excellent sleep, positive mood, and high task completion rate.');
      return { dayType: 'high-focus', reasons };
    }

    // Normal Check
    reasons.push('Metrics are balanced, proposing a standard active day.');
    return { dayType: 'normal', reasons };
  }

  async selectPrimaryMission(userId: string, dayType: DayType) {
    const priorityMap: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

    const incompleteTasks = await Task.find({
      userId,
      status: { $ne: 'Completed' },
    }).exec();

    if (!incompleteTasks || incompleteTasks.length === 0) {
      return {
        title: 'Set your first goal for today',
        reason: 'No open tasks found in your task list.',
      };
    }

    const sortedTasks = incompleteTasks.sort((a: any, b: any) => {
      const pA = priorityMap[a.priority as string] || 0;
      const pB = priorityMap[b.priority as string] || 0;
      if (pA !== pB) return pB - pA;
      if (a.dueDate && b.dueDate)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    });

    let selectedTask: any;
    let reason = '';

    if (dayType === 'recovery') {
      selectedTask = sortedTasks.find((t: any) => priorityMap[t.priority as string] >= 3);
      if (selectedTask) {
        reason = 'High priority task selected for essential completion during recovery.';
      } else {
        selectedTask = sortedTasks[0];
        reason = 'Selected highest available priority for steady progress.';
      }
    } else if (dayType === 'high-focus') {
      selectedTask = sortedTasks[0];
      reason = 'Tackling the most urgent and nearest due task to maximize focus block.';
    } else {
      selectedTask = sortedTasks[0];
      reason = 'Highest priority task queued for standard daily progression.';
    }

    return {
      title: selectedTask.title,
      taskId: selectedTask._id.toString(),
      reason,
    };
  }

  async generateSupportingGoals(userId: string, dayType: DayType): Promise<ISupportingGoal[]> {
    const goals: ISupportingGoal[] = [];
    const activeHabits = await Habit.find({ userId, isPaused: false, isDeleted: false })
      .limit(3)
      .exec();

    if (dayType === 'recovery') {
      if (activeHabits.length > 0) {
        goals.push({
          title: (activeHabits[0] as any).name || 'Habit',
          type: 'habit',
          completed: false,
        });
      }
      goals.push({
        title: 'Hydrate adequately',
        type: 'health',
        targetValue: '2L water',
        completed: false,
      });
    } else if (dayType === 'normal') {
      goals.push({
        title: 'Focus block',
        type: 'focus',
        targetValue: '45 minutes',
        completed: false,
      });
      activeHabits
        .slice(0, 2)
        .forEach((h: any) =>
          goals.push({ title: h.name || 'Habit', type: 'habit', completed: false }),
        );
      goals.push({
        title: 'Stay hydrated',
        type: 'health',
        targetValue: '2L water',
        completed: false,
      });
    } else if (dayType === 'high-focus') {
      goals.push({
        title: 'Deep Work Session',
        type: 'focus',
        targetValue: '90 minutes',
        completed: false,
      });
      activeHabits.forEach((h: any) =>
        goals.push({ title: h.name || 'Habit', type: 'habit', completed: false }),
      );
      goals.push({
        title: 'Optimal hydration',
        type: 'health',
        targetValue: '3L water',
        completed: false,
      });
    }

    return goals;
  }

  async generatePersonalReminder(userId: string): Promise<string> {
    const today = this.getStartOfDay();
    const yesterday = this.addDays(today, -1);
    const thirtyDaysAgo = this.addDays(today, -30);

    const sleep = await SleepLog.findOne({ userId, sleepTime: { $gte: yesterday, $lt: today } })
      .sort({ sleepTime: -1 })
      .exec();
    const pastSleeps = await SleepLog.find({
      userId,
      sleepTime: { $gte: thirtyDaysAgo, $lt: yesterday },
    }).exec();

    if (sleep && pastSleeps.length > 0) {
      const avgSleep =
        pastSleeps.reduce((acc, curr: any) => acc + (curr.duration || 0), 0) / pastSleeps.length;
      if ((sleep as any).duration < avgSleep - 1) {
        return 'Your sleep was below your baseline last night. Avoid overloading your schedule.';
      }
    }

    const recentHabitHistory = await HabitHistory.findOne({
      userId,
      date: { $gte: yesterday, $lt: today },
    }).exec();
    if (recentHabitHistory) {
      return "You're on a great streak! Keep the momentum going today.";
    }

    return 'Log your morning mood and water to help LifeOS personalize your day.';
  }

  generateAvoidance(dayType: DayType): string {
    if (dayType === 'recovery')
      return 'Avoid starting new projects. Focus on recovery and essentials only.';
    if (dayType === 'normal')
      return "Don't start low-priority tasks before completing your primary mission.";
    return 'Avoid context-switching. Protect your deep work blocks.';
  }

  async generateMission(userId: string) {
    const today = new Date();
    const existing = await this.repo.findToday(userId);
    if (existing) return existing;

    const { dayType, reasons } = await this.classifyDayType(userId);
    const primaryMission = await this.selectPrimaryMission(userId, dayType);
    const supportingGoals = await this.generateSupportingGoals(userId, dayType);
    const personalReminder = await this.generatePersonalReminder(userId);
    const avoidance = this.generateAvoidance(dayType);

    const data = {
      dayType,
      primaryMission,
      supportingGoals,
      personalReminder,
      avoidance,
      explanation: {
        dayTypeReason: reasons.join(' '),
        missionReason: primaryMission.reason,
        reminderReason: 'Based on your recent well-being and habit tracking data.',
      },
      status: 'active' as const,
    };

    return this.repo.upsertMission(userId, today, data);
  }

  async getTodayMission(userId: string) {
    const mission = await this.repo.findToday(userId);
    if (!mission) throw new NotFoundError('No mission generated for today.');
    return mission;
  }

  async submitReview(userId: string, missionId: string, reviewInput: ISubmitReviewInput) {
    const mission = await this.repo.findToday(userId);
    if (!mission || mission._id.toString() !== missionId) {
      throw new NotFoundError('Mission not found or not active today.');
    }

    const today = this.getStartOfDay();
    const tomorrow = this.getEndOfDay();

    const completedTasks = await Task.countDocuments({
      userId,
      status: 'Completed',
      completedAt: { $gte: today, $lte: tomorrow },
    }).exec();

    const plannedTasks = await Task.countDocuments({
      userId,
      dueDate: { $gte: today, $lte: tomorrow },
    }).exec();

    const completedHabits = await HabitHistory.countDocuments({
      userId,
      date: { $gte: today, $lte: tomorrow },
      completed: true,
    }).exec();
    const plannedHabits = await Habit.countDocuments({ userId, isPaused: false }).exec();

    const focusSessions = await FocusSession.find({
      userId,
      startTime: { $gte: today, $lte: tomorrow },
    }).exec();
    const focusMinutes = focusSessions.reduce((acc, s: any) => acc + (s.duration || 0), 0);
    const plannedFocusMinutes =
      mission.dayType === 'high-focus' ? 90 : mission.dayType === 'normal' ? 45 : 0;

    const review = {
      completedTasks,
      plannedTasks,
      completedHabits,
      plannedHabits,
      focusMinutes,
      plannedFocusMinutes,
      ...reviewInput,
      reviewedAt: new Date(),
    };

    const updated = await this.repo.updateReview(userId, missionId, review);
    return updated;
  }

  async getMissionHistory(userId: string, limit: number) {
    return this.repo.findHistory(userId, limit);
  }
}
