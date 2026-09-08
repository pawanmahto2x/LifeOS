'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusApiService } from '../services/focus.service';
import { Flame, Trash2, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export function FocusHistory() {
  const queryClient = useQueryClient();

  const { data: focusData, isLoading } = useQuery({
    queryKey: ['focus'],
    queryFn: async () => {
      const res = await focusApiService.getSessions();
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await focusApiService.deleteSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus'] });
    },
  });

  const sessions = focusData?.sessions || [];

  return (
    <div className="border-border bg-card rounded-3xl border p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-foreground text-lg font-semibold">Session History</h3>
          <p className="text-muted-foreground text-xs">Log of your deep work focus blocks</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-8 text-center text-xs">
          Loading focus history...
        </div>
      ) : sessions.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-2xl border border-dashed py-12 text-center text-xs">
          No focus sessions recorded yet. Start a session above to begin tracking your deep work!
        </div>
      ) : (
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {sessions.map((session) => {
            const sessionId = session._id || session.id || '';
            const taskTitle =
              typeof session.taskId === 'object' && session.taskId !== null
                ? session.taskId.title
                : null;

            return (
              <div
                key={sessionId}
                className="border-border bg-background/50 hover:bg-muted/40 flex items-start justify-between rounded-2xl border p-4 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground flex items-center gap-1 text-sm font-bold">
                      <Flame className="h-4 w-4 text-amber-500" />
                      {session.duration} mins
                    </span>
                    {session.completed ? (
                      <span className="py-0.2 flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 text-[10px] font-semibold text-emerald-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="bg-muted border-border py-0.2 text-muted-foreground rounded-full border px-2 text-[10px] font-semibold">
                        Interrupted
                      </span>
                    )}

                    {session.distractions > 0 && (
                      <span className="py-0.2 flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 text-[10px] font-semibold text-rose-500">
                        <AlertCircle className="h-3 w-3" />
                        {session.distractions}{' '}
                        {session.distractions === 1 ? 'distraction' : 'distractions'}
                      </span>
                    )}
                  </div>

                  {taskTitle && (
                    <p className="text-foreground/90 text-xs font-medium">
                      Task: <span className="text-primary">{taskTitle}</span>
                    </p>
                  )}

                  {session.notes && (
                    <p className="text-muted-foreground text-xs italic">
                      &quot;{session.notes}&quot;
                    </p>
                  )}

                  <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                    <Calendar className="h-3 w-3" />
                    {new Date(session.startedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    •{' '}
                    {new Date(session.startedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <button
                  onClick={() => deleteMutation.mutate(sessionId)}
                  disabled={deleteMutation.isPending}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg p-1.5 transition-colors"
                  title="Delete session"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
