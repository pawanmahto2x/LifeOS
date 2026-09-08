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
      reset();
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Failed to save habit.');
      } else {
        setServerError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-lg font-bold text-white">
            {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-950/60 p-3 text-xs text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Read 20 pages, Morning Jog"
              className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
                Frequency
              </label>
              <select
                {...register('frequency')}
                className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-neutral-500 focus:outline-none"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
                Target Days / Cycle
              </label>
              <input
                type="number"
                min="1"
                max="31"
                {...register('targetDays', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
              />
              {errors.targetDays && (
                <p className="mt-1 text-xs text-red-400">{errors.targetDays.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Reminder Time (24-Hour HH:mm)
            </label>
            <input
              type="text"
              placeholder="08:30"
              {...register('reminderTime')}
              className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
            {errors.reminderTime && (
              <p className="mt-1 text-xs text-red-400">{errors.reminderTime.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
