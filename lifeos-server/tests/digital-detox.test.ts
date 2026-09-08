import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DigitalDetoxService } from '../src/services/digital-detox.service';
import { DigitalDetoxRepository } from '../src/repositories/digital-detox.repository';
import { ScreenTimeLogRepository } from '../src/repositories/screen-time-log.repository';
import { DigitalDetoxSettingsDocument } from '../src/models/digital-detox.model';
import { ScreenTimeLogDocument } from '../src/models/screen-time-log.model';
import {
  IUpdateDigitalDetoxSettingsDto,
  ILogScreenTimeDto,
} from '../types/digital-detox.types';
import { Types } from 'mongoose';

class MockDigitalDetoxRepository extends DigitalDetoxRepository {
  private settingsMap: Map<string, DigitalDetoxSettingsDocument> = new Map();

  async findByUserId(userId: string): Promise<DigitalDetoxSettingsDocument | null> {
    return this.settingsMap.get(userId) || null;
  }

  async upsertSettings(
    userId: string,
    data: IUpdateDigitalDetoxSettingsDto,
  ): Promise<DigitalDetoxSettingsDocument> {
    const existing = this.settingsMap.get(userId);
    const doc = {
      _id: existing?._id || new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      dailyScreenTimeGoalMinutes:
        data.dailyScreenTimeGoalMinutes !== undefined
          ? data.dailyScreenTimeGoalMinutes
          : existing?.dailyScreenTimeGoalMinutes ?? 120,
      appLimits:
        data.appLimits !== undefined
          ? data.appLimits
          : existing?.appLimits ?? [],
      warningThresholdPercent:
        data.warningThresholdPercent !== undefined
          ? data.warningThresholdPercent
          : existing?.warningThresholdPercent ?? 80,
      focusLockEnabled:
        data.focusLockEnabled !== undefined
          ? data.focusLockEnabled
          : existing?.focusLockEnabled ?? false,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    } as unknown as DigitalDetoxSettingsDocument;

    this.settingsMap.set(userId, doc);
    return doc;
  }
}

class MockScreenTimeLogRepository extends ScreenTimeLogRepository {
  private logs: Map<string, ScreenTimeLogDocument> = new Map();

  async create(data: ILogScreenTimeDto): Promise<ScreenTimeLogDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      userId: new Types.ObjectId(data.userId),
      appName: data.appName || 'General Usage',
      minutesUsed: data.minutesUsed,
      loggedDate: data.loggedDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ScreenTimeLogDocument;

    this.logs.set(id.toString(), doc);
    return doc;
  }

  async findByDateRange(
    userId: string,
    _startDate: Date,
    _endDate: Date,
  ): Promise<ScreenTimeLogDocument[]> {
    return Array.from(this.logs.values()).filter((l) => l.userId.toString() === userId);
  }
}

describe('Phase 9 - Digital Detox Service Unit Tests', () => {
  const userId = new Types.ObjectId().toString();

  const detoxRepo = new MockDigitalDetoxRepository();
  const screenTimeRepo = new MockScreenTimeLogRepository();
  const service = new DigitalDetoxService(detoxRepo, screenTimeRepo);

  it('should return default detox settings when first accessed', async () => {
    const settings = await service.getSettings(userId);
    assert.strictEqual(settings.dailyScreenTimeGoalMinutes, 120);
    assert.strictEqual(settings.warningThresholdPercent, 80);
    assert.strictEqual(settings.appLimits.length, 0);
  });

  it('should update detox settings and per-app limits', async () => {
    const updated = await service.updateSettings(userId, {
      dailyScreenTimeGoalMinutes: 90,
      warningThresholdPercent: 75,
      appLimits: [
        { appName: 'Instagram', dailyLimitMinutes: 30, category: 'Social Media' },
        { appName: 'YouTube', dailyLimitMinutes: 45, category: 'Entertainment' },
      ],
    });

    assert.strictEqual(updated.dailyScreenTimeGoalMinutes, 90);
    assert.strictEqual(updated.warningThresholdPercent, 75);
    assert.strictEqual(updated.appLimits.length, 2);
    assert.strictEqual(updated.appLimits[0].appName, 'Instagram');
  });

  it('should log screen time and calculate usage percentage and threshold warning', async () => {
    // Log 70 minutes (70/90 = 77.7% -> triggers 75% warning!)
    await service.logScreenTime(userId, { appName: 'Instagram', minutesUsed: 25 });
    await service.logScreenTime(userId, { appName: 'YouTube', minutesUsed: 45 });

    const usage = await service.getUsage(userId);

    assert.strictEqual(usage.todayTotalMinutes, 70);
    assert.strictEqual(usage.goalMinutes, 90);
    assert.strictEqual(usage.percentageUsed, 78);
    assert.strictEqual(usage.isWarningTriggered, true);
    assert.strictEqual(usage.isGoalExceeded, false);
    assert.strictEqual(usage.appUsage.length, 2);
  });

  it('should accurately calculate opportunity cost from screen time saved', async () => {
    const cost = await service.getOpportunityCost(userId);

    assert.strictEqual(cost.screenTimeGoalMinutes, 90);
    assert.strictEqual(cost.todayScreenTimeMinutes, 70);
    assert.strictEqual(cost.minutesSaved, 20);
    assert.strictEqual(cost.hasUsageData, true);
    assert.strictEqual(typeof cost.equivalentPomodoroSessions, 'number');
  });
});
