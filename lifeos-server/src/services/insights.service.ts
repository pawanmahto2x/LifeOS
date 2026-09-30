import { Types } from 'mongoose';
import { InsightsRepository } from '../repositories/insights.repository';
import {
  BaselinePeriod,
  ITrendItem,
  IInsightsResponse,
  IBehaviourInsight,
  IAttentionArea,
  IBaselineResponse,
} from '../types/insights.types';
import { Task } from '../models/task.model';
import { FocusSession } from '../models/focus-session.model';
import { SleepLog } from '../models/sleep-log.model';
import { WaterLog } from '../models/water-log.model';
import { MoodLog } from '../models/mood-log.model';
import { Habit } from '../models/habit.model';
import { HabitHistory } from '../models/habit-history.model';

export class InsightsService {
  constructor(private repo: InsightsRepository = new InsightsRepository()) {}

  async computeBaseline(
    userId: Types.ObjectId | string,
    period: BaselinePeriod,
  ): Promise<IBaselineResponse> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Tasks completed
    const tasksCompleted = await Task.countDocuments({
      userId: userObjectId,
      status: 'Completed',
      isDeleted: false,
      completedAt: { $gte: startDate },
    });

    // 2. Focus sessions
    const focusResult = await FocusSession.aggregate([
      { $match: { userId: userObjectId, completed: true, startedAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$duration' }, count: { $sum: 1 } } },
    ]);
    const totalFocus = focusResult[0]?.total || 0;
    const focusCount = focusResult[0]?.count || 0;

    // 3. Sleep logs
    const sleepResult = await SleepLog.aggregate([
      { $match: { userId: userObjectId, sleepTime: { $gte: startDate } } },
      { $group: { _id: null, avg: { $avg: '$duration' }, count: { $sum: 1 } } },
    ]);
    const avgSleep = sleepResult[0]?.avg || 0;
    const sleepCount = sleepResult[0]?.count || 0;

    // 4. Water logs (daily aggregate then average)
    const waterResult = await WaterLog.aggregate([
      { $match: { userId: userObjectId, loggedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $group: { _id: null, avg: { $avg: '$total' }, count: { $sum: 1 } } },
    ]);
    const avgWater = waterResult[0]?.avg || 0;
    const waterCount = waterResult[0]?.count || 0;

    // 5. Mood logs
    const moodResult = await MoodLog.aggregate([
      { $match: { userId: userObjectId, loggedAt: { $gte: startDate } } },
      { $group: { _id: null, avg: { $avg: '$moodScore' }, count: { $sum: 1 } } },
    ]);
    const avgMood = moodResult[0]?.avg || 0;
    const moodCount = moodResult[0]?.count || 0;

    // 6. Habit consistency
    const activeHabits = await Habit.countDocuments({
      userId: userObjectId,
      isActive: true,
      isDeleted: false,
    });
    const habitHistory = await HabitHistory.countDocuments({
      userId: userObjectId,
      completed: true,
      completionDate: { $gte: startDate },
    });
    const avgHabits = activeHabits > 0 ? (habitHistory / (activeHabits * days)) * 100 : 0;

    const dataPointCount =
      tasksCompleted + focusCount + sleepCount + waterCount + moodCount + habitHistory;
    const minData = period === '7d' ? 3 : period === '14d' ? 7 : 14;

    if (dataPointCount < minData) {
      return { baseline: null, metrics: null, hasEnoughData: false, period };
    }

    const baselineData = {
      period,
      avgTasksCompletedPerDay: Math.round((tasksCompleted / days) * 10) / 10,
      avgFocusMinutesPerDay: Math.round(totalFocus / days),
      avgSleepMinutes: Math.round(avgSleep),
      avgWaterMlPerDay: Math.round(avgWater),
      avgMoodScore: Math.round(avgMood * 10) / 10,
      avgHabitCompletionRate: Math.round(avgHabits),
      dataPointCount,
      calculatedAt: new Date(),
    };

    const saved = await this.repo.upsertBaseline(userId, period, baselineData);
    const plainBaseline = saved ? saved.toObject() : baselineData;

    return {
      baseline: plainBaseline,
      metrics: plainBaseline,
      hasEnoughData: true,
      period,
    };
  }

  async detectPatterns(userId: Types.ObjectId | string): Promise<Partial<IBehaviourInsight>[]> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Group daily sleep duration (in minutes)
    const dailySleep = await SleepLog.aggregate([
      { $match: { userId: userObjectId, sleepTime: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$sleepTime' } },
          duration: { $avg: '$duration' },
        },
      },
    ]);

    // 2. Group daily focus duration (in minutes)
    const dailyFocus = await FocusSession.aggregate([
      { $match: { userId: userObjectId, completed: true, startedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          duration: { $sum: '$duration' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Group daily completed tasks count
    const dailyTasks = await Task.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: 'Completed',
          isDeleted: false,
          completedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Group daily mood
    const dailyMood = await MoodLog.aggregate([
      { $match: { userId: userObjectId, loggedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
          score: { $avg: '$moodScore' },
        },
      },
    ]);

    // 5. Group daily habit completions
    const dailyHabits = await HabitHistory.aggregate([
      {
        $match: {
          userId: userObjectId,
          completed: true,
          completionDate: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completionDate' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const sleepMap = new Map<string, number>();
    dailySleep.forEach((d) => sleepMap.set(d._id, d.duration));

    const focusMap = new Map<string, number>();
    dailyFocus.forEach((d) => focusMap.set(d._id, d.duration));

    const taskMap = new Map<string, number>();
    dailyTasks.forEach((d) => taskMap.set(d._id, d.count));

    const moodMap = new Map<string, number>();
    dailyMood.forEach((d) => moodMap.set(d._id, d.score));

    const habitMap = new Map<string, number>();
    dailyHabits.forEach((d) => habitMap.set(d._id, d.count));

    const patterns: Partial<IBehaviourInsight>[] = [];

    // Pattern A: Sleep -> Focus correlation
    const sleepFocusDates = Array.from(sleepMap.keys()).filter((d) => focusMap.has(d));
    if (sleepFocusDates.length >= 3) {
      const totalSleep = sleepFocusDates.reduce((sum, d) => sum + (sleepMap.get(d) || 0), 0);
      const avgSleep = totalSleep / sleepFocusDates.length;

      const higherSleepFocus: number[] = [];
      const lowerSleepFocus: number[] = [];

      sleepFocusDates.forEach((d) => {
        const sleep = sleepMap.get(d) || 0;
        const focus = focusMap.get(d) || 0;
        if (sleep > avgSleep) higherSleepFocus.push(focus);
        else lowerSleepFocus.push(focus);
      });

      if (higherSleepFocus.length > 0 && lowerSleepFocus.length > 0) {
        const avgHigher = higherSleepFocus.reduce((a, b) => a + b, 0) / higherSleepFocus.length;
        const avgLower = lowerSleepFocus.reduce((a, b) => a + b, 0) / lowerSleepFocus.length;

        if (avgHigher > avgLower * 1.1) {
          patterns.push({
            type: 'correlation',
            category: 'sleep_focus',
            title: 'Sleep and Focus Duration',
            description:
              'Your average focus duration was correlated with days with above-average sleep.',
            dataPoints: sleepFocusDates.length,
            confidence:
              sleepFocusDates.length >= 14
                ? 'high'
                : sleepFocusDates.length >= 7
                  ? 'medium'
                  : 'low',
            period: '30d',
          });
        }
      }
    }

    // Pattern B: Sleep -> Task Completion correlation
    const sleepTaskDates = Array.from(sleepMap.keys()).filter((d) => taskMap.has(d));
    if (sleepTaskDates.length >= 3) {
      const totalSleep = sleepTaskDates.reduce((sum, d) => sum + (sleepMap.get(d) || 0), 0);
      const avgSleep = totalSleep / sleepTaskDates.length;

      const higherSleepTasks: number[] = [];
      const lowerSleepTasks: number[] = [];

      sleepTaskDates.forEach((d) => {
        const sleep = sleepMap.get(d) || 0;
        const tasks = taskMap.get(d) || 0;
        if (sleep > avgSleep) higherSleepTasks.push(tasks);
        else lowerSleepTasks.push(tasks);
      });

      if (higherSleepTasks.length > 0 && lowerSleepTasks.length > 0) {
        const avgHigher = higherSleepTasks.reduce((a, b) => a + b, 0) / higherSleepTasks.length;
        const avgLower = lowerSleepTasks.reduce((a, b) => a + b, 0) / lowerSleepTasks.length;

        if (avgHigher > avgLower * 1.1) {
          patterns.push({
            type: 'correlation',
            category: 'sleep_tasks',
            title: 'Sleep and Task Completion',
            description:
              'Your task completion rate was higher on days when your recorded sleep exceeded your personal baseline.',
            dataPoints: sleepTaskDates.length,
            confidence:
              sleepTaskDates.length >= 14 ? 'high' : sleepTaskDates.length >= 7 ? 'medium' : 'low',
            period: '30d',
          });
        }
      }
    }

    // Pattern C: Focus -> Mood correlation
    const focusMoodDates = Array.from(focusMap.keys()).filter((d) => moodMap.has(d));
    if (focusMoodDates.length >= 3) {
      const focusDaysMood: number[] = [];
      const lowFocusDaysMood: number[] = [];

      focusMoodDates.forEach((d) => {
        const focus = focusMap.get(d) || 0;
        const mood = moodMap.get(d) || 0;
        if (focus > 30) focusDaysMood.push(mood);
        else lowFocusDaysMood.push(mood);
      });

      if (focusDaysMood.length > 0 && lowFocusDaysMood.length > 0) {
        const avgFocusMood = focusDaysMood.reduce((a, b) => a + b, 0) / focusDaysMood.length;
        const avgLowFocusMood =
          lowFocusDaysMood.reduce((a, b) => a + b, 0) / lowFocusDaysMood.length;

        if (avgFocusMood > avgLowFocusMood) {
          patterns.push({
            type: 'correlation',
            category: 'mood_productivity',
            title: 'Focus Sessions and Mood',
            description:
              'Your recorded mood was higher on days when you completed at least one planned focus session.',
            dataPoints: focusMoodDates.length,
            confidence:
              focusMoodDates.length >= 14 ? 'high' : focusMoodDates.length >= 7 ? 'medium' : 'low',
            period: '30d',
          });
        }
      }
    }

    // Pattern D: Habits -> Tasks correlation
    const habitTaskDates = Array.from(habitMap.keys()).filter((d) => taskMap.has(d));
    if (habitTaskDates.length >= 3) {
      const totalHabits = habitTaskDates.reduce((sum, d) => sum + (habitMap.get(d) || 0), 0);
      const avgHabits = totalHabits / habitTaskDates.length;

      const higherHabitTasks: number[] = [];
      const lowerHabitTasks: number[] = [];

      habitTaskDates.forEach((d) => {
        const habits = habitMap.get(d) || 0;
        const tasks = taskMap.get(d) || 0;
        if (habits >= avgHabits) higherHabitTasks.push(tasks);
        else lowerHabitTasks.push(tasks);
      });

      if (higherHabitTasks.length > 0 && lowerHabitTasks.length > 0) {
        const avgHigher = higherHabitTasks.reduce((a, b) => a + b, 0) / higherHabitTasks.length;
        const avgLower = lowerHabitTasks.reduce((a, b) => a + b, 0) / lowerHabitTasks.length;

        if (avgHigher > avgLower * 1.1) {
          patterns.push({
            type: 'correlation',
            category: 'habits_tasks',
            title: 'Habits and Task Productivity',
            description:
              'Days with higher habit completion were associated with higher task completion.',
            dataPoints: habitTaskDates.length,
            confidence:
              habitTaskDates.length >= 14 ? 'high' : habitTaskDates.length >= 7 ? 'medium' : 'low',
            period: '30d',
          });
        }
      }
    }

    return patterns;
  }

  async detectTrends(userId: Types.ObjectId | string): Promise<ITrendItem[]> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current 7d vs Prior 7d
    const [
      currentTasks,
      prevTasks,
      currentFocus,
      prevFocus,
      currentSleep,
      prevSleep,
      currentWater,
      prevWater,
      currentMood,
      prevMood,
    ] = await Promise.all([
      Task.countDocuments({
        userId: userObjectId,
        status: 'Completed',
        isDeleted: false,
        completedAt: { $gte: sevenDaysAgo, $lte: now },
      }),
      Task.countDocuments({
        userId: userObjectId,
        status: 'Completed',
        isDeleted: false,
        completedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      FocusSession.aggregate([
        {
          $match: {
            userId: userObjectId,
            completed: true,
            startedAt: { $gte: sevenDaysAgo, $lte: now },
          },
        },
        { $group: { _id: null, total: { $sum: '$duration' } } },
      ]),
      FocusSession.aggregate([
        {
          $match: {
            userId: userObjectId,
            completed: true,
            startedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
          },
        },
        { $group: { _id: null, total: { $sum: '$duration' } } },
      ]),
      SleepLog.aggregate([
        { $match: { userId: userObjectId, sleepTime: { $gte: sevenDaysAgo, $lte: now } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } },
      ]),
      SleepLog.aggregate([
        {
          $match: { userId: userObjectId, sleepTime: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } },
        },
        { $group: { _id: null, avg: { $avg: '$duration' } } },
      ]),
      WaterLog.aggregate([
        { $match: { userId: userObjectId, loggedAt: { $gte: sevenDaysAgo, $lte: now } } },
        { $group: { _id: null, avg: { $avg: '$amount' } } },
      ]),
      WaterLog.aggregate([
        {
          $match: { userId: userObjectId, loggedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } },
        },
        { $group: { _id: null, avg: { $avg: '$amount' } } },
      ]),
      MoodLog.aggregate([
        { $match: { userId: userObjectId, loggedAt: { $gte: sevenDaysAgo, $lte: now } } },
        { $group: { _id: null, avg: { $avg: '$moodScore' } } },
      ]),
      MoodLog.aggregate([
        {
          $match: { userId: userObjectId, loggedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } },
        },
        { $group: { _id: null, avg: { $avg: '$moodScore' } } },
      ]),
    ]);

    const buildTrend = (metric: string, cur: number, prev: number): ITrendItem | null => {
      if (cur === 0 && prev === 0) return null;
      let changePercent = 0;
      let direction: 'up' | 'down' | 'stable' = 'stable';

      if (prev === 0 && cur > 0) {
        changePercent = 100;
        direction = 'up';
      } else if (prev > 0 && cur === 0) {
        changePercent = -100;
        direction = 'down';
      } else if (prev > 0) {
        changePercent = Math.round(((cur - prev) / prev) * 100);
        direction = changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'stable';
      }

      return {
        metric,
        current: Math.round(cur * 10) / 10,
        previous: Math.round(prev * 10) / 10,
        changePercent,
        direction,
      };
    };

    const trends: ITrendItem[] = [];

    const taskTrend = buildTrend('Tasks Completed', currentTasks, prevTasks);
    if (taskTrend) trends.push(taskTrend);

    const focusCur = currentFocus[0]?.total || 0;
    const focusPrev = prevFocus[0]?.total || 0;
    const focusTrend = buildTrend('Focus Time (mins)', focusCur, focusPrev);
    if (focusTrend) trends.push(focusTrend);

    const sleepCur = currentSleep[0]?.avg || 0;
    const sleepPrev = prevSleep[0]?.avg || 0;
    const sleepTrend = buildTrend('Avg Sleep (mins)', sleepCur, sleepPrev);
    if (sleepTrend) trends.push(sleepTrend);

    const waterCur = currentWater[0]?.avg || 0;
    const waterPrev = prevWater[0]?.avg || 0;
    const waterTrend = buildTrend('Daily Water (ml)', waterCur, waterPrev);
    if (waterTrend) trends.push(waterTrend);

    const moodCur = currentMood[0]?.avg || 0;
    const moodPrev = prevMood[0]?.avg || 0;
    const moodTrend = buildTrend('Avg Mood (1-10)', moodCur, moodPrev);
    if (moodTrend) trends.push(moodTrend);

    return trends;
  }

  async getAttentionAreas(userId: Types.ObjectId | string): Promise<IAttentionArea[]> {
    const userObjectId = new Types.ObjectId(userId.toString());
    const areas: IAttentionArea[] = [];

    const baseline30 = await this.repo.findBaseline(userObjectId, '30d');
    const baseline7 = await this.repo.findBaseline(userObjectId, '7d');

    if (!baseline30 || !baseline7) {
      return areas;
    }

    // Sleep check (> 15% below personal baseline)
    if (
      baseline30.avgSleepMinutes > 0 &&
      baseline7.avgSleepMinutes < baseline30.avgSleepMinutes * 0.85
    ) {
      areas.push({
        metric: 'Sleep Duration',
        description:
          'Your average sleep over the last 7 days is below your 30-day personal baseline.',
        severity: 'warning',
      });
    }

    // Task completion check (> 20% below personal baseline)
    if (
      baseline30.avgTasksCompletedPerDay > 0 &&
      baseline7.avgTasksCompletedPerDay < baseline30.avgTasksCompletedPerDay * 0.8
    ) {
      areas.push({
        metric: 'Task Completion',
        description: 'Your task completion rate has declined compared to your personal baseline.',
        severity: 'info',
      });
    }

    // Hydration check (> 25% below personal baseline)
    if (
      baseline30.avgWaterMlPerDay > 0 &&
      baseline7.avgWaterMlPerDay < baseline30.avgWaterMlPerDay * 0.75
    ) {
      areas.push({
        metric: 'Hydration',
        description: 'Your average water intake has dropped over the last 7 days.',
        severity: 'info',
      });
    }

    // Habit consistency check (> 25% below personal baseline)
    if (
      baseline30.avgHabitCompletionRate > 0 &&
      baseline7.avgHabitCompletionRate < baseline30.avgHabitCompletionRate * 0.75
    ) {
      areas.push({
        metric: 'Habit Consistency',
        description: 'Your habit completion rate has dropped over the last 7 days.',
        severity: 'warning',
      });
    }

    return areas;
  }

  async getFullInsights(userId: Types.ObjectId | string): Promise<IInsightsResponse> {
    const baselines = {
      '7d': await this.computeBaseline(userId, '7d'),
      '14d': await this.computeBaseline(userId, '14d'),
      '30d': await this.computeBaseline(userId, '30d'),
    };

    const patterns = await this.detectPatterns(userId);
    await this.repo.saveInsights(userId, patterns);
    const activePatterns = await this.repo.findActiveInsights(userId);

    const trends = await this.detectTrends(userId);
    const attentionAreas = await this.getAttentionAreas(userId);

    const hasEnoughData = Boolean(
      baselines['7d']?.hasEnoughData ||
      baselines['14d']?.hasEnoughData ||
      baselines['30d']?.hasEnoughData,
    );

    return {
      baselines: {
        '7d': baselines['7d'],
        '14d': baselines['14d'],
        '30d': baselines['30d'],
      },
      patterns: activePatterns,
      trends,
      attentionAreas,
      hasEnoughData,
    };
  }
}
