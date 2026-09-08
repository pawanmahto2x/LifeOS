export interface IAppLimit {
  appName: string;
  dailyLimitMinutes: number;
  category?: string;
}

export interface IDigitalDetoxSettings {
  _id: string;
  userId: string;
  dailyScreenTimeGoalMinutes: number;
  appLimits: IAppLimit[];
  warningThresholdPercent: number;
  focusLockEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IScreenTimeLog {
  _id: string;
  userId: string;
  appName?: string;
  minutesUsed: number;
  loggedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateDigitalDetoxSettingsPayload {
  dailyScreenTimeGoalMinutes?: number;
  appLimits?: IAppLimit[];
  warningThresholdPercent?: number;
  focusLockEnabled?: boolean;
}

export interface ILogScreenTimePayload {
  appName?: string;
  minutesUsed: number;
  loggedDate?: string;
}

export interface IOpportunityCostSummary {
  screenTimeGoalMinutes: number;
  todayScreenTimeMinutes: number;
  minutesSaved: number;
  equivalentPomodoroSessions: number;
  equivalentBookPages: number;
  hasUsageData: boolean;
}

export interface IDigitalDetoxAppUsageItem {
  appName: string;
  minutesUsed: number;
  dailyLimitMinutes?: number;
  isLimitExceeded?: boolean;
}

export interface IDigitalDetoxUsageSummary {
  settings: IDigitalDetoxSettings;
  todayTotalMinutes: number;
  goalMinutes: number;
  percentageUsed: number;
  isWarningTriggered: boolean;
  isGoalExceeded: boolean;
  appUsage: IDigitalDetoxAppUsageItem[];
}
