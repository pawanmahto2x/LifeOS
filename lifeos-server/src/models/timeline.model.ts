import { Schema, model, Types, Model } from 'mongoose';
import { TimelineEntryType } from '../types/timeline.types';

export interface TimelineDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  entryType: TimelineEntryType;
  title: string;
  description: string;
  sourceId: Types.ObjectId;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TimelineModelType = Model<TimelineDocument>;

const TimelineSchema = new Schema<TimelineDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entryType: {
      type: String,
      enum: ['GoalCompleted', 'HabitMilestone', 'ChallengeCompleted', 'AchievementUnlocked'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    occurredAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound index for querying user timeline sorted by occurredAt
TimelineSchema.index({ userId: 1, occurredAt: -1 });

// Compound unique index to guarantee idempotent entry creation per source event
TimelineSchema.index({ userId: 1, entryType: 1, sourceId: 1 }, { unique: true });

export const Timeline = model<TimelineDocument, TimelineModelType>(
  'Timeline',
  TimelineSchema,
  'life_timeline',
);
