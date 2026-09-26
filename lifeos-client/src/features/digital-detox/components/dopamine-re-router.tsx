'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApiService } from '@/features/tasks/services/task.service';
import { healthApiService } from '@/features/health/services/health.service';
import { habitApiService } from '@/features/habits/services/habit.service';
import {
  Compass,
  Zap,
  Droplets,
  CheckCircle,
  ArrowRight,
  Footprints,
  Eye,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';

interface DopamineReRouterProps {
  todayScreenTimeMinutes?: number;
  dailyGoalMinutes?: number;
  onActivityCompleted?: () => void;
}

export function DopamineReRouter({ onActivityCompleted }: DopamineReRouterProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Micro-reset interactive modal state
  const [activeResetType, setActiveResetType] = useState<'walk' | 'eye' | 'nap' | null>(null);
  const [resetTimerSeconds, setResetTimerSeconds] = useState<number>(0);
  const [isResetRunning, setIsResetRunning] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // 1. Fetch Top Pending Task
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'detox-priority'],
    queryFn: async () => {
      const res = await taskApiService.getTasks({ status: 'Pending', limit: 5 });
      return res.data;
    },
  });

  // 2. Fetch Health Summary (Water)
  const { data: healthData } = useQuery({
    queryKey: ['health', 'summary'],
    queryFn: async () => {
      const res = await healthApiService.getSummary();
      return res.data;
    },
  });

  // 3. Fetch Habits
  const { data: habitsData, isLoading: isHabitsLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await habitApiService.getHabits({ limit: 10 });
      return res.data;
    },
  });

  // Water Log Mutation
  const waterMutation = useMutation({
    mutationFn: (amount: number) => healthApiService.logWater({ amount, unit: 'ml' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
      if (onActivityCompleted) onActivityCompleted();
    },
  });

  // Complete Habit Mutation
  const completeHabitMutation = useMutation({
    mutationFn: (habitId: string) => habitApiService.completeHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      if (onActivityCompleted) onActivityCompleted();
    },
  });

  // Active Micro-reset timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResetRunning && resetTimerSeconds > 0) {
      interval = setInterval(() => {
        setResetTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsResetRunning(false);
            setResetSuccessMessage('Reset completed! Your dopamine and focus have been recharged.');
            if (onActivityCompleted) onActivityCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResetRunning, resetTimerSeconds, onActivityCompleted]);

  const handleStartMicroReset = (type: 'walk' | 'eye' | 'nap') => {
    setActiveResetType(type);
    setResetSuccessMessage(null);
    if (type === 'eye') {
      setResetTimerSeconds(20); // 20-20-20 rule: 20 seconds
      setIsResetRunning(true);
    } else if (type === 'walk') {
      setResetTimerSeconds(600); // 10 minutes
      setIsResetRunning(true);
    } else if (type === 'nap') {
      setResetTimerSeconds(900); // 15 minutes
      setIsResetRunning(true);
    }
  };

  const topTask = tasksData?.tasks?.[0];
  const waterLogged = healthData?.water?.todayTotalMl || 0;
  const waterGoal = healthData?.water?.dailyGoalMl || 2500;
  const pendingHabit = habitsData?.habits?.find((h) => !h.isCompletedToday);

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-base font-bold">Productive Time Replacements</h3>
            <p className="text-muted-foreground text-xs">
              When you feel like scrolling, pick a high-value action to move your life forward.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Action Pillars */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Pillar 1: Career */}
        <div className="bg-muted/30 border-border/60 hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 transition-all">
          <div>
            <div className="text-primary mb-2 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Next Priority Task
              </span>
              <span className="text-muted-foreground text-[10px]">Career</span>
            </div>

            {topTask ? (
              <div>
                <p className="text-foreground line-clamp-1 text-sm font-semibold">
                  {topTask.title}
                </p>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                  {topTask.description || 'Priority task waiting in your LifeOS backlog.'}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                {isTasksLoading
                  ? 'Checking tasks...'
                  : 'All tasks cleared! Great job staying ahead.'}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push('/focus')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-colors"
          >
            <span>Start 25m Focus Block</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Pillar 2: Water */}
        <div className="bg-muted/30 border-border/60 flex flex-col justify-between rounded-2xl border p-5 transition-all hover:border-sky-500/40">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-sky-500">
              <span className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5" />
                Physical Hydration
              </span>
              <span className="text-muted-foreground text-[10px]">Health</span>
            </div>

            <p className="text-foreground text-sm font-semibold">
              {waterLogged} / {waterGoal} ml today
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Dehydration often tricks your brain into feeling restless and bored. Drink a glass to
              reset.
            </p>
          </div>

          <button
            type="button"
            disabled={waterMutation.isPending}
            onClick={() => waterMutation.mutate(250)}
            className="mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>+250ml Drink Water</span>
          </button>
        </div>

        {/* Pillar 3: Habit */}
        <div className="bg-muted/30 border-border/60 flex flex-col justify-between rounded-2xl border p-5 transition-all hover:border-emerald-500/40">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-emerald-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Daily Habit Streak
              </span>
              <span className="text-muted-foreground text-[10px]">Discipline</span>
            </div>

            {pendingHabit ? (
              <div>
                <p className="text-foreground line-clamp-1 text-sm font-semibold">
                  {pendingHabit.title}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Streak:{' '}
                  <span className="font-bold text-emerald-500">
                    {pendingHabit.currentStreak || 1} days
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                {isHabitsLoading
                  ? 'Checking habits...'
                  : 'All habits completed today! Superb consistency.'}
              </p>
            )}
          </div>

          {pendingHabit ? (
            <button
              type="button"
              disabled={completeHabitMutation.isPending}
              onClick={() => completeHabitMutation.mutate(pendingHabit._id)}
              className="mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Mark Done &amp; Protect Streak</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/habits')}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-colors"
            >
              <span>View Habits</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Quick-Reset Activities */}
      <div className="border-border/60 mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs">
        <span className="text-muted-foreground text-[11px] font-medium">
          Quick Physical Interventions (Click to start):
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleStartMicroReset('eye')}
            className="bg-muted/50 hover:bg-muted text-foreground border-border/60 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-sky-500" />
            <span>20-20-20 Eye Rest</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartMicroReset('walk')}
            className="bg-muted/50 hover:bg-muted text-foreground border-border/60 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Footprints className="h-3.5 w-3.5 text-emerald-500" />
            <span>10m Sunlight Walk</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartMicroReset('nap')}
            className="bg-muted/50 hover:bg-muted text-foreground border-border/60 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>15m Power Nap</span>
          </button>
        </div>
      </div>

      {/* Interactive Micro-Reset Timer Modal */}
      {activeResetType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="border-border bg-card relative w-full max-w-sm rounded-3xl border p-6 text-center shadow-xl">
            <button
              onClick={() => setActiveResetType(null)}
              className="text-muted-foreground hover:text-foreground absolute top-4 right-4 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            {resetSuccessMessage ? (
              <div className="py-4">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
                <h4 className="text-foreground text-lg font-bold">Activity Completed!</h4>
                <p className="text-muted-foreground mt-1 text-xs">{resetSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => setActiveResetType(null)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 mt-5 w-full rounded-xl py-2 text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h4 className="text-foreground text-lg font-bold">
                  {activeResetType === 'eye' && '👁️ 20-20-20 Eye Rest'}
                  {activeResetType === 'walk' && '🚶 10-Minute Walk'}
                  {activeResetType === 'nap' && '💤 15-Minute Power Nap'}
                </h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  {activeResetType === 'eye' &&
                    'Look at an object at least 20 feet away to relax your optic nerves.'}
                  {activeResetType === 'walk' &&
                    'Step away from your desk into natural sunlight to reset dopamine.'}
                  {activeResetType === 'nap' &&
                    'Close your eyes and let your conscious mind reboot.'}
                </p>

                <div className="text-primary my-6 text-4xl font-extrabold tracking-tight">
                  {Math.floor(resetTimerSeconds / 60)}:
                  {String(resetTimerSeconds % 60).padStart(2, '0')}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetRunning(false);
                      setResetSuccessMessage('Great job taking intentional rest!');
                      if (onActivityCompleted) onActivityCompleted();
                    }}
                    className="flex-1 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600"
                  >
                    I Completed It
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveResetType(null)}
                    className="border-border text-muted-foreground hover:bg-muted flex-1 rounded-xl border py-2 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
