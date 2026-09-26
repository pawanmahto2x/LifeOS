'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Waves, X, CheckCircle2, Wind, Sparkles } from 'lucide-react';

interface UrgeSurferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function UrgeSurferModal({ isOpen, onClose, onComplete }: UrgeSurferModalProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(90);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(90);
      setIsActive(true);
      setIsFinished(false);
      setBreathPhase('Inhale');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      setIsActive(false);
    }
  }, [isOpen]);

  // 90-Second Main Timer
  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setIsFinished(true);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft, onComplete]);

  // 4-4-4 Box Breathing Cycle (12 seconds total per cycle)
  useEffect(() => {
    if (isActive) {
      let cycleSecond = 0;
      breathTimerRef.current = setInterval(() => {
        cycleSecond = (cycleSecond + 1) % 12;
        if (cycleSecond < 4) {
          setBreathPhase('Inhale');
        } else if (cycleSecond < 8) {
          setBreathPhase('Hold');
        } else {
          setBreathPhase('Exhale');
        }
      }, 1000);
    }

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [isActive]);

  if (!isOpen) return null;

  // Neuro-guidance based on craving wave stage
  let stageTitle = 'Wave Rising (0-30s)';
  let stageDescription =
    'Your dopamine receptors are triggering a reflex to scroll. Do not fight the thought — just acknowledge the urge like a wave in the ocean.';
  if (secondsLeft <= 30) {
    stageTitle = 'Wave Collapsing (60-90s)';
    stageDescription =
      'The neurochemical spike has burned out. Your prefrontal cortex has regained full authority. Notice how the craving has lost its grip.';
  } else if (secondsLeft <= 60) {
    stageTitle = 'Wave Peak (30-60s)';
    stageDescription =
      'This is the highest intensity point. Observe any restlessness in your fingers or chest. Breathe through it — it physically cannot last more than a minute.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="border-border/80 bg-card relative w-full max-w-lg overflow-hidden rounded-3xl border p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-5 right-5 rounded-full p-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {!isFinished ? (
          <div className="flex flex-col items-center text-center">
            {/* Header Badge */}
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-500">
              <Waves className="h-3.5 w-3.5 animate-pulse" />
              <span>90-Second Urge Surfer</span>
            </div>

            <h2 className="text-foreground text-2xl font-black tracking-tight">
              Ride Out The Craving Wave
            </h2>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Scientific research proves dopamine cravings peak and collapse in 90 seconds.
            </p>

            {/* Breathing Animation Sphere */}
            <div className="relative my-8 flex h-48 w-48 items-center justify-center">
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full bg-cyan-500/15 transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-110 opacity-70'
                    : breathPhase === 'Hold'
                      ? 'scale-105 opacity-50'
                      : 'scale-90 opacity-20'
                }`}
              />
              {/* Core Sphere */}
              <div
                className={`flex h-36 w-36 flex-col items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-teal-400 text-white shadow-lg transition-transform duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-105'
                    : breathPhase === 'Hold'
                      ? 'scale-100'
                      : 'scale-95'
                }`}
              >
                <Wind className="mb-1 h-6 w-6" />
                <span className="text-xs font-bold tracking-wider uppercase">{breathPhase}</span>
                <span className="text-2xl font-black">{secondsLeft}s</span>
              </div>
            </div>

            {/* Stage Guidance Box */}
            <div className="bg-muted/40 border-border/60 w-full rounded-2xl border p-4 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-500">
                <span>{stageTitle}</span>
                <span>{90 - secondsLeft}s Elapsed</span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                {stageDescription}
              </p>
            </div>
          </div>
        ) : (
          /* Victory Screen */
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h2 className="text-foreground text-2xl font-black">Urge Defeated!</h2>
            <p className="text-muted-foreground mt-1.5 max-w-sm text-xs">
              You resisted the impulse, protected your dopamine baseline, and reclaimed control of
              your attention.
            </p>

            <div className="my-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-500">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>+1 Urge Conquered &amp; +5 Dopamine Clarity Points earned!</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl py-2.5 text-xs font-bold transition-colors"
            >
              Return to LifeOS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
