'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { healthApiService } from '../services/health.service';
import { MoodType } from '@/types/health.types';
import { X, Smile } from 'lucide-react';

const moodFormSchema = z.object({
  mood: z.enum(['Excellent', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Sad', 'Angry']),
  moodScore: z.number().min(1).max(10),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

type MoodFormData = z.infer<typeof moodFormSchema>;

interface MoodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialMood?: MoodType;
}

export function MoodDialog({ isOpen, onClose, initialMood }: MoodDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const moods: { type: MoodType; emoji: string; defaultScore: number }[] = [
    { type: 'Excellent', emoji: '🌟', defaultScore: 10 },
    { type: 'Happy', emoji: '😊', defaultScore: 8 },
    { type: 'Calm', emoji: '😌', defaultScore: 7 },
    { type: 'Neutral', emoji: '😐', defaultScore: 5 },
    { type: 'Stressed', emoji: '😰', defaultScore: 4 },
    { type: 'Sad', emoji: '😔', defaultScore: 3 },
    { type: 'Angry', emoji: '😠', defaultScore: 2 },
  ];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MoodFormData>({
    resolver: zodResolver(moodFormSchema),
    defaultValues: {
      mood: initialMood || 'Happy',
      moodScore: 8,
      note: '',
    },
  });

  const selectedMood = watch('mood');
  const selectedScore = watch('moodScore');

  if (!isOpen) return null;

  const handleMoodSelect = (mood: MoodType, score: number) => {
    setValue('mood', mood);
    setValue('moodScore', score);
  };

  const onSubmit = async (data: MoodFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      await healthApiService.logMood({
        mood: data.mood,
        moodScore: data.moodScore,
        note: data.note?.trim() || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ['health-mood'] });
      await queryClient.invalidateQueries({ queryKey: ['health-summary'] });
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Failed to record mood log.');
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Smile className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-foreground text-xl font-semibold">Mood Check-in</h2>
            <p className="text-muted-foreground text-xs">How are you feeling right now?</p>
          </div>
        </div>

        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-xl border p-3 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mood Selector Grid */}
          <div>
            <label className="text-muted-foreground mb-2 block text-xs font-medium tracking-wider uppercase">
              Select Mood
            </label>
            <div className="grid grid-cols-4 gap-2">
              {moods.map((m) => {
                const isSelected = selectedMood === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => handleMoodSelect(m.type, m.defaultScore)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition-all ${
                      isSelected
                        ? 'text-foreground scale-[1.02] border-2 border-amber-500 bg-amber-500/15 font-medium'
                        : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground border'
                    }`}
                  >
                    <span className="mb-1 text-2xl">{m.emoji}</span>
                    <span className="w-full truncate text-center text-[11px]">{m.type}</span>
                  </button>
                );
              })}
            </div>
            {errors.mood && <p className="text-destructive mt-1 text-xs">{errors.mood.message}</p>}
          </div>

          {/* Mood Score Slider (1-10) */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Mood Intensity Score
              </label>
              <span className="text-sm font-bold text-amber-500">{selectedScore}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              {...register('moodScore', { valueAsNumber: true })}
              className="w-full cursor-pointer accent-amber-500"
            />
            <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
              <span>1 (Very Low)</span>
              <span>5 (Neutral)</span>
              <span>10 (Peak Positive)</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
              Reflections / Notes (Optional)
            </label>
            <textarea
              {...register('note')}
              rows={2}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary w-full resize-none rounded-xl border px-3.5 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
              placeholder="What made you feel this way?"
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
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-amber-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
