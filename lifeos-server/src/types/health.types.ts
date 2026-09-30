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

export interface IBodyMetric {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  height: number; // cm
  weight: number; // kg
  bmi: number;
  recordedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ActivityType = 'running' | 'gym' | 'cycling' | 'swimming' | 'yoga' | 'other';

export interface IActivityLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: ActivityType;
  duration: number; // minutes
  calories?: number;
  notes?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SessionType = 'meditation' | 'breathing' | 'yoga' | 'other';

export interface IMindfulnessSession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  duration: number; // minutes
  sessionType: SessionType;
  moodBefore?: MoodType;
  moodAfter?: MoodType;
  notes?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
