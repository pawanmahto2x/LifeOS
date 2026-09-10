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
      className="relative rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
      title="Notifications"
      aria-label={`View notifications (${unreadCount} unread)`}
      onClick={() => {
        router.push('/notifications');
      }}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black ring-2 ring-neutral-950">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
