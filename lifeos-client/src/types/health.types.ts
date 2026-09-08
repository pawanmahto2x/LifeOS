export type WaterUnit = 'ml' | 'L';

export interface WaterLog {
  id?: string;
  _id?: string;
  userId: string;
  amount: number;
  unit: WaterUnit;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type SleepQuality = 'Poor' | 'Fair' | 'Good' | 'Excellent';

export interface SleepLog {
  id?: string;
  _id?: string;
  userId: string;
  sleepTime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: SleepQuality;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MoodType = 'Excellent' | 'Happy' | 'Calm' | 'Neutral' | 'Stressed' | 'Sad' | 'Angry';

export interface MoodLog {
  id?: string;
  _id?: string;
  userId: string;
  mood: MoodType;
  moodScore: number;
  note?: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthSummary {
  water: {
    todayTotalMl: number;
    dailyGoalMl: number;
    progressPercentage: number;
    logCount: number;
  };
  sleep: {
    lastSession: SleepLog | null;
    sevenDayAverageDurationMinutes: number;
  };
  mood: {
    todayLatestMood: MoodLog | null;
    sevenDayAverageScore: number | null;
  };
}

export interface WaterLogsResponse {
  logs: WaterLog[];
  total: number;
  page: number;
  totalPages: number;
  todayTotalMl: number;
  dailyGoalMl: number;
}

export interface SleepLogsResponse {
  logs: SleepLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MoodLogsResponse {
  logs: MoodLog[];
  total: number;
  page: number;
  totalPages: number;
}
