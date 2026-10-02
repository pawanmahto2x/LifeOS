import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { HabitHistory } from '../models/habit-history.model';
import { WaterLog } from '../models/water-log.model';
import { SleepLog } from '../models/sleep-log.model';
import { MoodLog } from '../models/mood-log.model';
import { FocusSession } from '../models/focus-session.model';
import { ScreenTimeLog } from '../models/screen-time-log.model';
import { DigitalDetoxSettings } from '../models/digital-detox.model';
import { DailyMission } from '../models/daily-mission.model';
import { Goal } from '../models/goal.model';
import { ReportRepository } from '../repositories/report.repository';
import { ReportDocument } from '../models/report.model';
import { ReportType, IReportSummary, IDashboardSummary } from '../types/report.types';
import { TimezoneUtil } from '../utils/timezone.util';

export class ReportService {
  private reportRepo: ReportRepository;

  constructor(reportRepo?: ReportRepository) {
    this.reportRepo = reportRepo || new ReportRepository();
  }

  // ─── Period Helpers ──────────────────────────────────────────────────────────

  private getRange(tz: string, type: ReportType, ref: Date): { start: Date; end: Date } {
    const todayStart = TimezoneUtil.getStartOfDayUTCForTimezone(tz, ref);

    switch (type) {
      case 'daily':
        return {
          start: todayStart,
          end: TimezoneUtil.getEndOfDayUTCForTimezone(tz, ref),
        };
      case 'weekly': {
        const start = TimezoneUtil.getStartOfWeekForTimezone(todayStart);
        const end = new Date(start.getTime() + 7 * 86400000 - 1);
        return { start, end };
      }
      case 'monthly':
        return {
          start: TimezoneUtil.getStartOfMonthForTimezone(todayStart),
          end: TimezoneUtil.getEndOfMonthForTimezone(todayStart),
        };
      case 'yearly':
        return {
          start: TimezoneUtil.getStartOfYearForTimezone(todayStart),
          end: TimezoneUtil.getEndOfYearForTimezone(todayStart),
        };
    }
  }

  // ─── Minimum Data Thresholds ─────────────────────────────────────────────────

  private getMinDays(type: ReportType): number {
    switch (type) {
      case 'daily':
        return 0; // Always generate
      case 'weekly':
        return 3;
      case 'monthly':
        return 7;
      case 'yearly':
        return 30;
    }
  }

  // ─── Core Aggregation ────────────────────────────────────────────────────────

