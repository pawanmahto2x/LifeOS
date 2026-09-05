import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  timezone: z.string().min(1).optional(),
  language: z.string().min(2).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type IUpdateProfileInput = z.infer<typeof updateProfileSchema>;
