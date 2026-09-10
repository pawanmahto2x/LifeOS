import React from 'react';
import { ITimelineEntry, TimelineEntryType } from '@/types/timeline.types';
import { Award, CheckCircle2, Flame, Trophy } from 'lucide-react';

interface TimelineCardProps {
  entry: ITimelineEntry;
  isLast?: boolean;
}

const TYPE_CONFIG: Record<
  TimelineEntryType,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badgeClass: string;
    iconClass: string;
    lineClass: string;
  }
> = {
  AchievementUnlocked: {
    icon: Award,
    label: 'Achievement Unlocked',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    lineClass: 'border-amber-500/20',
  },
  ChallengeCompleted: {
    icon: Trophy,
    label: 'Challenge Completed',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    iconClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    lineClass: 'border-indigo-500/20',
  },
  GoalCompleted: {
    icon: CheckCircle2,
    label: 'Goal Accomplished',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    lineClass: 'border-emerald-500/20',
  },
  HabitMilestone: {
    icon: Flame,
    label: 'Habit Milestone',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    iconClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    lineClass: 'border-orange-500/20',
  },
};

export function TimelineCard({ entry, isLast = false }: TimelineCardProps) {
  const config = TYPE_CONFIG[entry.entryType] || TYPE_CONFIG.GoalCompleted;
  const IconComponent = config.icon;

  const dateObj = new Date(entry.occurredAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative flex gap-4 sm:gap-6">
      {/* Left Node & Connecting Timeline Line */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${config.iconClass} shadow-sm transition-transform hover:scale-105`}
        >
          <IconComponent className="h-5 w-5" />
        </div>
        {!isLast && <div className="border-border my-2 w-px grow border-l-2 border-dashed" />}
      </div>

      {/* Right Content Card */}
      <div className="border-border bg-card mb-6 grow rounded-2xl border p-5 shadow-sm transition-all hover:border-neutral-700">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${config.badgeClass}`}
          >
            {config.label}
          </span>
          <span className="text-muted-foreground text-xs">
            {formattedDate} &bull; {formattedTime}
          </span>
        </div>

        <h3 className="text-foreground text-base font-bold tracking-tight">{entry.title}</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{entry.description}</p>
      </div>
    </div>
  );
}
