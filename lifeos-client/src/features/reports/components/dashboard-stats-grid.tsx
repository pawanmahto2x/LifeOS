'use client';

import React from 'react';
import { IDashboardSummary } from '@/types/report.types';
import { CheckSquare, Repeat, Droplets, Flame, Trophy, Brain } from 'lucide-react';

interface DashboardStatsGridProps {
  data?: IDashboardSummary;
  isLoading: boolean;
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Below Avg',
  4: 'Slightly Low',
  5: 'Neutral',
  6: 'Slightly Good',
  7: 'Good',
  8: 'Great',
  9: 'Excellent',
  10: 'Amazing',
};

export function DashboardStatsGrid({ data, isLoading }: DashboardStatsGridProps) {
  const stats = [
    {
      label: "Today's Tasks",
      icon: CheckSquare,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      value: data ? `${data.todayTasks.completed}/${data.todayTasks.total}` : '0/0',
      sub: data
        ? data.todayTasks.total === 0
          ? 'No tasks created today'
          : `${Math.round((data.todayTasks.completed / data.todayTasks.total) * 100)}% complete`
        : '—',
    },
    {
      label: "Today's Habits",
      icon: Repeat,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      value: data ? `${data.todayHabits.completed}/${data.todayHabits.total}` : '0/0',
      sub: data
        ? data.todayHabits.total === 0
          ? 'No active habits'
          : `${Math.round((data.todayHabits.completed / data.todayHabits.total) * 100)}% done`
        : '—',
    },
    {
      label: 'Hydration',
      icon: Droplets,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      value: data ? `${data.todayWaterMl} ml` : '0 ml',
      sub: data
        ? data.todayWaterMl >= 2000
          ? 'Daily goal reached!'
          : `${2000 - data.todayWaterMl}ml to 2L goal`
        : '—',
    },
    {
      label: 'Focus Today',
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      value: data ? `${data.todayFocusMinutes} min` : '0 min',
      sub: data ? `${data.weeklyFocusMinutes} min this week` : '—',
    },
    {
      label: 'Best Habit Streak',
      icon: Trophy,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      value: data ? `${data.currentStreak} days` : '0 days',
      sub: data
        ? data.currentStreak >= 7
          ? 'Over a week strong!'
          : data.currentStreak === 0
            ? 'Start your streak today'
            : 'Keep going!'
        : '—',
    },
    {
      label: "Today's Mood",
      icon: Brain,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      value: data?.todayMoodScore != null ? `${data.todayMoodScore}/10` : 'Not logged',
      sub:
        data?.todayMoodScore != null
          ? (MOOD_LABELS[Math.round(data.todayMoodScore)] ?? '—')
          : 'Log your mood in Health',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-border bg-card h-28 animate-pulse rounded-2xl border" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="border-border bg-card rounded-2xl border p-4 shadow-sm">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] leading-tight font-semibold tracking-wider uppercase">
                {s.label}
              </span>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${s.bg} ${s.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-foreground text-xl leading-none font-bold">{s.value}</p>
            <p className="text-muted-foreground mt-1 text-[10px] leading-tight">{s.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
