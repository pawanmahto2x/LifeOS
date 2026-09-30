import { Types } from 'mongoose';
import { LifeReplayRepository } from '../repositories/life-replay.repository';
import {
  ReplayPeriod,
  IReplayProductivity,
  IReplayWellness,
  IReplayHabits,
  IReplayReflection,
  IReplayChanges,
  IReplayPattern,
  ILifeReplay,
  IUserReflection,
} from '../types/life-replay.types';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { HabitHistory } from '../models/habit-history.model';
import { FocusSession } from '../models/focus-session.model';
import { SleepLog } from '../models/sleep-log.model';
import { WaterLog } from '../models/water-log.model';
import { MoodLog } from '../models/mood-log.model';
import { Journal } from '../models/journal.model';
import { JournalAnalysis } from '../models/journal-analysis.model';

export class LifeReplayService {
  constructor(private repository = new LifeReplayRepository()) {}

  private getDateRange(period: ReplayPeriod, refDate: Date = new Date()) {
    const d = new Date(refDate);
    const currentStart = new Date(d);
    const currentEnd = new Date(d);
    const prevStart = new Date(d);
    const prevEnd = new Date(d);

    if (period === 'weekly') {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      currentStart.setDate(diff);
      currentStart.setHours(0, 0, 0, 0);

      currentEnd.setDate(currentStart.getDate() + 6);
      currentEnd.setHours(23, 59, 59, 999);

      prevStart.setTime(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEnd.setTime(currentEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      currentStart.setDate(1);
      currentStart.setHours(0, 0, 0, 0);

      currentEnd.setMonth(currentEnd.getMonth() + 1, 0);
      currentEnd.setHours(23, 59, 59, 999);

      prevStart.setMonth(prevStart.getMonth() - 1, 1);
      prevStart.setHours(0, 0, 0, 0);

      prevEnd.setMonth(prevEnd.getMonth(), 0);
      prevEnd.setHours(23, 59, 59, 999);
    }

    return { currentStart, currentEnd, prevStart, prevEnd };
  }

  private async aggregateProductivity(
    userId: Types.ObjectId | string,
    start: Date,
    end: Date,
  ): Promise<IReplayProductivity> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const tasksCreated = await Task.countDocuments({
      userId: userObjectId,
      isDeleted: false,
      createdAt: { $gte: start, $lte: end },
    }).exec();
    const tasksCompleted = await Task.countDocuments({
      userId: userObjectId,
      status: 'Completed',
      isDeleted: false,
      completedAt: { $gte: start, $lte: end },
    }).exec();
    const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;

    const sessions = await FocusSession.aggregate([
      { $match: { userId: userObjectId, completed: true, startedAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, count: { $sum: 1 }, totalDuration: { $sum: '$duration' } } },
    ]).exec();

    const focusSessions = sessions.length > 0 ? sessions[0].count : 0;
    const focusTimeMinutes = sessions.length > 0 ? sessions[0].totalDuration : 0;

    return {
      tasksCompleted,
      tasksCreated,
      completionRate: Math.round(completionRate),
      focusSessions,
      focusTimeMinutes,
    };
  }

  private async aggregateWellness(
    userId: Types.ObjectId | string,
    start: Date,
    end: Date,
  ): Promise<IReplayWellness> {
    const userObjectId = new Types.ObjectId(userId.toString());

    const sleepLogs = await SleepLog.aggregate([
      { $match: { userId: userObjectId, sleepTime: { $gte: start, $lte: end } } },
      { $group: { _id: null, count: { $sum: 1 }, avgDuration: { $avg: '$duration' } } },
    ]).exec();

    const waterLogs = await WaterLog.aggregate([
      { $match: { userId: userObjectId, loggedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
          totalMl: { $sum: '$amount' },
        },
      },
      { $group: { _id: null, count: { $sum: 1 }, avgTotal: { $avg: '$totalMl' } } },
    ]).exec();

    const moodLogs = await MoodLog.aggregate([
      { $match: { userId: userObjectId, loggedAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, count: { $sum: 1 }, avgScore: { $avg: '$moodScore' } } },
    ]).exec();

    return {
      avgSleepMinutes: sleepLogs.length > 0 ? Math.round(sleepLogs[0].avgDuration) : 0,
      sleepLogs: sleepLogs.length > 0 ? sleepLogs[0].count : 0,
      avgWaterMlPerDay: waterLogs.length > 0 ? Math.round(waterLogs[0].avgTotal) : 0,
      waterLogs: waterLogs.length > 0 ? waterLogs[0].count : 0,
      avgMoodScore: moodLogs.length > 0 ? Math.round(moodLogs[0].avgScore * 10) / 10 : 0,
      moodLogs: moodLogs.length > 0 ? moodLogs[0].count : 0,
    };
  }

  private async aggregateHabits(
    userId: Types.ObjectId | string,
    start: Date,
    end: Date,
  ): Promise<IReplayHabits> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const activeHabits = await Habit.countDocuments({
      userId: userObjectId,
      isDeleted: false,
      isActive: true,
    }).exec();
    const histories = await HabitHistory.countDocuments({
      userId: userObjectId,
      completed: true,
      completionDate: { $gte: start, $lte: end },
    }).exec();

    const daysInRange = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const consistency = activeHabits > 0 ? (histories / (activeHabits * daysInRange)) * 100 : 0;

    const habitsData = await Habit.find({ userId: userObjectId, isDeleted: false })
      .sort({ streak: -1 })
      .limit(1)
      .exec();
    const bestStreak = habitsData.length > 0 ? (habitsData[0] as any).streak || 0 : 0;

    return {
      activeHabits,
      totalCompletions: histories,
      consistency: Math.round(consistency),
      bestStreak,
    };
  }

