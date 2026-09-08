import { Schema, model, Document, Model } from 'mongoose';
import { IHabitHistory } from '../types/habit.types';

export interface IHabitHistoryDocument extends Omit<IHabitHistory, '_id'>, Document {}

export type HabitHistoryModelType = Model<IHabitHistoryDocument>;

const habitHistorySchema = new Schema<IHabitHistoryDocument>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: [true, 'Habit reference is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    completed: {
      type: Boolean,
      required: true,
      default: true,
    },
    completionDate: {
      type: Date,
      required: [true, 'Completion date is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound index to guarantee one history log per habit per user per calendar day
habitHistorySchema.index({ habitId: 1, userId: 1, completionDate: 1 }, { unique: true });

export const HabitHistory = model<IHabitHistoryDocument, HabitHistoryModelType>(
  'HabitHistory',
  habitHistorySchema,
);
