'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { healthApiService } from '../services/health.service';
import { SleepQuality } from '@/types/health.types';
import { X, Moon } from 'lucide-react';

const sleepFormSchema = z
  .object({
    sleepTime: z.string().min(1, 'Sleep time is required'),
    wakeTime: z.string().min(1, 'Wake time is required'),
    quality: z.enum(['Poor', 'Fair', 'Good', 'Excellent']),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  })
  .refine((data) => new Date(data.wakeTime).getTime() > new Date(data.sleepTime).getTime(), {
    message: 'Wake time must be after sleep time',
    path: ['wakeTime'],
  });

type SleepFormData = z.infer<typeof sleepFormSchema>;

interface SleepDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SleepDialog({ isOpen, onClose }: SleepDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Default sleep time: yesterday at 23:00, wake time: today at 07:00
  const defaultYesterday = new Date();
  defaultYesterday.setDate(defaultYesterday.getDate() - 1);
  defaultYesterday.setHours(23, 0, 0, 0);

  const defaultToday = new Date();
  defaultToday.setHours(7, 0, 0, 0);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SleepFormData>({
    resolver: zodResolver(sleepFormSchema),
    defaultValues: {
      sleepTime: formatDateTimeLocal(defaultYesterday),
      wakeTime: formatDateTimeLocal(defaultToday),
      quality: 'Good' as SleepQuality,
      notes: '',
    },
  });

  const qualities: SleepQuality[] = ['Poor', 'Fair', 'Good', 'Excellent'];
  const selectedQuality = watch('quality');
  const watchedSleep = watch('sleepTime');
  const watchedWake = watch('wakeTime');

  // Calculate live duration in hours and minutes
  let calculatedDurationText = '';
  if (watchedSleep && watchedWake) {
    const diff = new Date(watchedWake).getTime() - new Date(watchedSleep).getTime();
    if (diff > 0) {
      const totalMinutes = Math.round(diff / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      calculatedDurationText = `${hours}h ${minutes}m (${totalMinutes} mins)`;
    }
  }

  if (!isOpen) return null;

  const onSubmit = async (data: SleepFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      await healthApiService.logSleep({
        sleepTime: new Date(data.sleepTime).toISOString(),
        wakeTime: new Date(data.wakeTime).toISOString(),
        quality: data.quality,
        notes: data.notes?.trim() || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ['health-sleep'] });
      await queryClient.invalidateQueries({ queryKey: ['health-summary'] });
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Failed to record sleep session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-card border-border animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl border p-6 shadow-xl duration-200">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-lg p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-foreground text-xl font-semibold">Record Sleep</h2>
            <p className="text-muted-foreground text-xs">Track duration and quality of sleep</p>
          </div>
        </div>

        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-xl border p-3 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
                Fell Asleep
              </label>
              <input
                type="datetime-local"
                {...register('sleepTime')}
                className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary w-full rounded-xl border px-3 py-2.5 text-xs transition-all focus:ring-2 focus:outline-none"
              />
              {errors.sleepTime && (
                <p className="text-destructive mt-1 text-[10px]">{errors.sleepTime.message}</p>
              )}
            </div>

            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
                Woke Up
              </label>
              <input
                type="datetime-local"
                {...register('wakeTime')}
                className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary w-full rounded-xl border px-3 py-2.5 text-xs transition-all focus:ring-2 focus:outline-none"
              />
              {errors.wakeTime && (
                <p className="text-destructive mt-1 text-[10px]">{errors.wakeTime.message}</p>
              )}
            </div>
          </div>

          {calculatedDurationText && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-2 text-xs font-medium text-indigo-400">
              Calculated Duration: {calculatedDurationText}
            </div>
          )}

          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
              Sleep Quality
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {qualities.map((q) => {
                const isSelected = selectedQuality === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setValue('quality', q)}
                    className={`rounded-xl px-2 py-2 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground border'
                    }`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary w-full resize-none rounded-xl border px-3.5 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
              placeholder="E.g., felt refreshed, woke up once during the night..."
            />
          </div>

          <div className="border-border mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Record Sleep'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
