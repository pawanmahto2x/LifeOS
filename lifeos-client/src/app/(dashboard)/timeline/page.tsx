'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timelineApiService } from '@/features/timeline/services/timeline.service';
import { TimelineCard } from '@/features/timeline/components/timeline-card';
import { TimelineEntryType } from '@/types/timeline.types';
import { GitCommit, ChevronLeft, ChevronRight } from 'lucide-react';

const FILTER_TYPES: { label: string; value?: TimelineEntryType }[] = [
  { label: 'All Milestones' },
  { label: 'Achievements', value: 'AchievementUnlocked' },
  { label: 'Goals Completed', value: 'GoalCompleted' },
  { label: 'Habit Milestones', value: 'HabitMilestone' },
  { label: 'Challenges', value: 'ChallengeCompleted' },
];

export default function TimelinePage() {
  const [selectedType, setSelectedType] = useState<TimelineEntryType | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['life-timeline', selectedType, page],
    queryFn: async () => {
      const res = await timelineApiService.getTimeline({
        entryType: selectedType,
        page,
        limit,
      });
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const entries = data?.entries || [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header Card */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <GitCommit className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight">Life Timeline</h1>
              <p className="text-muted-foreground mt-0.5 text-xs">
                A verified chronological record of your personal milestones, goals, habit streaks,
                and achievements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2">
              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                Total Milestones
              </span>
              <span className="text-foreground text-lg font-bold">{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {FILTER_TYPES.map((tab) => {
          const isSelected = selectedType === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setSelectedType(tab.value);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground border'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Timeline Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-2xl" />
              <div className="border-border bg-card h-24 grow animate-pulse rounded-2xl border" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="border-border bg-card rounded-2xl border p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
            <GitCommit className="h-6 w-6" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">No Timeline Entries Recorded</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs leading-relaxed">
            Your life timeline records milestones automatically from verified activities — complete
            goals, build habit streaks, finish challenges, and earn badges to see your journey
            unfold.
          </p>
        </div>
      ) : (
        <div className="relative pt-2">
          {entries.map((entry, index) => (
            <TimelineCard key={entry._id} entry={entry} isLast={index === entries.length - 1} />
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
              <p className="text-muted-foreground text-xs">
                Page {page} of {totalPages} ({total} entries)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isPlaceholderData}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="border-border hover:bg-muted rounded-lg border p-1.5 text-neutral-400 transition-colors hover:text-white disabled:opacity-40"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || isPlaceholderData}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="border-border hover:bg-muted rounded-lg border p-1.5 text-neutral-400 transition-colors hover:text-white disabled:opacity-40"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
