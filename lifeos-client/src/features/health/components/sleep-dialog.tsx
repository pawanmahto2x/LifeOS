'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { healthApiService } from '../services/health.service';
import { SleepQuality } from '@/types/health.types';
import { X, Moon, Clock, Sparkles } from 'lucide-react';

interface SleepDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLEEP_PRESETS = [
  { label: '6h', hours: 6, bed: '01:00', wake: '07:00' },
  { label: '6.5h', hours: 6.5, bed: '00:30', wake: '07:00' },
  { label: '7h', hours: 7, bed: '00:00', wake: '07:00' },
  { label: '7.5h', hours: 7.5, bed: '23:30', wake: '07:00' },
  { label: '8h', hours: 8, bed: '23:00', wake: '07:00' },
  { label: '8.5h', hours: 8.5, bed: '22:30', wake: '07:00' },
  { label: '9h', hours: 9, bed: '22:00', wake: '07:00' },
];

const QUALITIES: { value: SleepQuality; label: string; emoji: string }[] = [
  { value: 'Poor', label: 'Poor', emoji: '😴' },
  { value: 'Fair', label: 'Fair', emoji: '😐' },
  { value: 'Good', label: 'Good', emoji: '😊' },
  { value: 'Excellent', label: 'Excellent', emoji: '🌟' },
];

export function SleepDialog({ isOpen, onClose }: SleepDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Time state (default 11:00 PM to 07:00 AM = 8 hours)
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<SleepQuality>('Good');
  const [notes, setNotes] = useState('');
  const [activePreset, setActivePreset] = useState<number | null>(8);

  if (!isOpen) return null;

  // Calculate duration between bedtime and wake time
  const calculateDuration = (bed: string, wake: string) => {
    const [bedH, bedM] = bed.split(':').map(Number);
    const [wakeH, wakeM] = wake.split(':').map(Number);

    let minutes = wakeH * 60 + wakeM - (bedH * 60 + bedM);
    if (minutes <= 0) {
      minutes += 24 * 60; // Crosses midnight
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return { hours: h, minutes: m, totalMinutes: minutes };
  };

  const duration = calculateDuration(bedtime, wakeTime);

  const handlePresetClick = (preset: (typeof SLEEP_PRESETS)[0]) => {
    setBedtime(preset.bed);
    setWakeTime(preset.wake);
    setActivePreset(preset.hours);
  };

  const handleBedtimeChange = (val: string) => {
    setBedtime(val);
    setActivePreset(null);
  };

  const handleWakeTimeChange = (val: string) => {
    setWakeTime(val);
    setActivePreset(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setServerError(null);

      const [bedH, bedM] = bedtime.split(':').map(Number);
      const [wakeH, wakeM] = wakeTime.split(':').map(Number);

      const now = new Date();
      // Anchor wake time to today
      const wakeDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        wakeH,
        wakeM,
        0,
        0,
      );

      // Determine whether bedtime was yesterday or today
      let bedDate: Date;
      if (bedH >= 12 || bedH > wakeH) {
        // Bedtime in afternoon/night (e.g. 23:00) -> yesterday
        bedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, bedH, bedM, 0, 0);
      } else {
        // Bedtime early morning (e.g. 01:00 AM) -> today
        bedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), bedH, bedM, 0, 0);
      }

      await healthApiService.logSleep({
        sleepTime: bedDate.toISOString(),
        wakeTime: wakeDate.toISOString(),
        quality,
        notes: notes.trim() || undefined,
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

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-foreground text-xl font-semibold">Log Sleep</h2>
            <p className="text-muted-foreground text-xs">Quickly record last night&apos;s rest</p>
          </div>
        </div>

        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-xl border p-3 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Duration Presets */}
          <div>
            <label className="text-muted-foreground mb-1.5 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
              <span>Quick Presets</span>
              <span className="text-primary text-[11px] font-normal lowercase">1-click select</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
              {SLEEP_PRESETS.map((p) => {
                const isSelected = activePreset === p.hours;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetClick(p)}
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
          </div>

          {/* Simple Bedtime and Wake Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                <Clock className="h-3 w-3 text-indigo-500" />
                <span>Fell Asleep</span>
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => handleBedtimeChange(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary block w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-all focus:ring-2 focus:outline-none"
                required
              />
              <span className="text-muted-foreground mt-1 block text-[10px]">
                Last night / evening
              </span>
            </div>

            <div>
              <label className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                <Clock className="h-3 w-3 text-indigo-500" />
                <span>Woke Up</span>
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => handleWakeTimeChange(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary block w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-all focus:ring-2 focus:outline-none"
                required
              />
              <span className="text-muted-foreground mt-1 block text-[10px]">This morning</span>
            </div>
          </div>

          {/* Live Calculated Duration Banner */}
          <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2.5 text-xs">
            <span className="text-muted-foreground font-medium">Total Duration:</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-foreground text-sm font-bold">
                {duration.hours}h {duration.minutes > 0 ? `${duration.minutes}m` : ''}
              </span>
              <span className="text-muted-foreground text-[11px]">
                ({duration.totalMinutes} mins)
              </span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Sleep Quality
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
              placeholder="e.g. Slept deeply, rested, or woke up once"
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
              {isSubmitting ? 'Saving...' : 'Save Sleep'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
