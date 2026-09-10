import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { HabitHistory } from '../models/habit-history.model';
import { WaterLog } from '../models/water-log.model';
import { SleepLog } from '../models/sleep-log.model';
import { MoodLog } from '../models/mood-log.model';
import { FocusSession } from '../models/focus-session.model';
import { ScreenTimeLog } from '../models/screen-time-log.model';
import { DigitalDetoxSettings } from '../models/digital-detox.model';
import { ReportRepository } from '../repositories/report.repository';
import { ReportDocument } from '../models/report.model';
import { ReportType, IReportSummary, IDashboardSummary } from '../types/report.types';

export class ReportService {
  private reportRepo: ReportRepository;

  constructor(reportRepo?: ReportRepository) {
    this.reportRepo = reportRepo || new ReportRepository();
  }

  // ─── Period Helpers ──────────────────────────────────────────────────────────

  private getDailyRange(ref: Date): { start: Date; end: Date } {
    const start = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0, 0);
    const end = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 23, 59, 59, 999);
    return { start, end };
  }

  private getWeeklyRange(ref: Date): { start: Date; end: Date } {
    const day = ref.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMonday);
    const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private getMonthlyRange(ref: Date): { start: Date; end: Date } {
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  private getYearlyRange(ref: Date): { start: Date; end: Date } {
    const start = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  private getRange(type: ReportType, ref: Date): { start: Date; end: Date } {
    switch (type) {
      case 'daily':
        return this.getDailyRange(ref);
      case 'weekly':
        return this.getWeeklyRange(ref);
      case 'monthly':
        return this.getMonthlyRange(ref);
      case 'yearly':
        return this.getYearlyRange(ref);
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

  private async aggregateSummary(userId: string, start: Date, end: Date): Promise<IReportSummary> {
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

    return {
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
    };
  }

  // ─── Public API ───────────────────────────────────────────────────────────────

  async generateReport(
    userId: string,
    type: ReportType,
    refDate: Date = new Date(),
  ): Promise<{ report: ReportDocument; hasData: boolean }> {
    const { start, end } = this.getRange(type, refDate);

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
        });
        return { report: existing || empty, hasData: false };
      }
    }

    const summary = await this.aggregateSummary(userId, start, end);
    const report = await this.reportRepo.upsertReport(userId, type, start, end, summary);
    return { report, hasData: true };
  }

  async getDashboardSummary(userId: string): Promise<IDashboardSummary> {
    const now = new Date();
    const { start: todayStart, end: todayEnd } = this.getDailyRange(now);
    const { start: weekStart } = this.getWeeklyRange(now);

    const [
      todayTasks,
      habits,
      todayHabitHistories,
      waterLogs,
      todayFocusSessions,
      weeklyFocusSessions,
      todayMoodLogs,
    ] = await Promise.all([
      Task.find({
        userId,
        isDeleted: false,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }).exec(),
      Habit.find({ userId, isDeleted: false, isPaused: false }).exec(),
      HabitHistory.find({
        userId,
        completionDate: { $gte: todayStart, $lte: todayEnd },
        completed: true,
      }).exec(),
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
    ]);

    const todayWaterMl = waterLogs.reduce((acc, l) => acc + l.amount, 0);
    const todayFocusMinutes = todayFocusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const weeklyFocusMinutes = weeklyFocusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    const todayMoodScore =
      todayMoodLogs.length > 0
        ? todayMoodLogs[todayMoodLogs.length - 1].moodScore // most recent mood today
        : null;

    const currentStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;

    return {
      todayTasks: {
        total: todayTasks.length,
        completed: todayTasks.filter((t) => t.status === 'Completed').length,
      },
      todayHabits: {
        total: habits.length,
        completed: todayHabitHistories.length,
      },
      todayWaterMl,
      todayFocusMinutes,
      weeklyFocusMinutes,
      todayMoodScore,
      currentStreak,
    };
  }
}
