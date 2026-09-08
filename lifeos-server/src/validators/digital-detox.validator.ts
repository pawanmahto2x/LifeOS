import { z } from 'zod';

export const appLimitItemSchema = z.object({
  appName: z.string().trim().min(1, 'App name cannot be empty'),
  dailyLimitMinutes: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Daily limit must be at least 1 minute')
    .max(1440, 'Daily limit cannot exceed 1440 minutes (24 hours)'),
  category: z.string().trim().optional(),
});

export const updateDigitalDetoxSettingsSchema = z.object({
  dailyScreenTimeGoalMinutes: z.coerce
    .number()
    .int('Goal must be an integer')
    .min(10, 'Goal must be at least 10 minutes')
    .max(1440, 'Goal cannot exceed 1440 minutes')
    .optional(),
  appLimits: z.array(appLimitItemSchema).optional(),
  warningThresholdPercent: z.coerce
    .number()
    .int()
    .min(10, 'Threshold must be at least 10%')
    .max(100, 'Threshold cannot exceed 100%')
    .optional(),
  focusLockEnabled: z.boolean().optional(),
});

export const logScreenTimeSchema = z.object({
  appName: z.string().trim().optional(),
  minutesUsed: z.coerce
    .number()
    .int()
    .min(1, 'Minutes used must be at least 1')
    .max(1440, 'Minutes used cannot exceed 1440'),
  loggedDate: z.coerce.date().optional(),
});
