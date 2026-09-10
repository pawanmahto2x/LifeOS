'use client';

import React from 'react';
import { IChallengeListItem } from '@/types/challenge.types';
import { Users, Calendar, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ChallengeCardProps {
  challenge: IChallengeListItem;
}

const DIFFICULTY_COLORS = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Hard: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Expert: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const diffStyle = DIFFICULTY_COLORS[challenge.difficulty] || DIFFICULTY_COLORS.Medium;

  const startDate = new Date(challenge.startDate).toLocaleDateString();
  const endDate = new Date(challenge.endDate).toLocaleDateString();

  return (
    <Link
      href={`/challenges/${challenge._id}`}
      className="group border-border bg-card hover:border-primary/50 relative flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              {challenge.category}
            </span>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${diffStyle}`}>
              {challenge.difficulty}
            </span>
          </div>
          {challenge.isJoined && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Enrolled
            </span>
          )}
        </div>

        <h3 className="text-foreground group-hover:text-primary mt-3 text-base font-bold transition-colors">
          {challenge.title}
        </h3>

        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
          {challenge.description}
        </p>

        {challenge.reward && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
            <Award className="h-3.5 w-3.5" />
            <span className="text-[11px] font-semibold">{challenge.reward}</span>
          </div>
        )}
      </div>

      <div className="border-border mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <div className="text-muted-foreground flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px]">
            <Calendar className="h-3 w-3" /> {startDate} – {endDate}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Users className="h-3 w-3" /> {challenge.participantCount}
          </span>
        </div>
        <span className="text-primary flex items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-0.5">
          Details <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
