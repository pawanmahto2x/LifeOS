'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { digitalDetoxApiService } from '@/features/digital-detox/services/digital-detox.service';
import { DetoxGoalCard } from '@/features/digital-detox/components/detox-goal-card';
import { AppLimitsManager } from '@/features/digital-detox/components/app-limits-manager';
import { DopamineReRouter } from '@/features/digital-detox/components/dopamine-re-router';
import { UrgeSurferModal } from '@/features/digital-detox/components/urge-surfer-modal';
import { Smartphone, RefreshCw, Waves, Sparkles } from 'lucide-react';

export default function DigitalDetoxPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'limits' | 'detox'>('limits');
  const [isUrgeModalOpen, setIsUrgeModalOpen] = useState(false);

  // Fetch Usage & Boundaries Data
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

  const handleRefresh = () => {
    refetchUsage();
    queryClient.invalidateQueries({ queryKey: ['health'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  return (
    <div className="animate-in fade-in max-w-5xl space-y-6 duration-300">
      {/* Clean, Simple Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Digital Detox & Limits
            </h1>
            <p className="text-muted-foreground text-xs">
              Set healthy daily boundaries on distracting apps and practice mindful dopamine
              fasting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 1-Minute Calming Breathing Pause */}
          <button
            type="button"
            onClick={() => setIsUrgeModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-500/20 dark:text-cyan-400"
          >
            <Waves className="h-4 w-4" />
            <span>1-Min Pause</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Clean Tab Switcher: Screen Time & Limits vs. Mindful Detox */}
      <div className="bg-muted/40 border-border/60 inline-flex items-center rounded-2xl border p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('limits')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'limits'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground cursor-pointer'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>Screen Time & Limits</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('detox')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'detox'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground cursor-pointer'
          }`}
        >
          <Sparkles className="h-4 w-4 text-cyan-500" />
          <span>Mindful Detox & Fasting</span>
        </button>
      </div>

      {/* Tab 1: Screen Time & App Limits */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <DetoxGoalCard usageSummary={usageData} isLoading={isUsageLoading} />
          <AppLimitsManager
            appLimits={usageData?.settings?.appLimits}
            appUsage={usageData?.appUsage}
            isLoading={isUsageLoading}
          />
        </div>
      )}

      {/* Tab 2: Digital Detox & Mindful Fasting */}
      {activeTab === 'detox' && (
        <div className="space-y-6">
          <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                  <Waves className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-foreground text-base font-bold">1-Minute Breathing Pause</h2>
                  <p className="text-muted-foreground text-xs">
                    Ride out subconscious scrolling cravings with a guided 60-second breathing wave.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUrgeModalOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-cyan-600"
              >
                <Waves className="h-4 w-4" />
                <span>Start 1-Min Pause</span>
              </button>
            </div>
          </div>

          <DopamineReRouter onActivityCompleted={handleRefresh} />
        </div>
      )}

      {/* 1-Minute Calming Breathing Modal */}
      <UrgeSurferModal
        isOpen={isUrgeModalOpen}
        onClose={() => setIsUrgeModalOpen(false)}
        onComplete={() => setIsUrgeModalOpen(false)}
      />
    </div>
  );
}
