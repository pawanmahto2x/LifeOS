'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApiService } from '@/features/notifications/services/notification.service';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import { NotificationPreferencesCard } from '@/features/notifications/components/notification-preferences-card';
import { Bell, CheckCheck, Settings, BellOff } from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [showPreferences, setShowPreferences] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Queries
  const { data: notificationsData, isLoading: isNotifsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationApiService.getNotifications();
      return res.data;
    },
  });

  const { data: prefsData, isLoading: isPrefsLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await notificationApiService.getPreferences();
      return res.data;
    },
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApiService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApiService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApiService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const notifications = notificationsData || [];
  const filteredNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Notification Centre
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your reminders, system alerts, and notifications preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              showPreferences
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
        </div>
      </div>

      {/* Preferences Drawer / Accordion */}
      {showPreferences && (
        <NotificationPreferencesCard preferences={prefsData} isLoading={isPrefsLoading} />
      )}

      {/* Notifications Filter & List */}
      <div className="space-y-4">
        <div className="border-border flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterUnreadOnly(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                !filterUnreadOnly
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterUnreadOnly(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterUnreadOnly
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* List Content */}
        {isNotifsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border-border bg-card h-20 animate-pulse rounded-2xl border"
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="border-border bg-card rounded-2xl border p-12 text-center shadow-sm">
            <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
              <BellOff className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-foreground text-sm font-semibold">
              {filterUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              When tasks are due, habits need checking in, or milestones are unlocked, they will
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <NotificationItem
                key={notif._id}
                notification={notif}
                onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
                isMarking={markAsReadMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
