'use client';

import React from 'react';
import { Activity, Brain, Zap, ShieldCheck, Flame, Info } from 'lucide-react';

interface DopamineIndexCardProps {
  todayScreenTimeMinutes?: number;
  dailyGoalMinutes?: number;
  focusMinutesToday?: number;
  waterIntakeMl?: number;
  appLimitsExceededCount?: number;
  urgesConquered?: number;
}

export function DopamineIndexCard({
  todayScreenTimeMinutes = 45,
  dailyGoalMinutes = 120,
  focusMinutesToday = 25,
  waterIntakeMl = 1250,
  appLimitsExceededCount = 0,
  urgesConquered = 0,
}: DopamineIndexCardProps) {
  // Scientific cognitive recovery score algorithm (0 - 100)
  // Positive Drivers: Focus sessions (+), Hydration (+), Resisted urges (+)
  // Negative Drivers: Excessive screen time (-), App limit violations (-)
  let score = 55; // baseline

  // Focus boost: +10 pts per 25m pomodoro, max +30
  const focusBoost = Math.min(30, Math.round((focusMinutesToday / 25) * 10));
  score += focusBoost;

  // Hydration boost: max +10 pts if drinking 2000ml+
  const waterBoost = Math.min(10, Math.round((waterIntakeMl / 2000) * 10));
  score += waterBoost;

  // Urges conquered: +5 pts each, max +15
  const urgeBoost = Math.min(15, urgesConquered * 5);
  score += urgeBoost;

  // Screen time penalty: if screen time > goal, deduct points
  if (todayScreenTimeMinutes > dailyGoalMinutes) {
    const excessMinutes = todayScreenTimeMinutes - dailyGoalMinutes;
    const penalty = Math.min(35, Math.round((excessMinutes / 15) * 5));
    score -= penalty;
  }

  // App limit violations: -10 pts each
  score -= appLimitsExceededCount * 10;

  // Clamp 0 - 100
  const dopamineScore = Math.max(5, Math.min(100, score));

  // Determine State
  let statusTier: {
    label: string;
    description: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  };

  if (dopamineScore >= 75) {
    statusTier = {
      label: 'Deep Flow & High Sensitivity',
      description:
        'Your brain receptors are calibrated! High attention span, zero brain fog, and effortless focus.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: <Brain className="h-5 w-5 text-emerald-500" />,
    };
  } else if (dopamineScore >= 45) {
    statusTier = {
      label: 'Balanced Cognitive State',
      description:
        'Stable neuro-balance. Protect your focus window and avoid mindless doomscrolling.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: <Activity className="h-5 w-5 text-amber-500" />,
    };
  } else {
    statusTier = {
      label: 'Dopamine Debt & Overstimulation',
      description:
        'High sensory fatigue. Rapid algorithmic video feeds have exhausted your baseline. Take a 10m walk.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      icon: <Flame className="h-5 w-5 text-rose-500" />,
    };
  }

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left Side: Score & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border ${statusTier.border} ${statusTier.bg}`}
          >
            <span className={`text-3xl font-black tracking-tight ${statusTier.color}`}>
              {dopamineScore}
            </span>
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              / 100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-base font-bold">Dopamine Sensitivity Index</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusTier.bg} ${statusTier.color}`}
              >
                {statusTier.label}
              </span>
            </div>

            <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-relaxed">
              {statusTier.description}
            </p>

            {/* Micro Breakdown Metrics */}
            <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Zap className="h-3 w-3 text-amber-500" />
                Focus: +{focusBoost} pts
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Urges Resisted: {urgesConquered}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Info className="h-3 w-3 text-sky-500" />
                Hydration: +{waterBoost} pts
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Meter Bar */}
        <div className="w-full shrink-0 md:w-56">
          <div className="text-muted-foreground mb-1.5 flex justify-between text-xs font-semibold">
            <span>Receptor Baseline</span>
            <span className={statusTier.color}>{dopamineScore}%</span>
          </div>
          <div className="bg-muted h-3 w-full overflow-hidden rounded-full p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                dopamineScore >= 75
                  ? 'bg-emerald-500'
                  : dopamineScore >= 45
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
              }`}
              style={{ width: `${dopamineScore}%` }}
            />
          </div>
          <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
            <span>Burnout (0)</span>
            <span>Balanced (50)</span>
            <span>Flow (100)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
