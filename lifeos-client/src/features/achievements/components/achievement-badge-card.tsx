'use client';

import React from 'react';
import { IAchievementWithStatus } from '@/types/achievement.types';
import {
  CheckSquare,
  CheckCheck,
  Crown,
  Repeat,
  Flame,
  Trophy,
  Target,
  Zap,
  Droplets,
  Sun,
  BookOpen,
  Award,
  Users,
  Lock,
} from 'lucide-react';

interface AchievementBadgeCardProps {
  achievement: IAchievementWithStatus;
}

const ICON_MAP: Record<string, React.ElementType> = {
  CheckSquare,
  CheckCheck,
  Crown,
  Repeat,
  Flame,
  Trophy,
  Target,
  Zap,
  Droplets,
  Sun,
  BookOpen,
  Award,
  Users,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Productivity: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Consistency: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  Focus: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Wellness: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  Detox: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  Community: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
};

export function AchievementBadgeCard({ achievement }: AchievementBadgeCardProps) {
  const Icon = ICON_MAP[achievement.icon] || Award;
  const colors = CATEGORY_COLORS[achievement.category] || CATEGORY_COLORS.Productivity;

  const unlockedDate = achievement.unlockedAt
    ? new Date(achievement.unlockedAt).toLocaleDateString()
    : null;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
        achievement.isUnlocked
          ? 'border-border bg-card hover:border-primary/40 shadow-sm hover:shadow-md'
          : 'border-border/60 bg-muted/20 opacity-60 grayscale-[40%]'
      }`}
    >
      <div>
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
              achievement.isUnlocked
                ? `${colors.bg} ${colors.text} ${colors.border}`
                : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            {achievement.isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
          </div>

          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              achievement.isUnlocked
                ? `${colors.bg} ${colors.text}`
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {achievement.category}
          </span>
        </div>

        <h3
          className={`mt-3.5 text-base font-bold ${
            achievement.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {achievement.badgeName}
        </h3>

        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {achievement.description}
        </p>
      </div>

      <div className="border-border/70 mt-4 flex items-center justify-between border-t pt-3 text-[11px]">
        <span className="text-muted-foreground font-medium">
          {achievement.requirementDescription}
        </span>
        {achievement.isUnlocked && unlockedDate ? (
          <span className="font-semibold text-emerald-400">Unlocked {unlockedDate}</span>
        ) : (
          <span className="text-muted-foreground/80 flex items-center gap-1 font-semibold">
            <Lock className="h-3 w-3" /> Locked
          </span>
        )}
      </div>
    </div>
  );
}
