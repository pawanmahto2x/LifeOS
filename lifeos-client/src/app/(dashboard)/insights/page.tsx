'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsApiService } from '@/features/insights/services/insights.service';
import { BaselinePeriod } from '@/types/insights.types';
import {
  CheckSquare,
  Flame,
  Moon,
  Droplet,
  Smile,
  Repeat,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  SearchX,
} from 'lucide-react';

export default function InsightsPage() {
  const [period, setPeriod] = useState<BaselinePeriod>('7d');

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['insights'],
    queryFn: () => insightsApiService.getFullInsights(),
  });

  const insightsData = response?.data;
  const baseline = insightsData?.baselines[period];
  const metrics = baseline?.metrics;

  const formatTime = (minutes: number) => {
    if (!minutes) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h}h ${m}m`;
  };

  const renderBaselineCard = (
    title: string,
    value: string | number,
    Icon: any,
    colorClass: string,
    isEmpty: boolean = false,
  ) => {
    if (isEmpty || !baseline?.hasEnoughData) {
      return (
        <div className="border-border/80 flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-5 text-center">
          <SearchX className="text-muted-foreground/50 h-6 w-6" />
          <p className="text-muted-foreground text-xs">
            Not enough data yet. Keep using LifeOS to build your baseline.
          </p>
        </div>
      );
    }

    return (
      <div className="border-border/80 bg-card hover:border-primary/40 flex min-h-[140px] flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            {title}
          </span>
          <div className={`rounded-lg p-2 ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-foreground text-3xl font-bold tracking-tight">{value}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Based on {metrics?.dataPointCount || 0} data points
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-in fade-in space-y-8 p-6 duration-300">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-48 animate-pulse rounded"></div>
          <div className="bg-muted h-4 w-96 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="border-border/80 bg-card h-[140px] animate-pulse rounded-2xl border p-5 shadow-2xs"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="border-border/80 bg-card rounded-2xl border border-red-500/20 p-8 text-center text-red-500">
          Failed to load insights. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-8 p-6 pb-20 duration-300">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Behaviour Insights</h1>
          <p className="text-muted-foreground text-sm">
            Understand your patterns and performance compared to your personal baseline
          </p>
        </div>

        <div className="bg-muted/50 border-border/50 flex items-center rounded-lg border p-1">
          {(['7d', '14d', '30d'] as BaselinePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${period === p ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {p.replace('d', ' Days')}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-foreground text-lg font-bold tracking-tight">Personal Baseline</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {renderBaselineCard(
            'Tasks',
            Math.round(metrics?.avgTasksCompletedPerDay || 0),
            CheckSquare,
            'bg-blue-500/10 text-blue-500',
            !metrics,
          )}
          {renderBaselineCard(
            'Focus',
            formatTime(metrics?.avgFocusMinutesPerDay || 0),
            Flame,
            'bg-amber-500/10 text-amber-500',
            !metrics,
          )}
          {renderBaselineCard(
            'Sleep',
            formatTime(metrics?.avgSleepMinutes || 0),
            Moon,
            'bg-indigo-500/10 text-indigo-500',
            !metrics,
          )}
          {renderBaselineCard(
            'Water',
            `${(metrics?.avgWaterMlPerDay || 0) / 1000}L`,
            Droplet,
            'bg-sky-500/10 text-sky-500',
            !metrics,
          )}
          {renderBaselineCard(
            'Mood',
            `${(metrics?.avgMoodScore || 0).toFixed(1)}/10`,
            Smile,
            'bg-emerald-500/10 text-emerald-500',
            !metrics,
          )}
          {renderBaselineCard(
            'Habits',
            `${Math.round(metrics?.avgHabitCompletionRate || 0)}%`,
            Repeat,
            'bg-violet-500/10 text-violet-500',
            !metrics,
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-foreground text-lg font-bold tracking-tight">Behaviour Patterns</h2>
        {!insightsData?.patterns || insightsData.patterns.length === 0 ? (
          <div className="border-border/80 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-center">
            <SearchX className="text-muted-foreground/50 mb-2 h-8 w-8" />
            <p className="text-foreground font-medium">No patterns detected</p>
            <p className="text-muted-foreground max-w-md text-sm">
              Not enough data to identify reliable patterns yet. LifeOS needs at least 7 days of
              activity across multiple modules.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {insightsData.patterns.map((pattern) => (
              <div
                key={pattern._id}
                className="border-border/80 bg-card hover:border-primary/40 rounded-2xl border p-5 shadow-2xs transition-all"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">{pattern.title}</span>
                  </div>
                  <span
                    className={`border-border/80 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                      pattern.confidence === 'high'
                        ? 'bg-green-500/10 text-green-600'
                        : pattern.confidence === 'medium'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-yellow-500/10 text-yellow-600'
                    }`}
                  >
                    {pattern.confidence} confidence
                  </span>
                </div>
                <p className="text-muted-foreground mb-4 text-xs">{pattern.description}</p>
                <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Based on {pattern.dataPoints} data points
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-foreground text-lg font-bold tracking-tight">Weekly Trends</h2>
          {!insightsData?.trends || insightsData.trends.length === 0 ? (
            <div className="border-border/80 flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-center">
              <SearchX className="text-muted-foreground/50 mb-1 h-6 w-6" />
              <p className="text-muted-foreground text-sm">No trends available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insightsData.trends.map((trend, i) => (
                <div
                  key={i}
                  className="border-border/80 bg-card flex items-center justify-between rounded-xl border p-4 shadow-2xs"
                >
                  <div>
                    <div className="text-foreground text-sm font-semibold">{trend.metric}</div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {trend.previous} → {trend.current}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-sm font-bold ${
                      trend.direction === 'up'
                        ? 'text-green-500'
                        : trend.direction === 'down'
                          ? 'text-red-500'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
                    {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
                    {trend.direction === 'stable' && <Minus className="h-4 w-4" />}
                    {trend.changePercent > 0 ? '+' : ''}
                    {trend.changePercent}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-lg font-bold tracking-tight">
            Areas Needing Attention
          </h2>
          {!insightsData?.attentionAreas || insightsData.attentionAreas.length === 0 ? (
            <div className="border-border/80 bg-card flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border p-8 text-center">
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-foreground font-medium">Looking good!</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  All metrics are within your normal range. Keep it up!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {insightsData.attentionAreas.map((area, i) => (
                <div
                  key={i}
                  className={`border-border/80 bg-card flex gap-3 rounded-xl border p-4 shadow-2xs ${
                    area.severity === 'warning'
                      ? 'border-l-4 border-l-red-500'
                      : 'border-l-4 border-l-amber-500'
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 shrink-0 ${
                      area.severity === 'warning' ? 'text-red-500' : 'text-amber-500'
                    }`}
                  />
                  <div>
                    <div className="text-foreground text-sm font-semibold">{area.metric}</div>
                    <div className="text-muted-foreground mt-1 text-xs">{area.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
