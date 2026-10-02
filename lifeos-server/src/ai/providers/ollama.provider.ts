import { IAIProvider } from '../provider.interface';

export class OllamaProvider implements IAIProvider {
  name = 'ollama';

  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
    private readonly timeoutMs: number = 30000,
  ) {}

  private async request(messages: any[], format?: 'json'): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          format,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorDetail = response.statusText;
        try {
          const errBody = (await response.json()) as { error?: string };
          if (errBody && errBody.error) {
            errorDetail = errBody.error;
          }
        } catch (e) {
          // Ignore JSON parse error on error body
        }
        throw new Error(
          `Ollama API error (${response.status}): ${errorDetail} | Endpoint: POST ${this.baseUrl}/api/chat | Model: ${this.model}`,
        );
      }

      const data = (await response.json()) as { message: { content: string } };
      return data.message.content;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateStructured(prompt: string, systemPrompt?: string): Promise<any> {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const content = await this.request(messages, 'json');
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(
        'Failed to parse structured JSON from Ollama. Ensure model supports JSON mode.',
      );
    }
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    return this.request(messages);
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 sec max for test

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) return { success: false, latencyMs: Date.now() - start };

      return { success: true, latencyMs: Date.now() - start };
    } catch {
      return { success: false, latencyMs: Date.now() - start };
    }
  }
}
