import { Schema, model, Document, Model } from 'mongoose';
import { IFocusSession } from '../types/focus.types';

export interface FocusSessionDocument extends Omit<IFocusSession, '_id'>, Document {}
export type FocusSessionModelType = Model<FocusSessionDocument>;

const focusSessionSchema = new Schema<FocusSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: undefined,
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    distractions: {
      type: Number,
      default: 0,
      min: [0, 'Distractions cannot be negative'],
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endedAt: {
      type: Date,
      default: undefined,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

focusSessionSchema.index({ userId: 1, startedAt: -1 });

export const FocusSession = model<FocusSessionDocument, FocusSessionModelType>(
  'FocusSession',
  focusSessionSchema,
  'focus_sessions',
);
