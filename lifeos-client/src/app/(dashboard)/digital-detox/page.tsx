'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { digitalDetoxApiService } from '@/features/digital-detox/services/digital-detox.service';
import { healthApiService } from '@/features/health/services/health.service';
import { focusApiService } from '@/features/focus/services/focus.service';
import { habitApiService } from '@/features/habits/services/habit.service';
import { DetoxGoalCard } from '@/features/digital-detox/components/detox-goal-card';
import { AppLimitsManager } from '@/features/digital-detox/components/app-limits-manager';
import { OpportunityCostCards } from '@/features/digital-detox/components/opportunity-cost-cards';
import { LifeClockCard } from '@/features/digital-detox/components/life-clock-card';
import { DopamineIndexCard } from '@/features/digital-detox/components/dopamine-index-card';
import { UrgeSurferModal } from '@/features/digital-detox/components/urge-surfer-modal';
import { DopamineReRouter } from '@/features/digital-detox/components/dopamine-re-router';
import { DetoxProtocols } from '@/features/digital-detox/components/detox-protocols';
import { Smartphone, RefreshCw, Waves } from 'lucide-react';

export default function DigitalDetoxPage() {
  const queryClient = useQueryClient();
  const [isUrgeModalOpen, setIsUrgeModalOpen] = useState(false);
  const [urgesConquered, setUrgesConquered] = useState(0);

  // Load and persist urges conquered count from real local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos_urges_conquered');
      if (saved) {
        setUrgesConquered(Number(saved) || 0);
      }
    }
  }, []);

  const handleUrgeSurferComplete = () => {
    setUrgesConquered((prev) => {
      const next = prev + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('lifeos_urges_conquered', String(next));
      }
      return next;
    });
  };

  // 1. Digital Detox Usage Data
  const {
    data: usageData,
    isLoading: isUsageLoading,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ['digital-detox-usage'],
    queryFn: async () => {
      const res = await digitalDetoxApiService.getUsage();
      return res.data;
    },
  });

  // 2. Opportunity Cost Data
  const { data: opportunityCostData, isLoading: isCostLoading } = useQuery({
    queryKey: ['digital-detox-opportunity-cost'],
    queryFn: async () => {
      const res = await digitalDetoxApiService.getOpportunityCost();
      return res.data;
    },
  });

  // 3. Real Health Data (Water)
  const { data: healthData } = useQuery({
    queryKey: ['health', 'detox-summary'],
    queryFn: async () => {
      const res = await healthApiService.getSummary();
      return res.data;
    },
  });

  // 4. Real Focus Sessions Today
  const { data: focusSessionsData } = useQuery({
    queryKey: ['focus', 'detox-today'],
    queryFn: async () => {
      const res = await focusApiService.getSessions({ limit: 20 });
      return res.data;
    },
  });

  // 5. Real Habits Data
  const { data: habitsData } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await habitApiService.getHabits({ limit: 20 });
      return res.data;
    },
  });

  // Calculate genuine metrics without mock fallbacks
  const todayFocusMinutes = focusSessionsData?.analytics?.todayFocusMinutes || 0;
  const realWaterIntake = healthData?.water?.todayTotalMl || 0;
  const completedHabitsCount = habitsData?.habits?.filter((h) => h.isCompletedToday).length || 0;

  const appLimitsExceededCount = usageData?.appUsage?.filter((a) => a.isLimitExceeded).length || 0;

  const handleRefreshAll = () => {
    refetchUsage();
    queryClient.invalidateQueries({ queryKey: ['digital-detox-opportunity-cost'] });
    queryClient.invalidateQueries({ queryKey: ['health'] });
    queryClient.invalidateQueries({ queryKey: ['focus'] });
    queryClient.invalidateQueries({ queryKey: ['habits'] });
  };

  return (
    <div className="animate-in fade-in space-y-7 duration-300">
      {/* Clean, Serene Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Smartphone className="h-5 w-5" />
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Digital Detox &amp; Dopamine Balance
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Cultivate calm attention, set healthy screen boundaries, and reclaim your time for what
            matters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Calming 90s Urge Surfer Button */}
          <button
            type="button"
            onClick={() => setIsUrgeModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-600 shadow-2xs transition-colors hover:bg-cyan-500/20 dark:text-cyan-400"
          >
            <Waves className="h-4 w-4" />
            <span>Take a 90s Breathing Pause</span>
          </button>

          <button
            type="button"
            onClick={handleRefreshAll}
            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 1. Neuro-Clarity Baseline: Honest Real Dopamine & Focus Balance */}
      <DopamineIndexCard
        todayScreenTimeMinutes={usageData?.todayTotalMinutes || 0}
        dailyGoalMinutes={usageData?.goalMinutes || 120}
        focusMinutesToday={todayFocusMinutes}
        waterIntakeMl={realWaterIntake}
        completedHabitsCount={completedHabitsCount}
        urgesConquered={urgesConquered}
        appLimitsExceededCount={appLimitsExceededCount}
      />

      {/* 2. Inspiring Time Perspective Card (Replaced scary life clock & fake money) */}
      <LifeClockCard
        todayScreenTimeMinutes={usageData?.todayTotalMinutes || 0}
        dailyGoalMinutes={usageData?.goalMinutes || 120}
      />

      {/* 3. Productive Time Replacements (Top task, water, habits + interactive micro-resets) */}
      <DopamineReRouter
        todayScreenTimeMinutes={usageData?.todayTotalMinutes || 0}
        dailyGoalMinutes={usageData?.goalMinutes || 120}
        onActivityCompleted={handleRefreshAll}
      />

      {/* 4. Compact, Sleek Detox Challenges Strip */}
      <DetoxProtocols />

      {/* 5. Daily Screen Time Boundary Display */}
      <DetoxGoalCard usageSummary={usageData} isLoading={isUsageLoading} />

      {/* 6. Opportunity Cost Engine (Simple Preserved Time ROI) */}
      <OpportunityCostCards data={opportunityCostData} isLoading={isCostLoading} />

      {/* 7. App Boundaries & Enforced Limits */}
      <div className="grid grid-cols-1 gap-6">
        <AppLimitsManager
          appLimits={usageData?.settings?.appLimits}
          appUsage={usageData?.appUsage}
          isLoading={isUsageLoading}
        />
      </div>

      {/* Urge Surfer 90-Second Guided Wave Modal */}
      <UrgeSurferModal
        isOpen={isUrgeModalOpen}
        onClose={() => setIsUrgeModalOpen(false)}
        onComplete={handleUrgeSurferComplete}
      />
    </div>
  );
}
