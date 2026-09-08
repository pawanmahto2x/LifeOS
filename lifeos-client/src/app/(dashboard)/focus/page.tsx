'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { focusApiService } from '@/features/focus/services/focus.service';
import { FocusTimer } from '@/features/focus/components/focus-timer';
import { FocusHistory } from '@/features/focus/components/focus-history';
import { Flame, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function FocusPage() {
  const { data: focusData } = useQuery({
    queryKey: ['focus'],
    queryFn: async () => {
      const res = await focusApiService.getSessions();
      return res.data;
    },
  });

  const analytics = focusData?.analytics;
  const todayMinutes = analytics?.todayFocusMinutes ?? 0;
  const todaySessions = analytics?.todayCompletedSessions ?? 0;
  const totalMinutes = analytics?.totalFocusMinutes ?? 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="h-5 w-5" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Focus Mode</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Eliminate distractions, execute deep work blocks, and build focused momentum.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Today&apos;s Focus
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-foreground text-2xl font-bold">{todayMinutes} mins</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {todaySessions} completed {todaySessions === 1 ? 'session' : 'sessions'} today
          </p>
        </div>

        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Deep Work Total
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-foreground text-2xl font-bold">{totalHours} hrs</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {analytics?.totalCompletedSessions ?? 0} total sessions logged
          </p>
        </div>

        <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Today&apos;s Distractions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-foreground text-2xl font-bold">{analytics?.todayDistractions ?? 0}</p>
          <p className="text-muted-foreground mt-1 text-xs">Logged interruption events</p>
        </div>
      </div>

      {/* Main Focus Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <FocusTimer />
        </div>
        <div className="lg:col-span-5">
          <FocusHistory />
        </div>
      </div>
    </div>
  );
}
