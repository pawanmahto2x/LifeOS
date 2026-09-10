export type NotificationType =
  'Reminder' | 'Achievement' | 'AI Insight' | 'Challenge' | 'Group' | 'System';

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  scheduledFor?: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationPreferences {
  _id: string;
  userId: string;
  email: boolean;
  browser: boolean;
  habitReminders: boolean;
  taskReminders: boolean;
  weeklyReport: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateNotificationPreferencesDto {
  email?: boolean;
  browser?: boolean;
  habitReminders?: boolean;
  taskReminders?: boolean;
  weeklyReport?: boolean;
}
