'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApiService } from '../services/notification.service';
import { INotificationPreferences } from '@/types/notification.types';
import { Mail, Globe, Repeat, CheckSquare, BarChart3 } from 'lucide-react';

interface NotificationPreferencesCardProps {
  preferences?: INotificationPreferences;
  isLoading: boolean;
}

export function NotificationPreferencesCard({
  preferences,
  isLoading,
}: NotificationPreferencesCardProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: Partial<INotificationPreferences>) =>
      notificationApiService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const toggle = (key: keyof INotificationPreferences) => {
    if (!preferences) return;
    updateMutation.mutate({ [key]: !preferences[key] });
  };

  if (isLoading) {
    return <div className="border-border bg-card h-48 animate-pulse rounded-2xl border" />;
  }

  const items = [
    {
      key: 'email' as const,
      label: 'Email Notifications',
      description: 'Receive important account updates and weekly digest via email',
      icon: Mail,
      active: preferences?.email ?? true,
    },
    {
      key: 'browser' as const,
      label: 'Browser Notifications',
      description: 'Push notifications in desktop and mobile browsers',
      icon: Globe,
      active: preferences?.browser ?? true,
    },
    {
      key: 'habitReminders' as const,
      label: 'Habit Reminders',
      description: 'Reminders scheduled at your daily habit reminder times',
      icon: Repeat,
      active: preferences?.habitReminders ?? true,
    },
    {
      key: 'taskReminders' as const,
      label: 'Task Reminders',
      description: 'Due date alerts for high-priority and urgent tasks',
      icon: CheckSquare,
      active: preferences?.taskReminders ?? true,
    },
    {
      key: 'weeklyReport' as const,
      label: 'Weekly Report Alerts',
      description: 'Notifications when your weekly analytics report is generated',
      icon: BarChart3,
      active: preferences?.weeklyReport ?? true,
    },
  ];

  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <h3 className="text-foreground mb-1 text-sm font-bold tracking-wider uppercase">
        Notification Channels & Categories
      </h3>
      <p className="text-muted-foreground mb-5 text-xs">
        Only enabled notification categories will be delivered to your inbox.
      </p>

      <div className="divide-border divide-y">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3.5">
                <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">{item.label}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={item.active}
                onClick={() => toggle(item.key)}
                disabled={updateMutation.isPending}
                className={`focus:ring-primary relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                  item.active ? 'bg-primary' : 'bg-neutral-700'
                } disabled:opacity-50`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    item.active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
