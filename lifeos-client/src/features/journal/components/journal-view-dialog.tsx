'use client';

import React, { useState } from 'react';
import { IJournal } from '@/types/journal.types';
import { Calendar, Tag, Edit2, X, Smile, Sparkles, BookOpen } from 'lucide-react';
import { JournalAnalysis } from './JournalAnalysis';

interface JournalViewDialogProps {
  journal: IJournal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (journal: IJournal) => void;
  initialTab?: 'entry' | 'analysis';
}

export function JournalViewDialog({
  journal,
  isOpen,
  onClose,
  onEdit,
  initialTab = 'entry',
}: JournalViewDialogProps) {
  const [activeTab, setActiveTab] = useState<'entry' | 'analysis'>(initialTab);

  // Sync initial tab when journal changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [journal?._id, initialTab]);

  if (!isOpen || !journal) return null;

  const formattedDate = new Date(journal.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(journal.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const moodPillColors: Record<string, string> = {
    Excellent: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Happy: 'border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400',
    Calm: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Neutral: 'border-border bg-muted text-muted-foreground',
    Stressed: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Sad: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    Angry: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
      <div className="border-border/80 bg-card text-card-foreground relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border p-6 shadow-2xl transition-all sm:p-8">
        {/* Top Header Bar */}
        <div className="border-border/60 flex items-center justify-between border-b pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </span>

            {journal.mood && (
              <span
                className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${
                  moodPillColors[journal.mood] || moodPillColors.Neutral
                }`}
              >
                <Smile className="h-3.5 w-3.5" />
                <span>{journal.mood}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(journal);
              }}
              className="border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-xl p-1.5 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-muted/50 border-border/40 mt-4 flex items-center gap-1.5 rounded-xl border p-1">
          <button
            type="button"
            onClick={() => setActiveTab('entry')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'entry'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Journal Reflection</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'analysis'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="text-primary h-3.5 w-3.5" />
            <span>AI Behaviour Analysis</span>
          </button>
        </div>

        {activeTab === 'entry' ? (
          <div className="animate-in fade-in mt-6 space-y-5 duration-200">
            {/* Title */}
            <div>
              <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                {journal.title}
              </h1>
            </div>

            {/* Journal Reflection Content Body */}
            <div className="text-foreground/90 text-sm leading-relaxed font-normal whitespace-pre-wrap">
              {journal.content}
            </div>

            {/* Tags footer */}
            {journal.tags && journal.tags.length > 0 && (
              <div className="border-border/60 flex flex-wrap items-center gap-1.5 border-t pt-4">
                <Tag className="text-muted-foreground mr-1 h-3.5 w-3.5" />
                {journal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground rounded-lg px-2.5 py-1 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom prompt to explore analysis */}
            <div className="border-border/60 flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground text-xs">
                Want to see patterns and data connections from this reflection?
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('analysis')}
                className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>View Analysis →</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in mt-6 duration-200">
            <JournalAnalysis journalId={journal._id} />
          </div>
        )}
      </div>
    </div>
  );
}
