import { describe, it } from 'node:test';
import assert from 'node:assert';
import { EmergencyModeService } from '../src/services/emergency-mode.service';
import { EmergencyModeRepository } from '../src/repositories/emergency-mode.repository';
import { DigitalDetoxRepository } from '../src/repositories/digital-detox.repository';
import { EmergencyModeStateDocument } from '../src/models/emergency-mode.model';
import { DigitalDetoxSettingsDocument } from '../src/models/digital-detox.model';
import { IUpdateDigitalDetoxSettingsDto } from '../types/digital-detox.types';
import { Types } from 'mongoose';

// ─── Mock Repositories ────────────────────────────────────────────────────────

class MockEmergencyModeRepository extends EmergencyModeRepository {
  private stateMap: Map<string, EmergencyModeStateDocument> = new Map();

  async findByUserId(userId: string): Promise<EmergencyModeStateDocument | null> {
    return this.stateMap.get(userId) || null;
  }

  async upsertState(
    userId: string,
    data: Partial<{
      isActive: boolean;
      activatedAt: Date;
      deactivatedAt: Date;
      priorFocusSettings: Record<string, unknown>;
      priorDigitalDetoxSettings: Record<string, unknown>;
      priorNotificationPreferences: Record<string, unknown>;
    }>,
  ): Promise<EmergencyModeStateDocument> {
    const existing = this.stateMap.get(userId);
    const doc = {
      _id: existing?._id || new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      isActive: data.isActive !== undefined ? data.isActive : (existing?.isActive ?? false),
      activatedAt: data.activatedAt !== undefined ? data.activatedAt : existing?.activatedAt,
      deactivatedAt:
        data.deactivatedAt !== undefined ? data.deactivatedAt : existing?.deactivatedAt,
      priorFocusSettings:
        data.priorFocusSettings !== undefined
          ? data.priorFocusSettings
          : existing?.priorFocusSettings,
      priorDigitalDetoxSettings:
        data.priorDigitalDetoxSettings !== undefined
          ? data.priorDigitalDetoxSettings
          : existing?.priorDigitalDetoxSettings,
      priorNotificationPreferences:
        data.priorNotificationPreferences !== undefined
          ? data.priorNotificationPreferences
          : existing?.priorNotificationPreferences,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    } as unknown as EmergencyModeStateDocument;

    this.stateMap.set(userId, doc);
    return doc;
  }
}

class MockDetoxRepository extends DigitalDetoxRepository {
  private settingsMap: Map<string, DigitalDetoxSettingsDocument> = new Map();

  constructor(initialSettings?: Partial<DigitalDetoxSettingsDocument> & { userId: string }) {
    super();
    if (initialSettings) {
      const doc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(initialSettings.userId),
        dailyScreenTimeGoalMinutes: initialSettings.dailyScreenTimeGoalMinutes ?? 120,
        appLimits: initialSettings.appLimits ?? [],
        warningThresholdPercent: initialSettings.warningThresholdPercent ?? 80,
        focusLockEnabled: initialSettings.focusLockEnabled ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as DigitalDetoxSettingsDocument;
      this.settingsMap.set(initialSettings.userId, doc);
    }
  }

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
          : (existing?.dailyScreenTimeGoalMinutes ?? 120),
      appLimits: data.appLimits !== undefined ? data.appLimits : (existing?.appLimits ?? []),
      warningThresholdPercent:
        data.warningThresholdPercent !== undefined
          ? data.warningThresholdPercent
          : (existing?.warningThresholdPercent ?? 80),
      focusLockEnabled:
        data.focusLockEnabled !== undefined
          ? data.focusLockEnabled
          : (existing?.focusLockEnabled ?? false),
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    } as unknown as DigitalDetoxSettingsDocument;

    this.settingsMap.set(userId, doc);
    return doc;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 10 - Emergency Mode Service Unit Tests', () => {
  it('should return inactive state when no emergency mode record exists', async () => {
    const userId = new Types.ObjectId().toString();
    const emergencyRepo = new MockEmergencyModeRepository();
    const detoxRepo = new MockDetoxRepository();
    const service = new EmergencyModeService(emergencyRepo, detoxRepo);

    const status = await service.getStatus(userId);

    assert.strictEqual(status.isActive, false);
    assert.strictEqual(status.activatedAt, undefined);
  });

  it('should enable emergency mode, snapshot detox settings, and activate Focus Lock', async () => {
    const userId = new Types.ObjectId().toString();
    const emergencyRepo = new MockEmergencyModeRepository();
    // Pre-seed: user has a 120m screen time goal and Focus Lock disabled
    const detoxRepo = new MockDetoxRepository({
      userId,
      dailyScreenTimeGoalMinutes: 120,
      warningThresholdPercent: 80,
      focusLockEnabled: false,
    });
    const service = new EmergencyModeService(emergencyRepo, detoxRepo);

    const result = await service.enableEmergencyMode(userId);

    assert.strictEqual(result.isActive, true);
    assert.ok(result.activatedAt instanceof Date);

    // After activation, detox settings should have Focus Lock enabled and restricted goal
    const detoxAfter = await detoxRepo.findByUserId(userId);
    assert.strictEqual(detoxAfter?.focusLockEnabled, true);
    assert.strictEqual(detoxAfter?.dailyScreenTimeGoalMinutes, 30);

    // Snapshot should be saved
    const stateAfter = await emergencyRepo.findByUserId(userId);
    assert.ok(stateAfter?.priorDigitalDetoxSettings);
    assert.strictEqual(
      (stateAfter?.priorDigitalDetoxSettings as Record<string, unknown>)?.dailyScreenTimeGoalMinutes,
      120,
    );
  });

  it('should disable emergency mode and restore prior settings snapshot', async () => {
    const userId = new Types.ObjectId().toString();
    const emergencyRepo = new MockEmergencyModeRepository();
    const detoxRepo = new MockDetoxRepository({
      userId,
      dailyScreenTimeGoalMinutes: 90,
      warningThresholdPercent: 70,
      focusLockEnabled: false,
    });
    const service = new EmergencyModeService(emergencyRepo, detoxRepo);

    // Enable first
    await service.enableEmergencyMode(userId);

    // Now disable — should restore 90m goal, 70% threshold, and unlock Focus Lock
    const result = await service.disableEmergencyMode(userId);

    assert.strictEqual(result.isActive, false);
    assert.ok(result.deactivatedAt instanceof Date);

    const detoxAfter = await detoxRepo.findByUserId(userId);
    assert.strictEqual(detoxAfter?.dailyScreenTimeGoalMinutes, 90);
    assert.strictEqual(detoxAfter?.warningThresholdPercent, 70);
    assert.strictEqual(detoxAfter?.focusLockEnabled, false);
  });

  it('should be idempotent when enabling emergency mode that is already active', async () => {
    const userId = new Types.ObjectId().toString();
    const emergencyRepo = new MockEmergencyModeRepository();
    const detoxRepo = new MockDetoxRepository({ userId });
    const service = new EmergencyModeService(emergencyRepo, detoxRepo);

    await service.enableEmergencyMode(userId);
    const firstActivation = await service.getStatus(userId);

    // Enable again
    await service.enableEmergencyMode(userId);
    const secondCall = await service.getStatus(userId);

    // Should still be active, activated time should be the same (or very close)
    assert.strictEqual(secondCall.isActive, true);
    assert.deepStrictEqual(secondCall.activatedAt, firstActivation.activatedAt);
  });
});
