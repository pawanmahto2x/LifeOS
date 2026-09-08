'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyModeApiService } from '@/features/emergency-mode/services/emergency-mode.service';
import { EmergencyToggleCard } from '@/features/emergency-mode/components/emergency-toggle-card';
import { EmergencyActiveBanner } from '@/features/emergency-mode/components/emergency-active-banner';
import { EmergencyProtocolsCard } from '@/features/emergency-mode/components/emergency-protocols-card';
import { DeescalateModal } from '@/features/emergency-mode/components/deescalate-modal';
import { AlertTriangle } from 'lucide-react';

export default function EmergencyPage() {
  const queryClient = useQueryClient();
  const [isDeescalateOpen, setIsDeescalateOpen] = useState(false);

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['emergency-mode-status'],
    queryFn: async () => {
      const res = await emergencyModeApiService.getStatus();
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30s so elapsed time stays roughly fresh
  });

  const disableMutation = useMutation({
    mutationFn: () => emergencyModeApiService.disable(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-mode-status'] });
      setIsDeescalateOpen(false);
    },
  });

  const isActive = statusData?.isActive ?? false;

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
              isActive ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-500/10 text-rose-500'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Emergency Mode</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          One-touch full focus lockdown — enforces strict boundaries across Focus, Detox, and
          Notifications.
        </p>
      </div>

      {/* Active Banner — only when on */}
      {statusData && isActive && (
        <EmergencyActiveBanner
          status={statusData}
          onDeescalate={() => setIsDeescalateOpen(true)}
          isDeescalating={disableMutation.isPending}
        />
      )}

      {/* Toggle Card */}
      <EmergencyToggleCard
        status={statusData}
        isLoading={isLoading}
        onDeescalateClick={() => setIsDeescalateOpen(true)}
      />

      {/* Protocol Information */}
      <EmergencyProtocolsCard isActive={isActive} />

      {/* De-escalation Modal */}
      <DeescalateModal
        isOpen={isDeescalateOpen}
        onClose={() => setIsDeescalateOpen(false)}
        onConfirm={() => disableMutation.mutate()}
        isLoading={disableMutation.isPending}
      />
    </div>
  );
}
