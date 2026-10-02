import { Schema, model, Document, Model } from 'mongoose';
import { ITask, TaskPriority, TaskStatus } from '../types/task.types';

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}

export type TaskModelType = Model<ITaskDocument>;

const taskSchema = new Schema<ITaskDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
      index: true,
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: undefined,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'] as TaskPriority[],
      default: 'Medium',
      required: true,
    },
    dueDate: {
      type: Date,
      default: undefined,
    },
    reminder: {
      type: Date,
      default: undefined,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Archived'] as TaskStatus[],
      default: 'Pending',
      required: true,
    },
    completedAt: {
      type: Date,
      default: undefined,
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

// Compound indexes per Backend-Schema.md Section 5.2
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, isDeleted: 1 });

export const Task = model<ITaskDocument, TaskModelType>('Task', taskSchema);
