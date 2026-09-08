import { Types } from 'mongoose';

export type WaterUnit = 'ml' | 'L';

export interface IWaterLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  unit: WaterUnit;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SleepQuality = 'Poor' | 'Fair' | 'Good' | 'Excellent';

export interface ISleepLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sleepTime: Date;
  wakeTime: Date;
  duration: number; // duration in minutes
  quality: SleepQuality;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MoodType = 'Excellent' | 'Happy' | 'Calm' | 'Neutral' | 'Stressed' | 'Sad' | 'Angry';

export interface IMoodLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  mood: MoodType;
  moodScore: number; // 1 to 10
  note?: string;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthSummary {
  water: {
    todayTotalMl: number;
    dailyGoalMl: number;
    progressPercentage: number;
    logCount: number;
  };
  sleep: {
    lastSession: ISleepLog | null;
    sevenDayAverageDurationMinutes: number;
  };
  mood: {
    todayLatestMood: IMoodLog | null;
    sevenDayAverageScore: number | null;
  };
}
