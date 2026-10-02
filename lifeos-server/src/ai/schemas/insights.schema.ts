import { z } from 'zod';

export const aiInsightsSchema = z.object({
  patterns: z
    .array(
      z.object({
        category: z.enum([
          'sleep_focus',
          'sleep_tasks',
          'mood_productivity',
          'habits_tasks',
          'focus_trend',
          'task_trend',
          'sleep_trend',
          'water_trend',
          'mood_trend',
          'habit_trend',
        ]),
        title: z.string(),
        description: z.string(),
        confidence: z.enum(['low', 'medium', 'high']),
      }),
    )
    .describe("An array of behavioral patterns detected from the user's data."),
});

export type IAIInsightsData = z.infer<typeof aiInsightsSchema>;
