'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { focusApiService } from '../services/focus.service';
import { FocusSession } from '@/types/focus.types';
import { CheckCircle2, Flame, AlertCircle, X } from 'lucide-react';

interface FocusSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: FocusSession | null;
  distractions: number;
}

export function FocusSummaryDialog({
  isOpen,
  onClose,
  session,
  distractions,
}: FocusSummaryDialogProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !session) return null;

  const handleFinish = async (completed: boolean) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const sessionId = session._id || session.id || '';
      await focusApiService.endSession({
        sessionId,
        distractions,
        notes: notes.trim() || undefined,
        completed,
      });

      await queryClient.invalidateQueries({ queryKey: ['focus'] });
      await queryClient.invalidateQueries({ queryKey: ['focus-current'] });
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Failed to save focus session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="bg-card border-border animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl border p-6 shadow-2xl duration-200">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-lg p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-foreground text-xl font-bold">Session Complete!</h2>
            <p className="text-muted-foreground text-xs">Great work staying in deep focus.</p>
          </div>
        </div>

        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-xl border p-3 text-sm">
            {serverError}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="bg-muted/40 border-border rounded-xl border p-3.5 text-center">
            <div className="text-muted-foreground mb-1 flex items-center justify-center gap-1.5 text-xs">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>Target Duration</span>
            </div>
            <p className="text-foreground text-xl font-bold">{session.duration} mins</p>
          </div>

          <div className="bg-muted/40 border-border rounded-xl border p-3.5 text-center">
            <div className="text-muted-foreground mb-1 flex items-center justify-center gap-1.5 text-xs">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>Distractions</span>
            </div>
            <p className="text-foreground text-xl font-bold">{distractions}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-muted-foreground mb-2 block text-xs font-medium tracking-wider uppercase">
            Session Reflections / Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
            placeholder="What did you accomplish during this focus block?"
          />
        </div>

        <div className="border-border flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={() => handleFinish(false)}
            disabled={isSubmitting}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl px-4 py-2.5 text-xs font-medium transition-colors"
          >
            Discard / Interrupted
          </button>
          <button
            type="button"
            onClick={() => handleFinish(true)}
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save & Log Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
