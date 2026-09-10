import { z } from 'zod';

export const updateNotificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  browser: z.boolean().optional(),
  habitReminders: z.boolean().optional(),
  taskReminders: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().min(1, 'Message is required').max(500),
  type: z.enum(['Reminder', 'Achievement', 'AI Insight', 'Challenge', 'Group', 'System']),
  actionUrl: z.string().optional(),
  scheduledFor: z.coerce.date().optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
