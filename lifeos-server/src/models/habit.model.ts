import { Schema, model, Document, Model } from 'mongoose';
import { IHabit, HabitFrequency } from '../types/habit.types';

export interface IHabitDocument extends Omit<IHabit, '_id'>, Document {}

export type HabitModelType = Model<IHabitDocument>;

const habitSchema = new Schema<IHabitDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: undefined,
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'] as HabitFrequency[],
      default: 'Daily',
      required: true,
    },
    reminderTime: {
      type: String,
      trim: true,
      default: undefined,
    },
    targetDays: {
      type: Number,
      default: 7,
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      required: true,
    },
    longestStreak: {
      type: Number,
      default: 0,
      required: true,
    },
    completionRate: {
      type: Number,
      default: 0,
      required: true,
    },
    isPaused: {
      type: Boolean,
      default: false,
      required: true,
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

// Compound indexes per Backend-Schema.md Section 5.3
habitSchema.index({ userId: 1, frequency: 1 });
habitSchema.index({ userId: 1, isDeleted: 1 });

export const Habit = model<IHabitDocument, HabitModelType>('Habit', habitSchema);
