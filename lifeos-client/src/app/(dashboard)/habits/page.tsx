'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitApiService } from '@/features/habits/services/habit.service';
import { HabitCard } from '@/features/habits/components/habit-card';
import { HabitDialog } from '@/features/habits/components/habit-dialog';
import { IHabit } from '@/types/habit.types';
import { Plus, Repeat } from 'lucide-react';

export default function HabitsPage() {
  const queryClient = useQueryClient();
  const [selectedFrequency, setSelectedFrequency] = useState<string>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<IHabit | null>(null);

  // Fetch habits query
  const { data, isLoading } = useQuery({
    queryKey: ['habits', selectedFrequency],
    queryFn: async () => {
      const params: Parameters<typeof habitApiService.getHabits>[0] = {};
      if (selectedFrequency !== 'All') {
        params.frequency = selectedFrequency;
      }
      const response = await habitApiService.getHabits(params);
      return response.data;
    },
  });

  const habits = data?.habits || [];

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: async (habit: IHabit) => {
      return habitApiService.completeHabit(habit._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // Skip mutation
  const skipMutation = useMutation({
    mutationFn: async (habit: IHabit) => {
      return habitApiService.skipHabit(habit._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // Toggle pause mutation
  const togglePauseMutation = useMutation({
    mutationFn: async (habit: IHabit) => {
      if (habit.isPaused) {
        return habitApiService.resumeHabit(habit._id);
      }
      return habitApiService.pauseHabit(habit._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (habit: IHabit) => {
      return habitApiService.deleteHabit(habit._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const handleEdit = (habit: IHabit) => {
    setHabitToEdit(habit);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setHabitToEdit(null);
    setIsDialogOpen(true);
  };

  const frequencyTabs = ['All', 'Daily', 'Weekly', 'Monthly'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Habits</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Build consistency, track daily streaks, and cultivate long-term discipline.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center space-x-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-neutral-950 shadow transition-colors hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex scrollbar-none items-center space-x-1.5 overflow-x-auto border-b border-neutral-800 pb-2">
        {frequencyTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFrequency(tab)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedFrequency === tab
                ? 'bg-neutral-800 font-semibold text-white'
                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Habits Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/30"
            />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/10 p-12 text-center">
          <Repeat className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-200">No habits tracked yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
            {selectedFrequency !== 'All'
              ? `No ${selectedFrequency.toLowerCase()} habits found. Try switching filter tabs.`
              : 'Add your first recurring habit to start building streaks and daily momentum.'}
          </p>
          <div className="mt-5">
            <button
              onClick={handleCreate}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create your first habit</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit._id}
              habit={habit}
              onComplete={(h) => completeMutation.mutate(h)}
              onSkip={(h) => skipMutation.mutate(h)}
              onTogglePause={(h) => togglePauseMutation.mutate(h)}
              onEdit={handleEdit}
              onDelete={(h) => deleteMutation.mutate(h)}
            />
          ))}
        </div>
      )}

      {/* Habit Create / Edit Modal Dialog */}
      <HabitDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        habitToEdit={habitToEdit}
      />
    </div>
  );
}
