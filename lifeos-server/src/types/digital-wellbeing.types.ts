import { Types } from 'mongoose';

export interface IUsageLog {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  appName: string;
  durationMinutes: number;
  category: string;
  reason: string;
  date: Date;
}

export interface IDigitalBudget {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  dailyTargetMinutes: number;
}

export interface IUrgeIntervention {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  redirectedAction: string;
  outcome: 'completed' | 'abandoned';
}

export interface IDetoxSession {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  targetDuration: number;
  completed: boolean;
  endedEarlyReason?: string;
}
