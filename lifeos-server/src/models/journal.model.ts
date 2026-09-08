import { Schema, model, Document, Model } from 'mongoose';
import { IJournal, JournalMood } from '../types/journal.types';

export interface IJournalDocument extends Omit<IJournal, '_id'>, Document {}

export type JournalModelType = Model<IJournalDocument>;

const journalSchema = new Schema<IJournalDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Journal title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Journal content is required'],
      trim: true,
    },
    mood: {
      type: String,
      enum: ['Excellent', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Sad', 'Angry'] as JournalMood[],
      default: undefined,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes per Backend-Schema.md Section 5.5
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ userId: 1, tags: 1 });
journalSchema.index({ userId: 1, isDeleted: 1 });

export const Journal = model<IJournalDocument, JournalModelType>('Journal', journalSchema);
