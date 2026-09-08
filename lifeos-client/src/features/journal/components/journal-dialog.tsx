'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { journalApiService } from '../services/journal.service';
import { IJournal, JournalMood } from '@/types/journal.types';
import { X } from 'lucide-react';

const journalFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().trim().min(1, 'Content is required'),
  mood: z.enum(['Excellent', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Sad', 'Angry']).optional(),
  tagsString: z.string().optional(),
});

type JournalFormData = z.infer<typeof journalFormSchema>;

interface JournalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  journalToEdit?: IJournal | null;
}

export function JournalDialog({ isOpen, onClose, journalToEdit }: JournalDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const moods: JournalMood[] = [
    'Excellent',
    'Happy',
    'Calm',
    'Neutral',
    'Stressed',
    'Sad',
    'Angry',
  ];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalFormSchema),
    values: journalToEdit
      ? {
          title: journalToEdit.title,
          content: journalToEdit.content,
          mood: journalToEdit.mood,
          tagsString: journalToEdit.tags?.join(', ') || '',
        }
      : {
          title: '',
          content: '',
          mood: 'Calm',
          tagsString: '',
        },
  });

  const selectedMood = watch('mood');

  if (!isOpen) return null;

  const onSubmit = async (data: JournalFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const parsedTags = data.tagsString
        ? data.tagsString
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: data.title,
        content: data.content,
        mood: data.mood as JournalMood | undefined,
        tags: parsedTags,
      };

      if (journalToEdit) {
        await journalApiService.updateJournal(journalToEdit._id, payload);
      } else {
        await journalApiService.createJournal(payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['journals'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Failed to save journal entry.');
      } else {
        setServerError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-lg font-bold text-white">
            {journalToEdit ? 'Edit Reflection' : 'New Journal Entry'}
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
              placeholder="e.g. Morning thoughts on focus, Evening gratitude"
              className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              How are you feeling? (Mood)
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setValue('mood', mood)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedMood === mood
                      ? 'border-white bg-white font-semibold text-neutral-950'
                      : 'border-neutral-800 bg-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Reflection / Notes *
            </label>
            <textarea
              rows={8}
              {...register('content')}
              placeholder="Write your reflection, lessons learned, or stream of consciousness..."
              className="mt-1 block w-full resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm leading-relaxed text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              {...register('tagsString')}
              placeholder="e.g. mindfulness, deep-work, gratitude"
              className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
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
              {isSubmitting ? 'Saving...' : journalToEdit ? 'Save Changes' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
