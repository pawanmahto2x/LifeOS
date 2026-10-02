import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { ProviderFactory } from '../src/ai/provider.factory';
import { OllamaProvider } from '../src/ai/providers/ollama.provider';
import { OpenRouterProvider } from '../src/ai/providers/openrouter.provider';
import { AISettingsRepository } from '../src/repositories/ai-settings.repository';
import { AISettingsDocument } from '../src/models/ai-settings.model';
import { encryptApiKey } from '../src/utils/encryption';
import { Types } from 'mongoose';

// Ensure the module respects env variables during the test
import { env } from '../src/config/env';

describe('Phase 1 - AI Provider Abstraction', () => {
  let factory: ProviderFactory;
  let mockRepo: Partial<AISettingsRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: mock.fn(async () => null),
    };
    factory = new ProviderFactory(mockRepo as AISettingsRepository);
  });

  describe('ProviderFactory Priority Logic', () => {
    const userId = new Types.ObjectId().toString();

    it('should select user BYOK Ollama over system defaults', async () => {
      const mockSettings = {
        userId: new Types.ObjectId(userId),
        provider: 'ollama',
        model: 'llama3.1',
        baseUrl: 'http://custom-ollama:11434',
        isEnabled: true,
      } as unknown as AISettingsDocument;

      mockRepo.findByUserId = mock.fn(async () => mockSettings);

      const provider = await factory.getProvider(userId);
      assert.ok(provider instanceof OllamaProvider);
      assert.strictEqual(provider.name, 'ollama');
      // @ts-ignore
      assert.strictEqual(provider.baseUrl, 'http://custom-ollama:11434');
    });

    it('should select user BYOK OpenRouter over system defaults', async () => {
      const mockSettings = {
        userId: new Types.ObjectId(userId),
        provider: 'openrouter',
        model: 'anthropic/claude-3.5-sonnet',
        encryptedApiKey: encryptApiKey('sk-or-v1-testkey123'),
        isEnabled: true,
      } as unknown as AISettingsDocument;

      mockRepo.findByUserId = mock.fn(async () => mockSettings);

      const provider = await factory.getProvider(userId);
      assert.ok(provider instanceof OpenRouterProvider);
      assert.strictEqual(provider.name, 'openrouter');
      // @ts-ignore
      assert.strictEqual(provider.apiKey, 'sk-or-v1-testkey123');
    });

    it('should throw error if user selects OpenRouter but provides no API key', async () => {
      const mockSettings = {
        userId: new Types.ObjectId(userId),
        provider: 'openrouter',
        model: 'anthropic/claude-3.5-sonnet',
        isEnabled: true,
      } as unknown as AISettingsDocument;

      mockRepo.findByUserId = mock.fn(async () => mockSettings);

      await assert.rejects(
        async () => factory.getProvider(userId),
        { name: 'AIConfigurationError' }
      );
    });

    it('should fallback to system default if user has no BYOK settings', async () => {
      // Mock system env for this test only
      const originalProvider = env.AI_PROVIDER;
      const originalModel = env.AI_MODEL;
      const originalBaseUrl = env.AI_BASE_URL;

      env.AI_PROVIDER = 'ollama';
      env.AI_MODEL = 'qwen2.5:7b';
      env.AI_BASE_URL = 'http://system-default:11434';

      try {
        const provider = await factory.getProvider(userId);
        assert.ok(provider instanceof OllamaProvider);
        // @ts-ignore
        assert.strictEqual(provider.baseUrl, 'http://system-default:11434');
      } finally {
        // Restore
        env.AI_PROVIDER = originalProvider;
        env.AI_MODEL = originalModel;
        env.AI_BASE_URL = originalBaseUrl;
      }
    });
  });

  describe('OllamaProvider Error Handling', () => {
    it('should throw an error if parsing structured JSON fails', async () => {
      const provider = new OllamaProvider('http://localhost:11434', 'test-model');
      
      // Monkey patch request to return invalid JSON
      // @ts-ignore
      provider.request = mock.fn(async () => 'Not a JSON string');

      await assert.rejects(
        async () => provider.generateStructured('Test prompt'),
        { message: /Failed to parse structured JSON from Ollama/ }
      );
    });
  });
});
