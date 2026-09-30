'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApiService } from '@/features/tasks/services/task.service';
import { habitApiService } from '@/features/habits/services/habit.service';
import { healthApiService } from '@/features/health/services/health.service';
import { focusApiService } from '@/features/focus/services/focus.service';
import { dailyMissionApiService } from '@/features/daily-mission/services/daily-mission.service';
import { insightsApiService } from '@/features/insights/services/insights.service';
import { goalService } from '@/features/goals/services/goal.service';
import {
  CheckSquare,
  Repeat,
  Flame,
  Plus,
  ArrowRight,
  Droplet,
  HeartPulse,
  Clock,
  Compass,
  Lightbulb,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'dashboard-preview'],
    queryFn: async () => {
      try {
        const res = await taskApiService.getTasks({ limit: 50 });
        return res.data;
      } catch (err) {
        return null;
      }
    },
  });

  const { data: habitsData, isLoading: isHabitsLoading } = useQuery({
    queryKey: ['habits', 'dashboard-preview'],
    queryFn: async () => {
      try {
        const res = await habitApiService.getHabits({ limit: 5 });
        return res.data;
      } catch (err) {
        return null;
      }
    },
  });

  const { data: healthData, isLoading: isHealthLoading } = useQuery({
    queryKey: ['health-summary', 'dashboard-preview'],
    queryFn: async () => {
      try {
        const res = await healthApiService.getSummary();
        return res.data;
      } catch (err) {
        return null;
      }
    },
  });

  const { data: focusData, isLoading: isFocusLoading } = useQuery({
    queryKey: ['focus', 'dashboard-preview'],
    queryFn: async () => {
      try {
        const res = await focusApiService.getSessions();
        return res.data;
      } catch (err) {
        return null;
      }
    },
  });

  const { data: missionData, isLoading: isMissionLoading } = useQuery({
    queryKey: ['daily-mission', 'today', 'dashboard'],
    queryFn: async () => {
      try {
        const res = await dailyMissionApiService.getTodayMission();
        return res?.data || null;
      } catch (err) {
        return null;
      }
    },
  });

  const { data: patternsData } = useQuery({
    queryKey: ['insights', 'patterns'],
    queryFn: async () => {
      try {
        const res = await insightsApiService.getPatterns();
        return res?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const { data: trendsData } = useQuery({
    queryKey: ['insights', 'trends'],
    queryFn: async () => {
      try {
        const res = await insightsApiService.getTrends();
        return res?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const { data: goalsData, isLoading: isGoalsLoading } = useQuery({
    queryKey: ['goals', 'dashboard-preview'],
    queryFn: async () => {
      try {
        const res = await goalService.getAll();
        return res?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const generateMissionMutation = useMutation({
    mutationFn: async () => {
      try {
        if ((dailyMissionApiService as any).generateMission) {
          await (dailyMissionApiService as any).generateMission();
        }
      } catch (err) {
        console.error(err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-mission', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['daily-mission', 'today', 'dashboard'] });
    },
  });

  const tasks = tasksData?.tasks || [];
  const habits = habitsData?.habits || [];
  const health = healthData;
  const focus = focusData?.analytics;
  const pendingCount = tasks.filter((t: any) => t.status === 'Pending').length;
  const bestStreak = habits.reduce((max: number, h: any) => Math.max(max, h.currentStreak), 0);
  const todayFocusMinutes = focus?.todayFocusMinutes ?? 0;

  const allGoals = Array.isArray(goalsData) ? goalsData : [];
  const activeGoals = allGoals.filter((g: any) => g.status === 'active' || !g.status);
  const topActiveGoal = activeGoals[0] || allGoals[0] || null;
  const nextMilestone = topActiveGoal?.milestones?.find(
    (m: any) => !(m.completed ?? m.isCompleted),
  );

  const priorityWeight: Record<string, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const prioritizedTasks = [...tasks].sort((a: any, b: any) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;
    const weightA = priorityWeight[a.priority] || 0;
    const weightB = priorityWeight[b.priority] || 0;
    if (weightA !== weightB) return weightB - weightA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const firstPattern = patternsData?.[0];
  const topTrends = trendsData?.slice(0, 3) || [];

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* 1. Good Morning Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}, {user?.fullName || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{todayDate}</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/goals"
            className="border-border/80 bg-muted/60 text-foreground hover:bg-muted inline-flex items-center space-x-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Target className="text-primary h-4 w-4" />
            <span>Goals</span>
          </Link>
          <Link
            href="/tasks"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center space-x-2 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Link>
          <Link
            href="/focus"
            className="border-border/80 bg-muted/60 text-foreground hover:bg-muted inline-flex items-center space-x-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Clock className="h-4 w-4" />
            <span>Focus Mode</span>
          </Link>
          <Link
            href="/health"
            className="border-border/80 bg-muted/60 text-foreground hover:bg-muted inline-flex items-center space-x-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <HeartPulse className="h-4 w-4" />
            <span>Health</span>
          </Link>
        </div>
      </div>

      {/* 2. Strategic Goal & Daily Mission Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Mission Card */}
        <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-6 shadow-2xs transition-all duration-200">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <Compass className="text-primary h-5 w-5" />
              <span className="text-foreground text-sm font-bold tracking-tight">
                Today&apos;s Mission
              </span>
            </div>

            {isMissionLoading ? (
              <div className="text-muted-foreground py-4 text-center text-sm">
                Loading mission...
              </div>
            ) : missionData ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {missionData.dayType && (
                    <span className="border-border/80 bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {missionData.dayType}
                    </span>
                  )}
                </div>
                <h3 className="text-foreground text-xl font-bold tracking-tight">
                  {missionData.primaryMission?.title || 'Your Mission for Today'}
                </h3>
                {missionData.supportingGoals && (
                  <p className="text-muted-foreground text-xs">
                    {missionData.supportingGoals.filter((g: any) => g.completed).length} /{' '}
                    {missionData.supportingGoals.length} supporting goals completed
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <Link
                    href="/daily-mission"
                    className="text-primary inline-flex items-center text-xs font-medium hover:underline"
                  >
                    View Full Plan <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/v1/daily-mission/' + missionData._id, {
                          method: 'DELETE',
                          headers: {
                            Authorization: `Bearer ${
                              localStorage.getItem('auth-storage')
                                ? JSON.parse(localStorage.getItem('auth-storage') as string).state
                                    ?.token
                                : ''
                            }`,
                          },
                        });
                        window.location.reload();
                      } catch (e) {}
                    }}
                    className="text-muted-foreground hover:text-destructive text-xs underline"
                  >
                    Reject Plan
                  </button>
                </div>
                <p className="text-muted-foreground border-border/50 mt-2 border-t pt-2 text-[10px] italic">
                  Highlights your highest priorities for today based on existing tasks and habits.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
                <div className="bg-primary/10 text-primary rounded-full p-3">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-bold">No plan generated yet</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Let LifeOS highlight your focus areas for today
                  </p>
                </div>
                <button
                  onClick={() => generateMissionMutation.mutate()}
                  disabled={generateMissionMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {generateMissionMutation.isPending ? 'Generating...' : "Generate Today's Plan"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Strategic Goal & Next Milestone Card */}
        <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-6 shadow-2xs transition-all duration-200">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-indigo-500" />
                <span className="text-foreground text-sm font-bold tracking-tight">
                  Active Strategic Goal
                </span>
              </div>
              <Link href="/goals" className="text-primary text-xs font-medium hover:underline">
                All Goals
              </Link>
            </div>

            {isGoalsLoading ? (
              <div className="text-muted-foreground py-6 text-center text-sm">Loading goal...</div>
            ) : topActiveGoal ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="border-border/80 bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase">
                    {topActiveGoal.category || 'Strategic'}
                  </span>
                  <span className="text-foreground text-xs font-bold">
                    {topActiveGoal.progress}% completed
                  </span>
                </div>

                <div>
                  <h3 className="text-foreground line-clamp-1 text-xl font-bold tracking-tight">
                    {topActiveGoal.title}
                  </h3>
                  {topActiveGoal.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {topActiveGoal.description}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${topActiveGoal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Current Milestone */}
                {nextMilestone ? (
                  <div className="bg-muted/40 border-border/60 rounded-xl border p-3">
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      Current Milestone
                    </span>
                    <p className="text-foreground mt-1 flex items-center gap-2 text-xs font-medium">
                      <span className="bg-primary h-2 w-2 shrink-0 animate-pulse rounded-full" />
                      <span className="line-clamp-1">{nextMilestone.title}</span>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    All milestones completed! Ready to finalize goal.
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/goals/${topActiveGoal._id}`}
                    className="text-primary inline-flex items-center text-xs font-semibold hover:underline"
                  >
                    View Goal & Roadmap <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                  {topActiveGoal.deadline && (
                    <span className="text-muted-foreground text-[11px]">
                      Due{' '}
                      {new Date(topActiveGoal.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center">
                <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-500">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-bold">No active strategic goals</p>
                  <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                    Define your north star. Create a goal and let AI propose milestones, tasks, and
                    habits.
                  </p>
                </div>
                <Link
                  href="/goals"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all"
                >
                  Create Goal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Progress Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Tasks */}
        <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Active Tasks
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-foreground text-3xl font-bold tracking-tight">
                {isTasksLoading ? '...' : pendingCount}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {pendingCount} pending action {pendingCount === 1 ? 'item' : 'items'}
              </p>
              {/* Baseline comparison text as a small colored text below the main value */}
              <p className="text-muted-foreground mt-1 text-[10px]">
                Active tasks compared to usual
              </p>
            </div>
          </div>
          <div className="border-border/70 mt-6 flex items-center justify-between border-t pt-3.5 text-xs">
            <span className="text-muted-foreground">
              {pendingCount === 0 ? 'All caught up' : `${pendingCount} active`}
            </span>
            <Link
              href="/tasks"
              className="text-primary flex items-center space-x-1 font-medium hover:underline"
            >
              <span>View Tasks</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Focus Time */}
        <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Focus Time
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-foreground text-3xl font-bold tracking-tight">
                {isFocusLoading ? '...' : `${todayFocusMinutes}m`}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {focus?.todayCompletedSessions
                  ? `${focus.todayCompletedSessions} completed sessions today`
                  : 'Deep work completed today'}
              </p>
              <p className="text-muted-foreground mt-1 text-[10px]">
                Compared to average daily focus
              </p>
            </div>
          </div>
          <div className="border-border/70 mt-6 flex items-center justify-between border-t pt-3.5 text-xs">
            <span className="text-muted-foreground">
              {todayFocusMinutes > 0 ? 'Flow state active' : 'Ready to start'}
            </span>
            <Link
              href="/focus"
              className="text-primary flex items-center space-x-1 font-medium hover:underline"
            >
              <span>Start Session</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Habits Streak */}
        <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Active Habits
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Repeat className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-foreground text-3xl font-bold tracking-tight">
                {isHabitsLoading ? '...' : (habitsData?.total ?? 0)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {bestStreak > 0 ? `Best active streak: ${bestStreak} days` : 'Zero active streaks'}
              </p>
              <p className="mt-1 text-[10px] text-emerald-500">Maintaining consistency</p>
            </div>
          </div>
          <div className="border-border/70 mt-6 flex items-center justify-between border-t pt-3.5 text-xs">
            <span className="text-muted-foreground">
              {habits.length === 0 ? 'No habits yet' : `${habits.length} active`}
            </span>
            <Link
              href="/habits"
              className="text-primary flex items-center space-x-1 font-medium hover:underline"
            >
              <span>View Habits</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Hydration Card */}
        <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Water Today
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Droplet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-foreground text-3xl font-bold tracking-tight">
                {isHealthLoading ? '...' : `${health?.water?.todayTotalMl ?? 0} ml`}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {health?.water && health.water.progressPercentage > 0
                  ? `${health.water.progressPercentage}% of 2000 ml goal`
                  : '0% completed today'}
              </p>
              <p className="mt-1 text-[10px] text-sky-500">Daily hydration goal tracking</p>
            </div>
          </div>
          <div className="border-border/70 mt-6 flex items-center justify-between border-t pt-3.5 text-xs">
            <span className="text-muted-foreground">Hydration</span>
            <Link
              href="/health"
              className="text-primary flex items-center space-x-1 font-medium hover:underline"
            >
              <span>Log Water</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 & 5. Personal Insight and Quick Journal */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Personal Insight Card */}
        <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-6 shadow-2xs transition-all duration-200">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <span className="text-foreground text-sm font-bold tracking-tight">
                Personal Insight
              </span>
            </div>
            <p className="text-foreground text-sm font-medium">
              {firstPattern?.description ||
                'Keep using LifeOS to unlock personalized insights about your productivity and wellness.'}
            </p>
          </div>
          <div className="mt-6">
            <Link href="/insights" className="text-primary text-xs font-medium hover:underline">
              View all insights
            </Link>
          </div>
        </div>

        {/* Quick Journal Card */}
        <div className="border-border/80 bg-card hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-6 shadow-2xs transition-all duration-200">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <BookOpen className="text-primary h-5 w-5" />
              <span className="text-foreground text-sm font-bold tracking-tight">
                Quick Journal
              </span>
            </div>
            <p className="text-foreground mb-2 text-sm font-medium">How is your day going?</p>
            <p className="text-muted-foreground text-xs">
              Take a moment to reflect and capture your thoughts.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Recent entries this week</span>
            <Link
              href="/journal"
              className="bg-muted hover:bg-muted/80 text-foreground rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Write Entry
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Two-Column Layout (Existing modules) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tasks Widget */}
        <div className="border-border/80 bg-card rounded-2xl border p-6 shadow-2xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-sm font-bold tracking-tight">Recent Tasks</h2>
            <Link href="/tasks" className="text-primary text-xs font-medium hover:underline">
              See all
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="border-border/80 bg-muted/20 rounded-xl border border-dashed p-8 text-center">
              <CheckSquare className="text-muted-foreground mx-auto mb-2 h-7 w-7" />
              <p className="text-foreground text-xs font-semibold">No tasks created yet</p>
              <p className="text-muted-foreground mt-1 text-[11px]">
                Click &quot;New Task&quot; above to capture your daily agenda items.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {prioritizedTasks.slice(0, 4).map((task: any) => (
                <div
                  key={task._id}
                  className="border-border/80 bg-muted/30 hover:bg-muted/60 flex items-center justify-between rounded-xl border p-3 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.status === 'Completed' ? 'bg-emerald-500' : 'bg-muted-foreground'
                      }`}
                    />
                    <span
                      className={`truncate text-xs font-medium ${
                        task.status === 'Completed'
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span className="border-border/80 bg-card text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Habits Widget */}
        <div className="border-border/80 bg-card rounded-2xl border p-6 shadow-2xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-sm font-bold tracking-tight">
              Today&apos;s Habits
            </h2>
            <Link href="/habits" className="text-primary text-xs font-medium hover:underline">
              See all
            </Link>
          </div>
          {habits.length === 0 ? (
            <div className="border-border/80 bg-muted/20 rounded-xl border border-dashed p-8 text-center">
              <Repeat className="text-muted-foreground mx-auto mb-2 h-7 w-7" />
              <p className="text-foreground text-xs font-semibold">No habits tracked yet</p>
              <p className="text-muted-foreground mt-1 text-[11px]">
                Click &quot;New Habit&quot; to build your daily rituals and streaks.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.slice(0, 4).map((habit: any) => (
                <div
                  key={habit._id}
                  className="border-border/80 bg-muted/30 hover:bg-muted/60 flex items-center justify-between rounded-xl border p-3 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Flame
                      className={`h-3.5 w-3.5 ${
                        habit.currentStreak > 0 ? 'text-amber-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className="text-foreground truncate text-xs font-medium">
                      {habit.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-muted-foreground">{habit.currentStreak}d streak</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {habit.completionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 7. Weekly Trend Footer Section */}
      {topTrends.length > 0 && (
        <div className="border-border/80 bg-card mt-8 rounded-2xl border p-6 shadow-2xs">
          <h2 className="text-foreground mb-4 text-sm font-bold tracking-tight">Weekly Trends</h2>
          <div className="flex flex-wrap gap-4">
            {topTrends.map((trend: any, idx: number) => (
              <div
                key={idx}
                className="bg-muted/30 border-border/50 flex items-center space-x-2 rounded-lg border px-3 py-2"
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : trend.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                ) : (
                  <Minus className="text-muted-foreground h-4 w-4" />
                )}
                <span className="text-foreground text-xs font-medium">{trend.metric}</span>
                <span className="text-muted-foreground text-xs">{trend.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
