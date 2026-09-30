import { Schema, model, Document, Model } from 'mongoose';
import { IDetoxSession } from '../types/digital-wellbeing.types';

export interface IDetoxSessionDocument extends Omit<IDetoxSession, '_id'>, Document {}
export type DetoxSessionModelType = Model<IDetoxSessionDocument>;

const detoxSessionSchema = new Schema<IDetoxSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    targetDuration: { type: Number, required: true },
    completed: { type: Boolean, required: true, default: false },
    endedEarlyReason: { type: String },
  },
  { timestamps: true, versionKey: false },
);

detoxSessionSchema.index({ userId: 1, startTime: -1 });

export const DetoxSessionModel = model<IDetoxSessionDocument, DetoxSessionModelType>(
  'DetoxSession',
  detoxSessionSchema,
);
