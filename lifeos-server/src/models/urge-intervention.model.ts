import { Schema, model, Document, Model } from 'mongoose';
import { IUrgeIntervention } from '../types/digital-wellbeing.types';

export interface IUrgeInterventionDocument extends Omit<IUrgeIntervention, '_id'>, Document {}
export type UrgeInterventionModelType = Model<IUrgeInterventionDocument>;

const urgeInterventionSchema = new Schema<IUrgeInterventionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    redirectedAction: { type: String, required: true },
    outcome: { type: String, enum: ['completed', 'abandoned'], required: true },
  },
  { timestamps: true, versionKey: false },
);

urgeInterventionSchema.index({ userId: 1, date: -1 });

export const UrgeInterventionModel = model<IUrgeInterventionDocument, UrgeInterventionModelType>(
  'UrgeIntervention',
  urgeInterventionSchema,
);
