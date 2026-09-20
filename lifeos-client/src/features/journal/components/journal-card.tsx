'use client';

import React from 'react';
import { IJournal } from '@/types/journal.types';
import { Calendar, Tag, Edit2, Trash2, Smile } from 'lucide-react';

interface JournalCardProps {
  journal: IJournal;
  onEdit: (journal: IJournal) => void;
  onDelete: (journal: IJournal) => void;
}

export function JournalCard({ journal, onEdit, onDelete }: JournalCardProps) {
  const formattedDate = new Date(journal.createdAt).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
    <div className="group border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all duration-200 hover:shadow-xs">
      <div className="space-y-3">
        {/* Header: Date, Mood pill, Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground flex items-center space-x-1 text-xs">
              <Calendar className="text-muted-foreground h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </span>

            {journal.mood && (
              <span
                className={`flex items-center space-x-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                  moodPillColors[journal.mood] || moodPillColors.Neutral
                }`}
              >
                <Smile className="h-3 w-3" />
                <span>{journal.mood}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEdit(journal)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
              title="Edit entry"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(journal)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg p-1.5 transition-colors"
              title="Delete entry"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title and Content snippet */}
        <div>
          <h3 className="text-foreground text-base font-bold tracking-tight">{journal.title}</h3>
          <p className="text-muted-foreground mt-2 line-clamp-4 text-xs leading-relaxed font-normal whitespace-pre-wrap">
            {journal.content}
          </p>
        </div>
      </div>

      {/* Tags footer */}
      {journal.tags && journal.tags.length > 0 && (
        <div className="border-border/70 mt-4 flex flex-wrap items-center gap-1.5 border-t pt-3">
          <Tag className="text-muted-foreground mr-0.5 h-3 w-3" />
          {journal.tags.map((tag) => (
            <span
              key={tag}
              className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[10px] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
