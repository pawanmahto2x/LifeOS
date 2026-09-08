'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Bell, Search, Menu, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

interface TopBarProps {
  onOpenMobileNav: () => void;
}

export function TopBar({ onOpenMobileNav }: TopBarProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = () => {
    clearAuth();
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile Hamburger & Brand */}
      <div className="flex items-center space-x-3 lg:hidden">
        <button
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-lg font-bold tracking-tight text-white">LifeOS</span>
      </div>

      {/* Global Search Trigger (Desktop) */}
      <div className="hidden items-center lg:flex">
        <button
          className="flex w-64 items-center space-x-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-left text-xs text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-200"
          onClick={() => {
            // Future global command palette hook
          }}
        >
          <Search className="h-3.5 w-3.5 text-neutral-500" />
          <span className="flex-1">Search anything...</span>
          <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Theme Toggle, Notifications, Profile Menu */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Bell */}
        <button
          className="relative rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          title="Notifications"
          aria-label="View notifications"
          onClick={() => {
            router.push('/notifications');
          }}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 rounded-lg p-1.5 transition-colors hover:bg-neutral-800"
            aria-label="User menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-xs font-semibold text-white">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden max-w-[120px] truncate text-xs font-medium text-neutral-200 sm:inline">
              {user?.fullName || 'User'}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-200 shadow-xl">
              <div className="mb-1 border-b border-neutral-800 px-3 py-2">
                <p className="truncate text-sm font-semibold text-white">{user?.fullName}</p>
                <p className="truncate text-xs text-neutral-400">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push('/settings');
                }}
                className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <UserIcon className="h-4 w-4 text-neutral-400" />
                <span>Profile & Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-950/40 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
