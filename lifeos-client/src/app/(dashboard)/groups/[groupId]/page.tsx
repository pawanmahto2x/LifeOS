'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApiService } from '@/features/groups/services/group.service';
import {
  Users,
  Trophy,
  Vote,
  Copy,
  Check,
  LogOut,
  Shield,
  Trash2,
  Crown,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const groupId = params.groupId as string;

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'members' | 'goals'>('leaderboard');

  const { data: detailsData, isLoading } = useQuery({
    queryKey: ['group-details', groupId],
    queryFn: async () => {
      const res = await groupApiService.getGroupDetails(groupId);
      return res.data;
    },
  });

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => groupApiService.voteGoal(groupId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details', groupId] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => groupApiService.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      router.push('/groups');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => groupApiService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      router.push('/groups');
    },
  });

  const handleCopyCode = () => {
    if (!detailsData?.group.inviteCode) return;
    void navigator.clipboard.writeText(detailsData.group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-border bg-card h-40 animate-pulse rounded-2xl border" />
        <div className="border-border bg-card h-80 animate-pulse rounded-2xl border" />
      </div>
    );
  }

  if (!detailsData) {
    return (
      <div className="border-border bg-card rounded-2xl border p-12 text-center">
        <p className="text-foreground text-sm font-semibold">Group Not Found</p>
        <Link href="/groups" className="text-primary mt-2 inline-block text-xs hover:underline">
          Return to Groups
        </Link>
      </div>
    );
  }

  const { group, members, currentUserRole, leaderboard, activeWeeklyGoals } = detailsData;
  const isOwner = currentUserRole === 'Owner';

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Back button */}
      <Link
        href="/groups"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Groups
      </Link>

      {/* Header Banner */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-xl font-bold">{group.name}</h1>
                <span className="text-muted-foreground bg-muted rounded-md px-2 py-0.5 text-[10px] font-semibold">
                  {group.privacy}
                </span>
                {currentUserRole && (
                  <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-[10px] font-bold">
                    {currentUserRole}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-relaxed">
                {group.description || 'No description provided.'}
              </p>
              <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {members.length} / {group.maxMembers} members
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="hover:text-foreground inline-flex items-center gap-1 font-mono font-semibold"
                  title="Copy Invite Code"
                >
                  Code: <span className="text-primary font-bold">{group.inviteCode}</span>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isOwner && (
              <button
                type="button"
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Leave
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm('Are you sure you want to delete this group? This cannot be undone.')
                  ) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-500/80 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Group
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-border bg-muted/40 flex w-fit items-center gap-1 rounded-xl border p-1">
        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trophy className="h-3.5 w-3.5" /> Leaderboard
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('goals')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'goals'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Vote className="h-3.5 w-3.5" /> Weekly Goal Voting
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'members'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Members ({members.length})
        </button>
      </div>

      {/* Tab: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
              Activity Leaderboard
            </h2>
            <span className="text-muted-foreground text-xs">
              Score = Tasks (10pts) + Focus Mins (1pt) + Streak (5pts)
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-xs">No scores yet</p>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="hover:bg-muted/30 flex items-center justify-between px-5 py-3 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-7 w-7 items-center justify-center text-xs font-bold">
                    {entry.rank === 1 ? (
                      <Crown className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <span className="text-muted-foreground">#{entry.rank}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">{entry.fullName}</p>
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      {entry.role}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-primary text-sm font-bold">{entry.score}</span>
                  <p className="text-muted-foreground text-[10px]">pts</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Weekly Goal Voting */}
      {activeTab === 'goals' && (
        <div className="border-border bg-card space-y-4 rounded-2xl border p-6 shadow-sm">
          <div>
            <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
              Weekly Challenge Voting
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Cast your vote for next week&apos;s collective accountability sprint.
            </p>
          </div>

          <div className="space-y-3">
            {activeWeeklyGoals.map((opt) => (
              <div
                key={opt.id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  opt.hasVoted
                    ? 'border-primary bg-primary/5 ring-primary/30 ring-1'
                    : 'border-border bg-card'
                }`}
              >
                <div>
                  <h3 className="text-foreground text-sm font-bold">{opt.title}</h3>
                  <p className="text-muted-foreground mt-0.5 text-xs">{opt.description}</p>
                  <span className="text-muted-foreground mt-2 inline-block text-[11px] font-semibold">
                    {opt.votesCount} {opt.votesCount === 1 ? 'vote' : 'votes'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => voteMutation.mutate(opt.id)}
                  disabled={voteMutation.isPending || opt.hasVoted}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                    opt.hasVoted
                      ? 'bg-primary/20 text-primary cursor-default'
                      : 'border-border hover:bg-muted text-foreground border'
                  }`}
                >
                  {opt.hasVoted ? 'Voted' : 'Vote'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
          <div className="px-5 py-4">
            <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
              Group Members ({members.length})
            </h2>
          </div>

          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                  {m.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">{m.fullName}</p>
                  <p className="text-muted-foreground text-[10px]">
                    Joined {new Date(m.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    m.role === 'Owner'
                      ? 'bg-amber-500/10 text-amber-400'
                      : m.role === 'Admin'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {m.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
