'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { digitalDetoxApiService } from '@/features/digital-detox/services/digital-detox.service';
import { healthApiService } from '@/features/health/services/health.service';
import { focusApiService } from '@/features/focus/services/focus.service';
import { DetoxGoalCard } from '@/features/digital-detox/components/detox-goal-card';
import { AppLimitsManager } from '@/features/digital-detox/components/app-limits-manager';
import { OpportunityCostCards } from '@/features/digital-detox/components/opportunity-cost-cards';
import { LogScreenTimeDialog } from '@/features/digital-detox/components/log-screen-time-dialog';
import { LifeClockCard } from '@/features/digital-detox/components/life-clock-card';
import { DopamineIndexCard } from '@/features/digital-detox/components/dopamine-index-card';
import { UrgeSurferModal } from '@/features/digital-detox/components/urge-surfer-modal';
import { DopamineReRouter } from '@/features/digital-detox/components/dopamine-re-router';
import { DetoxProtocols } from '@/features/digital-detox/components/detox-protocols';
import { ILogScreenTimePayload } from '@/types/digital-detox.types';
import { Smartphone, PlusCircle, RefreshCw, Waves } from 'lucide-react';

export default function DigitalDetoxPage() {
  const queryClient = useQueryClient();
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [isUrgeModalOpen, setIsUrgeModalOpen] = useState(false);
  const [urgesConquered, setUrgesConquered] = useState(3);

  // Load and persist urges conquered count
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

  // Queries
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

  const { data: opportunityCostData, isLoading: isCostLoading } = useQuery({
    queryKey: ['digital-detox-opportunity-cost'],
    queryFn: async () => {
      const res = await digitalDetoxApiService.getOpportunityCost();
      return res.data;
    },
  });

  const { data: healthData } = useQuery({
    queryKey: ['health', 'detox-summary'],
    queryFn: async () => {
      const res = await healthApiService.getSummary();
      return res.data;
    },
  });

  const { data: focusSessionsData } = useQuery({
    queryKey: ['focus', 'detox-today'],
    queryFn: async () => {
      const res = await focusApiService.getSessions({ limit: 10 });
      return res.data;
    },
  });

  // Calculate today focus minutes
  const todayFocusMinutes =
    focusSessionsData?.sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 25;

  const appLimitsExceededCount = usageData?.appUsage?.filter((a) => a.isLimitExceeded).length || 0;

  const logScreenTimeMutation = useMutation({
    mutationFn: (payload: ILogScreenTimePayload) => digitalDetoxApiService.logScreenTime(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-detox-usage'] });
      queryClient.invalidateQueries({ queryKey: ['digital-detox-opportunity-cost'] });
      setIsLogDialogOpen(false);
    },
  });

  const handleLogScreenTime = (payload: ILogScreenTimePayload) => {
    logScreenTimeMutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <Smartphone className="h-5 w-5" />
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Digital Detox &amp; Dopamine Reset
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Break algorithmic dopamine loops, surf cravings, and redirect your life energy into deep
            mastery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Urge Surfer Emergency Button */}
          <button
            type="button"
            onClick={() => setIsUrgeModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-500 shadow-xs transition-all hover:bg-cyan-500/20"
          >
            <Waves className="h-4 w-4 animate-pulse" />
            <span>🌊 Craving Scrolling? (Ride Urge)</span>
          </button>

          <button
            type="button"
            onClick={() => refetchUsage()}
            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setIsLogDialogOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Log Screen Time
          </button>
        </div>
      </div>

      {/* 1. Neuro-Clarity Baseline: Dopamine Sensitivity Index */}
      <DopamineIndexCard
        todayScreenTimeMinutes={usageData?.todayTotalMinutes || 0}
        dailyGoalMinutes={usageData?.goalMinutes || 120}
        focusMinutesToday={todayFocusMinutes}
        waterIntakeMl={healthData?.water?.todayTotalMl || 1250}
        appLimitsExceededCount={appLimitsExceededCount}
        urgesConquered={urgesConquered}
      />

      {/* 2. Existential Reality Check: The Life Clock Card */}
      <LifeClockCard
        todayScreenTimeMinutes={usageData?.todayTotalMinutes || 180}
        dailyGoalMinutes={usageData?.goalMinutes || 120}
      />

      {/* 3. Active Intervention: Smart Dopamine Replacement Hub */}
      <DopamineReRouter
        todayScreenTimeMinutes={usageData?.todayTotalMinutes || 0}
        dailyGoalMinutes={usageData?.goalMinutes || 120}
      />

      {/* 4. Structured Challenges: 24h Monk Mode & Protocols */}
      <DetoxProtocols />

      {/* 5. Daily Screen Time Budget Dial */}
      <DetoxGoalCard usageSummary={usageData} isLoading={isUsageLoading} />

      {/* 6. Opportunity Cost Engine */}
      <OpportunityCostCards data={opportunityCostData} isLoading={isCostLoading} />

      {/* 7. Granular App Limits Section */}
      <div className="grid grid-cols-1 gap-6">
        <AppLimitsManager
          appLimits={usageData?.settings?.appLimits}
          appUsage={usageData?.appUsage}
          isLoading={isUsageLoading}
        />
      </div>

      {/* Modal Dialog for Logging Screen Time */}
      <LogScreenTimeDialog
        isOpen={isLogDialogOpen}
        onClose={() => setIsLogDialogOpen(false)}
        onLog={handleLogScreenTime}
        appLimits={usageData?.settings?.appLimits}
        isLogging={logScreenTimeMutation.isPending}
      />

      {/* Urge Surfer 90-Second Guided Wave Modal */}
      <UrgeSurferModal
        isOpen={isUrgeModalOpen}
        onClose={() => setIsUrgeModalOpen(false)}
        onComplete={handleUrgeSurferComplete}
      />
    </div>
  );
}
