import { z } from 'zod';

export const startFocusSessionSchema = z.object({
  taskId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
    .optional(),
  duration: z.coerce
    .number()
    .int('Duration must be an integer')
    .min(1, 'Duration must be at least 1 minute')
    .max(240, 'Duration cannot exceed 240 minutes (4 hours)'),
  startedAt: z.coerce.date().optional(),
});

export const endFocusSessionSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid session ID format'),
  distractions: z.coerce.number().int().min(0, 'Distractions cannot be negative').default(0),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  completed: z.boolean().default(true),
});

export const queryFocusSessionsSchema = z.object({
  taskId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
    .optional(),
  completed: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
