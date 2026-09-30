'use client';

import React, { useState } from 'react';
import { IJournal } from '@/types/journal.types';
import { Calendar, Tag, Edit2, Trash2, Smile, AlertCircle, BookOpen } from 'lucide-react';

interface JournalCardProps {
  journal: IJournal;
  onEdit: (journal: IJournal) => void;
  onDelete: (journal: IJournal) => void;
  onTagClick?: (tag: string) => void;
  onView?: (journal: IJournal) => void;
  onAnalyze?: (journal: IJournal) => void;
}

export function JournalCard({
  journal,
  onEdit,
  onDelete,
  onTagClick,
  onView,
  onAnalyze,
}: JournalCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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

  const isLong = journal.content.length > 200 || journal.content.includes('\n');

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

          {/* Action Buttons with Accidental Delete Guard */}
          <div className="flex items-center space-x-1">
            {isConfirmingDelete ? (
              <div className="bg-destructive/10 border-destructive/30 flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]">
                <AlertCircle className="text-destructive h-3 w-3" />
                <span className="text-destructive font-medium">Delete?</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmingDelete(false);
                    onDelete(journal);
                  }}
                  className="bg-destructive hover:bg-destructive/90 cursor-pointer rounded px-1.5 py-0.5 font-bold text-white transition-colors"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer px-1 py-0.5 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 opacity-80 transition-opacity group-hover:opacity-100 sm:opacity-0">
                {onAnalyze && (
                  <button
                    type="button"
                    onClick={() => onAnalyze(journal)}
                    className="text-primary hover:bg-primary/10 cursor-pointer rounded-lg p-1.5 transition-colors"
                    title="AI Behaviour Analysis"
                  >
                    <span className="sr-only">Analyze</span>
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                  </button>
                )}
                {onView && (
                  <button
                    type="button"
                    onClick={() => onView(journal)}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
                    title="Read full entry"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEdit(journal)}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
                  title="Edit entry"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg p-1.5 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title and Content snippet (Clickable to view) */}
        <div onClick={() => onView && onView(journal)} className={onView ? 'cursor-pointer' : ''}>
          <h3 className="text-foreground hover:text-primary text-base font-bold tracking-tight transition-colors">
            {journal.title}
          </h3>
          <p className="text-muted-foreground mt-2 line-clamp-4 text-xs leading-relaxed font-normal whitespace-pre-wrap">
            {journal.content}
          </p>
          {isLong && onView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView(journal);
              }}
              className="text-primary hover:text-primary/80 mt-1.5 inline-block cursor-pointer text-[11px] font-semibold"
            >
              Read full reflection →
            </button>
          )}
        </div>
      </div>

      {/* Clickable Tags footer */}
      {journal.tags && journal.tags.length > 0 && (
        <div className="border-border/70 mt-4 flex flex-wrap items-center gap-1.5 border-t pt-3">
          <Tag className="text-muted-foreground mr-0.5 h-3 w-3" />
          {journal.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick && onTagClick(tag)}
              className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors"
              title={`Filter by #${tag}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
