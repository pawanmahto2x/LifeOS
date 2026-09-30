'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthExpansionService } from '@/features/health/services/health-expansion.service';
import { Activity, Brain, Scale, CheckCircle2 } from 'lucide-react';
import { IActivityLog, IBodyMetric, IMindfulnessSession } from '@/types/health-expansion.types';

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Health & Wellness</h1>
          <p className="text-muted-foreground text-sm">
            Track your body metrics, activities, and mindfulness.
          </p>
        </div>
      </div>

      <div className="border-border/80 flex space-x-2 border-b pb-2">
        {['daily', 'body', 'activity', 'mindfulness'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in mt-4 duration-300">
        {activeTab === 'daily' && <DailyCheckins />}
        {activeTab === 'body' && <BodyMetricsTab />}
        {activeTab === 'activity' && <ActivityTab />}
        {activeTab === 'mindfulness' && <MindfulnessTab />}
      </div>
    </div>
  );
}

import { WaterTracker } from '@/features/health/components/water-tracker';
import { SleepTracker } from '@/features/health/components/sleep-tracker';
import { MoodTracker } from '@/features/health/components/mood-tracker';

function DailyCheckins() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <WaterTracker />
        <MoodTracker />
      </div>
      <div>
        <SleepTracker />
      </div>
    </div>
  );
}

