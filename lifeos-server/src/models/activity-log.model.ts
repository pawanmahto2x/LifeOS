import { Schema, model, Document, Model } from 'mongoose';
import { IActivityLog } from '../types/health.types';

export interface IActivityLogDocument extends Omit<IActivityLog, '_id'>, Document {}
export type ActivityLogModelType = Model<IActivityLogDocument>;

const activityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    duration: { type: Number, required: true },
    calories: { type: Number },
    notes: { type: String },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

activityLogSchema.index({ userId: 1, date: -1 });

export const ActivityLog = model<IActivityLogDocument, ActivityLogModelType>(
  'ActivityLog',
  activityLogSchema,
);
