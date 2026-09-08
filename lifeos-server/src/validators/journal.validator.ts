import { z } from 'zod';

export const journalMoodEnum = z.enum([
  'Excellent',
  'Happy',
  'Calm',
  'Neutral',
  'Stressed',
  'Sad',
  'Angry',
]);

export const createJournalSchema = z.object({
  title: z.string().trim().min(1, 'Journal title is required'),
  content: z.string().trim().min(1, 'Journal content is required'),
  mood: journalMoodEnum.optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const updateJournalSchema = z.object({
  title: z.string().trim().min(1).optional(),
  content: z.string().trim().min(1).optional(),
  mood: journalMoodEnum.optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const queryJournalsSchema = z.object({
  mood: journalMoodEnum.optional(),
  tag: z.string().trim().optional(),
  search: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchJournalSchema = z.object({
  q: z.string().trim().min(1, 'Search query q is required'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ICreateJournalInput = z.infer<typeof createJournalSchema>;
export type IUpdateJournalInput = z.infer<typeof updateJournalSchema>;
export type IQueryJournalsInput = z.infer<typeof queryJournalsSchema>;
export type ISearchJournalInput = z.infer<typeof searchJournalSchema>;
