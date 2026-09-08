'use client';

import React from 'react';
import { IEmergencyModeStatus } from '@/types/emergency-mode.types';
import { AlertTriangle, Clock, Zap } from 'lucide-react';

interface EmergencyActiveBannerProps {
  status: IEmergencyModeStatus;
  onDeescalate: () => void;
  isDeescalating: boolean;
}

export function EmergencyActiveBanner({
  status,
  onDeescalate,
  isDeescalating,
}: EmergencyActiveBannerProps) {
  if (!status.isActive) return null;

  const activatedAt = status.activatedAt ? new Date(status.activatedAt) : null;
  const elapsedMs = activatedAt ? Date.now() - activatedAt.getTime() : 0;
  const elapsedMins = Math.floor(elapsedMs / 60000);
  const elapsedHrs = Math.floor(elapsedMins / 60);
  const remainingMins = elapsedMins % 60;

  const elapsedLabel = elapsedHrs > 0 ? `${elapsedHrs}h ${remainingMins}m` : `${elapsedMins}m`;

  return (
    <div className="animate-in fade-in relative overflow-hidden rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4 shadow-lg duration-300">
      {/* Pulsing background effect */}
      <div className="absolute inset-0 animate-pulse rounded-2xl bg-rose-500/5" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider text-rose-300 uppercase">
                Emergency Mode Active
              </span>
              <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-rose-400 uppercase">
                <Zap className="h-2.5 w-2.5" /> LIVE
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <Clock className="h-3 w-3 text-rose-500/60" />
              <span className="text-xs text-rose-400/70">
                {activatedAt ? (
                  <>
                    Activated at{' '}
                    {activatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {elapsedMins > 0 && ` · ${elapsedLabel} elapsed`}
                  </>
                ) : (
                  'Active'
                )}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDeescalate}
          disabled={isDeescalating}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/30 disabled:opacity-50 sm:w-auto"
        >
          {isDeescalating ? 'Restoring...' : 'De-escalate & Restore Settings'}
        </button>
      </div>
    </div>
  );
}
