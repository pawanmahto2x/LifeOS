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
        <h2 className="text-xl font-bold tracking-tight text-white">Reset your password</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Enter your email address and we will send you instructions to reset your password.
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/60 p-4 text-sm text-emerald-300">
            If an account exists with that email, instructions to reset your password have been
            sent.
          </div>
          <Link
            href="/login"
            className="block w-full rounded-md border border-neutral-700 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="rounded-lg border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300">Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-neutral-200 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? 'Sending instructions...' : 'Send reset link'}
            </button>
          </form>

          <div className="text-center text-sm text-neutral-400">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-white hover:underline">
              Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