  private async aggregateSummary(
    userId: string,
    start: Date,
    end: Date,
    type: ReportType = 'daily',
  ): Promise<{ summary: IReportSummary; aiSummary: string }> {
    const [
      tasks,
      habits,
      habitHistories,
      waterLogs,
      sleepLogs,
      moodLogs,
      focusSessions,
      screenTimeLogs,
      detoxSettings,
      dailyMissions,
      goals,
    ] = await Promise.all([
      Task.find({ userId, isDeleted: false, createdAt: { $gte: start, $lte: end } }).exec(),
      Habit.find({ userId, isDeleted: false }).exec(),
      HabitHistory.find({ userId, completionDate: { $gte: start, $lte: end } }).exec(),
      WaterLog.find({ userId, loggedAt: { $gte: start, $lte: end } }).exec(),
      SleepLog.find({ userId, sleepTime: { $gte: start, $lte: end } }).exec(),
      MoodLog.find({ userId, loggedAt: { $gte: start, $lte: end } }).exec(),
      FocusSession.find({ userId, startedAt: { $gte: start, $lte: end }, completed: true }).exec(),
      ScreenTimeLog.find({ userId, loggedDate: { $gte: start, $lte: end } }).exec(),
      DigitalDetoxSettings.findOne({ userId }).exec(),
      DailyMission.find({ userId, date: { $gte: start, $lte: end } }).exec(),
      Goal.find({ userId }).exec(),
    ]);

    // Tasks
    const tasksCreated = tasks.length;
    const tasksCompleted = tasks.filter((t) => t.status === 'Completed').length;
    const tasksCompletionRate =
      tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;

    // Habits — use habitHistories for period completions
    const habitsTracked = habits.length;
    const habitCompletions = habitHistories.filter((h) => h.completed).length;
    const habitCompletionRate =
      habitsTracked > 0 ? Math.round((habitCompletions / habitsTracked) * 100) : 0;

    // Sleep
    const totalSleepMinutes = sleepLogs.reduce((acc, s) => acc + (s.duration || 0), 0);
    const avgDailySleepMinutes =
      sleepLogs.length > 0 ? Math.round(totalSleepMinutes / sleepLogs.length) : 0;

    // Water — group by day
    const waterByDay = new Map<string, number>();
    for (const log of waterLogs) {
      const dayKey = log.loggedAt.toISOString().split('T')[0];
      waterByDay.set(dayKey, (waterByDay.get(dayKey) || 0) + log.amount);
    }
    const avgDailyWaterMl =
      waterByDay.size > 0
        ? Math.round(Array.from(waterByDay.values()).reduce((a, b) => a + b, 0) / waterByDay.size)
        : 0;

    // Mood
    const totalMoodScore = moodLogs.reduce((acc, m) => acc + m.moodScore, 0);
    const avgMoodScore =
      moodLogs.length > 0 ? Math.round((totalMoodScore / moodLogs.length) * 10) / 10 : 0;

    // Focus
    const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalFocusSessions = focusSessions.length;

    // Screen Time
    const screenTimeByDay = new Map<string, number>();
    for (const log of screenTimeLogs) {
      const dayKey = log.loggedDate.toISOString().split('T')[0];
      screenTimeByDay.set(dayKey, (screenTimeByDay.get(dayKey) || 0) + log.minutesUsed);
    }
    const screenTimeGoalMinutes = detoxSettings?.dailyScreenTimeGoalMinutes ?? 120;
    let daysUnderGoal = 0;
    for (const [, mins] of screenTimeByDay) {
      if (mins <= screenTimeGoalMinutes) daysUnderGoal++;
    }
    const avgDailyScreenTimeMinutes =
      screenTimeByDay.size > 0
        ? Math.round(
            Array.from(screenTimeByDay.values()).reduce((a, b) => a + b, 0) / screenTimeByDay.size,
          )
        : 0;

    // Goals & Missions
    const missionsCompleted = dailyMissions.filter(
      (m) => m.primaryMission?.completed || m.status === 'completed',
    ).length;
    const activeGoals = goals.filter((g) => g.status === 'active').length;
    const milestonesCompleted = goals.reduce(
      (acc, g) => acc + (g.milestones?.filter((m: any) => m.completed)?.length || 0),
      0,
    );

    const summary: IReportSummary = {
      tasksCreated,
      tasksCompleted,
      tasksCompletionRate,
      habitsTracked,
      habitCompletions,
      habitCompletionRate,
      avgDailySleepMinutes,
      avgDailyWaterMl,
      avgMoodScore,
      totalFocusMinutes,
      totalFocusSessions,
      avgDailyScreenTimeMinutes,
      screenTimeGoalMinutes,
      daysUnderGoal,
      missionsCompleted,
      activeGoals,
      milestonesCompleted,
    };

    let aiSummary = '';

    // Deterministic factual summary
    aiSummary = `During this ${type} period, you completed ${tasksCompleted} of ${tasksCreated} planned tasks (${tasksCompletionRate}%) and logged ${totalFocusMinutes} minutes of focused deep work. `;
    if (activeGoals > 0) {
      aiSummary += `You are advancing ${activeGoals} active strategic goal${activeGoals > 1 ? 's' : ''} with ${milestonesCompleted} total milestone${milestonesCompleted === 1 ? '' : 's'} achieved. `;
    }
    if (missionsCompleted > 0) {
      aiSummary += `You accomplished ${missionsCompleted} mission${missionsCompleted > 1 ? 's' : ''}, maintaining deliberate alignment between your long-term roadmap and day-to-day actions. `;
    } else if (activeGoals > 0) {
      aiSummary += `Tip: generating and locking in your daily missions will help translate your active goals into daily milestone progress. `;
    }
    if (habitsTracked > 0) {
      aiSummary += `Habit consistency registered at ${habitCompletionRate}%. `;
    }
    if (avgDailySleepMinutes > 0) {
      const sleepHours = (avgDailySleepMinutes / 60).toFixed(1);
      aiSummary += `Sleep averaged ${sleepHours} hours per night. `;
    }

    return { summary, aiSummary };
  }

  // ─── Public API ───────────────────────────────────────────────────────────────

