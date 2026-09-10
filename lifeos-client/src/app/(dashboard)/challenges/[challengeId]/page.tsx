'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeApiService } from '@/features/challenges/services/challenge.service';
import {
  Trophy,
  Users,
  Calendar,
  Award,
  ChevronLeft,
  Crown,
  CheckCircle2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function ChallengeDetailsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const challengeId = params.challengeId as string;

  const { data: detailsData, isLoading } = useQuery({
    queryKey: ['challenge-details', challengeId],
    queryFn: async () => {
      const res = await challengeApiService.getChallengeDetails(challengeId);
      return res.data;
    },
  });

  const joinMutation = useMutation({
    mutationFn: () => challengeApiService.joinChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-details', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => challengeApiService.leaveChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-details', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: (progress: number) => challengeApiService.updateProgress(challengeId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-details', challengeId] });
    },
  });

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
        <p className="text-foreground text-sm font-semibold">Challenge Not Found</p>
        <Link href="/challenges" className="text-primary mt-2 inline-block text-xs hover:underline">
          Return to Challenges
        </Link>
      </div>
    );
  }

  const {
    challenge,
    isParticipant,
    userProgress = 0,
    isCompleted,
    participantCount,
    leaderboard,
  } = detailsData;

  const startDate = new Date(challenge.startDate).toLocaleDateString();
  const endDate = new Date(challenge.endDate).toLocaleDateString();

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Back button */}
      <Link
        href="/challenges"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Challenges
      </Link>

      {/* Header Banner */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                {challenge.category}
              </span>
              <span className="border-border bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-bold">
                {challenge.difficulty}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </span>
              )}
            </div>

            <h1 className="text-foreground mt-2 text-xl font-bold">{challenge.title}</h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-relaxed">
              {challenge.description}
            </p>

            <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {startDate} – {endDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {participantCount} participants
              </span>
              {challenge.reward && (
                <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <Award className="h-3.5 w-3.5" /> {challenge.reward}
                </span>
              )}
            </div>
          </div>

          <div className="self-start sm:self-auto">
            {!isParticipant ? (
              <button
                type="button"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 py-2 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {joinMutation.isPending ? 'Joining...' : 'Join Challenge'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Leave
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participant Progress Bar & Controls */}
      {isParticipant && (
        <div className="border-border bg-card space-y-4 rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
                Your Progress
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {isCompleted
                  ? 'Congratulations! You have completed this challenge.'
                  : 'Update your milestone completion percentage as you make progress.'}
              </p>
            </div>
            <span className="text-foreground text-xl font-bold">{userProgress}%</span>
          </div>

          {/* Progress track */}
          <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${userProgress}%` }}
            />
          </div>

          {/* Quick update buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => progressMutation.mutate(pct)}
                disabled={progressMutation.isPending || userProgress === pct}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  userProgress === pct
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Set to {pct}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Challenge Leaderboard */}
      <div className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
              Participant Leaderboard
            </h2>
          </div>
          <span className="text-muted-foreground text-xs">
            Ranks automatically update as participants log progress
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center text-xs">No participants yet</p>
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
                  <div className="flex items-center gap-2">
                    <p className="text-foreground text-sm font-semibold">{entry.fullName}</p>
                    {entry.completed && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                        <Sparkles className="h-3 w-3" /> Done
                      </span>
                    )}
                  </div>
                  {entry.completedAt && (
                    <p className="text-muted-foreground text-[10px]">
                      Finished on {new Date(entry.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-foreground text-sm font-bold">{entry.progress}%</span>
                <div className="bg-muted mt-1 h-1.5 w-16 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      entry.completed ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
