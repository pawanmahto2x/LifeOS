import mongoose, { Document, Schema } from 'mongoose';
import {
  ChallengeVisibility,
  ChallengeDifficulty,
  ChallengeCategory,
} from '../types/challenge.types';

export interface ChallengeDocument extends Document {
  creatorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  startDate: Date;
  endDate: Date;
  visibility: ChallengeVisibility;
  reward?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<ChallengeDocument>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Health', 'Custom'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    visibility: {
      type: String,
      enum: ['Public', 'Private', 'Friends', 'Group'],
      default: 'Public',
      required: true,
      index: true,
    },
    reward: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes per Backend-Schema.md Section 5.11
ChallengeSchema.index({ creatorId: 1, visibility: 1, category: 1 });

export const Challenge = mongoose.model<ChallengeDocument>(
  'Challenge',
  ChallengeSchema,
  'challenges',
);
