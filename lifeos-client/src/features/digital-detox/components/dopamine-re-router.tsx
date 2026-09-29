'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApiService } from '@/features/tasks/services/task.service';
import { healthApiService } from '@/features/health/services/health.service';
import { Zap, Droplets, Shield, ArrowRight } from 'lucide-react';

interface MindfulReplacementsProps {
  onActivityCompleted?: () => void;
}

export function DopamineReRouter({ onActivityCompleted }: MindfulReplacementsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Monk mode fast state in localStorage
  const [isMonkActive, setIsMonkActive] = useState<boolean>(false);
  const [monkStartedAt, setMonkStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos_monk_mode');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setIsMonkActive(parsed.active);
          setMonkStartedAt(parsed.startedAt);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const toggleMonkMode = () => {
    const nextState = !isMonkActive;
    setIsMonkActive(nextState);
    const started = nextState ? Date.now() : null;
    setMonkStartedAt(started);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'lifeos_monk_mode',
        JSON.stringify({ active: nextState, startedAt: started }),
      );
    }
  };

  // 1. Fetch Top Pending Task
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'detox-priority'],
    queryFn: async () => {
      const res = await taskApiService.getTasks({ status: 'Pending', limit: 3 });
      return res.data;
    },
  });

  // 2. Fetch Real Hydration
  const { data: healthData } = useQuery({
    queryKey: ['health', 'summary'],
    queryFn: async () => {
      const res = await healthApiService.getSummary();
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

  const topTask = tasksData?.tasks?.[0];
  const waterLogged = healthData?.water?.todayTotalMl || 0;
  const waterGoal = healthData?.water?.dailyGoalMl || 2500;

  const hoursElapsed = monkStartedAt
    ? Math.floor((Date.now() - monkStartedAt) / (1000 * 60 * 60))
    : 0;
  const hoursLeft = Math.max(0, 24 - hoursElapsed);

  return (
    <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-foreground text-sm font-bold">Mindful Replacements</h3>
        <p className="text-muted-foreground text-xs">
          Instead of scrolling, pick a productive action.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {/* Card 1: Top Task */}
        <div className="bg-muted/30 border-border/70 flex flex-col justify-between rounded-xl border p-4">
          <div>
            <div className="text-primary mb-1 flex items-center gap-1.5 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5" />
              <span>Next Task</span>
            </div>
            <p className="text-foreground truncate text-sm font-semibold">
              {topTask ? topTask.title : 'No pending tasks'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/focus')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors"
          >
            <span>Start Focus</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Card 2: Hydration */}
        <div className="bg-muted/30 border-border/70 flex flex-col justify-between rounded-xl border p-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-sky-500">
              <Droplets className="h-3.5 w-3.5" />
              <span>Hydration</span>
            </div>
            <p className="text-foreground text-sm font-semibold">
              {waterLogged} / {waterGoal} ml
            </p>
          </div>

          <button
            type="button"
            disabled={waterMutation.isPending}
            onClick={() => waterMutation.mutate(250)}
            className="mt-3 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-sky-500 py-1.5 text-xs font-bold text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
          >
            <Droplets className="h-3 w-3" />
            <span>+250ml Water</span>
          </button>
        </div>

        {/* Card 3: 24h Monk Fast */}
        <div className="bg-muted/30 border-border/70 flex flex-col justify-between rounded-xl border p-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-500">
              <Shield className="h-3.5 w-3.5" />
              <span>24h Monk Mode Fast</span>
            </div>
            <p className="text-foreground text-sm font-semibold">
              {isMonkActive ? `${hoursLeft}h remaining` : 'Full day zero-screen detox'}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleMonkMode}
            className={`mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg py-1.5 text-xs font-bold transition-colors ${
              isMonkActive
                ? 'border-destructive/30 text-destructive hover:bg-destructive/10 border'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isMonkActive ? 'End Fast Early' : 'Start 24h Fast'}
          </button>
        </div>
      </div>
    </div>
  );
}
