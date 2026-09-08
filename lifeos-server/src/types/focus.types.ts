import { Types } from 'mongoose';

export interface IFocusSession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  taskId?: Types.ObjectId;
  duration: number; // Duration in minutes
  completed: boolean;
  distractions: number;
  startedAt: Date;
  endedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateFocusSessionDto {
  userId: string;
  taskId?: string;
  duration: number; // Target duration in minutes
  startedAt?: Date;
}

export interface IEndFocusSessionDto {
  sessionId: string;
  distractions?: number;
  notes?: string;
  completed?: boolean;
}

export interface IFocusSessionFilterOptions {
  userId: string;
  taskId?: string;
  completed?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface FocusAnalyticsSummary {
  todayFocusMinutes: number;
  todayCompletedSessions: number;
  todayDistractions: number;
  totalFocusMinutes: number;
  totalCompletedSessions: number;
  currentRunningSession: IFocusSession | null;
}
