'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { journalAnalysisApiService } from '@/features/journal/services/journal-analysis.service';
import { BarChart3, TrendingUp } from 'lucide-react';

export const RecurringThemes = () => {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['journal-themes'],
    queryFn: () => journalAnalysisApiService.getRecurringThemes(),
  });

  if (isLoading) {
    return (
      <div className="border-border/80 bg-card flex flex-col items-center justify-center rounded-2xl border p-10 shadow-2xs">
        <div className="text-primary mb-2 flex space-x-2">
          <div className="bg-primary/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
          <div className="bg-primary/80 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
          <div className="bg-primary h-2 w-2 animate-bounce rounded-full"></div>
        </div>
        <p className="text-muted-foreground text-xs">Loading recurring themes...</p>
      </div>
    );
  }

  if (isError || !response?.data?.themes?.length) {
    return (
      <div className="border-border/80 bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center shadow-2xs">
        <BarChart3 className="text-muted-foreground mb-4 h-10 w-10 opacity-50" />
        <h3 className="text-foreground text-sm font-bold tracking-tight">
          No Recurring Themes Yet
        </h3>
        <p className="text-muted-foreground mt-2 max-w-sm text-xs">
          Analyze more journal entries to start seeing patterns over time.
        </p>
      </div>
    );
  }

  const { themes, totalEntriesAnalyzed } = response.data;

  return (
    <div className="border-border/80 bg-card animate-in fade-in flex flex-col rounded-2xl border p-6 shadow-2xs duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-sm font-bold tracking-tight">Recurring Themes</h3>
          <p className="text-muted-foreground text-xs">
            Patterns detected across {totalEntriesAnalyzed} entries
          </p>
        </div>
        <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full p-2">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-5">
        {themes.map((themeItem) => (
          <div key={themeItem.theme} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground font-medium capitalize">{themeItem.theme}</span>
              <span className="text-muted-foreground font-semibold">
                {themeItem.percentage}%{' '}
                <span className="font-normal opacity-70">({themeItem.count})</span>
              </span>
            </div>
            {/* Progress Bar Container */}
            <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${themeItem.percentage}%` }}
              />
            </div>
            {themeItem.recentMentions > 0 && (
              <p className="text-muted-foreground text-[10px] italic">
                Mentioned {themeItem.recentMentions} times recently
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
