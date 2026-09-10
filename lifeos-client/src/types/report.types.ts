export type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface IReportSummary {
  tasksCreated: number;
  tasksCompleted: number;
  tasksCompletionRate: number;
  habitsTracked: number;
  habitCompletions: number;
  habitCompletionRate: number;
  avgDailySleepMinutes: number;
  avgDailyWaterMl: number;
  avgMoodScore: number;
  totalFocusMinutes: number;
  totalFocusSessions: number;
  avgDailyScreenTimeMinutes: number;
  screenTimeGoalMinutes: number;
  daysUnderGoal: number;
}

export interface IReport {
  _id: string;
  userId: string;
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  summary: IReportSummary;
  aiSummary?: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDashboardSummary {
  todayTasks: { total: number; completed: number };
  todayHabits: { total: number; completed: number };
  todayWaterMl: number;
  todayFocusMinutes: number;
  weeklyFocusMinutes: number;
  todayMoodScore: number | null;
  currentStreak: number;
}
