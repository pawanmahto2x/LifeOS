'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { habitApiService } from '../services/habit.service';
import { IHabit, HabitFrequency } from '@/types/habit.types';
import { X, Clock, Calendar, Sparkles } from 'lucide-react';

const habitFormSchema = z.object({
  title: z.string().trim().min(1, 'Habit title is required'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly']),
  targetDays: z.number().int().positive().max(365, 'Target duration cannot exceed 365 days'),
  reminderTime: z.string().optional(),
});

type HabitFormData = z.infer<typeof habitFormSchema>;

interface HabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: IHabit | null;
}

const DURATION_PRESETS = [
  { label: '21 Days', days: 21, subtitle: 'Build Habit' },
  { label: '1 Month', days: 30, subtitle: '30 Days' },
  { label: '2 Months', days: 60, subtitle: '60 Days' },
  { label: '3 Months', days: 90, subtitle: '90 Days' },
  { label: '6 Months', days: 180, subtitle: '180 Days' },
  { label: '1 Year', days: 365, subtitle: '365 Days' },
];

function parse24to12(time24?: string) {
  if (!time24) return { hour: '08', minute: '00', period: 'AM', enabled: false };
  const parts = time24.split(':');
  if (parts.length !== 2) return { hour: '08', minute: '00', period: 'AM', enabled: false };
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return {
    hour: h.toString().padStart(2, '0'),
    minute: m,
    period,
    enabled: true,
  };
}

