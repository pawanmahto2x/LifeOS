'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Search, Menu, LogOut, User as UserIcon, Moon, Sun, Sparkles } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';
import { NotificationBadge } from '@/features/notifications/components/notification-badge';
import { CommandPalette } from '@/components/ui/command-palette';

interface TopBarProps {
  onOpenMobileNav: () => void;
}

export function TopBar({ onOpenMobileNav }: TopBarProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleSignOut = () => {
    clearAuth();
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className="border-border/80 bg-background/80 sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md transition-colors sm:px-6">
        {/* Mobile Hamburger & Brand */}
        <div className="flex items-center space-x-3 lg:hidden">
          <button
            onClick={onOpenMobileNav}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
            aria-label="Open navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shadow-xs">
              L
            </div>
            <span className="text-foreground text-base font-bold tracking-tight">LifeOS</span>
          </div>
        </div>

        {/* Global Search Trigger (Desktop) */}
        <div className="hidden items-center lg:flex">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="group border-border/80 bg-muted/50 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground flex w-72 cursor-pointer items-center space-x-3 rounded-xl border px-3.5 py-1.5 text-left text-xs shadow-2xs transition-all duration-200"
            aria-label="Open command palette"
          >
            <Search className="text-muted-foreground group-hover:text-foreground h-3.5 w-3.5 transition-colors" />
            <span className="flex-1 font-normal">Search anything or type ⌘K...</span>
            <kbd className="border-border/80 bg-background text-muted-foreground inline-flex h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Theme Toggle, Notifications, Profile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors lg:hidden"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Theme Toggle with micro-interaction */}
          <button
            onClick={toggleTheme}
            className="text-muted-foreground hover:bg-muted hover:text-foreground relative rounded-lg p-2 transition-all duration-200 active:scale-95"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-blue-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Live Notifications Badge */}
          <NotificationBadge />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="hover:bg-muted flex items-center space-x-2 rounded-xl p-1.5 transition-colors active:scale-[0.98]"
              aria-label="User menu"
            >
              <div className="border-border bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-foreground hidden max-w-[120px] truncate text-xs font-medium sm:inline">
                {user?.fullName || 'User'}
              </span>
            </button>

            {isProfileOpen && (
              <div className="border-border/80 bg-popover text-popover-foreground absolute right-0 z-50 mt-2 w-56 rounded-2xl border p-2 shadow-xl">
                <div className="border-border/80 mb-1 border-b px-3 py-2">
                  <p className="text-foreground truncate text-xs font-semibold">{user?.fullName}</p>
                  <p className="text-muted-foreground truncate text-[11px]">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/settings');
                  }}
                  className="text-foreground hover:bg-muted flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs transition-colors"
                >
                  <UserIcon className="text-muted-foreground h-4 w-4" />
                  <span>Profile & Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/timeline');
                  }}
                  className="text-foreground hover:bg-muted flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs transition-colors"
                >
                  <Sparkles className="text-muted-foreground h-4 w-4" />
                  <span>Life Timeline</span>
                </button>

                <div className="border-border/80 my-1 border-t" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleSignOut();
                  }}
                  className="text-destructive hover:bg-destructive/10 flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs transition-colors"
                >
                  <LogOut className="text-destructive h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette (⌘K) Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
