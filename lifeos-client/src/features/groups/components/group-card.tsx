'use client';

import React from 'react';
import { IGroup } from '@/types/group.types';
import { Users, Lock, Globe, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface GroupCardProps {
  group: IGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  const isPrivate = group.privacy !== 'Public';

  return (
    <Link
      href={`/groups/${group._id}`}
      className="group border-border bg-card hover:border-primary/50 relative flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-muted-foreground bg-muted flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold">
            {isPrivate ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
            {group.privacy}
          </span>
        </div>

        <h3 className="text-foreground group-hover:text-primary mt-3 text-base font-bold transition-colors">
          {group.name}
        </h3>

        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
          {group.description || 'No description provided.'}
        </p>
      </div>

      <div className="border-border mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <div className="text-muted-foreground flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">Max {group.maxMembers} members</span>
        </div>
        <span className="text-primary flex items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-0.5">
          Dashboard <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
