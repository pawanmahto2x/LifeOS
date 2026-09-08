'use client';

import React, { useState, useEffect } from 'react';
import { IAppLimit } from '@/types/digital-detox.types';
import { X, Smartphone } from 'lucide-react';

interface AppLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (limit: IAppLimit) => void;
  initialLimit?: IAppLimit | null;
  isSaving: boolean;
}

export function AppLimitDialog({
  isOpen,
  onClose,
  onSave,
  initialLimit,
  isSaving,
}: AppLimitDialogProps) {
  const [appName, setAppName] = useState('');
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState<number>(30);
  const [category, setCategory] = useState('Social Media');

  useEffect(() => {
    if (initialLimit) {
      setAppName(initialLimit.appName);
      setDailyLimitMinutes(initialLimit.dailyLimitMinutes);
      setCategory(initialLimit.category || 'Social Media');
    } else {
      setAppName('');
      setDailyLimitMinutes(30);
      setCategory('Social Media');
    }
  }, [initialLimit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;
    onSave({
      appName: appName.trim(),
      dailyLimitMinutes: Number(dailyLimitMinutes),
      category: category.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Smartphone className="h-4 w-4" />
            </div>
            <h3 className="text-foreground text-lg font-bold">
              {initialLimit ? 'Edit App Limit' : 'Set New App Limit'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              App / Site Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Instagram, YouTube, X, Reddit"
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
              required
              disabled={Boolean(initialLimit)} // Don't change appName key on edit
            />
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Daily Limit (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={1440}
              value={dailyLimitMinutes}
              onChange={(e) => setDailyLimitMinutes(Number(e.target.value))}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
              required
            />
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Category (Optional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
            >
              <option value="Social Media">Social Media</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Gaming">Gaming</option>
              <option value="News & Reading">News &amp; Reading</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !appName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : initialLimit ? 'Update Limit' : 'Set Limit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
