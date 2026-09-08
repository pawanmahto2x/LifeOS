'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthApiService } from '../services/health.service';
import { SleepDialog } from './sleep-dialog';
import { Moon, Plus, Trash2, Clock } from 'lucide-react';

export function SleepTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: sleepData, isLoading } = useQuery({
    queryKey: ['health-sleep'],
    queryFn: async () => {
      const res = await healthApiService.getSleepLogs();
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await healthApiService.deleteSleepLog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-sleep'] });
      queryClient.invalidateQueries({ queryKey: ['health-summary'] });
    },
  });

  const logs = sleepData?.logs ?? [];
  const latestLog = logs.length > 0 ? logs[0] : null;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case 'Excellent':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Good':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Fair':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Poor':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Moon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold">Sleep Tracker</h3>
            <p className="text-muted-foreground text-xs">Monitor rest duration and sleep quality</p>
          </div>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Record Sleep
        </button>
      </div>

      {/* Latest Session Card */}
      {latestLog ? (
        <div className="bg-muted/40 border-border/50 mb-6 rounded-xl border p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span className="text-muted-foreground text-xs font-medium">Last Recorded Sleep</span>
            </div>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getQualityBadgeColor(
                latestLog.quality,
              )}`}
            >
              {latestLog.quality}
            </span>
          </div>

          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-bold">
              {formatDuration(latestLog.duration)}
            </span>
            <span className="text-muted-foreground text-xs">
              (
              {new Date(latestLog.sleepTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              –{' '}
              {new Date(latestLog.wakeTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              )
            </span>
          </div>

          {latestLog.notes && (
            <p className="text-muted-foreground border-border/40 mt-2 border-t pt-2 text-xs italic">
              &quot;{latestLog.notes}&quot;
            </p>
          )}
        </div>
      ) : (
        <div className="bg-muted/20 border-border/50 mb-6 rounded-xl border p-4 text-center">
          <p className="text-muted-foreground text-xs">
            No sleep records logged yet. Record your last night&apos;s sleep to start tracking.
          </p>
        </div>
      )}

      {/* Sleep History */}
      <div>
        <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          Sleep History
        </h4>

        {isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-xs">
            Loading sleep logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-xl border border-dashed py-8 text-center text-xs">
            No sleep history recorded yet.
          </div>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {logs.map((log) => {
              const logId = log.id || log._id || '';
              return (
                <div
                  key={logId}
                  className="border-border bg-background/50 hover:bg-muted/50 flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-foreground text-sm font-medium">
                          {formatDuration(log.duration)}
                        </p>
                        <span
                          className={`py-0.2 rounded-full border px-2 text-[9px] font-semibold ${getQualityBadgeColor(
                            log.quality,
                          )}`}
                        >
                          {log.quality}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[10px]">
                        {new Date(log.sleepTime).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(log.sleepTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        to{' '}
                        {new Date(log.wakeTime).toLocaleTimeString([], {
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

      <SleepDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
