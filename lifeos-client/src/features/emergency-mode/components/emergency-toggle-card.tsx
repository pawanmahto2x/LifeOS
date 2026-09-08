'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyModeApiService } from '../services/emergency-mode.service';
import { IEmergencyModeStatus } from '@/types/emergency-mode.types';
import { AlertTriangle, ShieldOff, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

interface EmergencyToggleCardProps {
  status?: IEmergencyModeStatus;
  isLoading: boolean;
  onDeescalateClick: () => void;
}

export function EmergencyToggleCard({
  status,
  isLoading,
  onDeescalateClick,
}: EmergencyToggleCardProps) {
  const queryClient = useQueryClient();
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);

  const enableMutation = useMutation({
    mutationFn: () => emergencyModeApiService.enable(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-mode-status'] });
      setShowEnableConfirm(false);
    },
  });

  if (isLoading) {
    return <div className="border-border bg-card h-40 animate-pulse rounded-2xl border p-6" />;
  }

  const isActive = status?.isActive ?? false;

  return (
    <div
      className={`bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-500 ${
        isActive ? 'border-rose-500/50' : 'border-border'
      }`}
    >
      {isActive && (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl bg-rose-500/5" />
      )}

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Indicator */}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
              isActive
                ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/30'
                : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            {isActive ? <ShieldOff className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-foreground text-xl font-bold">Emergency Mode</h2>
              {isActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-rose-400 uppercase">
                  <Zap className="h-2.5 w-2.5" /> Active
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {isActive
                ? 'All non-essential access is restricted. Focus Lock and screen time limits are enforced.'
                : 'Engage to enforce strict Focus Lock, restrict screen time, and silence non-critical notifications.'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          {isActive ? (
            <button
              type="button"
              onClick={onDeescalateClick}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-2.5 text-sm font-bold text-rose-400 transition-colors hover:bg-rose-500/20"
            >
              <ShieldOff className="h-4 w-4" />
              De-escalate
            </button>
          ) : (
            <>
              {!showEnableConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowEnableConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-500"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Activate Emergency Mode
                </button>
              ) : (
                <div className="max-w-xs rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="mb-3 flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <p className="text-xs leading-relaxed text-amber-300/80">
                      This will restrict your app access and override your current Focus and Detox
                      settings until you manually de-escalate.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEnableConfirm(false)}
                      className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => enableMutation.mutate()}
                      disabled={enableMutation.isPending}
                      className="flex-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
                    >
                      {enableMutation.isPending ? 'Activating...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
