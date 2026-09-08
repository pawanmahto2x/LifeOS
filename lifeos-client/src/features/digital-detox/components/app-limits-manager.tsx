'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { digitalDetoxApiService } from '../services/digital-detox.service';
import { IAppLimit, IDigitalDetoxAppUsageItem } from '@/types/digital-detox.types';
import { AppLimitDialog } from './app-limit-dialog';
import { Plus, Edit2, Trash2, Smartphone, AlertCircle } from 'lucide-react';

interface AppLimitsManagerProps {
  appLimits?: IAppLimit[];
  appUsage?: IDigitalDetoxAppUsageItem[];
  isLoading: boolean;
}

export function AppLimitsManager({
  appLimits = [],
  appUsage = [],
  isLoading,
}: AppLimitsManagerProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<IAppLimit | null>(null);

  const updateSettingsMutation = useMutation({
    mutationFn: (newLimits: IAppLimit[]) =>
      digitalDetoxApiService.updateSettings({ appLimits: newLimits }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-detox-usage'] });
      queryClient.invalidateQueries({ queryKey: ['digital-detox-settings'] });
      setIsDialogOpen(false);
      setEditingLimit(null);
    },
  });

  const handleSaveLimit = (limit: IAppLimit) => {
    const existingIndex = appLimits.findIndex(
      (l) => l.appName.toLowerCase() === limit.appName.toLowerCase(),
    );
    let updated: IAppLimit[];
    if (existingIndex >= 0) {
      updated = [...appLimits];
      updated[existingIndex] = limit;
    } else {
      updated = [...appLimits, limit];
    }
    updateSettingsMutation.mutate(updated);
  };

  const handleDeleteLimit = (appName: string) => {
    const updated = appLimits.filter((l) => l.appName.toLowerCase() !== appName.toLowerCase());
    updateSettingsMutation.mutate(updated);
  };

  const getUsageForApp = (appName: string) => {
    const item = appUsage.find((u) => u.appName.toLowerCase() === appName.toLowerCase());
    return item?.minutesUsed ?? 0;
  };

  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-base font-bold">App Specific Limits</h3>
            <p className="text-muted-foreground text-xs">
              Enforce maximum daily allowances on distracting applications
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingLimit(null);
            setIsDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Limit
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-muted/40 h-16 w-full animate-pulse rounded-xl" />
          ))}
        </div>
      ) : appLimits.length === 0 ? (
        <div className="border-border bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
          <Smartphone className="text-muted-foreground mb-2 h-8 w-8 opacity-40" />
          <p className="text-foreground text-sm font-medium">No App Limits Configured</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Add limits for high-friction apps like Instagram or YouTube to preserve focus.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appLimits.map((limit) => {
            const used = getUsageForApp(limit.appName);
            const percent = Math.min(
              Math.round((used / (limit.dailyLimitMinutes || 1)) * 100),
              100,
            );
            const isExceeded = used > limit.dailyLimitMinutes;

            return (
              <div
                key={limit.appName}
                className="border-border bg-muted/20 hover:bg-muted/40 flex flex-col gap-2 rounded-xl border p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">{limit.appName}</span>
                    {limit.category && (
                      <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[10px] font-medium">
                        {limit.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLimit(limit);
                        setIsDialogOpen(true);
                      }}
                      className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                      title="Edit limit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLimit(limit.appName)}
                      className="text-muted-foreground rounded-lg p-1.5 transition-colors hover:text-rose-500"
                      title="Delete limit"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {used} / {limit.dailyLimitMinutes} mins today
                  </span>
                  {isExceeded && (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
                      <AlertCircle className="h-3 w-3" /> Exceeded limit
                    </span>
                  )}
                </div>

                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isExceeded ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AppLimitDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingLimit(null);
        }}
        onSave={handleSaveLimit}
        initialLimit={editingLimit}
        isSaving={updateSettingsMutation.isPending}
      />
    </div>
  );
}
