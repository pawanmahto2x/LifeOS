'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApiService } from '@/features/journal/services/journal.service';
import { JournalCard } from '@/features/journal/components/journal-card';
import { JournalDialog } from '@/features/journal/components/journal-dialog';
import { IJournal } from '@/types/journal.types';
import { Plus, Search, BookOpen } from 'lucide-react';

export default function JournalPage() {
  const queryClient = useQueryClient();
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [journalToEdit, setJournalToEdit] = useState<IJournal | null>(null);

  // Fetch journals query
  const { data, isLoading } = useQuery({
    queryKey: ['journals', selectedMood, searchQuery],
    queryFn: async () => {
      const params: Parameters<typeof journalApiService.getJournals>[0] = {};
      if (selectedMood !== 'All') {
        params.mood = selectedMood;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const response = await journalApiService.getJournals(params);
      return response.data;
    },
  });

  const journals = data?.journals || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (journal: IJournal) => {
      return journalApiService.deleteJournal(journal._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });

  const handleEdit = (journal: IJournal) => {
    setJournalToEdit(journal);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setJournalToEdit(null);
    setIsDialogOpen(true);
  };

  const moodTabs = ['All', 'Excellent', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Sad', 'Angry'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Journal</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Reflect on your daily experiences, emotional states, and insights in private.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center space-x-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-neutral-950 shadow transition-colors hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 border-b border-neutral-800 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex scrollbar-none items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {moodTabs.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedMood === mood
                  ? 'bg-neutral-800 font-semibold text-white'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search entries or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 py-1.5 pr-3 pl-9 text-xs text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Journal Feed or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/30"
            />
          ))}
        </div>
      ) : journals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/10 p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-200">No journal entries found</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-neutral-500">
            {searchQuery || selectedMood !== 'All'
              ? 'No entries match your search or mood filter. Try resetting your filter.'
              : 'You have not written any journal entries yet. Capture your thoughts and reflections today.'}
          </p>
          <div className="mt-5">
            <button
              onClick={handleCreate}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Write your first reflection</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {journals.map((journal) => (
            <JournalCard
              key={journal._id}
              journal={journal}
              onEdit={handleEdit}
              onDelete={(j) => deleteMutation.mutate(j)}
            />
          ))}
        </div>
      )}

      {/* Journal Create / Edit Modal Dialog */}
      <JournalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        journalToEdit={journalToEdit}
      />
    </div>
  );
}
