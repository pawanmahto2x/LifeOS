import { z } from 'zod';

export const submitReviewSchema = z.object({
  whatWentWell: z.string().max(500).optional(),
  whatRemainedIncomplete: z.string().max(500).optional(),
  moodReflection: z.string().max(500).optional(),
  tomorrowChange: z.string().max(500).optional(),
});

export type SubmitReviewType = z.infer<typeof submitReviewSchema>;

export const missionHistoryQuerySchema = z.object({
  limit: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : 7),
    z.number().min(1).max(30).default(7),
  ),
});

export type MissionHistoryQueryType = z.infer<typeof missionHistoryQuerySchema>;
