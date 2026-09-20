'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { habitApiService } from '../services/habit.service';
import { IHabit, HabitFrequency } from '@/types/habit.types';
import { X } from 'lucide-react';

const habitFormSchema = z.object({
  title: z.string().trim().min(1, 'Habit title is required'),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly']),
  targetDays: z.number().int().positive().max(31),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm (24-hour)')
    .or(z.literal(''))
    .optional(),
});

type HabitFormData = z.infer<typeof habitFormSchema>;

interface HabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: IHabit | null;
}

export function HabitDialog({ isOpen, onClose, habitToEdit }: HabitDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
    values: habitToEdit
      ? {
          title: habitToEdit.title,
          frequency: habitToEdit.frequency,
          targetDays: habitToEdit.targetDays,
          reminderTime: habitToEdit.reminderTime || '',
        }
      : {
          title: '',
          frequency: 'Daily',
          targetDays: 7,
          reminderTime: '',
        },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: HabitFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const payload = {
        title: data.title,
        frequency: data.frequency as HabitFrequency,
        targetDays: Number(data.targetDays),
        reminderTime: data.reminderTime?.trim() ? data.reminderTime.trim() : undefined,
      };

      if (habitToEdit) {
        await habitApiService.updateHabit(habitToEdit._id, payload);
      } else {
        await habitApiService.createHabit(payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['habits'] });
      await queryClient.refetchQueries({ queryKey: ['habits'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Failed to save habit.');
      } else {
        setServerError('An unexpected error occurred. Please check that the server is active.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border/80 bg-card text-card-foreground relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all">
        <div className="border-border/80 flex items-center justify-between border-b pb-4">
          <h2 className="text-foreground text-base font-bold">
            {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {serverError && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive mt-4 rounded-xl border p-3 text-xs">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Read 20 pages, Morning Jog"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
            {errors.title && (
              <p className="text-destructive mt-1 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                Frequency
              </label>
              <select
                {...register('frequency')}
                className="border-input bg-background text-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                Target Days / Cycle
              </label>
              <input
                type="number"
                min="1"
                max="31"
                {...register('targetDays', { valueAsNumber: true })}
                className="border-input bg-background text-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
              />
              {errors.targetDays && (
                <p className="text-destructive mt-1 text-xs">{errors.targetDays.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Reminder Time (24-Hour HH:mm)
            </label>
            <input
              type="text"
              placeholder="08:30"
              {...register('reminderTime')}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
            {errors.reminderTime && (
              <p className="text-destructive mt-1 text-xs">{errors.reminderTime.message}</p>
            )}
          </div>

          <div className="border-border/80 flex items-center justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-xl px-4 py-2 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
