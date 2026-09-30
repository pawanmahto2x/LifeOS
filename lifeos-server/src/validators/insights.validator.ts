import { z } from 'zod';

export const baselineQuerySchema = z.object({
  period: z.enum(['7d', '14d', '30d']).optional(),
});

export const insightsQuerySchema = z.object({
  period: z.enum(['7d', '14d', '30d']).optional(),
});

export type BaselineQueryType = z.infer<typeof baselineQuerySchema>;
export type InsightsQueryType = z.infer<typeof insightsQuerySchema>;
