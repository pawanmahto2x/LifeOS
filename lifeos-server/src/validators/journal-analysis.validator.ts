import { z } from 'zod';

export const analyzeEntryParamsSchema = z.object({
  journalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Journal ID'),
});

export const recurringThemesQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional()
    .default(30),
});
