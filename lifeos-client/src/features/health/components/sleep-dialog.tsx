'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { healthApiService } from '../services/health.service';
import { SleepQuality } from '@/types/health.types';
import { X, Moon, Clock, Sparkles, Zap } from 'lucide-react';

interface SleepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'night' | 'nap';
}

const NIGHT_PRESETS = [
  { label: '6h', hours: 6, bed: '01:00', wake: '07:00' },
  { label: '6.5h', hours: 6.5, bed: '00:30', wake: '07:00' },
  { label: '7h', hours: 7, bed: '00:00', wake: '07:00' },
  { label: '7.5h', hours: 7.5, bed: '23:30', wake: '07:00' },
  { label: '8h', hours: 8, bed: '23:00', wake: '07:00' },
  { label: '8.5h', hours: 8.5, bed: '22:30', wake: '07:00' },
  { label: '9h', hours: 9, bed: '22:00', wake: '07:00' },
];

const NAP_PRESETS = [
  { label: '20m', minutes: 20, bed: '14:00', wake: '14:20', desc: 'Power Nap' },
  { label: '30m', minutes: 30, bed: '14:00', wake: '14:30', desc: 'Quick Rest' },
  { label: '45m', minutes: 45, bed: '14:00', wake: '14:45', desc: 'Recovery' },
  { label: '1h', minutes: 60, bed: '14:00', wake: '15:00', desc: 'Full Nap' },
  { label: '1.5h', minutes: 90, bed: '14:00', wake: '15:30', desc: 'Full Cycle' },
  { label: '2h', minutes: 120, bed: '14:00', wake: '16:00', desc: 'Deep Rest' },
];

const QUALITIES: { value: SleepQuality; label: string; emoji: string }[] = [
  { value: 'Poor', label: 'Poor', emoji: '😴' },
  { value: 'Fair', label: 'Fair', emoji: '😐' },
  { value: 'Good', label: 'Good', emoji: '😊' },
  { value: 'Excellent', label: 'Excellent', emoji: '🌟' },
];

