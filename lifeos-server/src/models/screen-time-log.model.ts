import { Schema, model, Document, Model } from 'mongoose';
import { IScreenTimeLog } from '../types/digital-detox.types';

export interface ScreenTimeLogDocument extends Omit<IScreenTimeLog, '_id'>, Document {}
export type ScreenTimeLogModelType = Model<ScreenTimeLogDocument>;

const screenTimeLogSchema = new Schema<ScreenTimeLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    appName: {
      type: String,
      trim: true,
      default: 'Device Screen Time',
    },
    minutesUsed: {
      type: Number,
      required: [true, 'Minutes used is required'],
      min: [1, 'Minutes used must be at least 1'],
    },
    loggedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

screenTimeLogSchema.index({ userId: 1, loggedDate: -1 });

export const ScreenTimeLog = model<ScreenTimeLogDocument, ScreenTimeLogModelType>(
  'ScreenTimeLog',
  screenTimeLogSchema,
  'screen_time_logs',
);
