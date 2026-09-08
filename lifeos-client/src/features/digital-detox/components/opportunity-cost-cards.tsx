'use client';

import React from 'react';
import { IOpportunityCostSummary } from '@/types/digital-detox.types';
import { Sparkles, BookOpen, Clock, Zap } from 'lucide-react';

interface OpportunityCostCardsProps {
  data?: IOpportunityCostSummary;
  isLoading: boolean;
}

export function OpportunityCostCards({ data, isLoading }: OpportunityCostCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border bg-card h-32 animate-pulse rounded-2xl border p-5"
          />
        ))}
      </div>
    );
  }

  const minutesSaved = data?.minutesSaved ?? 0;
  const pomodoroSessions = data?.equivalentPomodoroSessions ?? 0;
  const bookPages = data?.equivalentBookPages ?? 0;
  const hasData = data?.hasUsageData ?? false;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h3 className="text-foreground text-sm font-bold tracking-wider uppercase">
          Opportunity Cost &amp; Saved Potential
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Time Budget Saved
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-foreground text-2xl font-bold">
            {hasData ? `${minutesSaved} mins` : '0 mins'}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {hasData
              ? minutesSaved > 0
                ? 'Time preserved under daily goal'
                : 'Goal exceeded today'
              : "Log today's screen time to track savings"}
          </p>
        </div>

        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Focus Blocks Earned
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-foreground text-2xl font-bold">
            {hasData ? `${pomodoroSessions}` : '0'}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Equivalent to {pomodoroSessions} × 25-min Pomodoro deep work blocks
          </p>
        </div>

        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Reading Potential
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="text-foreground text-2xl font-bold">
            {hasData ? `${bookPages} pages` : '0 pages'}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Book pages you could read with this preserved time
          </p>
        </div>
      </div>
    </div>
  );
}
