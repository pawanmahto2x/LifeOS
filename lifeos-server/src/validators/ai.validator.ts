import { z } from 'zod';

export const saveAISettingsSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'claude', 'groq', 'openrouter']),
  apiKey: z.string().min(8, 'API key is too short').max(256),
  model: z.string().min(2).max(100),
  isEnabled: z.boolean().default(true),
});

export const updateAISettingsSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'claude', 'groq', 'openrouter']).optional(),
  apiKey: z.string().min(8).max(256).optional(),
  model: z.string().min(2).max(100).optional(),
  isEnabled: z.boolean().optional(),
});

export const aiCoachPromptSchema = z.object({
  question: z.string().min(2, 'Question is required').max(1000),
});

export type SaveAISettingsInput = z.infer<typeof saveAISettingsSchema>;
export type UpdateAISettingsInput = z.infer<typeof updateAISettingsSchema>;
export type AICoachPromptInput = z.infer<typeof aiCoachPromptSchema>;
