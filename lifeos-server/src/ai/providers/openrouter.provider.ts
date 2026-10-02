import { IAIProvider } from '../provider.interface';

export class OpenRouterProvider implements IAIProvider {
  name = 'openrouter';

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly timeoutMs: number = 30000,
  ) {}

  private async request(messages: any[], isJson: boolean): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000', // Application URL
          'X-Title': 'LifeOS',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          response_format: isJson ? { type: 'json_object' } : undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { choices: { message: { content: string } }[] };
      return data.choices[0].message.content;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateStructured(prompt: string, systemPrompt?: string): Promise<any> {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const content = await this.request(messages, true);
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error('Failed to parse structured JSON from OpenRouter');
    }
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    return this.request(messages, false);
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      return { success: response.ok, latencyMs: Date.now() - start };
    } catch {
      return { success: false, latencyMs: Date.now() - start };
    }
  }
}
