export interface IAIProvider {
  name: string;

  /**
   * Generates a structured response based on the prompt.
   * Expects JSON output from the LLM.
   */
  generateStructured(prompt: string, systemPrompt?: string): Promise<any>;

  /**
   * Generates a free-text response.
   */
  generateText(prompt: string, systemPrompt?: string): Promise<string>;

  /**
   * Tests the connection to the provider and model.
   * Hosted providers must not be described as "unlimited" and are subject to rate-limits.
   */
  testConnection(): Promise<{ success: boolean; latencyMs: number }>;
}
