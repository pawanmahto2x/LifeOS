import { Schema, model, Document, Model } from 'mongoose';
import { ILifeReplay } from '../types/life-replay.types';

export interface ILifeReplayDocument extends Omit<ILifeReplay, '_id'>, Document {}
export type LifeReplayModelType = Model<ILifeReplayDocument>;

const lifeReplaySchema = new Schema<ILifeReplayDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    period: { type: String, enum: ['weekly', 'monthly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    productivity: {
      tasksCompleted: { type: Number, default: 0 },
      tasksCreated: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      focusSessions: { type: Number, default: 0 },
      focusTimeMinutes: { type: Number, default: 0 },
    },
    wellness: {
      avgSleepMinutes: { type: Number, default: 0 },
      avgWaterMlPerDay: { type: Number, default: 0 },
      avgMoodScore: { type: Number, default: 0 },
      sleepLogs: { type: Number, default: 0 },
      waterLogs: { type: Number, default: 0 },
      moodLogs: { type: Number, default: 0 },
    },
    habits: {
      consistency: { type: Number, default: 0 },
      totalCompletions: { type: Number, default: 0 },
      activeHabits: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
    },
    reflection: {
      journalEntries: { type: Number, default: 0 },
      commonThemes: [{ type: String }],
      topMood: { type: String, default: null },
    },
    changes: {
      focusChange: { type: Number, default: 0 },
      taskChange: { type: Number, default: 0 },
      sleepChange: { type: Number, default: 0 },
      habitChange: { type: Number, default: 0 },
      waterChange: { type: Number, default: 0 },
      moodChange: { type: Number, default: 0 },
    },
    patterns: [
      {
        description: { type: String, required: true },
        dataPoints: { type: Number, required: true },
      },
    ],
    userReflection: {
      whatToContinue: { type: String },
      whatToChange: { type: String },
      nextGoal: { type: String },
      submittedAt: { type: Date },
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

lifeReplaySchema.index({ userId: 1, period: 1, startDate: 1 }, { unique: true });
lifeReplaySchema.index({ userId: 1, generatedAt: -1 });

export const LifeReplay = model<ILifeReplayDocument, LifeReplayModelType>(
  'LifeReplay',
  lifeReplaySchema,
);
