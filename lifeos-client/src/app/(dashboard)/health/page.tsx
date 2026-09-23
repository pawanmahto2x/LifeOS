'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApiService } from '@/features/health/services/health.service';
import { WaterTracker } from '@/features/health/components/water-tracker';
import { SleepTracker } from '@/features/health/components/sleep-tracker';
import { MoodTracker } from '@/features/health/components/mood-tracker';
import { Droplet, Moon, Smile, HeartPulse } from 'lucide-react';

export default function HealthPage() {
  const { data: summary } = useQuery({
    queryKey: ['health-summary'],
    queryFn: async () => {
      const res = await healthApiService.getSummary();
      return res.data;
    },
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'Excellent':
        return '🌟';
      case 'Happy':
        return '😊';
      case 'Calm':
        return '😌';
      case 'Neutral':
        return '😐';
      case 'Stressed':
        return '😰';
      case 'Sad':
        return '😔';
      case 'Angry':
        return '😠';
      default:
        return '✨';
    }
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <HeartPulse className="h-5 w-5" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Health & Wellness</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Track daily hydration, rest patterns, and emotional wellbeing backed by your real logs.
        </p>
      </div>

      {/* Health Metric Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Hydration Card */}
        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Today&apos;s Water
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Droplet className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-bold">
              {summary?.water ? `${summary.water.todayTotalMl} ml` : '0 ml'}
            </span>
            <span className="text-muted-foreground text-xs">
              / {summary?.water ? `${summary.water.dailyGoalMl} ml` : '2000 ml'}
            </span>
          </div>
          <div className="text-muted-foreground mt-2 text-xs">
            {summary?.water && summary.water.progressPercentage > 0
              ? `${summary.water.progressPercentage}% of daily goal`
              : 'No intake logged today'}
          </div>
        </div>

        {/* Sleep Card */}
        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Last Night Sleep
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Moon className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-bold">
              {summary?.sleep?.lastSession
                ? formatDuration(summary.sleep.lastSession.duration)
                : '—'}
            </span>
            {summary?.sleep?.lastSession && (
              <span className="py-0.2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 text-[10px] font-semibold text-indigo-500">
                {summary.sleep.lastSession.quality}
              </span>
            )}
          </div>
          <div className="text-muted-foreground mt-2 text-xs">
            {summary?.sleep?.sevenDayAverageDurationMinutes
              ? `7-day avg: ${formatDuration(summary.sleep.sevenDayAverageDurationMinutes)}`
              : 'No recent sleep history'}
          </div>
        </div>

        {/* Mood Card */}
        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Today&apos;s Mood
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Smile className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {summary?.mood?.todayLatestMood ? (
              <>
                <span className="text-2xl">{getMoodEmoji(summary.mood.todayLatestMood.mood)}</span>
                <span className="text-foreground text-2xl font-bold">
                  {summary.mood.todayLatestMood.mood}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({summary.mood.todayLatestMood.moodScore}/10)
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-2xl font-bold">—</span>
            )}
          </div>
          <div className="text-muted-foreground mt-2 text-xs">
            {summary?.mood?.sevenDayAverageScore !== null &&
            summary?.mood?.sevenDayAverageScore !== undefined
              ? `7-day avg score: ${summary.mood.sevenDayAverageScore}/10`
              : 'No check-in yet today'}
          </div>
        </div>
      </div>

      {/* Main Trackers Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WaterTracker />
        </div>
        <div className="lg:col-span-1">
          <SleepTracker />
        </div>
        <div className="lg:col-span-1">
          <MoodTracker />
        </div>
      </div>
    </div>
  );
}
