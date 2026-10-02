import { IAIProvider } from './provider.interface';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { AISettingsRepository } from '../repositories/ai-settings.repository';
import { decryptApiKey } from '../utils/encryption';
import { env } from '../config/env';
import { AIConfigurationError } from './ai.errors';

export class ProviderFactory {
  constructor(private readonly settingsRepo: AISettingsRepository = new AISettingsRepository()) {}

  async getProvider(userId: string): Promise<IAIProvider> {
    // 1. User-configured provider (BYOK)
    const userSettings = await this.settingsRepo.findByUserId(userId);

    if (userSettings && userSettings.isEnabled) {
      const model = userSettings.model;
      const apiKey = userSettings.encryptedApiKey
        ? decryptApiKey(userSettings.encryptedApiKey)
        : '';

      if (userSettings.provider === 'ollama') {
        return new OllamaProvider(userSettings.baseUrl || 'http://localhost:11434', model);
      }

      if (userSettings.provider === 'openrouter') {
        if (!apiKey) throw new AIConfigurationError('API key required for OpenRouter');
        return new OpenRouterProvider(apiKey, model);
      }

      // Future expansion: GeminiProvider, GroqProvider, etc.
    }

    // 2. System default provider
    if (env.AI_PROVIDER) {
      const provider = env.AI_PROVIDER.toLowerCase();
      const model = env.AI_MODEL;
      if (!model)
        throw new AIConfigurationError(
          'AI_MODEL system variable must be configured if AI_PROVIDER is set',
        );

      if (provider === 'ollama') {
        return new OllamaProvider(
          env.AI_BASE_URL || 'http://localhost:11434',
          model,
          env.AI_TIMEOUT_MS,
        );
      }

      if (provider === 'openrouter') {
        if (!env.AI_API_KEY)
          throw new AIConfigurationError('AI_API_KEY system variable required for OpenRouter');
        return new OpenRouterProvider(env.AI_API_KEY, model, env.AI_TIMEOUT_MS);
      }

      // Future expansion: gemini, groq, claude, huggingface
    }

    // 3. AI unavailable
    throw new AIConfigurationError(
      'AI is currently unavailable. Configure your provider settings.',
    );
  }
}
