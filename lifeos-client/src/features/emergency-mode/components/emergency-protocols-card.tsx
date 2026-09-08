'use client';

import React from 'react';
import { Lock, BellOff, Smartphone, CheckCircle2 } from 'lucide-react';

interface EmergencyProtocolsCardProps {
  isActive: boolean;
}

const PROTOCOLS = [
  {
    icon: Lock,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    label: 'Focus Lock Engaged',
    description: 'All recreational app access is restricted. Deep work mode is enforced.',
    activeOnly: true,
  },
  {
    icon: Smartphone,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    label: 'Screen Time Restricted',
    description: 'Daily screen time budget reduced to 30 minutes emergency allowance.',
    activeOnly: true,
  },
  {
    icon: BellOff,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    label: 'Non-Critical Notifications Silenced',
    description: 'Only critical system and safety alerts will be delivered.',
    activeOnly: true,
  },
  {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    label: 'Auto-Restoration on Disable',
    description:
      'Your prior settings are snapshotted at activation and fully restored when you de-escalate.',
    activeOnly: false,
  },
];

export function EmergencyProtocolsCard({ isActive }: EmergencyProtocolsCardProps) {
  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <h3 className="text-foreground mb-5 text-sm font-bold tracking-wider uppercase">
        Emergency Protocols
      </h3>
      <div className="space-y-3">
        {PROTOCOLS.map((p) => {
          const IconComp = p.icon;
          const dimmed = p.activeOnly && !isActive;
          return (
            <div
              key={p.label}
              className={`flex items-start gap-3.5 rounded-xl border p-3.5 transition-all duration-300 ${
                dimmed ? 'border-border bg-muted/20 opacity-40' : 'border-border bg-muted/30'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${p.bg} ${p.color}`}
              >
                <IconComp className="h-4 w-4" />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${dimmed ? 'text-muted-foreground' : 'text-foreground'}`}
                >
                  {p.label}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
