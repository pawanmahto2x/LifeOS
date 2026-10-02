import { z } from 'zod';

export const aiReportSchema = z.object({
  aiSummary: z
    .string()
    .describe(
      "A concise, insightful paragraph summarizing the user's performance and habits over the period. Must be human-like, encouraging but analytical. Do not use markdown headers, just plain text or bolding.",
    ),
});

export type IAIReportResponse = z.infer<typeof aiReportSchema>;
