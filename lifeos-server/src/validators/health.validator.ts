import { z } from 'zod';

export const waterUnitEnum = z.enum(['ml', 'L']);
export const sleepQualityEnum = z.enum(['Poor', 'Fair', 'Good', 'Excellent']);
export const moodTypeEnum = z.enum([
  'Excellent',
  'Happy',
  'Calm',
  'Neutral',
  'Stressed',
  'Sad',
  'Angry',
]);

// Water
export const logWaterSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  unit: waterUnitEnum.default('ml'),
  loggedAt: z.coerce.date().optional(),
});

export const updateWaterSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive').optional(),
  unit: waterUnitEnum.optional(),
  loggedAt: z.coerce.date().optional(),
});

export const queryHealthLogsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Sleep
export const logSleepSchema = z
  .object({
    sleepTime: z.coerce.date(),
    wakeTime: z.coerce.date(),
    quality: sleepQualityEnum.default('Good'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  })
  .refine((data) => data.wakeTime.getTime() > data.sleepTime.getTime(), {
    message: 'Wake time must be after sleep time',
    path: ['wakeTime'],
  });

export const updateSleepSchema = z
  .object({
    sleepTime: z.coerce.date().optional(),
    wakeTime: z.coerce.date().optional(),
    quality: sleepQualityEnum.optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  })
  .refine(
    (data) => {
      if (data.sleepTime && data.wakeTime) {
        return data.wakeTime.getTime() > data.sleepTime.getTime();
      }
      return true;
    },
    {
      message: 'Wake time must be after sleep time',
      path: ['wakeTime'],
    },
  );

// Mood
export const logMoodSchema = z.object({
  mood: moodTypeEnum,
  moodScore: z.coerce
    .number()
    .int()
    .min(1, 'Mood score must be at least 1')
    .max(10, 'Mood score cannot exceed 10'),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  loggedAt: z.coerce.date().optional(),
});

export const updateMoodSchema = z.object({
  mood: moodTypeEnum.optional(),
  moodScore: z.coerce
    .number()
    .int()
    .min(1, 'Mood score must be at least 1')
    .max(10, 'Mood score cannot exceed 10')
    .optional(),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  loggedAt: z.coerce.date().optional(),
});

export const queryMoodLogsSchema = queryHealthLogsSchema.extend({
  mood: moodTypeEnum.optional(),
});
