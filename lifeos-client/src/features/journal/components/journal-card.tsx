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
    Excellent: 'bg-emerald-950/50 text-emerald-300 border-emerald-800',
    Happy: 'bg-teal-950/50 text-teal-300 border-teal-800',
    Calm: 'bg-blue-950/50 text-blue-300 border-blue-800',
    Neutral: 'bg-neutral-800 text-neutral-400 border-neutral-700',
    Stressed: 'bg-amber-950/50 text-amber-300 border-amber-800',
    Sad: 'bg-indigo-950/50 text-indigo-300 border-indigo-800',
    Angry: 'bg-red-950/50 text-red-300 border-red-800',
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 transition-all hover:border-neutral-700 hover:bg-neutral-900/70">
      <div className="space-y-3">
        {/* Header: Date, Mood pill, Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-xs text-neutral-400">
              <Calendar className="h-3.5 w-3.5 text-neutral-500" />
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
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              title="Edit entry"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(journal)}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
              title="Delete entry"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title and Content snippet */}
        <div>
          <h3 className="text-base font-bold tracking-tight text-white">{journal.title}</h3>
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed font-normal whitespace-pre-wrap text-neutral-300">
            {journal.content}
          </p>
        </div>
      </div>

      {/* Tags footer */}
      {journal.tags && journal.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-800/60 pt-3">
          <Tag className="mr-0.5 h-3 w-3 text-neutral-500" />
          {journal.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-neutral-800/80 px-2 py-0.5 text-[10px] font-medium text-neutral-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
