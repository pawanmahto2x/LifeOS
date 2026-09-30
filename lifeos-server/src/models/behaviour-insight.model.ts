import { Schema, model, Document, Model } from 'mongoose';
import { IBehaviourInsight } from '../types/insights.types';

export interface IBehaviourInsightDocument extends Omit<IBehaviourInsight, '_id'>, Document {}
export type BehaviourInsightModelType = Model<IBehaviourInsightDocument>;

const behaviourInsightSchema = new Schema<IBehaviourInsightDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['correlation', 'trend', 'attention'], required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dataPoints: { type: Number, default: 0 },
    confidence: { type: String, enum: ['low', 'medium', 'high'], required: true },
    period: { type: String, enum: ['7d', '14d', '30d'], required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

behaviourInsightSchema.index({ userId: 1, type: 1 });
behaviourInsightSchema.index({ userId: 1, isActive: 1 });

export const BehaviourInsight = model<IBehaviourInsightDocument, BehaviourInsightModelType>(
  'BehaviourInsight',
  behaviourInsightSchema,
);
