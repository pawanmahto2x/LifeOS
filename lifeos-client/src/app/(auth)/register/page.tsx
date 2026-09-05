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
        <h2 className="text-xl font-bold tracking-tight text-white">Create your account</h2>
        <p className="mt-1 text-sm text-neutral-400">Start organizing your life with LifeOS.</p>
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300">Full Name</label>
          <input
            type="text"
            {...register('fullName')}
            placeholder="Jane Doe"
            className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none sm:text-sm"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>
          )}
        </div>

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

        <div>
          <label className="block text-sm font-medium text-neutral-300">Password</label>
          <input
            type="password"
            {...register('password')}
            placeholder="At least 8 characters"
            className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none sm:text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-neutral-200 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="text-center text-sm text-neutral-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-white hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
