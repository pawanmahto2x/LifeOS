import { Schema, model, Document, Model } from 'mongoose';
import { IWaterLog, WaterUnit } from '../types/health.types';

export interface WaterLogDocument extends Omit<IWaterLog, '_id'>, Document {}
export type WaterLogModelType = Model<WaterLogDocument>;

const waterLogSchema = new Schema<WaterLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be positive'],
    },
    unit: {
      type: String,
      enum: ['ml', 'L'] as WaterUnit[],
      default: 'ml',
      required: [true, 'Unit is required'],
    },
    loggedAt: {
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

waterLogSchema.index({ userId: 1, loggedAt: -1 });

export const WaterLog = model<WaterLogDocument, WaterLogModelType>(
  'WaterLog',
  waterLogSchema,
  'water_logs',
);
