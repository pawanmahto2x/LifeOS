'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { digitalWellbeingService } from '@/features/digital-wellbeing/services/digital-wellbeing.service';
import { Clock, Shield, Activity, Timer, CheckCircle, XCircle } from 'lucide-react';
import { IUsageLog, IBudget, IUrgeLog } from '@/types/digital-wellbeing.types';

export default function DigitalDetoxPage() {
  const [activeTab, setActiveTab] = useState<'journal' | 'urge' | 'detox'>('journal');

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Digital Wellbeing</h1>
        <p className="text-muted-foreground text-sm">
          Monitor usage, set budgets, and intervene on digital urges.
        </p>
      </div>

      <div className="border-border/80 flex border-b">
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'journal' ? 'border-primary text-primary border-b-2' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Usage Journal
        </button>
        <button
          onClick={() => setActiveTab('urge')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'urge' ? 'border-primary text-primary border-b-2' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Interrupt Scroll
        </button>
        <button
          onClick={() => setActiveTab('detox')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'detox' ? 'border-primary text-primary border-b-2' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Detox Sessions
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'journal' && <UsageJournalTab />}
        {activeTab === 'urge' && <UrgeInterventionTab />}
        {activeTab === 'detox' && <DetoxSessionTab />}
      </div>
    </div>
  );
}

