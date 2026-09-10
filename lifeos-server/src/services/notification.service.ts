import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationDocument } from '../models/notification.model';
import { NotificationPreferencesDocument } from '../models/notification-preferences.model';
import {
  ICreateNotificationDto,
  IUpdateNotificationPreferencesDto,
} from '../types/notification.types';

export class NotificationService {
  private repo: NotificationRepository;

  constructor(repo?: NotificationRepository) {
    this.repo = repo || new NotificationRepository();
  }

  // ─── Notification Queries ───────────────────────────────────────────────────

  async getNotifications(userId: string, limit = 50): Promise<NotificationDocument[]> {
    return this.repo.findByUserId(userId, limit);
  }

  async getUnreadNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.repo.findUnreadByUserId(userId);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.repo.countUnread(userId);
    return { count };
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument | null> {
    return this.repo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<{ markedCount: number }> {
    const markedCount = await this.repo.markAllAsRead(userId);
    return { markedCount };
  }

  async deleteNotification(id: string, userId: string): Promise<NotificationDocument | null> {
    return this.repo.delete(id, userId);
  }

  // ─── Creating & Dispatching (Checking Preferences) ─────────────────────────

  async createNotification(data: ICreateNotificationDto): Promise<NotificationDocument | null> {
    const prefs = await this.getPreferences(data.userId);

    // Filter based on user preference category per Implementation.md Section Acceptance Criteria:
    // "Only enabled notifications are delivered."
    if (data.type === 'Reminder') {
      // Check if it's task or habit reminder
      const isTask =
        data.title.toLowerCase().includes('task') || data.message.toLowerCase().includes('task');
      const isHabit =
        data.title.toLowerCase().includes('habit') || data.message.toLowerCase().includes('habit');

      if (isTask && !prefs.taskReminders) return null;
      if (isHabit && !prefs.habitReminders) return null;
    }

    return this.repo.create(data);
  }

  // ─── Preferences ────────────────────────────────────────────────────────────

  async getPreferences(userId: string): Promise<NotificationPreferencesDocument> {
    let prefs = await this.repo.getPreferences(userId);
    if (!prefs) {
      prefs = await this.repo.upsertPreferences(userId, {
        email: true,
        browser: true,
        habitReminders: true,
        taskReminders: true,
        weeklyReport: true,
      });
    }
    return prefs;
  }

  async updatePreferences(
    userId: string,
    data: IUpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDocument> {
    return this.repo.upsertPreferences(userId, data);
  }
}
