import { Types } from 'mongoose';

export type NotificationType =
  'Reminder' | 'Achievement' | 'AI Insight' | 'Challenge' | 'Group' | 'System';

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
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

export interface INotificationPreferences {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  email: boolean;
  browser: boolean;
  habitReminders: boolean;
  taskReminders: boolean;
  weeklyReport: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateNotificationPreferencesDto {
  email?: boolean;
  browser?: boolean;
  habitReminders?: boolean;
  taskReminders?: boolean;
  weeklyReport?: boolean;
}

export interface ICreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  scheduledFor?: Date;
}
