import { Schema, model, Document, Model } from 'mongoose';
import { IDigitalDetoxSettings, IAppLimit } from '../types/digital-detox.types';

export interface DigitalDetoxSettingsDocument
  extends Omit<IDigitalDetoxSettings, '_id'>, Document {}
export type DigitalDetoxSettingsModelType = Model<DigitalDetoxSettingsDocument>;

const appLimitSchema = new Schema<IAppLimit>(
  {
    appName: {
      type: String,
      required: [true, 'App name is required'],
      trim: true,
    },
    dailyLimitMinutes: {
      type: Number,
      required: [true, 'Daily limit in minutes is required'],
      min: [1, 'Daily limit must be at least 1 minute'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
  },
  { _id: false },
);

const digitalDetoxSettingsSchema = new Schema<DigitalDetoxSettingsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    dailyScreenTimeGoalMinutes: {
      type: Number,
      default: 120, // 2 hours default
      min: [10, 'Goal must be at least 10 minutes'],
      max: [1440, 'Goal cannot exceed 1440 minutes'],
    },
    appLimits: {
      type: [appLimitSchema],
      default: [],
    },
    warningThresholdPercent: {
      type: Number,
      default: 80, // Warn at 80% of limit
      min: [10, 'Threshold must be at least 10%'],
      max: [100, 'Threshold cannot exceed 100%'],
    },
    focusLockEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DigitalDetoxSettings = model<
  DigitalDetoxSettingsDocument,
  DigitalDetoxSettingsModelType
>('DigitalDetoxSettings', digitalDetoxSettingsSchema, 'digital_detox_settings');
