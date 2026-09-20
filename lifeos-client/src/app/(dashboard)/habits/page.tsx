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
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Habits</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Build consistency, track daily streaks, and cultivate long-term discipline.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-border/80 bg-card flex scrollbar-none items-center space-x-1.5 overflow-x-auto rounded-2xl border p-2 shadow-2xs">
        {frequencyTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFrequency(tab)}
            className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
              selectedFrequency === tab
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
              className="border-border/80 bg-card h-48 animate-pulse rounded-2xl border"
            />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="border-border/80 bg-card/60 rounded-2xl border border-dashed p-12 text-center shadow-2xs">
          <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Repeat className="h-6 w-6" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">No habits tracked yet</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
            {selectedFrequency !== 'All'
              ? `No ${selectedFrequency.toLowerCase()} habits found. Try switching filter tabs.`
              : 'Add your first recurring habit to start building streaks and daily momentum.'}
          </p>
          <div className="mt-5">
            <button
              onClick={handleCreate}
              className="border-border bg-muted/80 text-foreground hover:bg-muted inline-flex cursor-pointer items-center space-x-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all active:scale-[0.98]"
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
