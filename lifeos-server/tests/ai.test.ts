import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AIService } from '../src/services/ai.service';
import { AISettingsRepository } from '../src/repositories/ai-settings.repository';
import { AISettingsDocument } from '../src/models/ai-settings.model';
import { ISaveAISettingsDto, IUpdateAISettingsDto } from '../types/ai.types';
import { encryptApiKey, decryptApiKey } from '../src/utils/encryption';
import { Types } from 'mongoose';

// ─── Mock Repository ──────────────────────────────────────────────────────────

class MockAISettingsRepository extends AISettingsRepository {
  private settings: Map<string, AISettingsDocument> = new Map();

  async findByUserId(userId: string): Promise<AISettingsDocument | null> {
    return this.settings.get(userId) || null;
  }

  async upsertSettings(userId: string, data: ISaveAISettingsDto): Promise<AISettingsDocument> {
    const existing = this.settings.get(userId);
    const doc = {
      _id: existing?._id || new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      provider: data.provider,
      model: data.model,
      encryptedApiKey: encryptApiKey(data.apiKey),
      isEnabled: data.isEnabled ?? true,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    } as unknown as AISettingsDocument;

    this.settings.set(userId, doc);
    return doc;
  }

  async updateSettings(userId: string, data: IUpdateAISettingsDto): Promise<AISettingsDocument | null> {
    const doc = this.settings.get(userId);
    if (!doc) return null;

    if (data.provider) doc.provider = data.provider;
    if (data.model) doc.model = data.model;
    if (data.isEnabled !== undefined) doc.isEnabled = data.isEnabled;
    if (data.apiKey) doc.encryptedApiKey = encryptApiKey(data.apiKey);
    doc.updatedAt = new Date();

    return doc;
  }

  async deleteSettings(userId: string): Promise<AISettingsDocument | null> {
    const doc = this.settings.get(userId);
    if (!doc) return null;
    this.settings.delete(userId);
    return doc;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 15 - AI Integration Service Unit Tests', () => {
  const userId = new Types.ObjectId().toString();
  const repo = new MockAISettingsRepository();
  const service = new AIService(repo);

  it('should verify AES-256-GCM encryption and decryption roundtrip', () => {
    const originalKey = 'sk-test-secret-key-1234567890';
    const encrypted = encryptApiKey(originalKey);

    assert.notStrictEqual(encrypted, originalKey);
    assert.ok(encrypted.includes(':')); // iv:authTag:cipher

    const decrypted = decryptApiKey(encrypted);
    assert.strictEqual(decrypted, originalKey);
  });

  it('should return disabled AI state when user has not configured BYOK settings', async () => {
    const settings = await service.getSettings(userId);
    assert.strictEqual(settings.isEnabled, false);
    assert.strictEqual(settings.hasKey, false);
  });

  it('should save encrypted AI settings without returning the plain-text key', async () => {
    const saved = await service.saveSettings(userId, {
      provider: 'gemini',
      apiKey: 'AIzaSyDemoKey987654321',
      model: 'gemini-2.5-pro',
      isEnabled: true,
    });

    assert.strictEqual(saved.provider, 'gemini');
    assert.strictEqual(saved.model, 'gemini-2.5-pro');
    assert.strictEqual(saved.isEnabled, true);
    assert.strictEqual(saved.hasKey, true);
    assert.strictEqual((saved as unknown as { apiKey?: string }).apiKey, undefined);

    // Verify stored key is actually encrypted
    const stored = await repo.findByUserId(userId);
    assert.ok(stored);
    assert.notStrictEqual(stored.encryptedApiKey, 'AIzaSyDemoKey987654321');
    assert.strictEqual(decryptApiKey(stored.encryptedApiKey), 'AIzaSyDemoKey987654321');
  });

  it('should update AI provider model configuration', async () => {
    const updated = await service.updateSettings(userId, {
      model: 'gemini-2.5-flash',
    });

    assert.strictEqual(updated.model, 'gemini-2.5-flash');
    assert.strictEqual(updated.provider, 'gemini');
  });

  it('should delete AI settings and clear stored key', async () => {
    await service.deleteSettings(userId);
    const settings = await service.getSettings(userId);
    assert.strictEqual(settings.hasKey, false);
    assert.strictEqual(settings.isEnabled, false);
  });

  it('should reject AI coach queries when AI is not configured or disabled', async () => {
    await assert.rejects(
      async () => {
        await service.askAICoach(userId, 'How can I stay consistent?');
      },
      { name: 'BadRequestError' },
    );
  });
});