function UsageJournalTab() {
  const queryClient = useQueryClient();
  const [app, setApp] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [targetHours, setTargetHours] = useState('');

  const { data: summaryResponse, isLoading } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => digitalWellbeingService.getUsageSummary(),
  });

  const logUsageMutation = useMutation({
    mutationFn: (data: Omit<IUsageLog, 'id' | 'createdAt'>) =>
      digitalWellbeingService.logUsage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-summary'] });
      setApp('');
      setDuration('');
      setCategory('');
      setReason('');
    },
  });

  const setBudgetMutation = useMutation({
    mutationFn: (data: Omit<IBudget, 'id'>) => digitalWellbeingService.setBudget(data),
    onSuccess: () => {
      setTargetHours('');
      alert('Budget updated');
    },
  });

  const summary = summaryResponse?.data;
  const totalMinutes = summary?.totalDurationMinutes || 0;
  // Fallback to a hardcoded target if not provided by backend summary
  const targetMinutes = 4 * 60; // 4 hours
  const progressPercent = Math.min((totalMinutes / targetMinutes) * 100, 100);

  return (
    <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-300 md:grid-cols-2">
      <div className="space-y-6">
        <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
          <h2 className="text-foreground mb-4 flex items-center gap-2 text-sm font-bold tracking-tight">
            <Activity className="text-primary h-4 w-4" /> Today's Usage
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Used: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </span>
              <span className="text-muted-foreground">
                Budget: {Math.floor(targetMinutes / 60)}h
              </span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full ${progressPercent >= 100 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
          <h2 className="text-foreground mb-4 text-sm font-bold tracking-tight">
            Log Manual Usage
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              logUsageMutation.mutate({ app, durationMinutes: Number(duration), category, reason });
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                App/Site
              </label>
              <input
                type="text"
                value={app}
                onChange={(e) => setApp(e.target.value)}
                className="border-border/80 mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Minutes
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="border-border/80 mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border-border/80 mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-sm"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Social">Social</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Reason / Notes
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="border-border/80 mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={logUsageMutation.isPending}
              className="bg-primary text-primary-foreground w-full rounded-md py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              Log Usage
            </button>
          </form>
        </div>
      </div>

      <div className="border-border/80 bg-card h-[500px] overflow-y-auto rounded-2xl border p-5 shadow-2xs">
        <h2 className="text-foreground mb-4 text-sm font-bold tracking-tight">Recent Logs</h2>
        {isLoading ? (
          <div className="text-muted-foreground text-xs">Loading...</div>
        ) : !summary?.logs || summary.logs.length === 0 ? (
          <div className="border-border/80 rounded-xl border border-dashed p-6 text-center">
            <Activity className="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-foreground text-sm font-medium">No usage logged</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Start tracking your digital habits.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.logs.map((log, i) => (
              <div
                key={i}
                className="border-border/50 bg-muted/20 flex items-center justify-between rounded-xl border p-3"
              >
                <div>
                  <p className="text-foreground text-sm font-medium">{log.app}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {log.category} • {log.reason}
                  </p>
                </div>
                <div className="text-right">
                  <span className="border-border/80 bg-card text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                    {log.durationMinutes}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UrgeInterventionTab() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showOutcome, setShowOutcome] = useState(false);

  const logUrgeMutation = useMutation({
    mutationFn: (outcome: string) => digitalWellbeingService.logUrgeIntervention({ outcome }),
    onSuccess: () => {
      setShowOutcome(false);
      setIsActive(false);
      setTimeLeft(60);
      alert('Outcome logged. Good job!');
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setShowOutcome(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setIsActive(true);
    setTimeLeft(60);
    setShowOutcome(false);
  };

  const handleOutcome = (outcome: string) => {
    logUrgeMutation.mutate(outcome);
  };

  return (
    <div className="animate-in fade-in border-border/80 bg-card flex min-h-[400px] flex-col items-center justify-center rounded-2xl border p-10 shadow-2xs duration-300">
      {!isActive && !showOutcome && (
        <div className="space-y-6 text-center">
          <Shield className="text-primary mx-auto mb-4 h-16 w-16 opacity-80" />
          <h2 className="text-foreground text-xl font-bold">Interrupt the Scroll</h2>
          <p className="text-muted-foreground mx-auto max-w-md text-sm">
            Feeling the urge to endlessly scroll? Take a 60-second reset before you open that app.
            Let the urge pass.
          </p>
          <button
            onClick={handleStart}
            className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-medium shadow-md transition-all hover:scale-105 hover:opacity-90"
          >
            Start 60-second Reset
          </button>
        </div>
      )}

      {isActive && !showOutcome && (
        <div className="space-y-4 text-center">
          <h2 className="text-foreground text-2xl font-bold">Breathe...</h2>
          <div className="text-primary text-7xl font-light tracking-tighter tabular-nums">
            {timeLeft}
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            Just sit with the urge. Notice it without acting on it.
          </p>
        </div>
      )}

      {showOutcome && (
        <div className="w-full max-w-md space-y-6 text-center">
          <h2 className="text-foreground text-xl font-bold">What would you rather do?</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            The 60 seconds are up. You have a choice.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Start a Focus Session', val: 'focus' },
              { label: 'Journal my thoughts', val: 'journal' },
              { label: 'Meditate for 5 mins', val: 'meditate' },
              { label: 'Continue scrolling anyway', val: 'scrolled' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleOutcome(opt.val)}
                disabled={logUrgeMutation.isPending}
                className="border-border/80 hover:border-primary/40 text-foreground flex items-center justify-between rounded-xl border p-4 text-sm font-medium transition-all hover:shadow-xs"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetoxSessionTab() {
  const [minutes, setMinutes] = useState('30');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showEndPrompt, setShowEndPrompt] = useState(false);
  const [endReason, setEndReason] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startDetox = () => {
    const mins = parseInt(minutes);
    if (!isNaN(mins) && mins > 0) {
      setTimeLeft(mins * 60);
      setIsActive(true);
      setShowEndPrompt(false);
    }
  };

  const stopDetoxEarly = () => {
    setShowEndPrompt(true);
  };

  const confirmEnd = () => {
    // Optionally log this to backend if needed
    setIsActive(false);
    setShowEndPrompt(false);
    setEndReason('');
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-in fade-in mx-auto max-w-xl space-y-6 duration-300">
      <div className="border-border/80 bg-card rounded-2xl border p-6 text-center shadow-2xs">
        {!isActive ? (
          <div className="space-y-6">
            <Timer className="text-muted-foreground mx-auto h-12 w-12" />
            <div>
              <h2 className="text-foreground text-lg font-bold">Manual Detox Session</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Put your devices away and commit to offline time.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <select
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="border-border/80 rounded-lg border bg-transparent px-4 py-2 text-sm"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="120">2 Hours</option>
                <option value="240">4 Hours</option>
              </select>
              <button
                onClick={startDetox}
                className="bg-primary text-primary-foreground rounded-lg px-6 py-2 text-sm font-medium hover:opacity-90"
              >
                Start Detox
              </button>
            </div>
          </div>
        ) : !showEndPrompt ? (
          <div className="space-y-6">
            <h2 className="text-foreground text-lg font-bold">Detox in Progress</h2>
            <div className="text-primary text-6xl font-light tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <p className="text-muted-foreground text-sm">Stay strong. Don't touch the phone.</p>
            <button
              onClick={stopDetoxEarly}
              className="border-border/80 hover:bg-muted text-foreground rounded-lg border px-6 py-2 text-sm font-medium"
            >
              End Early
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-foreground text-lg font-bold">Why are you ending early?</h2>
            <input
              type="text"
              value={endReason}
              onChange={(e) => setEndReason(e.target.value)}
              placeholder="Be honest with yourself..."
              className="border-border/80 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowEndPrompt(false)}
                className="border-border/80 hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium"
              >
                Nevermind, keep going
              </button>
              <button
                onClick={confirmEnd}
                className="bg-destructive text-destructive-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