function format12to24(hour: string, minute: string, period: string) {
  let h = parseInt(hour, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute}`;
}

export function HabitDialog({ isOpen, onClose, habitToEdit }: HabitDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Reminder time 12-hour picker state - enabled by default
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState('08');
  const [reminderMinute, setReminderMinute] = useState('00');
  const [reminderPeriod, setReminderPeriod] = useState<'AM' | 'PM'>('AM');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: '',
      description: '',
      frequency: 'Daily',
      targetDays: 30,
      reminderTime: '08:00',
    },
  });

  const currentTargetDays = watch('targetDays');

  // Initialize form when opening dialog or habitToEdit changes
  useEffect(() => {
    if (habitToEdit) {
      reset({
        title: habitToEdit.title,
        description: habitToEdit.description || '',
        frequency: habitToEdit.frequency,
        targetDays: habitToEdit.targetDays,
        reminderTime: habitToEdit.reminderTime || '',
      });

      const parsed = parse24to12(habitToEdit.reminderTime);
      setReminderEnabled(parsed.enabled);
      setReminderHour(parsed.hour);
      setReminderMinute(parsed.minute);
      setReminderPeriod(parsed.period as 'AM' | 'PM');
    } else {
      reset({
        title: '',
        description: '',
        frequency: 'Daily',
        targetDays: 30,
        reminderTime: '08:00',
      });
      setReminderEnabled(true);
      setReminderHour('08');
      setReminderMinute('00');
      setReminderPeriod('AM');
    }
  }, [habitToEdit, reset, isOpen]);

  // Update hidden reminderTime whenever 12-hr state changes
  const updateReminderTimeValue = (enabled: boolean, h: string, m: string, p: 'AM' | 'PM') => {
    if (!enabled) {
      setValue('reminderTime', '');
    } else {
      const time24 = format12to24(h, m, p);
      setValue('reminderTime', time24);
    }
  };

  const handleToggleReminder = (enabled: boolean) => {
    setReminderEnabled(enabled);
    updateReminderTimeValue(enabled, reminderHour, reminderMinute, reminderPeriod);
  };

  const handleTimeChange = (h: string, m: string, p: 'AM' | 'PM') => {
    setReminderHour(h);
    setReminderMinute(m);
    setReminderPeriod(p);
    if (reminderEnabled) {
      updateReminderTimeValue(true, h, m, p);
    }
  };

  const handleQuickPreset = (h: string, m: string, p: 'AM' | 'PM') => {
    setReminderEnabled(true);
    setReminderHour(h);
    setReminderMinute(m);
    setReminderPeriod(p);
    updateReminderTimeValue(true, h, m, p);
  };

  if (!isOpen) return null;

  const onSubmit = async (data: HabitFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const reminder = reminderEnabled
        ? format12to24(reminderHour, reminderMinute, reminderPeriod)
        : undefined;

      const payload = {
        title: data.title.trim(),
        description: data.description?.trim() ? data.description.trim() : undefined,
        frequency: data.frequency as HabitFrequency,
        targetDays: Number(data.targetDays),
        reminderTime: reminder,
      };

      if (habitToEdit) {
        await habitApiService.updateHabit(habitToEdit._id, payload);
      } else {
        await habitApiService.createHabit(payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['habits'] });
      await queryClient.refetchQueries({ queryKey: ['habits'] });
      reset();
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message || 'Failed to save habit.');
      } else {
        setServerError('An unexpected error occurred. Please check that the server is active.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border/80 bg-card text-card-foreground relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6 shadow-2xl transition-all">
        <div className="border-border/80 flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-foreground text-base font-bold">
              {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <p className="text-muted-foreground text-xs">
              Configure habit cycle, duration target, and daily reminders.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {serverError && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive mt-4 rounded-xl border p-3 text-xs">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Habit Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Read 20 pages, Morning Run, Drink 2L water"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
            {errors.title && (
              <p className="text-destructive mt-1 text-xs">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Description <span className="text-[10px] font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="e.g. Drink a large glass of water right after waking up to stay hydrated."
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full resize-none rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
            />
            {errors.description && (
              <p className="text-destructive mt-1 text-xs">{errors.description.message}</p>
            )}
          </div>

          {/* Frequency & Target Duration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                Frequency
              </label>
              <select
                {...register('frequency')}
                className="border-input bg-background text-foreground focus:ring-ring focus:border-primary/40 mt-1 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
              >
                <option value="Daily">Daily (Every Day)</option>
                <option value="Weekly">Weekly (Once per Week)</option>
                <option value="Monthly">Monthly (Once per Month)</option>
              </select>
            </div>

            <div>
              <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                Custom Target Days
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min="1"
                  max="365"
                  {...register('targetDays', { valueAsNumber: true })}
                  className="border-input bg-background text-foreground focus:ring-ring focus:border-primary/40 block w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                />
                <span className="text-muted-foreground absolute top-2.5 right-3 text-xs">
                  {currentTargetDays >= 180
                    ? `~${Math.round(currentTargetDays / 30)} mo`
                    : currentTargetDays >= 30
                      ? `~${Math.round(currentTargetDays / 30)} mo`
                      : 'days'}
                </span>
              </div>
              {errors.targetDays && (
                <p className="text-destructive mt-1 text-xs">{errors.targetDays.message}</p>
              )}
            </div>
          </div>

          {/* Target Duration Preset Chips */}
          <div>
            <label className="text-muted-foreground flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
              <span>Duration Goal Presets</span>
              <span className="text-primary text-[11px] font-normal lowercase">
                Target: {currentTargetDays} days
              </span>
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {DURATION_PRESETS.map((preset) => {
                const isSelected = currentTargetDays === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setValue('targetDays', preset.days, { shouldValidate: true })}
                    className={`cursor-pointer rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-primary/30 ring-1'
                        : 'border-border/80 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <p className="text-xs font-semibold">{preset.label}</p>
                    <p className="text-[10px] opacity-75">{preset.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 12-Hour AM/PM Reminder Time Selector */}
          <div className="border-border/80 bg-muted/20 space-y-3 rounded-2xl border p-3.5">
            <div className="flex items-center justify-between">
              <label className="text-foreground flex items-center space-x-1.5 text-xs font-semibold">
                <Clock className="text-primary h-3.5 w-3.5" />
                <span>Daily Reminder</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggleReminder(!reminderEnabled)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    reminderEnabled
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'border-border/80 bg-muted text-muted-foreground hover:text-foreground border'
                  }`}
                >
                  {reminderEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {reminderEnabled ? (
              <div className="space-y-2.5 pt-1">
                {/* 12-Hour Selector */}
                <div className="flex items-center space-x-2">
                  {/* Hour */}
                  <div className="flex-1">
                    <label className="text-muted-foreground block text-[10px] font-semibold uppercase">
                      Hour
                    </label>
                    <select
                      value={reminderHour}
                      onChange={(e) =>
                        handleTimeChange(e.target.value, reminderMinute, reminderPeriod)
                      }
                      className="border-input bg-background text-foreground focus:ring-ring mt-0.5 block w-full rounded-xl border px-3 py-1.5 text-sm font-medium focus:ring-2 focus:outline-none"
                    >
                      {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(
                        (h) => (
                          <option key={h} value={h}>
                            {parseInt(h, 10)}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <span className="text-muted-foreground pt-4 text-base font-bold">:</span>

                  {/* Minute */}
                  <div className="flex-1">
                    <label className="text-muted-foreground block text-[10px] font-semibold uppercase">
                      Minute
                    </label>
                    <select
                      value={reminderMinute}
                      onChange={(e) =>
                        handleTimeChange(reminderHour, e.target.value, reminderPeriod)
                      }
                      className="border-input bg-background text-foreground focus:ring-ring mt-0.5 block w-full rounded-xl border px-3 py-1.5 text-sm font-medium focus:ring-2 focus:outline-none"
                    >
                      {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(
                        (m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  {/* AM / PM Toggle */}
                  <div>
                    <label className="text-muted-foreground block text-[10px] font-semibold uppercase">
                      Period
                    </label>
                    <div className="border-border/80 bg-background mt-0.5 flex rounded-xl border p-0.5">
                      <button
                        type="button"
                        onClick={() => handleTimeChange(reminderHour, reminderMinute, 'AM')}
                        className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                          reminderPeriod === 'AM'
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTimeChange(reminderHour, reminderMinute, 'PM')}
                        className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                          reminderPeriod === 'PM'
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                    Quick Time Presets
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {[
                      { label: 'Morning (8:00 AM)', h: '08', m: '00', p: 'AM' as const },
                      { label: 'Afternoon (1:00 PM)', h: '01', m: '00', p: 'PM' as const },
                      { label: 'Evening (7:00 PM)', h: '07', m: '00', p: 'PM' as const },
                      { label: 'Night (9:30 PM)', h: '09', m: '30', p: 'PM' as const },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleQuickPreset(item.h, item.m, item.p)}
                        className={`cursor-pointer rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                          reminderHour === item.h &&
                          reminderMinute === item.m &&
                          reminderPeriod === item.p
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border/60 bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                No reminder set. Click &quot;Disabled&quot; above or choose a preset to receive
                scheduled reminders.
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-border/80 flex items-center justify-end space-x-3 border-t pt-4">
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
