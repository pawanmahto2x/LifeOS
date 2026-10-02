import { AISettings, AISettingsDocument } from '../models/ai-settings.model';
import { ISaveAISettingsDto, IUpdateAISettingsDto } from '../types/ai.types';
import { encryptApiKey } from '../utils/encryption';

export class AISettingsRepository {
  async findByUserId(userId: string): Promise<AISettingsDocument | null> {
    return AISettings.findOne({ userId }).exec();
  }

  async upsertSettings(userId: string, data: ISaveAISettingsDto): Promise<AISettingsDocument> {
    const updatePayload: any = {
      userId,
      provider: data.provider,
      model: data.model,
      isEnabled: data.isEnabled ?? true,
    };

    if (data.apiKey) updatePayload.encryptedApiKey = encryptApiKey(data.apiKey);
    if (data.baseUrl) updatePayload.baseUrl = data.baseUrl;

    const doc = await AISettings.findOneAndUpdate(
      { userId },
      { $set: updatePayload },
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
    if (data.baseUrl) updateData.baseUrl = data.baseUrl;

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
