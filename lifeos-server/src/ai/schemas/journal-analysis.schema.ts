import { z } from 'zod';

export const aiJournalAnalysisSchema = z.object({
  themes: z
    .array(
      z.enum([
        'productivity',
        'procrastination',
        'sleep',
        'stress',
        'motivation',
        'accomplishment',
        'difficulty',
        'goals',
        'energy',
        'social',
        'health',
        'exercise',
        'work',
        'learning',
        'gratitude',
        'anxiety',
        'focus',
        'relationships',
      ]),
    )
    .describe('An array of themes detected in the journal entry.'),
  extractedMood: z
    .enum(['positive', 'negative', 'neutral'])
    .nullable()
    .describe('The overall mood of the journal entry.'),
  extractedEnergy: z
    .enum(['high', 'medium', 'low'])
    .nullable()
    .describe('The perceived energy level of the user.'),
  keyPhrases: z
    .array(z.string())
    .max(5)
    .describe(
      'Up to 5 key sentences or phrases extracted verbatim or slightly paraphrased from the entry that represent the core thoughts.',
    ),
});

export type IAIJournalAnalysis = z.infer<typeof aiJournalAnalysisSchema>;
