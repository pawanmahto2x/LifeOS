'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Target,
  HeartPulse,
  BookOpen,
  ShieldAlert,
  Users,
  Trophy,
  Award,
  Sparkles,
  BarChart3,
  Bot,
  Settings,
  Sun,
  Moon,
  Plus,
  Clock,
  Droplet,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: 'Navigation' | 'Actions' | 'Preferences';
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const commandItems: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      description: 'Your personal central hub and daily summary',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'nav-tasks',
      title: 'Tasks & Action Items',
      description: 'Manage prioritized tasks and deadlines',
      category: 'Navigation',
      icon: CheckSquare,
      action: () => navigate('/tasks'),
    },
    {
      id: 'nav-habits',
      title: 'Habits & Streaks',
      description: 'Track daily habits and check-in consistency',
      category: 'Navigation',
      icon: Repeat,
      action: () => navigate('/habits'),
    },
    {
      id: 'nav-focus',
      title: 'Focus Mode / Pomodoro',
      description: 'Start deep work sessions with ambient audio',
      category: 'Navigation',
      icon: Target,
      action: () => navigate('/focus'),
    },
    {
      id: 'nav-health',
      title: 'Health & Vitality',
      description: 'Log water intake, sleep cycles, and daily mood',
      category: 'Navigation',
      icon: HeartPulse,
      action: () => navigate('/health'),
    },
    {
      id: 'nav-journal',
      title: 'Mindful Journal',
      description: 'Reflective writing with mood tags and search',
      category: 'Navigation',
      icon: BookOpen,
      action: () => navigate('/journal'),
    },
    {
      id: 'nav-achievements',
      title: 'Achievements & Badges',
      description: 'Explore unlocked badges and milestone rewards',
      category: 'Navigation',
      icon: Award,
      action: () => navigate('/achievements'),
    },
    {
      id: 'nav-timeline',
      title: 'Life Timeline',
      description: 'Chronological timeline of all major events and logs',
      category: 'Navigation',
      icon: Sparkles,
      action: () => navigate('/timeline'),
    },
    {
      id: 'nav-reports',
      title: 'Analytics & Reports',
      description: 'Review weekly and monthly productivity trends',
      category: 'Navigation',
      icon: BarChart3,
      action: () => navigate('/reports'),
    },
    {
      id: 'nav-detox',
      title: 'Digital Detox',
      description: 'Schedule scheduled breaks from digital distractions',
      category: 'Navigation',
      icon: Target,
      action: () => navigate('/digital-detox'),
    },
    {
      id: 'nav-emergency',
      title: 'Emergency De-escalation',
      description: 'Activate minimalist survival mode during high overwhelm',
      category: 'Navigation',
      icon: ShieldAlert,
      action: () => navigate('/emergency'),
    },
    {
      id: 'nav-groups',
      title: 'Accountability Groups',
      description: 'Connect with peers, create pacts, and vote',
      category: 'Navigation',
      icon: Users,
      action: () => navigate('/groups'),
    },
    {
      id: 'nav-challenges',
      title: 'Community Challenges',
      description: 'Join collective challenges with live leaderboards',
      category: 'Navigation',
      icon: Trophy,
      action: () => navigate('/challenges'),
    },
    {
      id: 'nav-ai',
      title: 'AI Life Coach',
      description: 'Context-aware guidance based on your real activity',
      category: 'Navigation',
      icon: Bot,
      action: () => navigate('/ai-coach'),
    },
    {
      id: 'nav-settings',
      title: 'Settings & Profile',
      description: 'Configure account, notifications, and security',
      category: 'Navigation',
      icon: Settings,
      action: () => navigate('/settings'),
    },

    // Actions
    {
      id: 'action-create-task',
      title: 'Create New Task',
      description: 'Quickly open task creation dialog',
      category: 'Actions',
      icon: Plus,
      action: () => navigate('/tasks?create=true'),
    },
    {
      id: 'action-start-focus',
      title: 'Start Deep Work Session',
      description: 'Jump directly to the focus timer',
      category: 'Actions',
      icon: Clock,
      action: () => navigate('/focus'),
    },
    {
      id: 'action-log-water',
      title: 'Log Water Hydration',
      description: 'Quickly record water intake',
      category: 'Actions',
      icon: Droplet,
      action: () => navigate('/health'),
    },

    // Preferences
    {
      id: 'pref-toggle-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: `Current mode: ${theme}`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        onClose();
      },
      shortcut: '⌘T',
    },
  ];

  const filteredItems = commandItems
    .map((item) => {
      const q = query.toLowerCase().trim();
      if (!q) return { item, score: 0 };

      const titleLower = item.title.toLowerCase();
      const descLower = (item.description || '').toLowerCase();
      const catLower = item.category.toLowerCase();

      let score = -1;
      if (titleLower === q) {
        score = 100;
      } else if (titleLower.startsWith(q)) {
        score = 80;
      } else if (titleLower.includes(q)) {
        score = 60;
      } else if (catLower.startsWith(q)) {
        score = 40;
      } else if (descLower.includes(q)) {
        score = 20;
      }

      return { item, score };
    })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (
        e.key === 'Escape' ||
        ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK'))
      ) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length),
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Command Palette Modal */}
      <div className="border-border/80 bg-popover relative z-50 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="border-border/80 flex items-center border-b px-4 py-3">
          <Search className="text-muted-foreground h-4 w-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-foreground placeholder:text-muted-foreground ml-3 flex-1 bg-transparent text-sm outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="border-border bg-muted text-muted-foreground ml-2 rounded border px-1.5 py-0.5 text-[10px] font-medium">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
              <p className="text-foreground text-sm font-medium">No matching commands</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Try searching for &quot;Tasks&quot;, &quot;Habits&quot;, &quot;Focus&quot;, or
                &quot;Theme&quot;.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                          isSelected
                            ? 'border-primary/30 bg-primary/10 text-primary'
                            : 'border-border bg-muted/60 text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-semibold">{item.title}</span>
                          <span className="border-border/80 bg-muted/50 py-0.2 text-muted-foreground rounded border px-1.5 text-[9px]">
                            {item.category}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-muted-foreground truncate text-[11px]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-3 flex shrink-0 items-center space-x-2">
                      {item.shortcut && (
                        <kbd className="border-border bg-muted text-muted-foreground rounded border px-1.5 py-0.5 text-[10px]">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <span className="text-muted-foreground flex items-center text-[10px]">
                          <CornerDownLeft className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="border-border/80 bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="border-border bg-background rounded border px-1 text-[9px]">↑</kbd>
            <kbd className="border-border bg-background rounded border px-1 text-[9px]">↓</kbd>
            <span>Select:</span>
            <kbd className="border-border bg-background rounded border px-1 text-[9px]">↵</kbd>
          </div>
          <span>LifeOS Universal Search</span>
        </div>
      </div>
    </div>
  );
}
