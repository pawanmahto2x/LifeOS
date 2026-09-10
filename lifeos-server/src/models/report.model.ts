import mongoose, { Document, Schema } from 'mongoose';
import { ReportType } from '../types/report.types';

const ReportSummarySchema = new Schema(
  {
    tasksCreated: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    tasksCompletionRate: { type: Number, default: 0 },
    habitsTracked: { type: Number, default: 0 },
    habitCompletions: { type: Number, default: 0 },
    habitCompletionRate: { type: Number, default: 0 },
    avgDailySleepMinutes: { type: Number, default: 0 },
    avgDailyWaterMl: { type: Number, default: 0 },
    avgMoodScore: { type: Number, default: 0 },
    totalFocusMinutes: { type: Number, default: 0 },
    totalFocusSessions: { type: Number, default: 0 },
    avgDailyScreenTimeMinutes: { type: Number, default: 0 },
    screenTimeGoalMinutes: { type: Number, default: 120 },
    daysUnderGoal: { type: Number, default: 0 },
  },
  { _id: false },
);

export interface ReportDocument extends Document {
  userId: mongoose.Types.ObjectId;
  reportType: ReportType;
  periodStart: Date;
  periodEnd: Date;
  summary: {
    tasksCreated: number;
    tasksCompleted: number;
    tasksCompletionRate: number;
    habitsTracked: number;
    habitCompletions: number;
    habitCompletionRate: number;
    avgDailySleepMinutes: number;
    avgDailyWaterMl: number;
    avgMoodScore: number;
    totalFocusMinutes: number;
    totalFocusSessions: number;
    avgDailyScreenTimeMinutes: number;
    screenTimeGoalMinutes: number;
    daysUnderGoal: number;
  };
  aiSummary?: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<ReportDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    summary: { type: ReportSummarySchema, required: true },
    aiSummary: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound index per Backend-Schema.md Section 5.10
ReportSchema.index({ userId: 1, reportType: 1, periodStart: 1 }, { unique: true });

export const Report = mongoose.model<ReportDocument>('Report', ReportSchema, 'reports');
