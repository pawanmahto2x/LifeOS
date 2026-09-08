import { Schema, model, Document, Model } from 'mongoose';
import { IMoodLog, MoodType } from '../types/health.types';

export interface MoodLogDocument extends Omit<IMoodLog, '_id'>, Document {}
export type MoodLogModelType = Model<MoodLogDocument>;

const moodLogSchema = new Schema<MoodLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    mood: {
      type: String,
      enum: ['Excellent', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Sad', 'Angry'] as MoodType[],
      required: [true, 'Mood is required'],
    },
    moodScore: {
      type: Number,
      required: [true, 'Mood score is required'],
      min: [1, 'Mood score must be at least 1'],
      max: [10, 'Mood score cannot exceed 10'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
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

moodLogSchema.index({ userId: 1, loggedAt: -1 });

export const MoodLog = model<MoodLogDocument, MoodLogModelType>(
  'MoodLog',
  moodLogSchema,
  'mood_logs',
);
