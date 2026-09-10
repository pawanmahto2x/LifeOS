'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeApiService } from '@/features/challenges/services/challenge.service';
import { ChallengeCard } from '@/features/challenges/components/challenge-card';
import { CreateChallengeDialog } from '@/features/challenges/components/create-challenge-dialog';
import { ICreateChallengeDto } from '@/types/challenge.types';
import { Trophy, Plus, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Productivity', 'Fitness', 'Learning', 'Mindfulness', 'Health'];

export default function ChallengesPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: challengesData, isLoading } = useQuery({
    queryKey: ['challenges', selectedCategory, statusFilter],
    queryFn: async () => {
      const res = await challengeApiService.getChallenges({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ICreateChallengeDto) => challengeApiService.createChallenge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setIsCreateOpen(false);
    },
  });

  const challenges = challengesData || [];

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="h-5 w-5" />
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Community Challenges
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Join shared milestones, build lasting habits, and see where you rank on the leaderboard.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-1.5 self-start rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-colors sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Challenge
        </button>
      </div>

      {/* Category Pills & Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="border-border bg-muted/40 flex items-center gap-1 self-start rounded-xl border p-1 sm:self-auto">
          {(['all', 'active', 'upcoming'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-border bg-card h-48 animate-pulse rounded-2xl border" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="border-border bg-card rounded-2xl border p-12 text-center shadow-sm">
          <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Trophy className="text-muted-foreground h-6 w-6" />
          </div>
          <p className="text-foreground text-sm font-semibold">No Challenges Found</p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs leading-relaxed">
            There are no challenges matching your current filter. Create one to kickstart a shared
            sprint!
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 text-xs font-bold transition-colors"
            >
              Create Challenge
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <ChallengeCard key={c._id} challenge={c} />
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateChallengeDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
