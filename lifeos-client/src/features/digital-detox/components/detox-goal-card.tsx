'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { digitalDetoxApiService } from '../services/digital-detox.service';
import { IDigitalDetoxUsageSummary } from '@/types/digital-detox.types';
import { Shield, AlertTriangle, CheckCircle2, Lock, Unlock, Settings2 } from 'lucide-react';

interface DetoxGoalCardProps {
  usageSummary?: IDigitalDetoxUsageSummary;
  isLoading: boolean;
}

export function DetoxGoalCard({ usageSummary, isLoading }: DetoxGoalCardProps) {
  const queryClient = useQueryClient();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState<number>(usageSummary?.goalMinutes ?? 120);
  const [warningThreshold, setWarningThreshold] = useState<number>(
    usageSummary?.settings?.warningThresholdPercent ?? 80,
  );

  const updateSettingsMutation = useMutation({
    mutationFn: (payload: {
      dailyScreenTimeGoalMinutes?: number;
      warningThresholdPercent?: number;
      focusLockEnabled?: boolean;
    }) => digitalDetoxApiService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-detox-usage'] });
      queryClient.invalidateQueries({ queryKey: ['digital-detox-settings'] });
      queryClient.invalidateQueries({ queryKey: ['digital-detox-opportunity-cost'] });
      setIsEditingGoal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="border-border bg-card animate-pulse rounded-2xl border p-6">
        <div className="bg-muted mb-4 h-6 w-1/3 rounded-md" />
        <div className="bg-muted h-12 w-full rounded-md" />
      </div>
    );
  }

  const goal = usageSummary?.goalMinutes ?? 120;
  const used = usageSummary?.todayTotalMinutes ?? 0;
  const percentage = Math.min(Math.round((used / (goal || 1)) * 100), 100);
  const isExceeded = usageSummary?.isGoalExceeded ?? false;
  const isWarning = usageSummary?.isWarningTriggered ?? false;
  const isLocked = usageSummary?.settings?.focusLockEnabled ?? false;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      dailyScreenTimeGoalMinutes: Number(goalInput),
      warningThresholdPercent: Number(warningThreshold),
    });
  };

  const handleToggleLock = () => {
    updateSettingsMutation.mutate({
      focusLockEnabled: !isLocked,
    });
  };

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isExceeded
                ? 'bg-rose-500/10 text-rose-500'
                : isWarning
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-emerald-500/10 text-emerald-500'
            }`}
          >
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-bold">Daily Screen Time Goal</h2>
            <p className="text-muted-foreground text-xs">
              Keep recreational usage under your daily budget
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleLock}
            disabled={updateSettingsMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLocked
                ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            {isLocked ? 'Focus Lock Active' : 'Lock Apps'}
          </button>
          <button
            type="button"
            onClick={() => {
              setGoalInput(goal);
              setWarningThreshold(usageSummary?.settings?.warningThresholdPercent ?? 80);
              setIsEditingGoal(!isEditingGoal);
            }}
            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl border p-2 text-xs transition-colors"
            title="Edit Goal Settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isEditingGoal ? (
        <form
          onSubmit={handleSaveGoal}
          className="bg-muted/30 border-border mt-5 space-y-4 rounded-xl border p-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1 block text-xs font-medium">
                Daily Goal (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={1440}
                value={goalInput}
                onChange={(e) => setGoalInput(Number(e.target.value))}
                className="border-input bg-background text-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="text-foreground mb-1 block text-xs font-medium">
                Warning Threshold (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="border-input bg-background text-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingGoal(false)}
              className="border-border hover:bg-muted text-muted-foreground rounded-lg border px-3 py-1.5 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-foreground text-3xl font-extrabold tracking-tight">
                {used}{' '}
                <span className="text-muted-foreground text-sm font-medium">/ {goal} mins</span>
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isExceeded
                  ? 'bg-rose-500/10 text-rose-500'
                  : isWarning
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              {isExceeded ? (
                <>
                  <AlertTriangle className="h-3 w-3" /> Exceeded by {used - goal}m
                </>
              ) : isWarning ? (
                <>
                  <AlertTriangle className="h-3 w-3" /> Approaching limit ({percentage}%)
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" /> On Track ({percentage}%)
                </>
              )}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-500 ${
                isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
