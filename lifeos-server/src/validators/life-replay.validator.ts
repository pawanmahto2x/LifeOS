import { z } from 'zod';

export const replayPeriodParamSchema = z.object({
  period: z.enum(['weekly', 'monthly']),
});

export const replayQuerySchema = z.object({
  date: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(50).default(10).optional(),
});

export const userReflectionSchema = z.object({
  whatToContinue: z.string().max(500).optional(),
  whatToChange: z.string().max(500).optional(),
  nextGoal: z.string().max(500).optional(),
});

export type ReplayPeriodParam = z.infer<typeof replayPeriodParamSchema>;
export type ReplayQuery = z.infer<typeof replayQuerySchema>;
export type UserReflectionDto = z.infer<typeof userReflectionSchema>;
