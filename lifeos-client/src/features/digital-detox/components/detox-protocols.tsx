'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Moon, Flame, Trophy, Play, CheckCircle2 } from 'lucide-react';

interface ProtocolState {
  id: string;
  name: string;
  durationHours: number;
  badgeName: string;
  active: boolean;
  startedAt: number | null;
}

export function DetoxProtocols() {
  const [protocols, setProtocols] = useState<ProtocolState[]>([
    {
      id: 'monk-mode',
      name: '24h Monk Mode Fast',
      durationHours: 24,
      badgeName: 'Digital Monk',
      active: false,
      startedAt: null,
    },
    {
      id: 'sunset-curfew',
      name: 'Sunset Curfew (9 PM)',
      durationHours: 10,
      badgeName: 'Twilight Master',
      active: false,
      startedAt: null,
    },
    {
      id: 'algorithm-fast',
      name: '3-Day Algorithmic Fast',
      durationHours: 72,
      badgeName: 'Feed Liberator',
      active: false,
      startedAt: null,
    },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos_detox_protocols');
      if (saved) {
        try {
          setProtocols(JSON.parse(saved));
        } catch {
          // ignore
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

  const handleToggle = (id: string) => {
    const updated = protocols.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          active: !p.active,
          startedAt: !p.active ? Date.now() : null,
        };
      }
      return p;
    });
    saveProtocols(updated);
  };

  return (
    <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h4 className="text-foreground text-sm font-bold">Detox Challenges &amp; Badges</h4>
        </div>
        <span className="text-muted-foreground text-[11px]">
          Short commitments to build long-term focus
        </span>
      </div>

      {/* Sleek, compact 3-column horizontal strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {protocols.map((p) => {
          const hoursElapsed = p.startedAt
            ? Math.floor((Date.now() - p.startedAt) / (1000 * 60 * 60))
            : 0;
          const hoursLeft = Math.max(0, p.durationHours - hoursElapsed);

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-2xl border p-3 transition-all ${
                p.active
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border/60 bg-muted/20 hover:border-border'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  {p.id === 'monk-mode' && (
                    <Shield className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  )}
                  {p.id === 'sunset-curfew' && (
                    <Moon className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  )}
                  {p.id === 'algorithm-fast' && (
                    <Flame className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  )}
                  <span className="text-foreground truncate text-xs font-semibold">{p.name}</span>
                </div>
                <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[10px]">
                  <span>🏆 {p.badgeName}</span>
                  {p.active && (
                    <span className="font-bold text-emerald-500">• {hoursLeft}h left</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggle(p.id)}
                className={`shrink-0 cursor-pointer rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all ${
                  p.active
                    ? 'border-destructive/30 text-destructive hover:bg-destructive/10 border'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs'
                }`}
              >
                {p.active ? 'Stop' : 'Start'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
