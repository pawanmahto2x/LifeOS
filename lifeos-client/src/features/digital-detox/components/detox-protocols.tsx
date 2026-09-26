'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Moon, Flame, Trophy, Play, CheckCircle2, Lock } from 'lucide-react';

interface ProtocolState {
  id: string;
  name: string;
  durationHours: number;
  description: string;
  badgeName: string;
  active: boolean;
  startedAt: number | null;
}

export function DetoxProtocols() {
  const [protocols, setProtocols] = useState<ProtocolState[]>([
    {
      id: 'monk-mode',
      name: '24-Hour Monk Mode Fast',
      durationHours: 24,
      description:
        'Zero recreational phone and entertainment screens for a full 24 hours. The ultimate dopamine reset.',
      badgeName: 'Digital Monk',
      active: false,
      startedAt: null,
    },
    {
      id: 'sunset-curfew',
      name: 'Sunset Screen Curfew (9 PM)',
      durationHours: 10,
      description:
        'Zero screens after 9:00 PM until 7:00 AM. Maximizes melatonin production for deep REM restorative sleep.',
      badgeName: 'Twilight Master',
      active: false,
      startedAt: null,
    },
    {
      id: 'algorithm-fast',
      name: '3-Day Algorithmic Fast',
      durationHours: 72,
      description:
        'Total ban on short-form video algorithms (Instagram Reels, YouTube Shorts, TikTok) for 3 consecutive days.',
      badgeName: 'Feed Liberator',
      active: false,
      startedAt: null,
    },
  ]);

  // Load state from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos_detox_protocols');
      if (saved) {
        try {
          setProtocols(JSON.parse(saved));
        } catch {
          // ignore corrupted json
        }
      }
    }
  }, []);

  const saveProtocols = (updated: ProtocolState[]) => {
    setProtocols(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_detox_protocols', JSON.stringify(updated));
    }
  };

  const handleToggleProtocol = (id: string) => {
    const updated = protocols.map((p) => {
      if (p.id === id) {
        if (!p.active) {
          return { ...p, active: true, startedAt: Date.now() };
        } else {
          return { ...p, active: false, startedAt: null };
        }
      }
      return p;
    });
    saveProtocols(updated);
  };

  return (
    <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-base font-bold">Structured Detox Challenges</h3>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                Achievement Protocols
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Commit to science-backed digital fasts and permanently rewire your dopamine receptors.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {protocols.map((protocol) => {
          const hoursElapsed = protocol.startedAt
            ? Math.floor((Date.now() - protocol.startedAt) / (1000 * 60 * 60))
            : 0;
          const hoursLeft = Math.max(0, protocol.durationHours - hoursElapsed);
          const isCompleted = protocol.active && hoursLeft === 0;

          return (
            <div
              key={protocol.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                protocol.active
                  ? 'bg-primary/5 border-primary/40 shadow-xs'
                  : 'bg-muted/20 border-border/60 hover:border-border'
              }`}
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    {protocol.id === 'monk-mode' && <Shield className="h-4 w-4 text-amber-500" />}
                    {protocol.id === 'sunset-curfew' && (
                      <Moon className="h-4 w-4 text-indigo-500" />
                    )}
                    {protocol.id === 'algorithm-fast' && (
                      <Flame className="h-4 w-4 text-rose-500" />
                    )}
                    {protocol.name}
                  </span>
                </div>

                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {protocol.description}
                </p>

                <div className="bg-muted/40 border-border/50 mt-4 flex items-center justify-between rounded-xl border px-3 py-2 text-xs">
                  <span className="text-muted-foreground text-[11px] font-medium">
                    Reward Badge:
                  </span>
                  <span className="text-foreground flex items-center gap-1 font-bold">
                    <Trophy className="h-3 w-3 text-amber-500" />
                    {protocol.badgeName}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                {protocol.active ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1 text-emerald-500">
                        <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                        Protocol Active
                      </span>
                      <span className="text-foreground">{hoursLeft}h remaining</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleProtocol(protocol.id)}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 w-full cursor-pointer rounded-xl border py-2 text-xs font-semibold transition-colors"
                    >
                      Surrender / End Early
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleProtocol(protocol.id)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold shadow-xs transition-colors"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Activate Protocol</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
