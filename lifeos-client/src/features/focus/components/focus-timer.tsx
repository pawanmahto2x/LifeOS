'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusApiService } from '../services/focus.service';
import { taskApiService } from '@/features/tasks/services/task.service';
import { FocusSummaryDialog } from './focus-summary-dialog';
import { FocusSession } from '@/types/focus.types';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckSquare,
  ShieldAlert,
  X,
  Monitor,
  BookOpen,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { emergencyModeApiService } from '@/features/emergency-mode/services/emergency-mode.service';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';
type DisciplineProfile = 'strict' | 'software' | 'emergency';

export function FocusTimer() {
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [disciplineProfile, setDisciplineProfile] = useState<DisciplineProfile>('strict');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusGuardAlert, setFocusGuardAlert] = useState<{
    type: 'reset' | 'warning';
    awaySeconds: number;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftAtRef = useRef<number | null>(null);
  const originalTitleRef = useRef<string>('');

  // Auto-switch to Emergency mode if URL query contains mode=emergency
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'emergency') {
        setDisciplineProfile('emergency');
      }
    }
  }, []);

  // Fetch active user tasks to attach
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'focus-selector'],
    queryFn: async () => {
      const res = await taskApiService.getTasks({ status: 'Pending', limit: 20 });
      return res.data;
    },
  });

  const tasks = tasksData?.tasks || [];

  // Calculate target duration in seconds
  const getTargetDurationSeconds = (m: TimerMode, customM: number) => {
    switch (m) {
      case 'pomodoro':
        return 25 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
      case 'custom':
        return customM * 60;
      default:
        return 25 * 60;
    }
  };

  const totalDurationSeconds = getTargetDurationSeconds(mode, customMinutes);

  const startMutation = useMutation({
    mutationFn: async () => {
      const durationMinutes = Math.round(totalDurationSeconds / 60);
      const res = await focusApiService.startSession({
        taskId: selectedTaskId || undefined,
        duration: durationMinutes,
      });
      return res.data;
    },
    onSuccess: (session) => {
      setActiveSession(session ?? null);
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
      queryClient.invalidateQueries({ queryKey: ['focus'] });
    },
  });

  const requestNotificationPermission = () => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().catch(() => {});
    }
  };

  const triggerDesktopNotification = () => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification('🎉 Focus Block Completed! • LifeOS', {
          body: 'Awesome work! Your scheduled focus session has finished.',
          icon: '/favicon.ico',
        });
      } catch {
        // Silently catch if desktop notifications are unsupported or blocked
      }
    }
  };

  const playCompletionSound = () => {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const now = audioCtx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Note 2: G#5 (830.61 Hz)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(830.61, now + 0.25);
      gain2.gain.setValueAtTime(0.25, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.2);
    } catch {
      // Audio playback silently ignored if blocked by browser autoplay policy
    }
  };

  // Countdown effect with wall-clock drift compensation (handles screen-off, background tabs & power save)
  useEffect(() => {
    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      timerRef.current = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));

        if (diff <= 0) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          targetEndTimeRef.current = null;
          setTimeLeft(0);
          if (disciplineProfile === 'emergency') {
            emergencyModeApiService.disable().catch(() => {});
            queryClient.invalidateQueries({ queryKey: ['emergency-mode-status'] });
          }
          playCompletionSound();
          triggerDesktopNotification();
          setIsSummaryOpen(true);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, disciplineProfile]);

  // Capture original page title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      originalTitleRef.current = document.title || 'LifeOS';
    }
  }, []);

  // Focus Guard: Auto-detect tab switch & window minimization
  useEffect(() => {
    if (!isRunning) {
      if (typeof document !== 'undefined' && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
      leftAtRef.current = null;
      return;
    }

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (!document.hidden) {
      document.title =
        disciplineProfile === 'emergency'
          ? `🚨 (${formatted}) CRISIS LOCKDOWN • LifeOS`
          : disciplineProfile === 'software'
            ? `💻 (${formatted}) Deep Work • LifeOS`
            : `(${formatted}) Focus Mode • LifeOS`;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from LifeOS
        leftAtRef.current = Date.now();
        if (disciplineProfile === 'emergency') {
          document.title = '🚨 CRISIS LOCKDOWN BREACHED! • LifeOS';
          setDistractions((prev) => prev + 1);
        } else if (disciplineProfile === 'strict') {
          document.title = '⚠️ Return to Focus! • LifeOS';
          setDistractions((prev) => prev + 1);
        } else {
          document.title = `💻 (${formatted}) Deep Work • LifeOS`;
        }
      } else {
        // User returned to LifeOS tab
        if (leftAtRef.current) {
          const awaySeconds = Math.round((Date.now() - leftAtRef.current) / 1000);
          leftAtRef.current = null;

          if (disciplineProfile === 'emergency') {
            if (awaySeconds >= 30) {
              // Away for 30s or more in emergency lockdown: Reset timer back to start!
              handleReset();
              setFocusGuardAlert({
                type: 'reset',
                awaySeconds,
              });
            } else if (awaySeconds >= 2) {
              setFocusGuardAlert({
                type: 'warning',
                awaySeconds,
              });
            }
          } else if (disciplineProfile === 'strict') {
            if (awaySeconds >= 60) {
              // Away for 60 seconds or more in strict mode: Reset timer back to start!
              handleReset();
              setFocusGuardAlert({
                type: 'reset',
                awaySeconds,
              });
            } else if (awaySeconds >= 2) {
              // Away for under 60 seconds in strict mode: Log as distraction
              setFocusGuardAlert({
                type: 'warning',
                awaySeconds,
              });
            }
          }
        }
        document.title =
          disciplineProfile === 'emergency'
            ? `🚨 (${formatted}) CRISIS LOCKDOWN • LifeOS`
            : disciplineProfile === 'software'
              ? `💻 (${formatted}) Deep Work • LifeOS`
              : `(${formatted}) Focus Mode • LifeOS`;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (typeof document !== 'undefined' && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [isRunning, timeLeft, disciplineProfile]);

  const handleModeChange = (newMode: TimerMode) => {
    if (isRunning) return;
    setMode(newMode);
    targetEndTimeRef.current = null;
    setTimeLeft(getTargetDurationSeconds(newMode, customMinutes));
  };

  const handleCustomMinutesChange = (mins: number) => {
    if (isRunning) return;
    setCustomMinutes(mins);
    if (mode === 'custom') {
      targetEndTimeRef.current = null;
      setTimeLeft(mins * 60);
    }
  };

  const handleStart = () => {
    requestNotificationPermission();
    targetEndTimeRef.current = Date.now() + timeLeft * 1000;
    if (disciplineProfile === 'emergency') {
      emergencyModeApiService.enable().catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['emergency-mode-status'] });
    }
    if (!activeSession && mode !== 'shortBreak' && mode !== 'longBreak') {
      startMutation.mutate();
    } else {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
  };

  const handleStop = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    if (disciplineProfile === 'emergency') {
      emergencyModeApiService.disable().catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['emergency-mode-status'] });
    }
    if (activeSession) {
      setIsSummaryOpen(true);
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setActiveSession(null);
    setDistractions(0);
    setTimeLeft(getTargetDurationSeconds(mode, customMinutes));
    if (disciplineProfile === 'emergency') {
      emergencyModeApiService.disable().catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['emergency-mode-status'] });
    }
    if (typeof document !== 'undefined' && originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
  };

  const handleDistraction = () => {
    if (!isRunning) return;
    setDistractions((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = ((totalDurationSeconds - timeLeft) / totalDurationSeconds) * 100;
  const strokeDashoffset = 565.48 - (565.48 * progress) / 100;

  return (
    <div
      ref={containerRef}
      className={`border-border bg-card rounded-3xl border p-8 shadow-sm transition-all ${
        disciplineProfile === 'emergency'
          ? 'border-rose-500/50 ring-1 shadow-rose-500/5 ring-rose-500/20'
          : ''
      } ${
        isFullscreen
          ? 'bg-background fixed inset-0 z-50 flex flex-col items-center justify-center rounded-none p-12'
          : ''
      }`}
    >
      {/* Focus Guard Notification Alert */}
      {focusGuardAlert && (
        <div
          className={`mb-6 flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-xs shadow-sm transition-all ${
            focusGuardAlert.type === 'reset'
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-500'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-bold">
                {focusGuardAlert.type === 'reset'
                  ? disciplineProfile === 'emergency'
                    ? 'Crisis Lockdown Breached (> 30s Away)'
                    : 'Focus Block Reset (> 1 Min Away)'
                  : 'Tab Switch Detected (+1 Distraction)'}
              </p>
              <p className="mt-1 leading-relaxed opacity-95">
                {focusGuardAlert.type === 'reset'
                  ? disciplineProfile === 'emergency'
                    ? `You left LifeOS for ${focusGuardAlert.awaySeconds} seconds while under Crisis Lockdown. The timer has been reset to keep your focus unbroken.`
                    : `You left LifeOS for ${focusGuardAlert.awaySeconds} seconds (exceeding the 1-minute limit). The timer has been reset to the start point so your focus discipline remains authentic.`
                  : `You were away from the focus tab for ${focusGuardAlert.awaySeconds} seconds. Stay locked in to maintain your flow state!`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFocusGuardAlert(null)}
            className="hover:bg-foreground/10 cursor-pointer rounded-lg p-1 transition-colors"
            title="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="mb-8 flex w-full items-center justify-between">
        {/* Mode Selector Tabs */}
        <div className="bg-muted/50 border-border/50 flex rounded-2xl border p-1">
          {(
            [
              { key: 'pomodoro', label: 'Pomodoro (25m)' },
              { key: 'shortBreak', label: 'Short Break (5m)' },
              { key: 'longBreak', label: 'Long Break (15m)' },
              { key: 'custom', label: 'Custom' },
            ] as { key: TimerMode; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => handleModeChange(t.key)}
              disabled={isRunning}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                mode === t.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground disabled:opacity-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={toggleFullscreen}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl p-2 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Custom Duration Slider & Presets if Custom mode */}
      {mode === 'custom' && !isRunning && (
        <div className="mx-auto mb-6 max-w-sm text-center">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs">
            <span>Select Duration</span>
            <span className="text-primary font-bold">{customMinutes} minutes</span>
          </div>

          <div className="mb-3 flex flex-wrap justify-center gap-1.5">
            {[1, 15, 25, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleCustomMinutesChange(mins)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  customMinutes === mins
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground border'
                }`}
              >
                {mins === 1 ? '1m (Test)' : `${mins}m`}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="1"
            max="120"
            step="1"
            value={customMinutes}
            onChange={(e) => handleCustomMinutesChange(Number(e.target.value))}
            className="accent-primary w-full cursor-pointer"
          />
          <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
            <span>1 min</span>
            <span>30 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
        </div>
      )}

      {/* Discipline Profile Switcher (Strict Study vs Software vs Crisis Lockdown) */}
      <div className="mx-auto mb-4 max-w-md text-center">
        <div className="bg-muted/40 border-border/60 inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border p-1 shadow-2xs">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => setDisciplineProfile('strict')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              disciplineProfile === 'strict'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            } ${isRunning ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Strict Study</span>
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => setDisciplineProfile('software')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              disciplineProfile === 'software'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            } ${isRunning ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Creative Flow</span>
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => setDisciplineProfile('emergency')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              disciplineProfile === 'emergency'
                ? 'border border-rose-500/30 bg-rose-500/15 text-rose-600 shadow-2xs dark:text-rose-400'
                : 'text-muted-foreground hover:text-foreground'
            } ${isRunning ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span>🚨 Crisis Lockdown</span>
          </button>
        </div>
        <p className="text-muted-foreground mt-1 text-[11px]">
          {disciplineProfile === 'strict' &&
            '🛡️ Strict Study: Leaving tab counts as distraction; > 1 min away resets timer.'}
          {disciplineProfile === 'software' &&
            '💻 Creative Flow: Edit in VS Code, Premiere, CapCut! No false penalties & alerts when done.'}
          {disciplineProfile === 'emergency' &&
            '🚨 Crisis Lockdown: Strict deadline emergency. Suppresses distractions & locks tab. > 30s away resets timer!'}
        </p>
      </div>

      {/* Circular Timer Display */}
      <div className="relative my-4 flex flex-col items-center justify-center">
        <svg className="h-64 w-64 -rotate-90 transform" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            className="stroke-muted"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            className={`transition-all duration-1000 ${
              disciplineProfile === 'emergency'
                ? 'stroke-rose-500'
                : mode === 'pomodoro' || mode === 'custom'
                  ? 'stroke-primary'
                  : 'stroke-emerald-500'
            }`}
            strokeWidth="8"
            strokeDasharray="565.48"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-foreground font-mono text-5xl font-bold tracking-tighter sm:text-6xl">
            {formattedTime}
          </span>
          <span className="text-muted-foreground mt-2 text-xs font-semibold tracking-widest uppercase">
            {isRunning
              ? disciplineProfile === 'emergency'
                ? '🚨 Crisis Lockdown Active'
                : 'In Flow State'
              : 'Paused / Ready'}
          </span>
        </div>
      </div>

      {/* Task Attachment Selector */}
      {!isFullscreen && (
        <div className="mx-auto my-6 w-full max-w-md">
          <label className="text-muted-foreground mb-2 block text-center text-xs font-medium tracking-wider uppercase">
            Focusing on Task:
          </label>
          <div className="relative">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              disabled={isRunning}
              className="bg-background border-border text-foreground focus:ring-primary/20 focus:border-primary w-full appearance-none rounded-xl border px-4 py-2.5 text-xs transition-all focus:ring-2 focus:outline-none disabled:opacity-60"
            >
              <option value="">None (General Deep Work)</option>
              {tasks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title} ({t.priority})
                </option>
              ))}
            </select>
            <CheckSquare className="text-muted-foreground pointer-events-none absolute top-3 right-3.5 h-4 w-4" />
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="my-6 flex items-center justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={startMutation.isPending}
            className="bg-primary text-primary-foreground flex h-14 w-14 scale-100 items-center justify-center rounded-2xl shadow-lg transition-all hover:opacity-90 active:scale-95"
            title="Start Focus"
          >
            <Play className="ml-0.5 h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex h-14 w-14 scale-100 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95"
            title="Pause Focus"
          >
            <Pause className="h-6 w-6" />
          </button>
        )}

        <button
          onClick={handleStop}
          disabled={!isRunning && timeLeft === totalDurationSeconds}
          className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground flex h-12 w-12 items-center justify-center rounded-2xl border transition-all disabled:opacity-40"
          title="Stop & Finish"
        >
          <Square className="h-5 w-5" />
        </button>

        <button
          onClick={handleReset}
          disabled={isRunning}
          className="border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground flex h-12 w-12 items-center justify-center rounded-2xl border transition-all disabled:opacity-40"
          title="Reset Timer"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Distraction Counter Widget */}
      {isRunning && (
        <div className="border-border/50 animate-in fade-in mx-auto flex max-w-sm items-center justify-center gap-3 border-t pt-4 duration-200">
          <button
            onClick={handleDistraction}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Log Distraction (+1)</span>
          </button>
          <span className="bg-muted text-foreground rounded-xl px-3 py-2 text-xs font-bold">
            {distractions} logged
          </span>
        </div>
      )}

      {/* Summary modal */}
      <FocusSummaryDialog
        isOpen={isSummaryOpen}
        onClose={() => {
          setIsSummaryOpen(false);
          handleReset();
        }}
        session={activeSession}
        distractions={distractions}
      />
    </div>
  );
}
