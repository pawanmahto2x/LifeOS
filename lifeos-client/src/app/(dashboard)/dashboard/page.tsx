'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { taskApiService } from '@/features/tasks/services/task.service';
import { habitApiService } from '@/features/habits/services/habit.service';
import { healthApiService } from '@/features/health/services/health.service';
import { focusApiService } from '@/features/focus/services/focus.service';
import {
  CheckSquare,
  Repeat,
  Flame,
  Plus,
  ArrowRight,
  Droplet,
  HeartPulse,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'dashboard-preview'],
    queryFn: async () => {
      const res = await taskApiService.getTasks({ limit: 50 });
      return res.data;
    },
  });

  const { data: habitsData, isLoading: isHabitsLoading } = useQuery({
    queryKey: ['habits', 'dashboard-preview'],
    queryFn: async () => {
      const res = await habitApiService.getHabits({ limit: 5 });
      return res.data;
    },
  });

  const { data: healthData, isLoading: isHealthLoading } = useQuery({
    queryKey: ['health-summary', 'dashboard-preview'],
    queryFn: async () => {
      const res = await healthApiService.getSummary();
      return res.data;
    },
  });

  const { data: focusData, isLoading: isFocusLoading } = useQuery({
    queryKey: ['focus', 'dashboard-preview'],
    queryFn: async () => {
      const res = await focusApiService.getSessions();
      return res.data;
    },
  });

  const tasks = tasksData?.tasks || [];
  const habits = habitsData?.habits || [];
  const health = healthData;
  const focus = focusData?.analytics;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const todayFocusMinutes = focus?.todayFocusMinutes ?? 0;

  const priorityWeight: Record<string, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const prioritizedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;
    const weightA = priorityWeight[a.priority] || 0;
    const weightB = priorityWeight[b.priority] || 0;
    if (weightA !== weightB) return weightB - weightA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* Header with greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user?.fullName || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Here is your daily LifeOS overview. Ready to focus today?
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Tasks */}
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

      {/* Module Overview Section */}
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
              {prioritizedTasks.slice(0, 4).map((task) => (
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
              {habits.slice(0, 4).map((habit) => (
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
    </div>
  );
}
