'use client';

import React from 'react';
import { INotification } from '@/types/notification.types';
import {
  Bell,
  Trophy,
  Sparkles,
  Swords,
  Users,
  Info,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarking: boolean;
  isDeleting: boolean;
}

const TYPE_CONFIG = {
  Reminder: { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  Achievement: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'AI Insight': { icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  Challenge: { icon: Swords, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  Group: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  System: { icon: Info, color: 'text-neutral-400', bg: 'bg-neutral-500/10' },
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isMarking,
  isDeleting,
}: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.System;
  const Icon = config.icon;

  const sentDate = new Date(notification.sentAt || notification.createdAt);
  const timeAgo = sentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = sentDate.toLocaleDateString();

  return (
    <div
      className={`group relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${
        notification.isRead
          ? 'border-border bg-card/40 opacity-70 hover:opacity-100'
          : 'border-border bg-card ring-1 ring-emerald-500/20'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`truncate text-sm font-semibold ${
              notification.isRead ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            {notification.title}
          </h3>
          {!notification.isRead && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          )}
        </div>

        <p className="text-muted-foreground mt-1 text-xs leading-relaxed break-words">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-muted-foreground text-[10px]">
            {dateStr} at {timeAgo}
          </span>
          <span className="text-muted-foreground bg-muted rounded-md px-1.5 py-0.5 text-[10px] font-medium">
            {notification.type}
          </span>
          {notification.actionUrl && (
            <Link
              href={notification.actionUrl}
              className="text-primary inline-flex items-center gap-1 text-[10px] font-semibold hover:underline"
            >
              View <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!notification.isRead && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification._id)}
            disabled={isMarking}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors disabled:opacity-50"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification._id)}
          disabled={isDeleting}
          className="text-muted-foreground rounded-lg p-1.5 transition-colors hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
