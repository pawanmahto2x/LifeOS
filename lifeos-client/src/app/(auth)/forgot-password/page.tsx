'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApiService } from '@/features/auth/services/auth.service';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      await authApiService.forgotPassword(data);
      setIsSuccess(true);
    } catch {
      setServerError('Unable to process your request. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-xl font-bold tracking-tight">Reset your password</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter your email address and we will send you instructions to reset your password.
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-500">
            If an account exists with that email, instructions to reset your password have been
            sent.
          </div>
          <Link
            href="/login"
            className="border-border bg-muted hover:bg-muted/80 text-foreground block w-full rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-3 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-foreground block text-sm font-medium">Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary mt-1.5 block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
              />
              {errors.email && (
                <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:opacity-90 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? 'Sending instructions...' : 'Send reset link'}
            </button>
          </form>

          <div className="text-muted-foreground text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-foreground font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
