'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notificationApiService } from '@/features/notifications/services/notification.service';
import { Bell } from 'lucide-react';

export function NotificationBadge() {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const res = await notificationApiService.getUnreadCount();
      return res.data;
    },
    refetchInterval: 15000, // check unread count every 15s
  });

  const unreadCount = data?.count ?? 0;

  return (
    <button
      className="text-muted-foreground hover:bg-muted hover:text-foreground relative rounded-lg p-2 transition-colors"
      title="Notifications"
      aria-label={`View notifications (${unreadCount} unread)`}
      onClick={() => {
        router.push('/notifications');
      }}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="ring-background absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
