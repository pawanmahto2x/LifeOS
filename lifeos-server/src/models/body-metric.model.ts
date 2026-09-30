import { Schema, model, Document, Model } from 'mongoose';
import { IBodyMetric } from '../types/health.types';

export interface IBodyMetricDocument extends Omit<IBodyMetric, '_id'>, Document {}
export type BodyMetricModelType = Model<IBodyMetricDocument>;

const bodyMetricSchema = new Schema<IBodyMetricDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    bmi: { type: Number, required: true },
    recordedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

bodyMetricSchema.index({ userId: 1, recordedAt: -1 });

export const BodyMetric = model<IBodyMetricDocument, BodyMetricModelType>(
  'BodyMetric',
  bodyMetricSchema,
);
