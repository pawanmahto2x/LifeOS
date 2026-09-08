import { Types } from 'mongoose';

export type HabitFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface IHabit {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  frequency: HabitFrequency;
  reminderTime?: string;
  targetDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  isPaused: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabitHistory {
  _id: Types.ObjectId;
  habitId: Types.ObjectId;
  userId: Types.ObjectId;
  completed: boolean;
  completionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateHabitDto {
  userId: string;
  title: string;
  frequency?: HabitFrequency;
  reminderTime?: string;
  targetDays?: number;
}

export interface IUpdateHabitDto {
  title?: string;
  frequency?: HabitFrequency;
  reminderTime?: string;
  targetDays?: number;
  currentStreak?: number;
  longestStreak?: number;
  completionRate?: number;
  isPaused?: boolean;
  isDeleted?: boolean;
}

export interface IHabitFilterOptions {
  userId: string;
  frequency?: HabitFrequency;
  isPaused?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
