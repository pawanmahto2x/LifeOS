'use client';

import React, { useState } from 'react';
import { Hourglass, TrendingDown, DollarSign, Sparkles, AlertTriangle } from 'lucide-react';

interface LifeClockCardProps {
  todayScreenTimeMinutes?: number;
  dailyGoalMinutes?: number;
}

export function LifeClockCard({
  todayScreenTimeMinutes = 180,
  dailyGoalMinutes = 120,
}: LifeClockCardProps) {
  const [currentAge, setCurrentAge] = useState<number>(22);
  const [hourlyRate, setHourlyRate] = useState<number>(20); // in dollars or currency units
  const [isCurrencyInr, setIsCurrencyInr] = useState<boolean>(true);

  const effectiveDailyHours = Math.max(1, (todayScreenTimeMinutes || 240) / 60);
  const goalDailyHours = Math.max(0.5, (dailyGoalMinutes || 120) / 60);

  // Assumptions:
  // Life expectancy = 78 years
  // Conscious waking hours per day = 16 hours (excluding 8h sleep)
  const remainingLifeYears = Math.max(1, 78 - currentAge);
  const totalWakingHoursRemaining = remainingLifeYears * 365 * 16;

  // Uncontrolled Screen Time trajectory
  const lifetimeScreenHours = remainingLifeYears * 365 * effectiveDailyHours;
  const lifetimeScreenYears = Number((lifetimeScreenHours / (365 * 16)).toFixed(1));

  // LifeOS Target trajectory
  const targetScreenHours = remainingLifeYears * 365 * goalDailyHours;
  const targetScreenYears = Number((targetScreenHours / (365 * 16)).toFixed(1));
  const yearsReclaimed = Number(Math.max(0, lifetimeScreenYears - targetScreenYears).toFixed(1));

  // Financial opportunity cost per year
  const currencySymbol = isCurrencyInr ? '₹' : '$';
  const effectiveRate = isCurrencyInr ? 500 : hourlyRate;
  const wastedAnnualHours = Math.round(effectiveDailyHours * 365);
  const annualEarningPotentialLost = (wastedAnnualHours * effectiveRate).toLocaleString();
  const annualSavedWithGoal = Math.round(
    Math.max(0, effectiveDailyHours - goalDailyHours) * 365 * effectiveRate,
  ).toLocaleString();

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm">
      {/* Background glow accent */}
      <div className="bg-destructive/5 pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl" />
      <div className="bg-primary/5 pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl" />

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Hourglass className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-base font-bold">The Existential Life Clock</h3>
              <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-[10px] font-semibold">
                High Stakes
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              What mindless scrolling actually costs your finite lifetime and career.
            </p>
          </div>
        </div>

        {/* Age & Currency Controls */}
        <div className="bg-muted/40 border-border/60 flex items-center gap-2 rounded-2xl border p-1.5 text-xs">
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-muted-foreground text-[11px]">Age:</span>
            <input
              type="number"
              min={14}
              max={70}
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value) || 22)}
              className="bg-background text-foreground border-border w-12 rounded-lg border px-1.5 py-0.5 text-center font-bold"
            />
          </div>
          <div className="border-border/60 h-4 border-r" />
          <button
            type="button"
            onClick={() => setIsCurrencyInr(!isCurrencyInr)}
            className="text-primary hover:bg-muted/60 rounded-lg px-2 py-0.5 font-semibold transition-colors"
            title="Toggle Currency"
          >
            {isCurrencyInr ? '₹ INR' : '$ USD'}
          </button>
        </div>
      </div>

      {/* Dual Reality Comparison Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Card 1: The Dark Reality */}
        <div className="bg-destructive/5 border-destructive/20 relative rounded-2xl border p-5">
          <div className="text-destructive mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Default Trajectory ({effectiveDailyHours.toFixed(1)}h/day)
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase">Unchecked</span>
          </div>

          <div className="my-3">
            <div className="text-destructive text-3xl font-extrabold tracking-tight">
              {lifetimeScreenYears}{' '}
              <span className="text-foreground/70 text-sm font-normal">Years Lost</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              At your current rate, you will spend{' '}
              <span className="text-foreground font-semibold">
                {lifetimeScreenYears} full conscious years
              </span>{' '}
              of your remaining life staring into a phone screen.
            </p>
          </div>

          <div className="border-destructive/15 text-muted-foreground mt-4 border-t pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                Annual Career Wealth Burn:
              </span>
              <span className="text-destructive font-bold">
                {currencySymbol}
                {annualEarningPotentialLost}/yr
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: The LifeOS Reclaimed Trajectory */}
        <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="mb-2 flex items-center justify-between text-emerald-500">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              LifeOS Disciplined Trajectory ({goalDailyHours.toFixed(1)}h/day)
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase">Reclaimed</span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold tracking-tight text-emerald-500">
              +{yearsReclaimed}{' '}
              <span className="text-foreground/70 text-sm font-normal">Years Given Back</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Adhering to your LifeOS boundary gifts you back{' '}
              <span className="text-foreground font-semibold">{yearsReclaimed} years</span> of real
              relationships, health, and mastery.
            </p>
          </div>

          <div className="text-muted-foreground mt-4 border-t border-emerald-500/15 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                Annual Financial Capital Saved:
              </span>
              <span className="font-bold text-emerald-500">
                +{currencySymbol}
                {annualSavedWithGoal}/yr
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
