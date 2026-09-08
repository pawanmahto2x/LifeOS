'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { digitalDetoxApiService } from '@/features/digital-detox/services/digital-detox.service';
import { DetoxGoalCard } from '@/features/digital-detox/components/detox-goal-card';
import { AppLimitsManager } from '@/features/digital-detox/components/app-limits-manager';
import { OpportunityCostCards } from '@/features/digital-detox/components/opportunity-cost-cards';
import { LogScreenTimeDialog } from '@/features/digital-detox/components/log-screen-time-dialog';
import { ILogScreenTimePayload } from '@/types/digital-detox.types';
import { Smartphone, PlusCircle, RefreshCw } from 'lucide-react';

export default function DigitalDetoxPage() {
  const queryClient = useQueryClient();
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

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
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Digital Detox</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Tame screen addiction, set hard app boundaries, and convert recovered time into deep
            work.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Log Screen Time
          </button>
        </div>
      </div>

      {/* Main Screen Time Goal Card */}
      <DetoxGoalCard usageSummary={usageData} isLoading={isUsageLoading} />

      {/* Opportunity Cost Cards */}
      <OpportunityCostCards data={opportunityCostData} isLoading={isCostLoading} />

      {/* App Limits Section */}
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
    </div>
  );
}