export function SleepDialog({ isOpen, onClose, initialMode = 'night' }: SleepDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [mode, setMode] = useState<'night' | 'nap'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setServerError(null);
    }
  }, [isOpen, initialMode]);

  // Night state
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [activeNightPreset, setActiveNightPreset] = useState<number | null>(8);

  // Nap state
  const [napStart, setNapStart] = useState('14:00');
  const [napEnd, setNapEnd] = useState('15:00');
  const [activeNapPreset, setActiveNapPreset] = useState<number | null>(60);

  const [quality, setQuality] = useState<SleepQuality>('Good');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Calculate duration
  const calculateDuration = (start: string, end: string, isNap: boolean) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let totalMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (totalMinutes <= 0) {
      if (isNap) {
        totalMinutes = 60; // fallback minimum
      } else {
        totalMinutes += 24 * 60; // crossed midnight
      }
    }
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return { hours: h, minutes: m, totalMinutes };
  };

  const currentDuration =
    mode === 'night'
      ? calculateDuration(bedtime, wakeTime, false)
      : calculateDuration(napStart, napEnd, true);

  const handleNightPreset = (preset: (typeof NIGHT_PRESETS)[0]) => {
    setBedtime(preset.bed);
    setWakeTime(preset.wake);
    setActiveNightPreset(preset.hours);
  };

  const handleNapPreset = (preset: (typeof NAP_PRESETS)[0]) => {
    setNapStart(preset.bed);
    setNapEnd(preset.wake);
    setActiveNapPreset(preset.minutes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setServerError(null);

      const now = new Date();
      let sleepDate: Date;
      let wakeDate: Date;

      if (mode === 'nap') {
        const [startH, startM] = napStart.split(':').map(Number);
        const [endH, endM] = napEnd.split(':').map(Number);

        sleepDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          startH,
          startM,
          0,
          0,
        );
        wakeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM, 0, 0);

        if (wakeDate.getTime() <= sleepDate.getTime()) {
          wakeDate = new Date(sleepDate.getTime() + 60 * 60 * 1000);
        }
      } else {
        const [bedH, bedM] = bedtime.split(':').map(Number);
        const [wakeH, wakeM] = wakeTime.split(':').map(Number);

        wakeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), wakeH, wakeM, 0, 0);

        if (bedH >= 12 || bedH > wakeH) {
          sleepDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
            bedH,
            bedM,
            0,
            0,
          );
        } else {
          sleepDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), bedH, bedM, 0, 0);
        }
      }

      const defaultNote = mode === 'nap' ? 'Daytime Nap' : undefined;
      const finalNotes = notes.trim() || defaultNote;

      await healthApiService.logSleep({
        sleepTime: sleepDate.toISOString(),
        wakeTime: wakeDate.toISOString(),
        quality,
        notes: finalNotes,
      });

      await queryClient.invalidateQueries({ queryKey: ['health-sleep'] });
      await queryClient.invalidateQueries({ queryKey: ['health-summary'] });
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Failed to record sleep session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-card border-border animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl border p-6 shadow-xl duration-200">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 cursor-pointer rounded-lg p-1 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dialog Header */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              mode === 'night'
                ? 'bg-indigo-500/10 text-indigo-500'
                : 'bg-amber-500/10 text-amber-500'
            }`}
          >
            {mode === 'night' ? <Moon className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-foreground text-xl font-semibold">
              {mode === 'night' ? 'Record Night Sleep' : 'Record Daytime Nap'}
            </h2>
            <p className="text-muted-foreground text-xs">
              {mode === 'night'
                ? 'Track duration and rest quality for last night'
                : 'Log a quick power nap or afternoon recovery rest'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="border-border/80 bg-muted/40 mb-4 flex rounded-xl border p-1">
          <button
            type="button"
            onClick={() => setMode('night')}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'night'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Night Sleep</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('nap')}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'nap'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Daytime Nap</span>
          </button>
        </div>

        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-xl border p-3 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="text-muted-foreground mb-1.5 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
              <span>{mode === 'night' ? 'Duration Presets' : 'Nap Presets'}</span>
              <span className="text-primary text-[11px] font-normal lowercase">1-click select</span>
            </label>

            {mode === 'night' ? (
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                {NIGHT_PRESETS.map((p) => {
                  const isSelected = activeNightPreset === p.hours;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleNightPreset(p)}
                      className={`cursor-pointer rounded-xl py-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground border'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {NAP_PRESETS.map((p) => {
                  const isSelected = activeNapPreset === p.minutes;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleNapPreset(p)}
                      className={`cursor-pointer rounded-xl p-2 text-center transition-all ${
                        isSelected
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 ring-2 ring-amber-400/30 dark:text-amber-400'
                          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground border'
                      }`}
                    >
                      <span className="block text-xs font-bold">{p.label}</span>
                      <span className="text-[10px] opacity-75">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                <Clock className="h-3 w-3 text-indigo-500" />
                <span>{mode === 'night' ? 'Fell Asleep' : 'Nap Start'}</span>
              </label>
              <input
                type="time"
                value={mode === 'night' ? bedtime : napStart}
                onChange={(e) => {
                  if (mode === 'night') {
                    setBedtime(e.target.value);
                    setActiveNightPreset(null);
                  } else {
                    setNapStart(e.target.value);
                    setActiveNapPreset(null);
                  }
                }}
                className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary block w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-all focus:ring-2 focus:outline-none"
                required
              />
              <span className="text-muted-foreground mt-1 block text-[10px]">
                {mode === 'night' ? 'Last night / evening' : 'Today afternoon'}
              </span>
            </div>

            <div>
              <label className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                <Clock className="h-3 w-3 text-indigo-500" />
                <span>{mode === 'night' ? 'Woke Up' : 'Nap End'}</span>
              </label>
              <input
                type="time"
                value={mode === 'night' ? wakeTime : napEnd}
                onChange={(e) => {
                  if (mode === 'night') {
                    setWakeTime(e.target.value);
                    setActiveNightPreset(null);
                  } else {
                    setNapEnd(e.target.value);
                    setActiveNapPreset(null);
                  }
                }}
                className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary block w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-all focus:ring-2 focus:outline-none"
                required
              />
              <span className="text-muted-foreground mt-1 block text-[10px]">
                {mode === 'night' ? 'This morning' : 'Woke up today'}
              </span>
            </div>
          </div>

          {/* Live Calculated Duration Banner */}
          <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2.5 text-xs">
            <span className="text-muted-foreground font-medium">
              {mode === 'night' ? 'Total Night Rest:' : 'Nap Duration:'}
            </span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-foreground text-sm font-bold">
                {currentDuration.hours > 0 ? `${currentDuration.hours}h ` : ''}
                {currentDuration.minutes > 0 ? `${currentDuration.minutes}m` : ''}
                {currentDuration.hours === 0 && currentDuration.minutes === 0 ? '0m' : ''}
              </span>
              <span className="text-muted-foreground text-[11px]">
                ({currentDuration.totalMinutes} mins)
              </span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Rest Quality
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {QUALITIES.map((q) => {
                const isSelected = quality === q.value;
                return (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => setQuality(q.value)}
                    className={`cursor-pointer rounded-xl py-2 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground border'
                    }`}
                  >
                    <span className="block text-sm">{q.emoji}</span>
                    <span className="text-[11px] font-semibold">{q.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary w-full rounded-xl border px-3.5 py-2 text-xs transition-all focus:ring-2 focus:outline-none"
              placeholder={
                mode === 'nap'
                  ? 'e.g. 20m quick recharge, felt alert afterward'
                  : 'e.g. Slept deeply, rested, or woke up once'
              }
            />
          </div>

          {/* Footer Actions */}
          <div className="border-border mt-5 flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-xl px-4 py-2 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'nap' ? 'Save Nap' : 'Save Sleep'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
