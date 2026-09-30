import { Schema, model, Document, Model } from 'mongoose';
import { IPersonalBaseline } from '../types/insights.types';

export interface IPersonalBaselineDocument extends Omit<IPersonalBaseline, '_id'>, Document {}
export type PersonalBaselineModelType = Model<IPersonalBaselineDocument>;

const personalBaselineSchema = new Schema<IPersonalBaselineDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, enum: ['7d', '14d', '30d'], required: true },
    avgTasksCompletedPerDay: { type: Number, default: 0 },
    avgFocusMinutesPerDay: { type: Number, default: 0 },
    avgSleepMinutes: { type: Number, default: 0 },
    avgWaterMlPerDay: { type: Number, default: 0 },
    avgMoodScore: { type: Number, default: 0 },
    avgHabitCompletionRate: { type: Number, default: 0 },
    dataPointCount: { type: Number, default: 0 },
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

personalBaselineSchema.index({ userId: 1, period: 1 }, { unique: true });

export const PersonalBaseline = model<IPersonalBaselineDocument, PersonalBaselineModelType>(
  'PersonalBaseline',
  personalBaselineSchema,
);
