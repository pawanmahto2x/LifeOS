'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthApiService } from '../services/health.service';
import { MoodDialog } from './mood-dialog';
import { MoodType } from '@/types/health.types';
import { Smile, Plus, Trash2, Sparkles } from 'lucide-react';

export function MoodTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeMoodForDialog, setActiveMoodForDialog] = useState<MoodType | undefined>();
  const queryClient = useQueryClient();

  const { data: moodData, isLoading } = useQuery({
    queryKey: ['health-mood'],
    queryFn: async () => {
      const res = await healthApiService.getMoodLogs();
      return res.data;
    },
  });

  const { data: summaryData } = useQuery({
    queryKey: ['health-summary'],
    queryFn: async () => {
      const res = await healthApiService.getSummary();
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await healthApiService.deleteMoodLog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-mood'] });
      queryClient.invalidateQueries({ queryKey: ['health-summary'] });
    },
  });

  const getMoodEmoji = (mood: MoodType | string) => {
    switch (mood) {
      case 'Excellent':
        return '🌟';
      case 'Happy':
        return '😊';
      case 'Calm':
        return '😌';
      case 'Neutral':
        return '😐';
      case 'Stressed':
        return '😰';
      case 'Sad':
        return '😔';
      case 'Angry':
        return '😠';
      default:
        return '🙂';
    }
  };

  const logs = moodData?.logs ?? [];
  const averageScore = summaryData?.mood?.sevenDayAverageScore ?? null;

  const handleOpenDialog = (mood?: MoodType) => {
    setActiveMoodForDialog(mood);
    setIsDialogOpen(true);
  };

  return (
    <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Smile className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold">Mood Tracker</h3>
            <p className="text-muted-foreground text-xs">Daily emotional wellness and reflection</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Check In
        </button>
      </div>

      {/* Mood Quick Check-in Chips */}
      <div className="mb-6">
        <p className="text-muted-foreground mb-2 text-xs font-medium">Quick Check-in:</p>
        <div className="flex flex-wrap gap-1.5">
          {(
            ['Excellent', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Sad', 'Angry'] as MoodType[]
          ).map((mood) => (
            <button
              key={mood}
              onClick={() => handleOpenDialog(mood)}
              className="border-border bg-background/60 text-foreground hover:bg-muted flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-colors"
            >
              <span>{getMoodEmoji(mood)}</span>
              <span>{mood}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7-day average score if data exists */}
      {averageScore !== null && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-foreground text-xs font-medium">7-Day Mood Average</span>
          </div>
          <span className="text-sm font-bold text-amber-500">{averageScore} / 10</span>
        </div>
      )}

      {/* Mood History */}
      <div>
        <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          Mood History
        </h4>

        {isLoading ? (
          <div className="text-muted-foreground py-6 text-center text-xs">Loading mood logs...</div>
        ) : logs.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-xl border border-dashed py-8 text-center text-xs">
            No mood logs recorded yet. Check in above to start tracking your emotional trends!
          </div>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {logs.map((log) => {
              const logId = log.id || log._id || '';
              return (
                <div
                  key={logId}
                  className="border-border bg-background/50 hover:bg-muted/50 flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getMoodEmoji(log.mood)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-foreground text-sm font-medium">{log.mood}</p>
                        <span className="py-0.2 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 text-[9px] font-semibold text-amber-500">
                          {log.moodScore}/10
                        </span>
                      </div>
                      {log.note && (
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                          {log.note}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-0.5 text-[10px]">
                        {new Date(log.loggedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(log.loggedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(logId)}
                    disabled={deleteMutation.isPending}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg p-1 transition-colors"
                    title="Delete check-in"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MoodDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialMood={activeMoodForDialog}
      />
    </div>
  );
}
