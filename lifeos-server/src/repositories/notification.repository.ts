import { Notification, NotificationDocument } from '../models/notification.model';
import {
  NotificationPreferences,
  NotificationPreferencesDocument,
} from '../models/notification-preferences.model';
import {
  ICreateNotificationDto,
  IUpdateNotificationPreferencesDto,
} from '../types/notification.types';

export class NotificationRepository {
  // ─── Notifications ──────────────────────────────────────────────────────────

  async create(data: ICreateNotificationDto): Promise<NotificationDocument> {
    const notification = new Notification({
      ...data,
      sentAt: new Date(),
    });
    return notification.save();
  }

  async findByUserId(userId: string, limit = 50): Promise<NotificationDocument[]> {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findUnreadByUserId(userId: string): Promise<NotificationDocument[]> {
    return Notification.find({ userId, isRead: false }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument | null> {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true },
    ).exec();
  }

  async markAllAsRead(userId: string): Promise<number> {
    const res = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    ).exec();
    return res.modifiedCount;
  }

  async delete(id: string, userId: string): Promise<NotificationDocument | null> {
    return Notification.findOneAndDelete({ _id: id, userId }).exec();
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false }).exec();
  }

  // ─── Notification Preferences ────────────────────────────────────────────────

  async getPreferences(userId: string): Promise<NotificationPreferencesDocument | null> {
    return NotificationPreferences.findOne({ userId }).exec();
  }

  async upsertPreferences(
    userId: string,
    data: IUpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDocument> {
    const res = await NotificationPreferences.findOneAndUpdate(
      { userId },
      { $set: { ...data, userId } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    ).exec();

    if (!res) throw new Error('Failed to upsert notification preferences');
    return res;
  }
}
