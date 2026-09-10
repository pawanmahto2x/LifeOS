'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApiService } from '@/features/groups/services/group.service';
import { GroupCard } from '@/features/groups/components/group-card';
import { CreateGroupDialog } from '@/features/groups/components/create-group-dialog';
import { JoinGroupDialog } from '@/features/groups/components/join-group-dialog';
import { ICreateGroupDto } from '@/types/group.types';
import { Users, Plus, KeyRound, ShieldAlert } from 'lucide-react';

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: groupsData, isLoading } = useQuery({
    queryKey: ['user-groups'],
    queryFn: async () => {
      const res = await groupApiService.getUserGroups();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ICreateGroupDto) => groupApiService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      setIsCreateOpen(false);
      setErrorMsg(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create group');
    },
  });

  const joinMutation = useMutation({
    mutationFn: (code: string) => groupApiService.joinGroupByCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      setIsJoinOpen(false);
      setErrorMsg(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setErrorMsg(err.response?.data?.message || 'Failed to join group');
    },
  });

  const groups = groupsData || [];

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Accountability Groups
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Collaborate, share goals, climb group leaderboards, and stay accountable together.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setIsJoinOpen(true);
            }}
            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Join with Code
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setIsCreateOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Groups Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-border bg-card h-40 animate-pulse rounded-2xl border" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="border-border bg-card rounded-2xl border p-12 text-center shadow-sm">
          <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Users className="text-muted-foreground h-6 w-6" />
          </div>
          <p className="text-foreground text-sm font-semibold">No Groups Joined Yet</p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs leading-relaxed">
            Create an accountability group for your team or enter an invite code to join an existing
            one.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 text-xs font-bold transition-colors"
            >
              Create Group
            </button>
            <button
              type="button"
              onClick={() => setIsJoinOpen(true)}
              className="border-border hover:bg-muted text-foreground rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
            >
              Join with Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateGroupDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      <JoinGroupDialog
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSubmit={(code) => joinMutation.mutate(code)}
        isLoading={joinMutation.isPending}
      />
    </div>
  );
}
