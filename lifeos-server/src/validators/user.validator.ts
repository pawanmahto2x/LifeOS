import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  timezone: z.string().min(1).optional(),
  language: z.string().min(2).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export type IUpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type IChangePasswordInput = z.infer<typeof changePasswordSchema>;
