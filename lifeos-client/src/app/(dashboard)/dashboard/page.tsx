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
      const res = await taskApiService.getTasks({ limit: 5 });
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

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* Header with greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, {user?.fullName || 'User'}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Here is your daily LifeOS overview. Ready to focus today?
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/tasks"
            className="inline-flex items-center space-x-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-neutral-950 shadow transition-colors hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Link>
          <Link
            href="/focus"
            className="inline-flex items-center space-x-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            <Clock className="h-4 w-4" />
            <span>Focus Mode</span>
          </Link>
          <Link
            href="/health"
            className="inline-flex items-center space-x-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            <HeartPulse className="h-4 w-4" />
            <span>Health</span>
          </Link>
        </div>
      </div>

      {/* Overview Cards (Real data empty states per Rule 1: Zero Fake Data) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Tasks */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Active Tasks
              </span>
              <CheckSquare className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white">
                {isTasksLoading ? '...' : (tasksData?.total ?? 0)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {pendingCount} pending action {pendingCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-800/60 pt-4 text-xs">
            <span className="text-neutral-500">
              {tasks.length === 0 ? 'No tasks yet' : `${tasks.length} recent`}
            </span>
            <Link
              href="/tasks"
              className="flex items-center space-x-1 text-neutral-300 hover:text-white"
            >
              <span>View Tasks</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Focus Time */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Focus Time
              </span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white">
                {isFocusLoading ? '...' : `${todayFocusMinutes}m`}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {focus?.todayCompletedSessions
                  ? `${focus.todayCompletedSessions} completed sessions today`
                  : 'Deep work completed today'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-800/60 pt-4 text-xs">
            <span className="text-neutral-500">
              {todayFocusMinutes > 0 ? 'Flow state active' : 'Ready to start'}
            </span>
            <Link
              href="/focus"
              className="flex items-center space-x-1 text-neutral-300 hover:text-white"
            >
              <span>Start Session</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Habits Streak */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Active Habits
              </span>
              <Repeat className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white">
                {isHabitsLoading ? '...' : (habitsData?.total ?? 0)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {bestStreak > 0 ? `Best active streak: ${bestStreak} days` : 'Zero active streaks'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-800/60 pt-4 text-xs">
            <span className="text-neutral-500">
              {habits.length === 0 ? 'No habits yet' : `${habits.length} active`}
            </span>
            <Link
              href="/habits"
              className="flex items-center space-x-1 text-neutral-300 hover:text-white"
            >
              <span>View Habits</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Hydration Card */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Water Today
              </span>
              <Droplet className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white">
                {isHealthLoading ? '...' : `${health?.water?.todayTotalMl ?? 0} ml`}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {health?.water && health.water.progressPercentage > 0
                  ? `${health.water.progressPercentage}% of 2000 ml goal`
                  : '0% completed today'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-800/60 pt-4 text-xs">
            <span className="text-neutral-500">Hydration</span>
            <Link
              href="/health"
              className="flex items-center space-x-1 text-neutral-300 hover:text-white"
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
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Tasks</h2>
            <Link href="/tasks" className="text-xs text-neutral-400 hover:text-white">
              See all
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-800 p-8 text-center">
              <CheckSquare className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-300">No tasks created yet</p>
              <p className="mt-1 text-xs text-neutral-500">
                Click &quot;New Task&quot; above to begin organizing your daily agenda.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-3"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.status === 'Completed' ? 'bg-emerald-500' : 'bg-neutral-500'
                      }`}
                    />
                    <span
                      className={`truncate text-xs font-medium ${
                        task.status === 'Completed' ? 'text-neutral-500 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span className="rounded border border-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Habits Widget */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Today&apos;s Habits</h2>
            <Link href="/habits" className="text-xs text-neutral-400 hover:text-white">
              See all
            </Link>
          </div>
          {habits.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-800 p-8 text-center">
              <Repeat className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-300">No habits tracked yet</p>
              <p className="mt-1 text-xs text-neutral-500">
                Click &quot;New Habit&quot; above to build your daily rituals and streaks.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.slice(0, 4).map((habit) => (
                <div
                  key={habit._id}
                  className="flex items-center justify-between rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-3"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Flame
                      className={`h-3.5 w-3.5 ${
                        habit.currentStreak > 0 ? 'text-amber-500' : 'text-neutral-500'
                      }`}
                    />
                    <span className="truncate text-xs font-medium text-white">{habit.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-neutral-400">{habit.currentStreak}d streak</span>
                    <span className="font-medium text-emerald-400">{habit.completionRate}%</span>
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
