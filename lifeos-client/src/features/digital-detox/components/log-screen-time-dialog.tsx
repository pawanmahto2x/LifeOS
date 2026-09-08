'use client';

import React, { useState } from 'react';
import { ILogScreenTimePayload, IAppLimit } from '@/types/digital-detox.types';
import { X, Clock } from 'lucide-react';

interface LogScreenTimeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (payload: ILogScreenTimePayload) => void;
  appLimits?: IAppLimit[];
  isLogging: boolean;
}

export function LogScreenTimeDialog({
  isOpen,
  onClose,
  onLog,
  appLimits = [],
  isLogging,
}: LogScreenTimeDialogProps) {
  const [selectedApp, setSelectedApp] = useState('');
  const [customApp, setCustomApp] = useState('');
  const [minutesUsed, setMinutesUsed] = useState<number>(30);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appName = selectedApp === '__custom__' || !selectedApp ? customApp.trim() : selectedApp;
    if (minutesUsed <= 0) return;

    onLog({
      appName: appName || undefined,
      minutesUsed: Number(minutesUsed),
      loggedDate: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-foreground text-lg font-bold">Log Screen Time</h3>
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
              App / Service (Optional)
            </label>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="border-input bg-background text-foreground focus:ring-ring mb-2 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
            >
              <option value="">General Device Screen Time</option>
              {appLimits.map((l) => (
                <option key={l.appName} value={l.appName}>
                  {l.appName} (Limit: {l.dailyLimitMinutes}m)
                </option>
              ))}
              <option value="__custom__">+ Other App...</option>
            </select>

            {selectedApp === '__custom__' && (
              <input
                type="text"
                value={customApp}
                onChange={(e) => setCustomApp(e.target.value)}
                placeholder="Enter app name (e.g. TikTok, Netflix)"
                className="border-input bg-background text-foreground focus:ring-ring w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
                required
              />
            )}
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Minutes Spent
            </label>
            <input
              type="number"
              min={1}
              max={1440}
              value={minutesUsed}
              onChange={(e) => setMinutesUsed(Number(e.target.value))}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2"
              required
            />
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
              disabled={isLogging || minutesUsed <= 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isLogging ? 'Logging...' : 'Log Usage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
