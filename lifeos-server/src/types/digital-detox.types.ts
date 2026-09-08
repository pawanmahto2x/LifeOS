import { Types } from 'mongoose';

export interface IAppLimit {
  appName: string;
  dailyLimitMinutes: number;
  category?: string;
}

export interface IDigitalDetoxSettings {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  dailyScreenTimeGoalMinutes: number;
  appLimits: IAppLimit[];
  warningThresholdPercent: number; // e.g. 80 for 80%
  focusLockEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IScreenTimeLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  appName?: string;
  minutesUsed: number;
  loggedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateDigitalDetoxSettingsDto {
  dailyScreenTimeGoalMinutes?: number;
  appLimits?: IAppLimit[];
  warningThresholdPercent?: number;
  focusLockEnabled?: boolean;
}

export interface ILogScreenTimeDto {
  userId: string;
  appName?: string;
  minutesUsed: number;
  loggedDate?: Date;
}

export interface OpportunityCostSummary {
  screenTimeGoalMinutes: number;
  todayScreenTimeMinutes: number;
  minutesSaved: number;
  equivalentPomodoroSessions: number; // minutesSaved / 25
  equivalentBookPages: number; // ~1 page per 2 minutes
  hasUsageData: boolean;
}

export interface DigitalDetoxUsageSummary {
  settings: IDigitalDetoxSettings;
  todayTotalMinutes: number;
  goalMinutes: number;
  percentageUsed: number;
  isWarningTriggered: boolean;
  isGoalExceeded: boolean;
  appUsage: {
    appName: string;
    minutesUsed: number;
    dailyLimitMinutes?: number;
    isLimitExceeded?: boolean;
  }[];
}
