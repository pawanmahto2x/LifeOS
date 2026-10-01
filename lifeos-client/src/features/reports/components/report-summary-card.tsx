'use client';

import React from 'react';
import { IReport } from '@/types/report.types';
import {
  CheckSquare,
  Repeat,
  BedDouble,
  Droplets,
  Flame,
  Smartphone,
  BarChart3,
  AlertCircle,
  Target,
  Compass,
  Sparkles,
} from 'lucide-react';

interface ReportSummaryCardProps {
  report: IReport | null;
  isLoading: boolean;
  hasData: boolean;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

function StatRow({
  icon: Icon,
  color,
  bg,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border-border flex items-center justify-between border-b py-2.5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-foreground text-sm font-medium">{label}</p>
          {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
        </div>
      </div>
      <span className="text-foreground text-sm font-bold">{value}</span>
    </div>
  );
}

export function ReportSummaryCard({ report, isLoading, hasData, type }: ReportSummaryCardProps) {
  if (isLoading) {
    return <div className="border-border bg-card h-64 animate-pulse rounded-2xl border" />;
  }

  if (!hasData || !report) {
    return (
      <div className="border-border bg-card rounded-2xl border p-8 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
          <AlertCircle className="text-muted-foreground h-6 w-6" />
        </div>
        <p className="text-foreground text-sm font-semibold">Not Enough Data Yet</p>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          Keep using LifeOS for a few more days to unlock your {type} report.
        </p>
      </div>
    );
  }

  const s = report.summary;
  const periodLabel = `${new Date(report.periodStart).toLocaleDateString()} – ${new Date(report.periodEnd).toLocaleDateString()}`;

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border border-b px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground text-sm font-bold capitalize">{type} Report</span>
          </div>
          {report.aiSummary && (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-400">
              <Sparkles className="h-3 w-3" />
              AI Synthesized
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">{periodLabel}</p>
      </div>

      {report.aiSummary && (
        <div className="border-border/60 bg-muted/30 border-b p-5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-violet-400 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            AI Executive Summary
          </div>
          <p className="text-foreground/90 text-sm leading-relaxed">{report.aiSummary}</p>
        </div>
      )}

      <div className="divide-border divide-y px-5 py-1">
        {s.missionsCompleted !== undefined && (
          <StatRow
            icon={Target}
            color="text-indigo-400"
            bg="bg-indigo-500/10"
            label="Missions Completed"
            value={`${s.missionsCompleted}`}
            sub="Daily missions achieved"
          />
        )}
        {s.activeGoals !== undefined && (
          <StatRow
            icon={Compass}
            color="text-pink-400"
            bg="bg-pink-500/10"
            label="Strategic Goals & Milestones"
            value={`${s.activeGoals} Active Goals`}
            sub={`${s.milestonesCompleted || 0} total milestones achieved`}
          />
        )}
        <StatRow
          icon={CheckSquare}
          color="text-blue-400"
          bg="bg-blue-500/10"
          label="Tasks Completed"
          value={`${s.tasksCompleted} / ${s.tasksCreated}`}
          sub={`${s.tasksCompletionRate}% completion rate`}
        />
        <StatRow
          icon={Repeat}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          label="Habit Check-ins"
          value={`${s.habitCompletions}`}
          sub={`${s.habitCompletionRate}% of ${s.habitsTracked} tracked habits`}
        />
        <StatRow
          icon={BedDouble}
          color="text-indigo-400"
          bg="bg-indigo-500/10"
          label="Avg Sleep"
          value={`${Math.floor(s.avgDailySleepMinutes / 60)}h ${s.avgDailySleepMinutes % 60}m`}
          sub="per night average"
        />
        <StatRow
          icon={Droplets}
          color="text-sky-400"
          bg="bg-sky-500/10"
          label="Avg Daily Water"
          value={`${s.avgDailyWaterMl} ml`}
          sub={s.avgDailyWaterMl >= 2000 ? 'Goal achieved' : 'Below 2L goal'}
        />
        <StatRow
          icon={Flame}
          color="text-amber-400"
          bg="bg-amber-500/10"
          label="Focus Sessions"
          value={`${s.totalFocusSessions} sessions`}
          sub={`${s.totalFocusMinutes} total minutes`}
        />
        <StatRow
          icon={Smartphone}
          color="text-rose-400"
          bg="bg-rose-500/10"
          label="Avg Screen Time"
          value={`${s.avgDailyScreenTimeMinutes} min/day`}
          sub={`${s.daysUnderGoal} days under goal`}
        />
      </div>
    </div>
  );
}
