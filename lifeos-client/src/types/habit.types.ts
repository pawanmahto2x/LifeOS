export type HabitFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface IHabit {
  _id: string;
  userId: string;
  title: string;
  frequency: HabitFrequency;
  reminderTime?: string;
  targetDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  isPaused: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IHabitHistory {
  _id: string;
  habitId: string;
  userId: string;
  completed: boolean;
  completionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateHabitPayload {
  title: string;
  frequency?: HabitFrequency;
  reminderTime?: string;
  targetDays?: number;
}

export interface IUpdateHabitPayload {
  title?: string;
  frequency?: HabitFrequency;
  reminderTime?: string;
  targetDays?: number;
}

export interface IHabitsListResponse {
  habits: IHabit[];
  total: number;
  page: number;
  totalPages: number;
}
