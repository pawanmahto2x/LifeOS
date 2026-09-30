'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthApiService } from '../services/health.service';
import { WaterDialog } from './water-dialog';
import { Droplet, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function WaterTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: waterData, isLoading } = useQuery({
    queryKey: ['health-water'],
    queryFn: async () => {
      const today = new Date();
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).toISOString();
      const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999,
      ).toISOString();
      const res = await healthApiService.getWaterLogs({ startDate, endDate, limit: 100 });
      return res.data;
    },
  });

  const quickLogMutation = useMutation({
    mutationFn: async (amount: number) => {
      await healthApiService.logWater({ amount, unit: 'ml' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-water'] });
      queryClient.invalidateQueries({ queryKey: ['health-summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await healthApiService.deleteWaterLog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-water'] });
      queryClient.invalidateQueries({ queryKey: ['health-summary'] });
    },
  });

  const totalMl = waterData?.todayTotalMl ?? 0;
  const goalMl = waterData?.dailyGoalMl ?? 2000;
  const percentage = Math.min(Math.round((totalMl / goalMl) * 100), 100);
  const logs = waterData?.logs ?? [];

  return (
    <div className="border-border bg-card flex h-full flex-col rounded-2xl border p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold">Hydration Tracker</h3>
            <p className="text-muted-foreground text-xs">Daily hydration goal: {goalMl} ml</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => quickLogMutation.mutate(250)}
            disabled={quickLogMutation.isPending}
            className="border-border bg-background text-foreground hover:bg-muted rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            +250 ml
          </button>
          <button
            onClick={() => quickLogMutation.mutate(500)}
            disabled={quickLogMutation.isPending}
            className="border-border bg-background text-foreground hover:bg-muted rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            +500 ml
          </button>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Custom
          </button>
        </div>
      </div>

      {/* Progress Bar & Stat Card */}
      <div className="bg-muted/40 border-border/50 mb-6 rounded-xl border p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <span className="text-foreground text-2xl font-bold">{totalMl}</span>
            <span className="text-muted-foreground ml-1 text-xs">/ {goalMl} ml</span>
          </div>
          <span className="text-sm font-semibold text-blue-500">{percentage}%</span>
        </div>

        <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {percentage >= 100 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Daily hydration target reached!
          </div>
        )}
      </div>

      {/* Today's Logs */}
      <div className="flex min-h-0 flex-1 flex-col">
        <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          Today&apos;s Logs
        </h4>

        {isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-xs">
            Loading hydration logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-xl border border-dashed py-8 text-center text-xs">
            No water intake logged today. Drink a glass of water to start!
          </div>
        ) : (
          <div className="max-h-56 flex-1 space-y-2 overflow-y-auto pr-1">
            {logs.map((log) => {
              const logId = log.id || log._id || '';
              return (
                <div
                  key={logId}
                  className="border-border bg-background/50 hover:bg-muted/50 flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {log.amount} {log.unit}
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        {new Date(log.loggedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(logId)}
                    disabled={deleteMutation.isPending}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg p-1 transition-colors"
                    title="Delete log"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WaterDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
