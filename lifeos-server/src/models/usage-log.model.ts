import { Schema, model, Document, Model } from 'mongoose';
import { IUsageLog } from '../types/digital-wellbeing.types';

export interface IUsageLogDocument extends Omit<IUsageLog, '_id'>, Document {}
export type UsageLogModelType = Model<IUsageLogDocument>;

const usageLogSchema = new Schema<IUsageLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    appName: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    category: { type: String, required: true },
    reason: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
);

usageLogSchema.index({ userId: 1, date: -1 });

export const UsageLogModel = model<IUsageLogDocument, UsageLogModelType>(
  'UsageLog',
  usageLogSchema,
);
