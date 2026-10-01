import { Schema, model, Document, Model } from 'mongoose';
import { IDailyMission } from '../types/daily-mission.types';

export interface IDailyMissionDocument extends Omit<IDailyMission, '_id'>, Document {}
export type DailyMissionModelType = Model<IDailyMissionDocument>;

const supportingGoalSchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['habit', 'focus', 'health', 'task', 'milestone', 'goal'],
      required: true,
    },
    targetValue: { type: String },
    completed: { type: Boolean, default: false },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    goalTitle: { type: String },
    category: { type: String },
  },
  { _id: false },
);

const primaryMissionSchema = new Schema(
  {
    title: { type: String, required: true },
    taskId: { type: String },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    goalTitle: { type: String },
    category: { type: String },
    reason: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const explanationSchema = new Schema(
  {
    dayTypeReason: { type: String, required: true },
    missionReason: { type: String, required: true },
    reminderReason: { type: String, required: true },
  },
  { _id: false },
);

const reviewSchema = new Schema(
  {
    completedTasks: { type: Number, required: true },
    plannedTasks: { type: Number, required: true },
    completedHabits: { type: Number, required: true },
    plannedHabits: { type: Number, required: true },
    focusMinutes: { type: Number, required: true },
    plannedFocusMinutes: { type: Number, required: true },
    whatWentWell: { type: String },
    whatRemainedIncomplete: { type: String },
    moodReflection: { type: String },
    tomorrowChange: { type: String },
    reviewedAt: { type: Date, required: true },
  },
  { _id: false },
);

const dailyMissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    dayType: { type: String, enum: ['recovery', 'normal', 'high-focus'], required: true },
    primaryMission: { type: primaryMissionSchema, required: true },
    supportingGoals: { type: [supportingGoalSchema], required: true },
    personalReminder: { type: String, required: true },
    avoidance: { type: String, required: true },
    explanation: { type: explanationSchema, required: true },
    review: { type: reviewSchema },
    status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
  },
  { timestamps: true, versionKey: false },
);

dailyMissionSchema.index({ userId: 1, date: 1 }, { unique: true });
dailyMissionSchema.index({ userId: 1, createdAt: -1 });

export const DailyMission = model<IDailyMissionDocument, DailyMissionModelType>(
  'DailyMission',
  dailyMissionSchema,
);