  private async aggregateReflection(
    userId: Types.ObjectId | string,
    start: Date,
    end: Date,
  ): Promise<IReplayReflection> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const journalEntries = await Journal.countDocuments({
      userId: userObjectId,
      isDeleted: false,
      createdAt: { $gte: start, $lte: end },
    }).exec();

    const topMoods = await MoodLog.aggregate([
      { $match: { userId: userObjectId, loggedAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]).exec();

    const topMood = topMoods.length > 0 ? topMoods[0]._id : null;

    const analyses = await JournalAnalysis.find({
      userId: userObjectId,
      analyzedAt: { $gte: start, $lte: end },
    }).exec();

    const themeCounts: Record<string, number> = {};
    analyses.forEach((a) => {
      a.themes.forEach((t) => {
        themeCounts[t] = (themeCounts[t] || 0) + 1;
      });
    });

    const commonThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme]) => theme);

    return {
      journalEntries,
      commonThemes,
      topMood,
    };
  }

  private calculateChanges(current: any, previous: any): IReplayChanges {
    const calc = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100);
    };

    return {
      focusChange: calc(
        current.productivity.focusTimeMinutes,
        previous.productivity.focusTimeMinutes,
      ),
      taskChange: calc(current.productivity.tasksCompleted, previous.productivity.tasksCompleted),
      sleepChange: calc(current.wellness.avgSleepMinutes, previous.wellness.avgSleepMinutes),
      habitChange: calc(current.habits.consistency, previous.habits.consistency),
      waterChange: calc(current.wellness.avgWaterMlPerDay, previous.wellness.avgWaterMlPerDay),
      moodChange: calc(current.wellness.avgMoodScore, previous.wellness.avgMoodScore),
    };
  }

  private async detectPatterns(
    userId: Types.ObjectId | string,
    start: Date,
    end: Date,
  ): Promise<IReplayPattern[]> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const patterns: IReplayPattern[] = [];

    // Check Sleep and Focus correlation in this period
    const dailySleep = await SleepLog.aggregate([
      { $match: { userId: userObjectId, sleepTime: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$sleepTime' } },
          duration: { $avg: '$duration' },
        },
      },
    ]);
    const dailyFocus = await FocusSession.aggregate([
      { $match: { userId: userObjectId, completed: true, startedAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          duration: { $sum: '$duration' },
        },
      },
    ]);

    const sleepMap = new Map<string, number>();
    dailySleep.forEach((d) => sleepMap.set(d._id, d.duration));
    const focusMap = new Map<string, number>();
    dailyFocus.forEach((d) => focusMap.set(d._id, d.duration));

    const overlappingDates = Array.from(sleepMap.keys()).filter((d) => focusMap.has(d));
    if (overlappingDates.length >= 3) {
      const avgSleep =
        overlappingDates.reduce((s, d) => s + (sleepMap.get(d) || 0), 0) / overlappingDates.length;
      const highSleepFocus = overlappingDates
        .filter((d) => (sleepMap.get(d) || 0) > avgSleep)
        .map((d) => focusMap.get(d) || 0);
      const lowSleepFocus = overlappingDates
        .filter((d) => (sleepMap.get(d) || 0) <= avgSleep)
        .map((d) => focusMap.get(d) || 0);

      if (highSleepFocus.length > 0 && lowSleepFocus.length > 0) {
        const avgHigh = highSleepFocus.reduce((a, b) => a + b, 0) / highSleepFocus.length;
        const avgLow = lowSleepFocus.reduce((a, b) => a + b, 0) / lowSleepFocus.length;
        if (avgHigh > avgLow * 1.1) {
          patterns.push({
            description:
              'Your recorded focus duration was higher on days when your sleep exceeded your baseline.',
            dataPoints: overlappingDates.length,
          });
        }
      }
    }

    // Check Habit and Task correlation
    const dailyHabits = await HabitHistory.aggregate([
      {
        $match: {
          userId: userObjectId,
          completed: true,
          completionDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completionDate' } },
          count: { $sum: 1 },
        },
      },
    ]);
    const dailyTasks = await Task.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: 'Completed',
          isDeleted: false,
          completedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const habitMap = new Map<string, number>();
    dailyHabits.forEach((d) => habitMap.set(d._id, d.count));
    const taskMap = new Map<string, number>();
    dailyTasks.forEach((d) => taskMap.set(d._id, d.count));

    const habitTaskDates = Array.from(habitMap.keys()).filter((d) => taskMap.has(d));
    if (habitTaskDates.length >= 3) {
      patterns.push({
        description:
          'Days with consistent habit completion were associated with higher task completion.',
        dataPoints: habitTaskDates.length,
      });
    }

    return patterns;
  }

  async generateReplay(userId: string, period: ReplayPeriod, refDate?: Date): Promise<ILifeReplay> {
    const userObjectId = new Types.ObjectId(userId);
    const { currentStart, currentEnd, prevStart, prevEnd } = this.getDateRange(period, refDate);

    const tasks = await Task.countDocuments({
      userId: userObjectId,
      isDeleted: false,
      createdAt: { $gte: currentStart, $lte: currentEnd },
    });
    const logs = await MoodLog.countDocuments({
      userId: userObjectId,
      loggedAt: { $gte: currentStart, $lte: currentEnd },
    });
    const sessions = await FocusSession.countDocuments({
      userId: userObjectId,
      completed: true,
      startedAt: { $gte: currentStart, $lte: currentEnd },
    });

    if (tasks + logs + sessions < 3) {
      throw new BadRequestError(
        'Not enough data to generate a replay for this period. Try completing some tasks or logging your day.',
      );
    }

    const currentData = {
      productivity: await this.aggregateProductivity(userId, currentStart, currentEnd),
      wellness: await this.aggregateWellness(userId, currentStart, currentEnd),
      habits: await this.aggregateHabits(userId, currentStart, currentEnd),
      reflection: await this.aggregateReflection(userId, currentStart, currentEnd),
    };

    const prevData = {
      productivity: await this.aggregateProductivity(userId, prevStart, prevEnd),
      wellness: await this.aggregateWellness(userId, prevStart, prevEnd),
      habits: await this.aggregateHabits(userId, prevStart, prevEnd),
      reflection: await this.aggregateReflection(userId, prevStart, prevEnd),
    };

    const changes = this.calculateChanges(currentData, prevData);
    const patterns = await this.detectPatterns(userId, currentStart, currentEnd);

    const replay = await this.repository.upsertReplay(userId, {
      userId: userObjectId,
      period,
      startDate: currentStart,
      endDate: currentEnd,
      productivity: currentData.productivity,
      wellness: currentData.wellness,
      habits: currentData.habits,
      reflection: currentData.reflection,
      changes,
      patterns,
      generatedAt: new Date(),
    });

    return replay as unknown as ILifeReplay;
  }

  async saveUserReflection(
    userId: string,
    replayId: string,
    reflection: Omit<IUserReflection, 'submittedAt'>,
  ): Promise<ILifeReplay> {
    const data = { ...reflection, submittedAt: new Date() };
    const updated = await this.repository.addUserReflection(userId, replayId, data);
    if (!updated) {
      throw new NotFoundError('Life replay not found');
    }
    return updated as unknown as ILifeReplay;
  }

  async getReplayHistory(
    userId: string,
    period: ReplayPeriod,
    limit: number = 10,
  ): Promise<ILifeReplay[]> {
    const history = await this.repository.findRecent(userId, period, limit);
    return history as unknown as ILifeReplay[];
  }
}
