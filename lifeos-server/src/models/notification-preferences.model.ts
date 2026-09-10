import mongoose, { Document, Schema } from 'mongoose';

export interface NotificationPreferencesDocument extends Document {
  userId: mongoose.Types.ObjectId;
  email: boolean;
  browser: boolean;
  habitReminders: boolean;
  taskReminders: boolean;
  weeklyReport: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<NotificationPreferencesDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    email: { type: Boolean, default: true },
    browser: { type: Boolean, default: true },
    habitReminders: { type: Boolean, default: true },
    taskReminders: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Unique index per Backend-Schema.md Section 5.18
NotificationPreferencesSchema.index({ userId: 1 }, { unique: true });

export const NotificationPreferences = mongoose.model<NotificationPreferencesDocument>(
  'NotificationPreferences',
  NotificationPreferencesSchema,
  'notification_preferences',
);
