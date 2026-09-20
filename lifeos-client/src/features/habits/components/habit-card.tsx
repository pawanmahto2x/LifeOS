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
                <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                  Paused
                </span>
              )}
            </div>
            <div className="text-muted-foreground flex items-center space-x-2 text-[10px]">
              <span className="border-border/80 bg-muted/60 text-foreground rounded-md border px-2 py-0.5 font-medium">
                {habit.frequency}
              </span>
              {habit.reminderTime && (
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{habit.reminderTime}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onTogglePause(habit)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
              title={habit.isPaused ? 'Resume habit' : 'Pause habit'}
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
              <span className="text-muted-foreground text-xs font-normal">days</span>
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
              <span className="text-muted-foreground text-xs font-normal">days</span>
            </p>
          </div>
        </div>

        {/* Completion Rate Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="text-muted-foreground flex justify-between text-[10px] font-medium">
            <span>Historical Rate</span>
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
        <button
          onClick={() => onComplete(habit)}
          disabled={habit.isPaused}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex flex-1 cursor-pointer items-center justify-center space-x-1.5 rounded-xl py-2 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Complete</span>
        </button>

        <button
          onClick={() => onSkip(habit)}
          disabled={habit.isPaused}
          className="border-border/80 bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center justify-center rounded-xl border p-2 transition-colors disabled:opacity-40"
          title="Skip today"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
