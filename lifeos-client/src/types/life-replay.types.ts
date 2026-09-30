export type ReplayPeriod = 'weekly' | 'monthly';

export interface IReplayProductivity {
  tasksCompleted: number;
  tasksCreated: number;
  completionRate: number;
  focusSessions: number;
  focusTimeMinutes: number;
}

export interface IReplayWellness {
  avgSleepMinutes: number;
  avgWaterMlPerDay: number;
  avgMoodScore: number;
  sleepLogs: number;
  waterLogs: number;
  moodLogs: number;
}

export interface IReplayHabits {
  consistency: number;
  totalCompletions: number;
  activeHabits: number;
  bestStreak: number;
}

export interface IReplayReflection {
  journalEntries: number;
  commonThemes: string[];
  topMood: string | null;
}

export interface IReplayChanges {
  focusChange: number;
  taskChange: number;
  sleepChange: number;
  habitChange: number;
  waterChange: number;
  moodChange: number;
}

export interface IReplayPattern {
  description: string;
  dataPoints: number;
}

export interface IUserReflection {
  whatToContinue?: string;
  whatToChange?: string;
  nextGoal?: string;
  submittedAt: string;
}

export interface ILifeReplay {
  _id: string;
  userId: string;
  period: ReplayPeriod;
  startDate: string;
  endDate: string;
  productivity: IReplayProductivity;
  wellness: IReplayWellness;
  habits: IReplayHabits;
  reflection: IReplayReflection;
  changes: IReplayChanges;
  patterns: IReplayPattern[];
  userReflection?: IUserReflection;
  generatedAt: string;
}
