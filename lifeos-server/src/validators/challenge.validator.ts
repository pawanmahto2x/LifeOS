import { z } from 'zod';

export const createChallengeSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().min(5, 'Description must be at least 5 characters').max(1000),
    category: z.enum(['Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Health', 'Custom']),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']),
    visibility: z.enum(['Public', 'Private', 'Friends', 'Group']).default('Public'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reward: z.string().max(200).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const updateChallengeSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(5).max(1000).optional(),
  category: z
    .enum(['Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Health', 'Custom'])
    .optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).optional(),
  visibility: z.enum(['Public', 'Private', 'Friends', 'Group']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  reward: z.string().max(200).optional(),
});

export const updateChallengeProgressSchema = z.object({
  progress: z.number().min(0).max(100),
});

export const challengeQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.string().optional(),
  status: z.enum(['active', 'upcoming', 'ended', 'all']).optional(),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>;
export type UpdateChallengeProgressInput = z.infer<typeof updateChallengeProgressSchema>;
export type ChallengeQueryInput = z.infer<typeof challengeQuerySchema>;
