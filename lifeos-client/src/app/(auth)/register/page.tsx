'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApiService } from '@/features/auth/services/auth.service';

const registerFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      await authApiService.register(data);
      router.push('/login?registered=true');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(
          axiosErr.response?.data?.message || 'Registration failed. Please try again.',
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
        <h2 className="text-foreground text-xl font-bold tracking-tight">Create your account</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Start organizing your life with LifeOS.
        </p>
      </div>

      {serverError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-3 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-foreground block text-sm font-medium">Full Name</label>
          <input
            type="text"
            {...register('fullName')}
            placeholder="Jane Doe"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary mt-1.5 block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
          />
          {errors.fullName && (
            <p className="text-destructive mt-1 text-xs">{errors.fullName.message}</p>
          )}
        </div>

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
          <label className="text-foreground block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register('password')}
            placeholder="At least 8 characters"
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-foreground font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
