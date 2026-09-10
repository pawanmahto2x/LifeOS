import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NotificationService } from '../src/services/notification.service';
import { NotificationRepository } from '../src/repositories/notification.repository';
import { NotificationDocument } from '../src/models/notification.model';
import { NotificationPreferencesDocument } from '../src/models/notification-preferences.model';
import {
  ICreateNotificationDto,
  IUpdateNotificationPreferencesDto,
} from '../types/notification.types';
import { Types } from 'mongoose';

// ─── Mock Repository ──────────────────────────────────────────────────────────

class MockNotificationRepository extends NotificationRepository {
  private notifications: Map<string, NotificationDocument> = new Map();
  private preferences: Map<string, NotificationPreferencesDocument> = new Map();

  async create(data: ICreateNotificationDto): Promise<NotificationDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
      actionUrl: data.actionUrl,
      scheduledFor: data.scheduledFor,
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as NotificationDocument;

    this.notifications.set(id.toString(), doc);
    return doc;
  }

  async findByUserId(userId: string): Promise<NotificationDocument[]> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId.toString() === userId,
    );
  }

  async findUnreadByUserId(userId: string): Promise<NotificationDocument[]> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId.toString() === userId && !n.isRead,
    );
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument | null> {
    const doc = this.notifications.get(id);
    if (!doc || doc.userId.toString() !== userId) return null;
    doc.isRead = true;
    return doc;
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const doc of this.notifications.values()) {
      if (doc.userId.toString() === userId && !doc.isRead) {
        doc.isRead = true;
        count++;
      }
    }
    return count;
  }

  async delete(id: string, userId: string): Promise<NotificationDocument | null> {
    const doc = this.notifications.get(id);
    if (!doc || doc.userId.toString() !== userId) return null;
    this.notifications.delete(id);
    return doc;
  }

  async countUnread(userId: string): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId.toString() === userId && !n.isRead,
    ).length;
  }

  async getPreferences(userId: string): Promise<NotificationPreferencesDocument | null> {
    return this.preferences.get(userId) || null;
  }

  async upsertPreferences(
    userId: string,
    data: IUpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDocument> {
    const existing = this.preferences.get(userId);
    const doc = {
      _id: existing?._id || new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      email: data.email ?? existing?.email ?? true,
      browser: data.browser ?? existing?.browser ?? true,
      habitReminders: data.habitReminders ?? existing?.habitReminders ?? true,
      taskReminders: data.taskReminders ?? existing?.taskReminders ?? true,
      weeklyReport: data.weeklyReport ?? existing?.weeklyReport ?? true,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    } as unknown as NotificationPreferencesDocument;

    this.preferences.set(userId, doc);
    return doc;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 12 - Notifications Service Unit Tests', () => {
  const userId = new Types.ObjectId().toString();
  const repo = new MockNotificationRepository();
  const service = new NotificationService(repo);

  it('should return default preferences when first accessed', async () => {
    const prefs = await service.getPreferences(userId);
    assert.strictEqual(prefs.email, true);
    assert.strictEqual(prefs.browser, true);
    assert.strictEqual(prefs.habitReminders, true);
    assert.strictEqual(prefs.taskReminders, true);
    assert.strictEqual(prefs.weeklyReport, true);
  });

  it('should update preferences correctly', async () => {
    const updated = await service.updatePreferences(userId, {
      taskReminders: false,
      email: false,
    });
    assert.strictEqual(updated.taskReminders, false);
    assert.strictEqual(updated.email, false);
    assert.strictEqual(updated.habitReminders, true); // untouched
  });

  it('should deliver system notifications unconditionally', async () => {
    const notif = await service.createNotification({
      userId,
      title: 'Welcome to LifeOS',
      message: 'Your account is ready.',
      type: 'System',
    });
    assert.ok(notif);
    assert.strictEqual(notif.isRead, false);

    const unread = await service.getUnreadCount(userId);
    assert.strictEqual(unread.count, 1);
  });

  it('should suppress disabled task reminders per user preferences', async () => {
    // taskReminders was set to false in the previous test
    const notif = await service.createNotification({
      userId,
      title: 'Task Due Reminder',
      message: 'Your task is due in 30 minutes',
      type: 'Reminder',
    });
    // Should be suppressed (null)
    assert.strictEqual(notif, null);
  });

  it('should mark an individual notification as read', async () => {
    const list = await service.getNotifications(userId);
    assert.ok(list.length > 0);
    const target = list[0];

    const updated = await service.markAsRead(target._id.toString(), userId);
    assert.ok(updated);
    assert.strictEqual(updated.isRead, true);

    const unread = await service.getUnreadCount(userId);
    assert.strictEqual(unread.count, 0);
  });

  it('should mark all notifications as read and delete notification', async () => {
    // Create two new unread notifications
    await service.createNotification({
      userId,
      title: 'Achievement Unlocked',
      message: 'First task completed!',
      type: 'Achievement',
    });
    await service.createNotification({
      userId,
      title: 'AI Insight',
      message: 'Your focus peaked yesterday.',
      type: 'AI Insight',
    });

    let unread = await service.getUnreadCount(userId);
    assert.strictEqual(unread.count, 2);

    const res = await service.markAllAsRead(userId);
    assert.strictEqual(res.markedCount, 2);

    unread = await service.getUnreadCount(userId);
    assert.strictEqual(unread.count, 0);

    // Delete one
    const all = await service.getNotifications(userId);
    const del = await service.deleteNotification(all[0]._id.toString(), userId);
    assert.ok(del);

    const afterDel = await service.getNotifications(userId);
    assert.strictEqual(afterDel.length, all.length - 1);
  });
});
