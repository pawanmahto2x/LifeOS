import { EmergencyModeRepository } from '../repositories/emergency-mode.repository';
import { DigitalDetoxRepository } from '../repositories/digital-detox.repository';
import { EmergencyModeStateDocument } from '../models/emergency-mode.model';
import { IEmergencyStatusDto } from '../types/emergency-mode.types';

export class EmergencyModeService {
  private emergencyRepo: EmergencyModeRepository;
  private detoxRepo: DigitalDetoxRepository;

  constructor(emergencyRepo?: EmergencyModeRepository, detoxRepo?: DigitalDetoxRepository) {
    this.emergencyRepo = emergencyRepo || new EmergencyModeRepository();
    this.detoxRepo = detoxRepo || new DigitalDetoxRepository();
  }

  /**
   * Returns the current emergency mode state (or a default inactive state if none exists yet).
   */
  async getState(userId: string): Promise<EmergencyModeStateDocument> {
    let state = await this.emergencyRepo.findByUserId(userId);
    if (!state) {
      state = await this.emergencyRepo.upsertState(userId, {
        isActive: false,
      });
    }
    return state;
  }

  /**
   * Returns a simple DTO with isActive, activatedAt, deactivatedAt — avoids leaking snapshot internals.
   */
  async getStatus(userId: string): Promise<IEmergencyStatusDto> {
    const state = await this.getState(userId);
    return {
      isActive: state.isActive,
      activatedAt: state.activatedAt,
      deactivatedAt: state.deactivatedAt,
    };
  }

  /**
   * Enables Emergency Mode:
   * 1. Snapshots current Digital Detox settings into priorDigitalDetoxSettings.
   * 2. Activates Focus Lock via Digital Detox settings update.
   * 3. Persists isActive: true + activatedAt timestamp.
   *
   * Per API.md Section 15 and Implementation.md Phase 10.
   */
  async enableEmergencyMode(userId: string): Promise<IEmergencyStatusDto> {
    const existingState = await this.emergencyRepo.findByUserId(userId);

    // Already active — idempotent, return current state
    if (existingState?.isActive) {
      return {
        isActive: true,
        activatedAt: existingState.activatedAt,
      };
    }

    // Snapshot current Digital Detox settings so we can restore on disable
    const currentDetoxSettings = await this.detoxRepo.findByUserId(userId);
    const detoxSnapshot = currentDetoxSettings
      ? {
          focusLockEnabled: currentDetoxSettings.focusLockEnabled ?? false,
          dailyScreenTimeGoalMinutes: currentDetoxSettings.dailyScreenTimeGoalMinutes,
          warningThresholdPercent: currentDetoxSettings.warningThresholdPercent,
        }
      : undefined;

    // Activate Emergency Mode: enable Focus Lock, reduce daily screen time to 30m emergency budget
    await this.detoxRepo.upsertSettings(userId, {
      focusLockEnabled: true,
      dailyScreenTimeGoalMinutes: 30,
      warningThresholdPercent: 50,
    });

    const now = new Date();
    await this.emergencyRepo.upsertState(userId, {
      isActive: true,
      activatedAt: now,
      deactivatedAt: undefined,
      priorDigitalDetoxSettings: detoxSnapshot as Record<string, unknown>,
    });

    return {
      isActive: true,
      activatedAt: now,
    };
  }

  /**
   * Disables Emergency Mode:
   * 1. Restores the prior Digital Detox settings snapshot.
   * 2. Sets isActive: false + deactivatedAt timestamp.
   *
   * Per API.md Section 15 — "Restores the settings snapshot taken at activation."
   */
  async disableEmergencyMode(userId: string): Promise<IEmergencyStatusDto> {
    const existingState = await this.emergencyRepo.findByUserId(userId);

    // Already inactive — idempotent, return current state
    if (!existingState || !existingState.isActive) {
      return {
        isActive: false,
        deactivatedAt: existingState?.deactivatedAt,
      };
    }

    // Restore Digital Detox settings snapshot taken at activation
    if (existingState.priorDigitalDetoxSettings) {
      await this.detoxRepo.upsertSettings(userId, {
        focusLockEnabled: existingState.priorDigitalDetoxSettings.focusLockEnabled ?? false,
        dailyScreenTimeGoalMinutes:
          existingState.priorDigitalDetoxSettings.dailyScreenTimeGoalMinutes ?? 120,
        warningThresholdPercent:
          existingState.priorDigitalDetoxSettings.warningThresholdPercent ?? 80,
      });
    }

    const now = new Date();
    await this.emergencyRepo.upsertState(userId, {
      isActive: false,
      deactivatedAt: now,
      // Clear snapshots after restoration
      priorDigitalDetoxSettings: undefined,
    });

    return {
      isActive: false,
      deactivatedAt: now,
    };
  }
}
