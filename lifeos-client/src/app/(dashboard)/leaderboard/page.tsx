'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { groupApiService } from '@/features/groups/services/group.service';
import { challengeApiService } from '@/features/challenges/services/challenge.service';
import { Medal, Users, Trophy, ChevronRight, Crown } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await groupApiService.getUserGroups();
      return res.data;
    },
  });

  const { data: challengesData, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges', undefined, 'active'],
    queryFn: async () => {
      const res = await challengeApiService.getChallenges({ status: 'active' });
      return res.data;
    },
  });

  const groups = groupsData || [];
  const challenges = challengesData || [];
  const isLoading = groupsLoading || challengesLoading;

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Medal className="h-5 w-5" />
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          See where you rank in your groups and active challenges.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="border-border bg-card h-32 animate-pulse rounded-2xl border" />
          <div className="border-border bg-card h-32 animate-pulse rounded-2xl border" />
        </div>
      )}

      {/* Group Leaderboards */}
      {!isLoading && (
        <div className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
            <Users className="h-4 w-4" /> Group Leaderboards
          </h2>
          {groups.length === 0 ? (
            <div className="border-border bg-card rounded-2xl border p-8 text-center">
              <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
                <Users className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-foreground text-sm font-semibold">No Groups Yet</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Join or create a group to see activity-based leaderboards.
              </p>
              <Link
                href="/groups"
                className="text-primary mt-3 inline-block text-xs font-semibold hover:underline"
              >
                Go to Groups →
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.map((group: any) => (
                <Link
                  key={group._id}
                  href={`/groups/${group._id}`}
                  className="border-border bg-card hover:bg-muted/50 group flex items-center justify-between rounded-2xl border p-5 shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-bold">{group.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {group.memberCount || '—'} members • View rankings
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Challenge Leaderboards */}
      {!isLoading && (
        <div className="space-y-3">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
            <Trophy className="h-4 w-4" /> Challenge Leaderboards
          </h2>
          {challenges.length === 0 ? (
            <div className="border-border bg-card rounded-2xl border p-8 text-center">
              <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
                <Trophy className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-foreground text-sm font-semibold">No Active Challenges</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Join a challenge to see participant leaderboards.
              </p>
              <Link
                href="/challenges"
                className="text-primary mt-3 inline-block text-xs font-semibold hover:underline"
              >
                Browse Challenges →
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {challenges.map((challenge: any) => (
                <Link
                  key={challenge._id}
                  href={`/challenges/${challenge._id}`}
                  className="border-border bg-card hover:bg-muted/50 group flex items-center justify-between rounded-2xl border p-5 shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-bold">{challenge.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {challenge.participantCount || '—'} participants • View rankings
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
