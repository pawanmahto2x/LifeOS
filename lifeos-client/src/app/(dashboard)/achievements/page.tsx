'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { achievementApiService } from '@/features/achievements/services/achievement.service';
import { AchievementBadgeCard } from '@/features/achievements/components/achievement-badge-card';
import { Award } from 'lucide-react';

const CATEGORIES = ['All', 'Productivity', 'Consistency', 'Focus', 'Wellness', 'Community'];

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState(false);

  const {
    data: summaryData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await achievementApiService.getAchievements();
      return res.data;
    },
    retry: 2,
  });

  const allAchievements = summaryData?.achievements || [];

  const filtered = allAchievements.filter((a) => {
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesUnlocked = !filterUnlockedOnly || a.isUnlocked;
    return matchesCategory && matchesUnlocked;
  });

  const unlockedCount = summaryData?.unlockedCount ?? 0;
  const totalBadges = summaryData?.totalBadges ?? allAchievements.length;
  const percentage = summaryData?.unlockedPercentage ?? 0;

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header Banner with Global Progress */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Achievements & Badges
              </h1>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Milestones unlock automatically as you complete tasks, maintain habit streaks, and
                stay focused.
              </p>
            </div>
          </div>

          {/* Progress stats */}
          <div className="border-border flex items-center gap-6 self-start border-t pt-3 sm:self-auto sm:border-t-0 sm:pt-0">
            <div>
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Unlocked
              </p>
              <p className="text-foreground text-xl font-bold">
                {unlockedCount} / {totalBadges}
              </p>
            </div>

            <div className="w-32">
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-bold">{percentage}%</span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setFilterUnlockedOnly(!filterUnlockedOnly)}
          className={`self-start rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors sm:self-auto ${
            filterUnlockedOnly
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {filterUnlockedOnly ? 'Showing Unlocked Only' : 'Show All Badges'}
        </button>
      </div>

      {/* Error State */}
      {isError && (
        <div className="border-destructive/20 bg-destructive/10 rounded-2xl border p-8 text-center shadow-xs">
          <p className="text-destructive text-sm font-semibold">Failed to load achievements</p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
            Could not reach the LifeOS server. Make sure the backend server is running on port 5000.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex cursor-pointer items-center rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Badge Gallery */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border-border bg-card h-44 animate-pulse rounded-2xl border" />
          ))}
        </div>
      ) : !isError && filtered.length === 0 ? (
        <div className="border-border bg-card rounded-2xl border p-12 text-center shadow-sm">
          <p className="text-foreground text-sm font-semibold">No Badges Match This Filter</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Try selecting a different category or clearing the unlocked-only filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((achievement) => (
            <AchievementBadgeCard key={achievement.badgeId} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  );
}