  async generateReport(
    userId: string,
    type: ReportType,
    refDate: Date = new Date(),
  ): Promise<{ report: ReportDocument; hasData: boolean }> {
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const { start, end } = this.getRange(tz, type, refDate);

    // Check if enough activity exists before generating
    const minDays = this.getMinDays(type);
    if (minDays > 0) {
      const activityCount = await Task.countDocuments({
        userId,
        isDeleted: false,
        createdAt: { $gte: start, $lte: end },
      }).exec();

      const habitCount = await HabitHistory.countDocuments({
        userId,
        completionDate: { $gte: start, $lte: end },
      }).exec();

      if (activityCount + habitCount === 0) {
        // Not enough data — return stored or minimal placeholder
        const existing = await this.reportRepo.findByPeriod(userId, type, start);
        const empty = await this.reportRepo.upsertReport(userId, type, start, end, {
          tasksCreated: 0,
          tasksCompleted: 0,
          tasksCompletionRate: 0,
          habitsTracked: 0,
          habitCompletions: 0,
          habitCompletionRate: 0,
          avgDailySleepMinutes: 0,
          avgDailyWaterMl: 0,
          avgMoodScore: 0,
          totalFocusMinutes: 0,
          totalFocusSessions: 0,
          avgDailyScreenTimeMinutes: 0,
          screenTimeGoalMinutes: 120,
          daysUnderGoal: 0,
          missionsCompleted: 0,
          activeGoals: 0,
          milestonesCompleted: 0,
        });
        return { report: existing || empty, hasData: false };
      }
    }

    const { summary, aiSummary } = await this.aggregateSummary(userId, start, end, type);
    const report = await this.reportRepo.upsertReport(userId, type, start, end, summary, aiSummary);
    return { report, hasData: true };
  }

  async getDashboardSummary(userId: string): Promise<IDashboardSummary> {
    const tz = await TimezoneUtil.getUserTimezone(userId);
    const todayStart = TimezoneUtil.getStartOfDayUTCForTimezone(tz);
    const todayEnd = TimezoneUtil.getEndOfDayUTCForTimezone(tz);
    const weekStart = TimezoneUtil.getStartOfWeekForTimezone(todayStart);

    const habitService = new (require('./habit.service').HabitService)();
    const taskRepo = new (require('../repositories/task.repository').TaskRepository)();

    const [
      activeTasksResult,
      completedTodayTasks,
      habitsResult,
      waterLogs,
      todayFocusSessions,
      weeklyFocusSessions,
      todayMoodLogs,
      todayMission,
      activeGoalsCount,
    ] = await Promise.all([
      // Pending tasks across all time
      taskRepo.findByUser({ userId, status: 'Pending', limit: 100 }),
      // Tasks completed today
      Task.find({
        userId,
        status: 'Completed',
        isDeleted: false,
        completedAt: { $gte: todayStart, $lte: todayEnd },
      }).exec(),
      // Habits with full completion state logic
      habitService.getHabits(userId, { limit: 100, isPaused: 'false' }),
      WaterLog.find({ userId, loggedAt: { $gte: todayStart, $lte: todayEnd } }).exec(),
      FocusSession.find({
        userId,
        startedAt: { $gte: todayStart, $lte: todayEnd },
        completed: true,
      }).exec(),
      FocusSession.find({
        userId,
        startedAt: { $gte: weekStart, $lte: todayEnd },
        completed: true,
      }).exec(),
      MoodLog.find({ userId, loggedAt: { $gte: todayStart, $lte: todayEnd } }).exec(),
      DailyMission.findOne({ userId, date: { $gte: todayStart, $lte: todayEnd } }).exec(),
      Goal.countDocuments({ userId, status: 'active' }).exec(),
    ]);

    const activeTasksCount = activeTasksResult.total;
    const completedTasksCount = completedTodayTasks.length;
    const todayTasksTotal = activeTasksCount + completedTasksCount;

    const habits = habitsResult.habits;
    const completedHabitsCount = habits.filter((h: any) => h.isCompletedToday).length;

    const todayWaterMl = waterLogs.reduce((acc, l) => acc + l.amount, 0);
    const todayFocusMinutes = todayFocusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const weeklyFocusMinutes = weeklyFocusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    const todayMoodScore =
      todayMoodLogs.length > 0 ? todayMoodLogs[todayMoodLogs.length - 1].moodScore : null;

    const currentStreak =
      habits.length > 0 ? Math.max(...habits.map((h: any) => h.currentStreak || 0)) : 0;

    const todayMissionStatus = todayMission
      ? {
          hasMission: true,
          completed: todayMission.primaryMission?.completed || todayMission.status === 'completed',
          title: todayMission.primaryMission?.title,
          dayType: todayMission.dayType,
        }
      : {
          hasMission: false,
          completed: false,
        };

    return {
      todayTasks: {
        total: todayTasksTotal,
        completed: completedTasksCount,
      },
      todayHabits: {
        total: habits.length,
        completed: completedHabitsCount,
      },
      todayWaterMl,
      todayFocusMinutes,
      weeklyFocusMinutes,
      todayMoodScore,
      currentStreak,
      todayMissionStatus,
      activeGoalsCount,
    };
  }
}
