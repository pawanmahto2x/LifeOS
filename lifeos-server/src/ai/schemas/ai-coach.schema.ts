import { z } from 'zod';

export const aiCoachSchema = z.object({
  answer: z
    .string()
    .describe(
      "The AI Coach's synthesized, highly personalized advice responding directly to the user's question, incorporating the provided context. Use markdown text, but no headers.",
    ),
});

export const aiWeeklyReportSchema = z.object({
  weeklySummary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const aiHealthAnalysisSchema = z.object({
  summary: z.string(),
  sleepQualityTrend: z.string(),
  hydrationCompliance: z.string(),
  moodCorrelation: z.string(),
  recommendations: z.array(z.string()),
});

export type IAICoachResponseData = z.infer<typeof aiCoachSchema>;
export type IAIWeeklyReportData = z.infer<typeof aiWeeklyReportSchema>;
export type IAIHealthAnalysisData = z.infer<typeof aiHealthAnalysisSchema>;
