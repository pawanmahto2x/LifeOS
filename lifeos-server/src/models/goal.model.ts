import { Schema, model, Document, Model } from 'mongoose';
import { IGoal, IMilestone } from '../types/goal.types';

export interface IGoalDocument extends Omit<IGoal, '_id'>, Document {}
export type GoalModelType = Model<IGoalDocument>;

const milestoneSchema = new Schema<IMilestone>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, required: true },
});

const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: [
        'career',
        'education',
        'health',
        'fitness',
        'personal',
        'finance',
        'relationships',
        'creativity',
        'other',
      ],
      required: true,
    },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'abandoned'],
      default: 'active',
    },
    milestones: [milestoneSchema],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

goalSchema.index({ userId: 1, status: 1 });

export const Goal = model<IGoalDocument, GoalModelType>('Goal', goalSchema);
