import mongoose, { Document, Schema } from 'mongoose';

// Sub-schema for settings snapshots
const settingsSnapshotSchema = new Schema(
  {
    focusLockEnabled: { type: Boolean },
    dailyScreenTimeGoalMinutes: { type: Number },
    warningThresholdPercent: { type: Number },
  },
  { _id: false },
);

export interface EmergencyModeStateDocument extends Document {
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
  priorFocusSettings?: {
    focusLockEnabled?: boolean;
    dailyScreenTimeGoalMinutes?: number;
    warningThresholdPercent?: number;
  };
  priorDigitalDetoxSettings?: {
    focusLockEnabled?: boolean;
    dailyScreenTimeGoalMinutes?: number;
    warningThresholdPercent?: number;
  };
  priorNotificationPreferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyModeStateSchema = new Schema<EmergencyModeStateDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isActive: { type: Boolean, default: false, required: true },
    activatedAt: { type: Date },
    deactivatedAt: { type: Date },
    priorFocusSettings: { type: settingsSnapshotSchema },
    priorDigitalDetoxSettings: { type: settingsSnapshotSchema },
    priorNotificationPreferences: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Unique index per Backend-Schema.md Section 5.21
EmergencyModeStateSchema.index({ userId: 1 }, { unique: true });

export const EmergencyModeState = mongoose.model<EmergencyModeStateDocument>(
  'EmergencyModeState',
  EmergencyModeStateSchema,
  'emergency_mode_state',
);
