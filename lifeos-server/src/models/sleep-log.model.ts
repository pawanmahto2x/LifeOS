import { Schema, model, Document, Model } from 'mongoose';
import { ISleepLog, SleepQuality } from '../types/health.types';

export interface SleepLogDocument extends Omit<ISleepLog, '_id'>, Document {}
export type SleepLogModelType = Model<SleepLogDocument>;

const sleepLogSchema = new Schema<SleepLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    sleepTime: {
      type: Date,
      required: [true, 'Sleep time is required'],
      index: true,
    },
    wakeTime: {
      type: Date,
      required: [true, 'Wake time is required'],
    },
    duration: {
      type: Number, // duration in minutes
      required: [true, 'Duration is required'],
      min: [0, 'Duration cannot be negative'],
    },
    quality: {
      type: String,
      enum: ['Poor', 'Fair', 'Good', 'Excellent'] as SleepQuality[],
      required: [true, 'Quality is required'],
      default: 'Good',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

sleepLogSchema.index({ userId: 1, sleepTime: -1 });

export const SleepLog = model<SleepLogDocument, SleepLogModelType>(
  'SleepLog',
  sleepLogSchema,
  'sleep_logs',
);
