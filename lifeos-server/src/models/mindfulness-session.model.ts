import { Schema, model, Document, Model } from 'mongoose';
import { IMindfulnessSession } from '../types/health.types';

export interface IMindfulnessSessionDocument extends Omit<IMindfulnessSession, '_id'>, Document {}
export type MindfulnessSessionModelType = Model<IMindfulnessSessionDocument>;

const mindfulnessSessionSchema = new Schema<IMindfulnessSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    duration: { type: Number, required: true },
    sessionType: {
      type: String,
      enum: ['meditation', 'breathing', 'yoga', 'other'],
      required: true,
    },
    moodBefore: {
      type: String,
      enum: ['Excellent', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Sad', 'Angry'],
    },
    moodAfter: {
      type: String,
      enum: ['Excellent', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Sad', 'Angry'],
    },
    notes: { type: String },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

mindfulnessSessionSchema.index({ userId: 1, date: -1 });

export const MindfulnessSession = model<IMindfulnessSessionDocument, MindfulnessSessionModelType>(
  'MindfulnessSession',
  mindfulnessSessionSchema,
);
