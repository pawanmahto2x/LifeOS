import { EmergencyModeState, EmergencyModeStateDocument } from '../models/emergency-mode.model';

export class EmergencyModeRepository {
  async findByUserId(userId: string): Promise<EmergencyModeStateDocument | null> {
    return EmergencyModeState.findOne({ userId }).exec();
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
    const result = await EmergencyModeState.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...data,
          userId,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    ).exec();

    if (!result) {
      throw new Error('Failed to upsert emergency mode state');
    }

    return result;
  }
}
