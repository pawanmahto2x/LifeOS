'use client';

import React from 'react';
import { IHabit } from '@/types/habit.types';
import { Flame, Check, RotateCcw, Pause, Play, Edit2, Trash2, Clock, Trophy } from 'lucide-react';

interface HabitCardProps {
  habit: IHabit;
  onComplete: (habit: IHabit) => void;
  onSkip: (habit: IHabit) => void;
  onTogglePause: (habit: IHabit) => void;
  onEdit: (habit: IHabit) => void;
  onDelete: (habit: IHabit) => void;
}

function formatReminderTime(time24?: string): string {
  if (!time24) return '';
  const parts = time24.split(':');
  if (parts.length !== 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

function formatTargetDuration(days: number): string {
  if (days >= 365) return '1 Year (365d)';
  if (days >= 180) return '6 Months (180d)';
  if (days >= 90) return '3 Months (90d)';
  if (days >= 60) return '2 Months (60d)';
  if (days >= 30) return '1 Month (30d)';
  return `${days} days`;
}

export function HabitCard({
  habit,
  onComplete,
  onSkip,
  onTogglePause,
  onEdit,
  onDelete,
}: HabitCardProps) {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all duration-200 ${
        habit.isPaused
          ? 'border-border/60 bg-muted/20 opacity-70'
          : 'border-border/80 bg-card hover:border-primary/40 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Card Header: Title, Pause indicator, Actions */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-foreground truncate text-sm font-semibold tracking-tight">
                {habit.title}
              </h3>
              {habit.isPaused && (
                <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Paused
                </span>
              )}
            </div>

            {habit.description && (
              <p className="text-muted-foreground line-clamp-2 pt-0.5 text-xs">
                {habit.description}
              </p>
            )}

            <div className="text-muted-foreground flex flex-wrap items-center gap-2 pt-1 text-[10px]">
              <span className="border-border/80 bg-muted/60 text-foreground rounded-md border px-2 py-0.5 font-medium">
                {habit.frequency}
              </span>
              <span className="border-border/80 bg-muted/40 text-muted-foreground rounded-md border px-2 py-0.5 font-medium">
                Goal: {formatTargetDuration(habit.targetDays)}
              </span>
              {habit.reminderTime && (
                <span className="flex items-center space-x-1">
                  <Clock className="text-primary h-3 w-3" />
                  <span>{formatReminderTime(habit.reminderTime)}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onTogglePause(habit)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
              title={habit.isPaused ? 'Resume habit streak' : 'Pause habit (freezes streak)'}
            >
              {habit.isPaused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => onEdit(habit)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
              title="Edit habit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(habit)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg p-1.5 transition-colors"
              title="Delete habit"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Streak and Completion Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="border-border/80 bg-muted/30 rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                Streak
              </span>
              <Flame
                className={`h-4 w-4 ${
                  habit.currentStreak > 0
                    ? 'fill-amber-500/20 text-amber-500'
                    : 'text-muted-foreground'
                }`}
              />
            </div>
            <p className="text-foreground mt-1 text-xl font-bold tracking-tight">
              {habit.currentStreak}{' '}
              <span className="text-muted-foreground text-xs font-normal">
                {habit.frequency === 'Daily'
                  ? 'days'
                  : habit.frequency === 'Weekly'
                    ? 'weeks'
                    : 'months'}
              </span>
            </p>
          </div>

          <div className="border-border/80 bg-muted/30 rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                Best
              </span>
              <Trophy className="text-muted-foreground h-4 w-4" />
            </div>
            <p className="text-foreground mt-1 text-xl font-bold tracking-tight">
              {habit.longestStreak}{' '}
              <span className="text-muted-foreground text-xs font-normal">
                {habit.frequency === 'Daily'
                  ? 'days'
                  : habit.frequency === 'Weekly'
                    ? 'weeks'
                    : 'months'}
              </span>
            </p>
          </div>
        </div>

        {/* Completion Rate Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="text-muted-foreground flex justify-between text-[10px] font-medium">
            <span>Consistency Rate</span>
            <span className="text-foreground font-semibold">{habit.completionRate}%</span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, habit.completionRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Footer: Complete or Skip for today */}
      <div className="border-border/70 mt-6 flex items-center space-x-2 border-t pt-4">
        {habit.isCompletedToday ? (
          <button
            disabled
            className="inline-flex flex-1 cursor-default items-center justify-center space-x-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-600 shadow-xs dark:text-emerald-400"
          >
            <Check className="h-3.5 w-3.5" />
            <span>
              {habit.frequency === 'Weekly'
                ? 'Completed This Week'
                : habit.frequency === 'Monthly'
                  ? 'Completed This Month'
                  : 'Completed Today'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onComplete(habit)}
            disabled={habit.isPaused}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex flex-1 cursor-pointer items-center justify-center space-x-1.5 rounded-xl py-2 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Complete</span>
          </button>
        )}

        <button
          onClick={() => onSkip(habit)}
          disabled={habit.isPaused || habit.isCompletedToday}
          className="border-border/80 bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center justify-center rounded-xl border p-2 transition-colors disabled:opacity-40"
          title={habit.isCompletedToday ? 'Already completed' : 'Skip today'}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