function BodyMetricsTab() {
  const queryClient = useQueryClient();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['body-metrics'],
    queryFn: () => healthExpansionService.getBodyMetrics(),
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<IBodyMetric>) => healthExpansionService.logBodyMetrics(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-metrics'] });
      setHeight('');
      setWeight('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!height || !weight) return;

    const h = parseFloat(height);
    const w = parseFloat(weight);
    // Simple BMI calculation: weight (kg) / height (m)^2
    const bmi = w / Math.pow(h / 100, 2);

    mutation.mutate({ height: h, weight: w, bmi: parseFloat(bmi.toFixed(1)) });
  };

  const metrics = metricsData?.data || [];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
        <div className="mb-4 flex items-center space-x-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Scale className="text-primary h-5 w-5" />
          </div>
          <h2 className="text-foreground text-sm font-bold tracking-tight">Log Body Metrics</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="bg-muted border-border/80 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. 175"
              required
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-muted border-border/80 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. 70"
              required
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary text-primary-foreground w-full rounded-lg py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            {mutation.isPending ? 'Logging...' : 'Save Metrics'}
          </button>
        </form>
      </div>

      <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
        <div className="mb-4 flex items-center space-x-3">
          <h2 className="text-foreground text-sm font-bold tracking-tight">Recent Metrics</h2>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            Loading metrics...
          </div>
        ) : metrics.length === 0 ? (
          <div className="border-border/50 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
            <Scale className="text-muted-foreground mb-2 h-8 w-8 opacity-50" />
            <p className="text-muted-foreground text-sm">No body metrics logged yet</p>
            <p className="text-muted-foreground mt-1 text-center text-[11px]">
              Log your height and weight to track your BMI over time.
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
            {metrics.map((m, i) => (
              <div
                key={m.id || i}
                className="border-border/40 bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-xl border p-3 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold">
                    {m.weight} kg, {m.height} cm
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium">
                    BMI: {m.bmi}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityTab() {
  const queryClient = useQueryClient();
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');

  const { data: activityData, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => healthExpansionService.getActivityLogs(),
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<IActivityLog>) => healthExpansionService.logActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setType('');
      setDuration('');
      setCalories('');
      setNotes('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !duration) return;

    mutation.mutate({
      type,
      duration: parseInt(duration, 10),
      calories: calories ? parseInt(calories, 10) : 0,
      notes,
    });
  };

  const activities = activityData?.data || [];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
        <div className="mb-4 flex items-center space-x-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Activity className="text-primary h-5 w-5" />
          </div>
          <h2 className="text-foreground text-sm font-bold tracking-tight">Log Activity</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
              Activity Type
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-muted border-border/80 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. Running, Weightlifting"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                Duration (min)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-muted border-border/80 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="e.g. 45"
                required
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                Calories (optional)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="bg-muted border-border/80 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="e.g. 300"
              />
            </div>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-muted border-border/80 min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="How did it feel?"
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary text-primary-foreground w-full rounded-lg py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            {mutation.isPending ? 'Logging...' : 'Save Activity'}
          </button>
        </form>
      </div>

      <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
        <div className="mb-4 flex items-center space-x-3">
          <h2 className="text-foreground text-sm font-bold tracking-tight">Recent Activities</h2>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="border-border/50 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
            <Activity className="text-muted-foreground mb-2 h-8 w-8 opacity-50" />
            <p className="text-muted-foreground text-sm">No activities logged yet</p>
            <p className="text-muted-foreground mt-1 text-center text-[11px]">
              Get moving and log your first workout!
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
            {activities.map((a, i) => (
              <div
                key={a.id || i}
                className="border-border/40 bg-muted/30 hover:bg-muted/50 flex justify-between rounded-xl border p-3 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold capitalize">{a.type}</div>
                  {a.notes && <div className="text-muted-foreground mt-1 text-xs">{a.notes}</div>}
                  <div className="text-muted-foreground mt-2 text-[11px]">
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <div className="border-border/80 bg-card text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                    {a.duration} min
                  </div>
                  {a.calories ? (
                    <div className="text-muted-foreground text-[10px] font-semibold">
                      {a.calories} kcal
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MindfulnessTab() {
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState<number>(5);
  const [sessionType, setSessionType] = useState('meditation');
  const [moodBefore, setMoodBefore] = useState('');
  const [moodAfter, setMoodAfter] = useState('');

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60);

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['mindfulness'],
    queryFn: () => healthExpansionService.getMindfulnessSessions(),
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<IMindfulnessSession>) =>
      healthExpansionService.logMindfulnessSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindfulness'] });
      setMoodBefore('');
      setMoodAfter('');
      setIsTimerRunning(false);
      setTimeLeft(duration * 60);
    },
  });

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleStartTimer = () => {
    setTimeLeft(duration * 60);
    setIsTimerRunning(true);
  };

  const handleSave = () => {
    mutation.mutate({
      duration,
      sessionType,
      moodBefore,
      moodAfter,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sessions = sessionsData?.data || [];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
        <div className="mb-4 flex items-center space-x-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Brain className="text-primary h-5 w-5" />
          </div>
          <h2 className="text-foreground text-sm font-bold tracking-tight">Mindfulness Session</h2>
        </div>

        {!isTimerRunning && timeLeft === duration * 60 ? (
          <div className="animate-in fade-in space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block text-[11px] font-semibold tracking-wider uppercase">
                Duration
              </label>
              <div className="flex gap-2">
                {[2, 5, 10, 15].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setDuration(m);
                      setTimeLeft(m * 60);
                    }}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${duration === m ? 'border-primary bg-primary/10 text-primary' : 'border-border/80 text-muted-foreground hover:bg-muted'}`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                Mood Before (optional)
              </label>
              <select
                value={moodBefore}
                onChange={(e) => setMoodBefore(e.target.value)}
                className="bg-muted border-border/80 w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select mood...</option>
                <option value="stressed">Stressed</option>
                <option value="anxious">Anxious</option>
                <option value="neutral">Neutral</option>
                <option value="calm">Calm</option>
                <option value="focused">Focused</option>
              </select>
            </div>

            <button
              onClick={handleStartTimer}
              className="bg-primary text-primary-foreground mt-2 w-full rounded-lg py-2 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Start Timer
            </button>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 flex flex-col items-center space-y-6 py-6">
            <div className="text-foreground text-5xl font-bold tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </div>

            {timeLeft === 0 ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 w-full space-y-4">
                <p className="text-primary bg-primary/10 rounded-lg py-2 text-center text-sm font-medium">
                  Session Complete!
                </p>
                <div>
                  <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                    Mood After (optional)
                  </label>
                  <select
                    value={moodAfter}
                    onChange={(e) => setMoodAfter(e.target.value)}
                    className="bg-muted border-border/80 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Select mood...</option>
                    <option value="stressed">Stressed</option>
                    <option value="anxious">Anxious</option>
                    <option value="neutral">Neutral</option>
                    <option value="calm">Calm</option>
                    <option value="focused">Focused</option>
                  </select>
                </div>
                <button
                  onClick={handleSave}
                  disabled={mutation.isPending}
                  className="bg-primary text-primary-foreground w-full rounded-lg py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                >
                  {mutation.isPending ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimeLeft(duration * 60);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Cancel Session
              </button>
            )}
          </div>
        )}
      </div>

      <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
        <div className="mb-4 flex items-center space-x-3">
          <h2 className="text-foreground text-sm font-bold tracking-tight">Recent Sessions</h2>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="border-border/50 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
            <Brain className="text-muted-foreground mb-2 h-8 w-8 opacity-50" />
            <p className="text-muted-foreground text-sm">No sessions logged yet</p>
            <p className="text-muted-foreground mt-1 text-center text-[11px]">
              Take a moment to breathe and log a session.
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
            {sessions.map((s, i) => (
              <div
                key={s.id || i}
                className="border-border/40 bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-xl border p-3 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold capitalize">{s.sessionType}</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {s.moodBefore && s.moodAfter
                      ? `${s.moodBefore} → ${s.moodAfter}`
                      : s.moodBefore || s.moodAfter || 'No mood tracked'}
                  </div>
                  <div className="text-muted-foreground mt-2 text-[11px]">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
                <div className="border-border/80 bg-card text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                  {s.duration} min
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
