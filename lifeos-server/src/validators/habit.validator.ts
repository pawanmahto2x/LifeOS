import { z } from 'zod';

export const habitFrequencyEnum = z.enum(['Daily', 'Weekly', 'Monthly']);

export const createHabitSchema = z.object({
  title: z.string().trim().min(1, 'Habit title is required'),
  frequency: habitFrequencyEnum.default('Daily'),
  targetDays: z.coerce.number().int().positive().max(31).default(7),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Reminder time must be in 24-hour HH:mm format')
    .optional(),
});

export const updateHabitSchema = z.object({
  title: z.string().trim().min(1).optional(),
  frequency: habitFrequencyEnum.optional(),
  targetDays: z.coerce.number().int().positive().max(31).optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Reminder time must be in 24-hour HH:mm format')
    .optional(),
});

export const queryHabitsSchema = z.object({
  frequency: habitFrequencyEnum.optional(),
  isPaused: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'currentStreak', 'completionRate', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ICreateHabitInput = z.infer<typeof createHabitSchema>;
export type IUpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type IQueryHabitsInput = z.infer<typeof queryHabitsSchema>;
