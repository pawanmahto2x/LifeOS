import { Types } from 'mongoose';

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// The summary object stored inside a report document
export interface IReportSummary {
  // Tasks
  tasksCreated: number;
  tasksCompleted: number;
  tasksCompletionRate: number; // 0-100%

  // Habits
  habitsTracked: number;
  habitCompletions: number;
  habitCompletionRate: number;

  // Health
  avgDailySleepMinutes: number;
  avgDailyWaterMl: number;
  avgMoodScore: number;

  // Focus
  totalFocusMinutes: number;
  totalFocusSessions: number;

  // Digital Detox
  avgDailyScreenTimeMinutes: number;
  screenTimeGoalMinutes: number;
  daysUnderGoal: number;

  // Goals & Missions
  missionsCompleted?: number;
  activeGoals?: number;
  milestonesCompleted?: number;
}

export interface IReport {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  reportType: ReportType;
  periodStart: Date;
  periodEnd: Date;
  summary: IReportSummary;
  aiSummary?: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard summary DTO (lightweight, computed on-the-fly, not stored)
export interface IDashboardSummary {
  todayTasks: { total: number; completed: number };
  todayHabits: { total: number; completed: number };
  todayWaterMl: number;
  todayFocusMinutes: number;
  weeklyFocusMinutes: number;
  todayMoodScore: number | null;
  currentStreak: number; // longest active habit streak
  todayMissionStatus?: {
    hasMission: boolean;
    completed: boolean;
    title?: string;
    dayType?: string;
  };
  activeGoalsCount?: number;
}
