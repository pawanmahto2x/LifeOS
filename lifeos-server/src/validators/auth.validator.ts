import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type IRegisterInput = z.infer<typeof registerSchema>;
export type ILoginInput = z.infer<typeof loginSchema>;
export type IRefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type IForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type IResetPasswordInput = z.infer<typeof resetPasswordSchema>;
