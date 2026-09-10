import { z } from 'zod';

export const timelineEntryTypeEnum = z.enum([
  'GoalCompleted',
  'HabitMilestone',
  'ChallengeCompleted',
  'AchievementUnlocked',
]);

export const queryTimelineSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  entryType: timelineEntryTypeEnum.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const timelineParamSchema = z.object({
  entryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid timeline entry ID'),
});

export type IQueryTimelineInput = z.infer<typeof queryTimelineSchema>;
export type ITimelineParamInput = z.infer<typeof timelineParamSchema>;
