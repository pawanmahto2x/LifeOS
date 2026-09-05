'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleSignOut = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">LifeOS Dashboard</h1>
            <p className="text-sm text-neutral-400">Welcome back, {user?.fullName || 'User'}!</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Sign Out
          </button>
        </header>

        <main className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
              Profile
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-medium text-white">{user?.fullName}</p>
              <p className="text-neutral-400">{user?.email}</p>
              <p className="text-xs text-neutral-500">Timezone: {user?.timezone || 'UTC'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
              Productivity
            </h2>
            <p className="mt-3 text-sm text-neutral-400">
              Tasks & Habits will connect in upcoming phases.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
              Status
            </h2>
            <div className="mt-3 flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-sm font-medium text-emerald-400">Session Authenticated</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
