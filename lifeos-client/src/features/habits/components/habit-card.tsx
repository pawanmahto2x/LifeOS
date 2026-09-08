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
      className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
        habit.isPaused
          ? 'border-neutral-800 bg-neutral-900/20 opacity-70'
          : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/70'
      }`}
    >
      <div>
        {/* Card Header: Title, Pause indicator, Actions */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="truncate text-sm font-semibold tracking-tight text-white">
                {habit.title}
              </h3>
              {habit.isPaused && (
                <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400">
                  Paused
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-neutral-400">
              <span className="rounded border border-neutral-800 bg-neutral-800/80 px-2 py-0.5 font-medium text-neutral-300">
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
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
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
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              title="Edit habit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(habit)}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-950/40 hover:text-red-400"
              title="Delete habit"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Streak and Completion Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase">Streak</span>
              <Flame
                className={`h-4 w-4 ${
                  habit.currentStreak > 0 ? 'fill-amber-500/20 text-amber-500' : 'text-neutral-600'
                }`}
              />
            </div>
            <p className="mt-1 text-xl font-bold text-white">
              {habit.currentStreak}{' '}
              <span className="text-xs font-normal text-neutral-400">days</span>
            </p>
          </div>

          <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase">Best</span>
              <Trophy className="h-4 w-4 text-neutral-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-white">
              {habit.longestStreak}{' '}
              <span className="text-xs font-normal text-neutral-400">days</span>
            </p>
          </div>
        </div>

        {/* Completion Rate Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[10px] font-medium text-neutral-400">
            <span>Historical Rate</span>
            <span className="font-semibold text-white">{habit.completionRate}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, habit.completionRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Footer: Complete or Skip for today */}
      <div className="mt-6 flex items-center space-x-2 border-t border-neutral-800/60 pt-4">
        <button
          onClick={() => onComplete(habit)}
          disabled={habit.isPaused}
          className="inline-flex flex-1 items-center justify-center space-x-1.5 rounded-lg bg-white py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Complete</span>
        </button>

        <button
          onClick={() => onSkip(habit)}
          disabled={habit.isPaused}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/60 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white disabled:opacity-40"
          title="Skip today"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
