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
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">Journal</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Reflect on your daily experiences, emotional states, and insights in private.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center justify-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="border-border/80 bg-card flex flex-col gap-3 rounded-2xl border p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex scrollbar-none items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {moodTabs.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                selectedMood === mood
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5" />
          <input
            type="text"
            placeholder="Search entries or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-input bg-background/80 text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary/40 w-full rounded-xl border py-1.5 pr-3 pl-9 text-xs transition-colors focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Journal Feed or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-border/80 bg-card h-48 animate-pulse rounded-2xl border"
            />
          ))}
        </div>
      ) : journals.length === 0 ? (
        <div className="border-border/80 bg-card/60 rounded-2xl border border-dashed p-12 text-center shadow-2xs">
          <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">No journal entries found</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
            {searchQuery || selectedMood !== 'All'
              ? 'No entries match your search or mood filter. Try resetting your filter.'
              : 'You have not written any journal entries yet. Capture your thoughts and reflections today.'}
          </p>
          <div className="mt-5">
            <button
              onClick={handleCreate}
              className="border-border bg-muted/80 text-foreground hover:bg-muted inline-flex cursor-pointer items-center space-x-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all active:scale-[0.98]"
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
