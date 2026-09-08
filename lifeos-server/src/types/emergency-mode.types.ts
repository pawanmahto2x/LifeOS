import { Types } from 'mongoose';

// Snapshot of settings taken at Emergency Mode activation
export interface IEmergencyModeSettingsSnapshot {
  focusLockEnabled?: boolean;
  dailyScreenTimeGoalMinutes?: number;
  warningThresholdPercent?: number;
}

export interface IEmergencyModeState {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  isActive: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
  priorFocusSettings?: IEmergencyModeSettingsSnapshot;
  priorDigitalDetoxSettings?: IEmergencyModeSettingsSnapshot;
  priorNotificationPreferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// DTO returned to client for status view
export interface IEmergencyStatusDto {
  isActive: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
}
