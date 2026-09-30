'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lifeReplayApiService } from '@/features/life-replay/services/life-replay.service';
import { ReplayPeriod, IUserReflection } from '@/types/life-replay.types';
import {
  CalendarDays,
  Play,
  CheckCircle2,
  Timer,
  Moon,
  Droplets,
  Smile,
  Flame,
  Target,
  BookOpen,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

export default function LifeReplayPage() {
  const [period, setPeriod] = useState<ReplayPeriod>('weekly');
  const queryClient = useQueryClient();

  const [reflectionForm, setReflectionForm] = useState({
    whatToContinue: '',
    whatToChange: '',
    nextGoal: '',
  });

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['life-replay', period],
    queryFn: () => lifeReplayApiService.getReplay(period),
  });

  const { mutate: saveReflection, isPending: isSaving } = useMutation({
    mutationFn: (data: Partial<IUserReflection>) => {
      if (!response?.data?._id) throw new Error('No replay ID');
      return lifeReplayApiService.saveReflection(response.data._id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-replay', period] });
    },
  });

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveReflection(reflectionForm);
  };

  const formatHoursMins = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h}h ${m}m`;
  };

  const renderChangeIndicator = (value: number) => {
    if (value > 0)
      return (
        <span className="flex items-center text-emerald-500">
          <TrendingUp className="mr-1 h-4 w-4" /> +{value}%
        </span>
      );
    if (value < 0)
      return (
        <span className="flex items-center text-red-500">
          <TrendingDown className="mr-1 h-4 w-4" /> {value}%
        </span>
      );
    return (
      <span className="text-muted-foreground flex items-center">
        <Minus className="mr-1 h-4 w-4" /> 0%
      </span>
    );
  };

  return (
    <div className="animate-in fade-in container mx-auto max-w-5xl space-y-8 py-8 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Play className="text-primary h-8 w-8" /> Life Replay
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Look back at your journey and measure your growth
          </p>
        </div>

        <div className="bg-muted flex items-center rounded-lg p-1">
          <button
            onClick={() => setPeriod('weekly')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              period === 'weekly'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              period === 'monthly'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">Generating your {period} replay...</p>
        </div>
      )}

      {isError && (
        <div className="border-border/80 bg-card flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center shadow-2xs">
          <CalendarDays className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
          <h3 className="text-foreground font-bold">Not Enough Data Yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Your first Life Replay will be available after you have enough recorded activity. Keep
            using LifeOS!
          </p>
        </div>
      )}

      {response?.data && (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Productivity Quick Stats */}
            <div className="border-border/80 bg-card hover:border-primary/40 rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
              <div className="text-primary flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="text-foreground text-sm font-bold tracking-tight">Productivity</h3>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-foreground text-3xl font-bold">
                  {response.data.productivity.tasksCompleted}
                </p>
                <p className="text-muted-foreground text-xs">tasks done</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Focus Time</span>
                  <span className="font-semibold">
                    {formatHoursMins(response.data.productivity.focusTimeMinutes)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold">
                    {Math.round(response.data.productivity.completionRate)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Wellness Quick Stats */}
            <div className="border-border/80 bg-card hover:border-primary/40 rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
              <div className="flex items-center gap-2 text-indigo-500">
                <Moon className="h-5 w-5" />
                <h3 className="text-foreground text-sm font-bold tracking-tight">Wellness</h3>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-foreground text-3xl font-bold">
                  {formatHoursMins(response.data.wellness.avgSleepMinutes)}
                </p>
                <p className="text-muted-foreground text-xs">avg sleep</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg Water</span>
                  <span className="font-semibold">
                    {(response.data.wellness.avgWaterMlPerDay / 1000).toFixed(1)}L / day
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg Mood</span>
                  <span className="font-semibold">
                    {response.data.wellness.avgMoodScore.toFixed(1)} / 10
                  </span>
                </div>
              </div>
            </div>

            {/* Habits Quick Stats */}
            <div className="border-border/80 bg-card hover:border-primary/40 rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
              <div className="flex items-center gap-2 text-orange-500">
                <Flame className="h-5 w-5" />
                <h3 className="text-foreground text-sm font-bold tracking-tight">Habits</h3>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-foreground text-3xl font-bold">
                  {Math.round(response.data.habits.consistency)}%
                </p>
                <p className="text-muted-foreground text-xs">consistency</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Completions</span>
                  <span className="font-semibold">{response.data.habits.totalCompletions}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Best Streak</span>
                  <span className="font-semibold">{response.data.habits.bestStreak} days</span>
                </div>
              </div>
            </div>

            {/* Reflection Quick Stats */}
            <div className="border-border/80 bg-card hover:border-primary/40 rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
              <div className="flex items-center gap-2 text-violet-500">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-foreground text-sm font-bold tracking-tight">Reflection</h3>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-foreground text-3xl font-bold">
                  {response.data.reflection.journalEntries}
                </p>
                <p className="text-muted-foreground text-xs">journal entries</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Top Mood</span>
                  <span className="font-semibold capitalize">
                    {response.data.reflection.topMood || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {response.data.reflection.commonThemes.slice(0, 2).map((theme) => (
                    <span
                      key={theme}
                      className="border-border/80 bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Changes vs Previous */}
            <div className="border-border/80 bg-card space-y-4 rounded-2xl border p-6 shadow-2xs">
              <h3 className="text-foreground text-sm font-bold tracking-tight uppercase">
                Compared to Previous {period === 'weekly' ? 'Week' : 'Month'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-border/80 bg-muted/30 flex flex-col items-center justify-center rounded-xl border p-4 text-center">
                  <span className="text-muted-foreground mb-1 text-xs">Focus Time</span>
                  {renderChangeIndicator(response.data.changes.focusChange)}
                </div>
                <div className="border-border/80 bg-muted/30 flex flex-col items-center justify-center rounded-xl border p-4 text-center">
                  <span className="text-muted-foreground mb-1 text-xs">Tasks Done</span>
                  {renderChangeIndicator(response.data.changes.taskChange)}
                </div>
                <div className="border-border/80 bg-muted/30 flex flex-col items-center justify-center rounded-xl border p-4 text-center">
                  <span className="text-muted-foreground mb-1 text-xs">Sleep Quality</span>
                  {renderChangeIndicator(response.data.changes.sleepChange)}
                </div>
                <div className="border-border/80 bg-muted/30 flex flex-col items-center justify-center rounded-xl border p-4 text-center">
                  <span className="text-muted-foreground mb-1 text-xs">Habit Consistency</span>
                  {renderChangeIndicator(response.data.changes.habitChange)}
                </div>
              </div>
            </div>

            {/* Detected Patterns */}
            <div className="border-border/80 bg-card space-y-4 rounded-2xl border p-6 shadow-2xs">
              <h3 className="text-foreground flex items-center gap-2 text-sm font-bold tracking-tight uppercase">
                <Brain className="text-primary h-4 w-4" /> Patterns Detected
              </h3>
              {response.data.patterns.length > 0 ? (
                <div className="space-y-3">
                  {response.data.patterns.map((pattern, idx) => (
                    <div
                      key={idx}
                      className="border-border/80 bg-muted/30 flex flex-col gap-1 rounded-xl border p-3"
                    >
                      <p className="text-foreground text-sm">{pattern.description}</p>
                      <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        Based on {pattern.dataPoints} data points
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center pb-8 text-center">
                  <p className="text-muted-foreground text-sm italic">
                    Collect more data to reveal patterns.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Reflection Input */}
          <div className="border-border/80 bg-card rounded-2xl border p-6 shadow-2xs">
            <h3 className="text-foreground mb-4 text-sm font-bold tracking-tight uppercase">
              Your Reflection
            </h3>

            {response.data.userReflection ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-primary/5 border-primary/20 rounded-xl border p-4">
                  <h4 className="text-primary mb-2 text-xs font-semibold uppercase">
                    What to Continue
                  </h4>
                  <p className="text-foreground text-sm">
                    {response.data.userReflection.whatToContinue || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                  <h4 className="mb-2 text-xs font-semibold text-orange-600 uppercase">
                    What to Change
                  </h4>
                  <p className="text-foreground text-sm">
                    {response.data.userReflection.whatToChange || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <h4 className="mb-2 text-xs font-semibold text-blue-600 uppercase">Next Goal</h4>
                  <p className="text-foreground text-sm">
                    {response.data.userReflection.nextGoal || '—'}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReflectionSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-xs font-medium">
                      What should you continue?
                    </label>
                    <textarea
                      className="border-border/80 bg-background focus:border-primary focus:ring-primary w-full resize-none rounded-lg border p-3 text-sm focus:ring-1 focus:outline-none"
                      rows={3}
                      placeholder="e.g., Morning workouts..."
                      value={reflectionForm.whatToContinue}
                      onChange={(e) =>
                        setReflectionForm({ ...reflectionForm, whatToContinue: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-xs font-medium">
                      What should you change?
                    </label>
                    <textarea
                      className="border-border/80 bg-background focus:border-primary focus:ring-primary w-full resize-none rounded-lg border p-3 text-sm focus:ring-1 focus:outline-none"
                      rows={3}
                      placeholder="e.g., Scrolling before bed..."
                      value={reflectionForm.whatToChange}
                      onChange={(e) =>
                        setReflectionForm({ ...reflectionForm, whatToChange: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-xs font-medium">
                      What is one thing to accomplish next {period === 'weekly' ? 'week' : 'month'}?
                    </label>
                    <textarea
                      className="border-border/80 bg-background focus:border-primary focus:ring-primary w-full resize-none rounded-lg border p-3 text-sm focus:ring-1 focus:outline-none"
                      rows={3}
                      placeholder="e.g., Finish my project..."
                      value={reflectionForm.nextGoal}
                      onChange={(e) =>
                        setReflectionForm({ ...reflectionForm, nextGoal: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Reflection'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
