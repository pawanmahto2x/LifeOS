import { z } from 'zod';

export const aiGoalPlanSchema = z.object({
  milestones: z
    .array(z.string())
    .min(1, 'At least one milestone is required')
    .max(10, 'Too many milestones'),
  tasks: z
    .array(
      z.object({
        milestoneIndex: z.number().int().min(0),
        title: z.string().min(3, 'Task title is too short').max(200, 'Task title is too long'),
      }),
    )
    .max(30, 'Too many tasks'),
  habits: z
    .array(
      z.object({
        title: z.string().min(3, 'Habit title is too short').max(100, 'Habit title is too long'),
        frequency: z.enum(['daily', 'weekly']),
      }),
    )
    .max(10, 'Too many habits'),
});

export type AIGoalPlanSchemaType = z.infer<typeof aiGoalPlanSchema>;
