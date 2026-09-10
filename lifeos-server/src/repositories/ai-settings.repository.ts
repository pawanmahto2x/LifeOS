import { AISettings, AISettingsDocument } from '../models/ai-settings.model';
import { ISaveAISettingsDto, IUpdateAISettingsDto } from '../types/ai.types';
import { encryptApiKey } from '../utils/encryption';

export class AISettingsRepository {
  async findByUserId(userId: string): Promise<AISettingsDocument | null> {
    return AISettings.findOne({ userId }).exec();
  }

  async upsertSettings(userId: string, data: ISaveAISettingsDto): Promise<AISettingsDocument> {
    const encryptedApiKey = encryptApiKey(data.apiKey);

    const doc = await AISettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          provider: data.provider,
          model: data.model,
          encryptedApiKey,
          isEnabled: data.isEnabled ?? true,
        },
      },
      { new: true, upsert: true, runValidators: true },
    ).exec();

    if (!doc) throw new Error('Failed to upsert AI settings');
    return doc;
  }

  async updateSettings(
    userId: string,
    data: IUpdateAISettingsDto,
  ): Promise<AISettingsDocument | null> {
    const updateData: Record<string, unknown> = {};

    if (data.provider) updateData.provider = data.provider;
    if (data.model) updateData.model = data.model;
    if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
    if (data.apiKey) updateData.encryptedApiKey = encryptApiKey(data.apiKey);

    return AISettings.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true },
    ).exec();
  }

  async deleteSettings(userId: string): Promise<AISettingsDocument | null> {
    return AISettings.findOneAndDelete({ userId }).exec();
  }
}
