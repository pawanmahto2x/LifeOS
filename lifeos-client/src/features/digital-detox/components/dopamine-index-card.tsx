'use client';

import React from 'react';
import { Activity, Brain, Zap, Droplets, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DopamineIndexCardProps {
  todayScreenTimeMinutes: number;
  dailyGoalMinutes: number;
  focusMinutesToday: number;
  waterIntakeMl: number;
  completedHabitsCount: number;
  urgesConquered: number;
  appLimitsExceededCount: number;
}

export function DopamineIndexCard({
  todayScreenTimeMinutes = 0,
  dailyGoalMinutes = 120,
  focusMinutesToday = 0,
  waterIntakeMl = 0,
  completedHabitsCount = 0,
  urgesConquered = 0,
  appLimitsExceededCount = 0,
}: DopamineIndexCardProps) {
  // 100% Genuine Calculation based purely on real database actions
  // Neutral calm baseline = 50
  let score = 50;

  // Real Focus: +10 pts per 25m completed focus, max +20 pts
  const focusBoost = Math.min(20, Math.floor((focusMinutesToday / 25) * 10));
  score += focusBoost;

  // Real Hydration: +5 pts per 500ml drank, max +15 pts
  const waterBoost = Math.min(15, Math.floor((waterIntakeMl / 500) * 5));
  score += waterBoost;

  // Real Habits Completed Today: +5 pts per habit, max +15 pts
  const habitBoost = Math.min(15, completedHabitsCount * 5);
  score += habitBoost;

  // Real Urges Surfed & Conquered: +5 pts each, max +15 pts
  const urgeBoost = Math.min(15, urgesConquered * 5);
  score += urgeBoost;

  // Screen Time Penalty: Only if screen time actually exceeds user's daily goal
  let screenPenalty = 0;
  if (dailyGoalMinutes > 0 && todayScreenTimeMinutes > dailyGoalMinutes) {
    const excessMinutes = todayScreenTimeMinutes - dailyGoalMinutes;
    screenPenalty = Math.min(25, Math.floor((excessMinutes / 20) * 5));
    score -= screenPenalty;
  }

  // App Limit Overages: -5 pts per exceeded app limit
  const limitPenalty = Math.min(20, appLimitsExceededCount * 5);
  score -= limitPenalty;

  // Bound score cleanly between 10 and 100
  const finalScore = Math.max(10, Math.min(100, score));

  // Calm, restorative status tiers
  let statusText = 'Resting Baseline';
  let statusColor = 'text-sky-500';
  let badgeBg = 'bg-sky-500/10 text-sky-500 border-sky-500/20';
  let description =
    'Your mind is in a neutral resting state. Complete a focus block, drink water, or tick off a habit to build positive momentum.';

  if (finalScore >= 75) {
    statusText = 'Deep Calm & Focused Flow';
    statusColor = 'text-emerald-500';
    badgeBg = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    description =
      'Outstanding mental clarity. Your attention is grounded, habits are active, and screen distractions are under control.';
  } else if (finalScore >= 55) {
    statusText = 'Balanced & Steady';
    statusColor = 'text-indigo-500';
    badgeBg = 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    description =
      'Healthy cognitive rhythm. You have positive actions logged today with steady attention span.';
  } else if (finalScore < 45) {
    statusText = 'Screen Boundary Needed';
    statusColor = 'text-amber-500';
    badgeBg = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    description =
      'Screen time is running high relative to physical breaks. Take a short 10-minute pause or drink some water to refresh.';
  }

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left Side: Clean Zen Score & Description */}
        <div className="flex items-start gap-5">
          <div className="bg-muted/40 border-border/80 flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border">
            <span className={`text-3xl font-extrabold tracking-tight ${statusColor}`}>
              {finalScore}
            </span>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              / 100
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-foreground text-base font-bold">Dopamine &amp; Focus Balance</h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeBg}`}
              >
                {statusText}
              </span>
            </div>

            <p className="text-muted-foreground max-w-xl text-xs leading-relaxed">{description}</p>

            {/* Real Honest Action Badges (Only shown when > 0) */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-1 text-[11px]">
              <span className="flex items-center gap-1 font-medium">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Focus: {focusMinutesToday}m {focusBoost > 0 && `(+${focusBoost} pts)`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Droplets className="h-3.5 w-3.5 text-sky-500" />
                Water: {waterIntakeMl}ml {waterBoost > 0 && `(+${waterBoost} pts)`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Habits: {completedHabitsCount} {habitBoost > 0 && `(+${habitBoost} pts)`}
              </span>
              {urgesConquered > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                    Urges Resisted: {urgesConquered} (+{urgeBoost} pts)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Peaceful Progress Bar */}
        <div className="w-full shrink-0 md:w-56">
          <div className="text-muted-foreground mb-1.5 flex justify-between text-xs font-medium">
            <span>Cognitive Balance</span>
            <span className={`font-bold ${statusColor}`}>{finalScore}%</span>
          </div>
          <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                finalScore >= 75
                  ? 'bg-emerald-500'
                  : finalScore >= 50
                    ? 'bg-indigo-500'
                    : 'bg-amber-500'
              }`}
              style={{ width: `${finalScore}%` }}
            />
          </div>
          <div className="text-muted-foreground mt-1.5 flex justify-between text-[10px]">
            <span>Calm Baseline</span>
            <span>Flow State</span>
          </div>
        </div>
      </div>
    </div>
  );
}
