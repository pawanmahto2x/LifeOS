import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum([
    'career',
    'education',
    'health',
    'fitness',
    'personal',
    'finance',
    'relationships',
    'creativity',
    'other',
  ]),
  deadline: z.string().datetime().or(z.date()),
  milestones: z
    .array(
      z.object({
        title: z.string(),
        completed: z.boolean().default(false),
        order: z.number(),
      }),
    )
    .optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(['active', 'completed', 'paused', 'abandoned']).optional(),
});

export const applyAIPlanSchema = z.object({
  milestones: z.array(z.string()),
  tasks: z.array(
    z.object({
      milestoneIndex: z.number(),
      title: z.string(),
    }),
  ),
  habits: z.array(
    z.object({
      title: z.string(),
      frequency: z.string(),
    }),
  ),
});
