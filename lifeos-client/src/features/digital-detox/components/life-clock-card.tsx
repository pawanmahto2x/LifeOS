'use client';

import React from 'react';
import { Clock, Sparkles, Heart } from 'lucide-react';

interface LifeClockCardProps {
  todayScreenTimeMinutes?: number;
  dailyGoalMinutes?: number;
}

export function LifeClockCard({
  todayScreenTimeMinutes = 0,
  dailyGoalMinutes = 120,
}: LifeClockCardProps) {
  // Goal in hours per day (default 2h)
  const goalHours = Math.max(1, (dailyGoalMinutes || 120) / 60);

  // Average smartphone user spends ~4.5 hours/day
  const benchmarkDailyHours = 4.5;
  const dailyHoursSaved = Math.max(0.5, benchmarkDailyHours - goalHours);

  // Weekly and yearly hours saved
  const weeklyHoursReclaimed = Math.round(dailyHoursSaved * 7);
  const yearlyDaysReclaimed = Math.round((dailyHoursSaved * 365) / 16); // 16 waking hours per day

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-base font-bold">
              Time Perspective &amp; Life Balance
            </h3>
            <p className="text-muted-foreground text-xs">
              Every hour saved from mindless feeds is an hour given back to your real life.
            </p>
          </div>
        </div>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Daily Boundary: {goalHours}h/day
        </span>
      </div>

      {/* Main Inspiring Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Box 1: Weekly Hours Reclaimed */}
        <div className="bg-muted/30 border-border/70 rounded-2xl border p-5">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Time Preserved Each Week</span>
          </div>

          <div className="my-2.5">
            <span className="text-foreground text-3xl font-extrabold tracking-tight">
              +{weeklyHoursReclaimed} Hours
            </span>
            <span className="text-muted-foreground ml-2 text-xs">/ week</span>
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed">
            Enough free time each week to learn a new creative skill, read a full book, or enjoy
            deep undisturbed sleep.
          </p>
        </div>

        {/* Box 2: Yearly Life Reclaimed */}
        <div className="bg-muted/30 border-border/70 rounded-2xl border p-5">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <Heart className="h-4 w-4 text-rose-500" />
            <span>Conscious Life Reclaimed Per Year</span>
          </div>

          <div className="my-2.5">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-500">
              +{yearlyDaysReclaimed} Full Days
            </span>
            <span className="text-muted-foreground ml-2 text-xs">every year</span>
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed">
            By keeping healthy boundaries on social media, you reclaim nearly a full month of
            conscious waking life every year.
          </p>
        </div>
      </div>
    </div>
  );
}
