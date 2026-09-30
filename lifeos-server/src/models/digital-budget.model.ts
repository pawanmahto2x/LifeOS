import { Schema, model, Document, Model } from 'mongoose';
import { IDigitalBudget } from '../types/digital-wellbeing.types';

export interface IDigitalBudgetDocument extends Omit<IDigitalBudget, '_id'>, Document {}
export type DigitalBudgetModelType = Model<IDigitalBudgetDocument>;

const digitalBudgetSchema = new Schema<IDigitalBudgetDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dailyTargetMinutes: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const DigitalBudgetModel = model<IDigitalBudgetDocument, DigitalBudgetModelType>(
  'DigitalBudget',
  digitalBudgetSchema,
);
