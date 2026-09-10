import { z } from 'zod';

export const reportQuerySchema = z.object({
  date: z.string().optional(), // ISO date string, defaults to today
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
