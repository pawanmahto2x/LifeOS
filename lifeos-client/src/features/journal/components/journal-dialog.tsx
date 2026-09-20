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
      await queryClient.refetchQueries({ queryKey: ['journals'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Failed to save journal entry.');
      } else {
        setServerError('An unexpected error occurred. Please check that the server is active.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border/80 bg-card text-card-foreground relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-6 shadow-2xl transition-all">
        <div className="border-border/80 flex items-center justify-between border-b pb-4">
          <h2 className="text-foreground text-base font-bold">
            {journalToEdit ? 'Edit Reflection' : 'New Journal Entry'}
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
              placeholder="e.g. Morning thoughts on focus, Evening gratitude"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
            {errors.title && (
              <p className="text-destructive mt-1 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              How are you feeling? (Mood)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setValue('mood', mood)}
                  className={`cursor-pointer rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
                    selectedMood === mood
                      ? 'bg-primary text-primary-foreground border-transparent font-semibold shadow-2xs'
                      : 'border-border/80 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Reflection / Notes *
            </label>
            <textarea
              rows={8}
              {...register('content')}
              placeholder="Write your reflection, lessons learned, or stream of consciousness..."
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-relaxed transition-colors focus:ring-2 focus:outline-none"
            />
            {errors.content && (
              <p className="text-destructive mt-1 text-xs">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              {...register('tagsString')}
              placeholder="e.g. mindfulness, deep-work, gratitude"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
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
              {isSubmitting ? 'Saving...' : journalToEdit ? 'Save Changes' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
