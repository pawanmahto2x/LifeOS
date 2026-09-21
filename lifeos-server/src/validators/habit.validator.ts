import { z } from 'zod';

export const habitFrequencyEnum = z.enum(['Daily', 'Weekly', 'Monthly']);

export const reminderTimeSchema = z
  .string()
  .trim()
  .transform((val) => {
    if (!val) return undefined;
    const match12 = val.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
      let h = parseInt(match12[1], 10);
      const m = match12[2];
      const meridiem = match12[3].toUpperCase();
      if (meridiem === 'PM' && h < 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${m}`;
    }
    return val;
  })
  .refine(
    (val) => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val),
    'Reminder time must be in HH:mm format (e.g. 08:30 or 08:30 AM)',
  )
  .optional();

export const createHabitSchema = z.object({
  title: z.string().trim().min(1, 'Habit title is required'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  frequency: habitFrequencyEnum.default('Daily'),
  targetDays: z.coerce
    .number()
    .int()
    .positive()
    .max(365, 'Target duration cannot exceed 365 days')
    .default(30),
  reminderTime: reminderTimeSchema,
});

export const updateHabitSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  frequency: habitFrequencyEnum.optional(),
  targetDays: z.coerce
    .number()
    .int()
    .positive()
    .max(365, 'Target duration cannot exceed 365 days')
    .optional(),
  reminderTime: reminderTimeSchema,
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
