'use client';

import React from 'react';
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
  Clock,
  Sparkles,
  ArrowRight,
  Footprints,
  Eye,
} from 'lucide-react';

interface DopamineReRouterProps {
  todayScreenTimeMinutes?: number;
  dailyGoalMinutes?: number;
  onQuickLogScreenTime?: (minutes: number) => void;
}

export function DopamineReRouter({
  todayScreenTimeMinutes = 45,
  dailyGoalMinutes = 120,
}: DopamineReRouterProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Fetch Top Pending Task
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'detox-priority'],
    queryFn: async () => {
      const res = await taskApiService.getTasks({ status: 'Pending', limit: 5 });
      return res.data;
    },
  });

  // 2. Fetch Health Summary (Water)
  const { data: healthData, isLoading: isHealthLoading } = useQuery({
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
    },
  });

  // Complete Habit Mutation
  const completeHabitMutation = useMutation({
    mutationFn: (habitId: string) => habitApiService.completeHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // Calculations
  const topTask = tasksData?.tasks?.[0];
  const waterLogged = healthData?.water?.todayTotalMl || 0;
  const waterGoal = healthData?.water?.dailyGoalMl || 2500;
  const isHydrationLow = waterLogged < waterGoal * 0.6;

  const pendingHabit = habitsData?.habits?.find((h) => !h.isCompletedToday);

  // Earned screen time: 10m per 25m focus
  // For display, assume ~30m focus today or derived
  const earnedMinutes = 30; // base or focus-derived
  const deficitMinutes = Math.max(0, todayScreenTimeMinutes - earnedMinutes);

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-base font-bold">
                Smart Dopamine Replacement Hub
              </h3>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-500">
                Active Intervention
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Do not leave a vacuum. Replace mindless scrolling with high-leverage life momentum.
            </p>
          </div>
        </div>

        {/* Earned Screen Time Badge */}
        <div className="bg-muted/40 border-border/60 flex items-center gap-3 rounded-2xl border px-3 py-1.5 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-indigo-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Earned Leisure: {earnedMinutes}m</span>
          </div>
          <span className="text-muted-foreground text-[11px]">
            {deficitMinutes > 0 ? (
              <span className="text-destructive font-bold">({deficitMinutes}m in deficit)</span>
            ) : (
              <span className="font-bold text-emerald-500">(In surplus)</span>
            )}
          </span>
        </div>
      </div>

      {/* 3 Action Pillars */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Pillar 1: Career / Deep Work */}
        <div className="bg-muted/30 border-border/60 hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-4.5 transition-all">
          <div>
            <div className="text-primary mb-2 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Career Momentum
              </span>
              <span className="text-muted-foreground text-[10px]">High Impact</span>
            </div>

            {topTask ? (
              <div>
                <p className="text-foreground line-clamp-1 text-sm font-semibold">
                  {topTask.title}
                </p>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                  {topTask.description || 'Priority task waiting in your queue.'}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                {isTasksLoading
                  ? 'Scanning tasks...'
                  : 'All tasks cleared! Perfect time for creative study.'}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push('/focus')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-colors"
          >
            <span>Launch 25m Focus Block</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Pillar 2: Physiology & Brain Energy */}
        <div className="bg-muted/30 border-border/60 flex flex-col justify-between rounded-2xl border p-4.5 transition-all hover:border-sky-500/40">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-sky-500">
              <span className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5" />
                Brain Hydration
              </span>
              <span className="text-muted-foreground text-[10px]">Energy Fuel</span>
            </div>

            <p className="text-foreground text-sm font-semibold">
              {waterLogged} / {waterGoal} ml
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {isHydrationLow
                ? 'Mild dehydration mimics boredom and craving. Rehydrate now to clear brain fog.'
                : 'Hydration well maintained! Recharging cellular energy.'}
            </p>
          </div>

          <button
            type="button"
            disabled={waterMutation.isPending}
            onClick={() => waterMutation.mutate(250)}
            className="mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>+250ml Drink Water Now</span>
          </button>
        </div>

        {/* Pillar 3: Micro Habit Consistency */}
        <div className="bg-muted/30 border-border/60 flex flex-col justify-between rounded-2xl border p-4.5 transition-all hover:border-emerald-500/40">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-emerald-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Daily Discipline
              </span>
              <span className="text-muted-foreground text-[10px]">Streak Guard</span>
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
                  . Keep the momentum going!
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                {isHabitsLoading
                  ? 'Checking habits...'
                  : 'All daily habits completed! Fantastic discipline.'}
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
              <span>Complete Habit &amp; Protect Streak</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/habits')}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-colors"
            >
              <span>Manage Habits</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick 5-Minute Physical Interventions */}
      <div className="border-border/60 mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs">
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
          <Sparkles className="h-3 w-3 text-amber-500" />
          5-Minute Sensory Reset Protocols:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-muted/60 text-muted-foreground flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px]">
            <Footprints className="h-3 w-3 text-emerald-500" />
            10m Sunlight Walk
          </span>
          <span className="bg-muted/60 text-muted-foreground flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px]">
            <Eye className="h-3 w-3 text-sky-500" />
            20-20-20 Eye Rest
          </span>
          <span className="bg-muted/60 text-muted-foreground flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px]">
            <Clock className="h-3 w-3 text-amber-500" />
            15m Power Nap
          </span>
        </div>
      </div>
    </div>
  );
}
