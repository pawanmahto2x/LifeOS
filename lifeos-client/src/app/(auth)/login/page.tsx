'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApiService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

const loginFormSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const response = await authApiService.login(data);
      if (response.data) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(
          axiosErr.response?.data?.message || 'Login failed. Please check your credentials.',
        );
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back! Please enter your details.
        </p>
      </div>

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
          {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-foreground block text-sm font-medium">Password</label>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary mt-1.5 block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
          />
          {errors.password && (
            <p className="text-destructive mt-1 text-xs">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:opacity-90 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-foreground font-semibold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
