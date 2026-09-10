import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType } from '../types/notification.types';

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  scheduledFor?: Date;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Reminder', 'Achievement', 'AI Insight', 'Challenge', 'Group', 'System'],
      required: true,
      default: 'System',
    },
    isRead: { type: Boolean, default: false, index: true },
    actionUrl: { type: String, trim: true },
    scheduledFor: { type: Date, index: true },
    sentAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound indexes per Backend-Schema.md Section 5.16
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, scheduledFor: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<NotificationDocument>(
  'Notification',
  NotificationSchema,
  'notifications',
);
