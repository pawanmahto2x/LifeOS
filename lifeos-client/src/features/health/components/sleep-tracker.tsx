'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthApiService } from '../services/health.service';
import { SleepDialog } from './sleep-dialog';
import { Moon, Plus, Trash2, Clock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export function SleepTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'night' | 'nap'>('night');
  const queryClient = useQueryClient();

  const { data: sleepData, isLoading } = useQuery({
    queryKey: ['health-sleep'],
    queryFn: async () => {
      const res = await healthApiService.getSleepLogs();
      return res.data;
    },
  });

  const quickLogMutation = useMutation({
    mutationFn: async (hours: number) => {
      const now = new Date();
      // Anchor wake time to today at 7:00 AM (or current time if before 7:00 AM)
      const wakeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
      const sleepTime = new Date(wakeTime.getTime() - hours * 60 * 60 * 1000);

      await healthApiService.logSleep({
        sleepTime: sleepTime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        quality: 'Good',
        notes: `Quick logged ${hours}h night rest`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-sleep'] });
      queryClient.invalidateQueries({ queryKey: ['health-summary'] });
    },
  });

  const quickNapMutation = useMutation({
    mutationFn: async (minutes: number = 60) => {
      const now = new Date();
      const wakeTime = now;
      const sleepTime = new Date(wakeTime.getTime() - minutes * 60 * 1000);

      await healthApiService.logSleep({
        sleepTime: sleepTime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        quality: 'Good',
        notes: `Daytime Nap (${minutes >= 60 ? `${Math.round(minutes / 60)}h` : `${minutes}m`})`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-sleep'] });
      queryClient.invalidateQueries({ queryKey: ['health-summary'] });
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

  // Helper to detect if a log is a daytime nap vs night sleep
  const isNapSession = (log: { duration: number; notes?: string }) => {
    const hasNapNote = (log.notes || '').toLowerCase().includes('nap');
    return hasNapNote || log.duration <= 150; // <= 2.5 hours
  };

  // Calculate today's total sleep across both night sleep and daytime naps
  const todayDateString = new Date().toDateString();
  const todayLogs = logs.filter((log) => {
    const wakeDate = new Date(log.wakeTime).toDateString();
    const sleepDate = new Date(log.sleepTime).toDateString();
    return wakeDate === todayDateString || sleepDate === todayDateString;
  });
  const todayTotalSleepMinutes = todayLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
  const isSleepLimitExceeded = todayTotalSleepMinutes >= 540; // 9 hours or more

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
    <div className="border-border bg-card flex h-full flex-col rounded-2xl border p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Moon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold">Sleep Tracker</h3>
            <p className="text-muted-foreground text-xs">
              Monitor rest duration, power naps & sleep quality
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => quickLogMutation.mutate(8)}
            disabled={quickLogMutation.isPending || quickNapMutation.isPending}
            className="border-border bg-background text-foreground hover:bg-muted cursor-pointer rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            title="Quick log 8 hours of night rest (11:00 PM – 7:00 AM)"
          >
            +8 hrs
          </button>
          <button
            onClick={() => quickNapMutation.mutate(60)}
            disabled={quickLogMutation.isPending || quickNapMutation.isPending}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-400"
            title="Quick log a 1-hour daytime power nap"
          >
            <Zap className="h-3 w-3" />
            +1h Nap
          </button>
          <button
            onClick={() => {
              setDialogMode('night');
              setIsDialogOpen(true);
            }}
            className="flex cursor-pointer items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            title="Record custom sleep or nap session"
          >
            <Plus className="h-3.5 w-3.5" />
            Custom
          </button>
        </div>
      </div>

      {/* Unified Rest Status & Smart Coach Card */}
      <div className="bg-muted/40 border-border/50 mb-6 rounded-xl border p-4">
        {latestLog ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isNapSession(latestLog) ? (
                  <Zap className="h-4 w-4 text-amber-500" />
                ) : (
                  <Clock className="h-4 w-4 text-indigo-500" />
                )}
                <span className="text-muted-foreground text-xs font-medium">
                  {isNapSession(latestLog) ? 'Latest Daytime Nap' : 'Last Night Sleep'}
                </span>
                <span
                  className={`py-0.2 rounded-full border px-1.5 text-[9px] font-semibold ${
                    isNapSession(latestLog)
                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-500'
                  }`}
                >
                  {isNapSession(latestLog) ? '⚡ Nap' : '🌙 Night'}
                </span>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getQualityBadgeColor(
                  latestLog.quality,
                )}`}
              >
                {latestLog.quality}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
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

            {latestLog.notes && !isSleepLimitExceeded && (
              <p className="text-muted-foreground border-border/40 mt-1.5 border-t pt-1.5 text-xs italic">
                &quot;{latestLog.notes}&quot;
              </p>
            )}
          </>
        ) : (
          <div className="text-muted-foreground py-2 text-center text-xs">
            No sleep records logged yet. Record your rest or log a power nap to start tracking.
          </div>
        )}

        {/* Integrated Productivity Coach Alert (Active when daily sleep quota >= 9h) */}
        {isSleepLimitExceeded && (
          <div className="mt-3 border-t border-amber-500/20 pt-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-foreground text-xs font-semibold">
                  Daily Sleep Quota Reached
                </span>
              </div>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                {formatDuration(todayTotalSleepMinutes)} today
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
              Battery 100%! Ready to channel your energy into deep, productive work:
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <Link
                href="/focus"
                className="flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 py-1.5 text-center text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
              >
                <span>Start Focus</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/tasks"
                className="border-border bg-background hover:bg-muted text-foreground flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-center text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>View Tasks</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sleep History */}
      <div className="flex min-h-0 flex-1 flex-col">
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
          <div className="max-h-56 flex-1 space-y-2 overflow-y-auto pr-1">
            {logs.map((log) => {
              const logId = log.id || log._id || '';
              const nap = isNapSession(log);
              return (
                <div
                  key={logId}
                  className="border-border bg-background/50 hover:bg-muted/50 flex items-center justify-between rounded-xl border px-3 py-2 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {nap ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <Zap className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                        <Moon className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-foreground text-xs font-semibold">
                          {formatDuration(log.duration)}
                        </p>
                        <span
                          className={`py-0.2 rounded-full border px-1.5 text-[9px] font-semibold ${
                            nap
                              ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-500'
                          }`}
                        >
                          {nap ? '⚡ Nap' : '🌙 Night'}
                        </span>
                        <span
                          className={`py-0.2 rounded-full border px-1.5 text-[9px] font-semibold ${getQualityBadgeColor(
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
                        })}{' '}
                        •{' '}
                        {new Date(log.sleepTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        –{' '}
                        {new Date(log.wakeTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {log.notes && ` • "${log.notes}"`}
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

      <SleepDialog
        isOpen={isDialogOpen}
        initialMode={dialogMode}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
