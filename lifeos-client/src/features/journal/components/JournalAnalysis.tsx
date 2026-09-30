'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalAnalysisApiService } from '@/features/journal/services/journal-analysis.service';
import { Sparkles, Activity, Brain, LineChart, AlertCircle, Quote } from 'lucide-react';

interface JournalAnalysisProps {
  journalId: string;
  onClose?: () => void;
}

const themeColors: Record<string, string> = {
  productivity: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  procrastination: 'bg-red-500/10 text-red-500 border-red-500/20',
  sleep: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  stress: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  motivation: 'bg-green-500/10 text-green-500 border-green-500/20',
  accomplishment: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  difficulty: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  goals: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  energy: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  social: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  health: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  exercise: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  work: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  learning: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
  gratitude: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  anxiety: 'bg-red-600/10 text-red-600 border-red-600/20',
  focus: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  relationships: 'bg-pink-400/10 text-pink-400 border-pink-400/20',
};

export const JournalAnalysis: React.FC<JournalAnalysisProps> = ({ journalId }) => {
  const queryClient = useQueryClient();

  const {
    data: analysisRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['journal-analysis', journalId],
    queryFn: () => journalAnalysisApiService.getAnalysis(journalId),
    retry: 1,
  });

  const { mutate: analyze, isPending: isAnalyzing } = useMutation({
    mutationFn: () => journalAnalysisApiService.analyzeEntry(journalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-analysis', journalId] });
      queryClient.invalidateQueries({ queryKey: ['journal-themes'] });
    },
  });

  if (isLoading) {
    return (
      <div className="border-border/80 bg-card flex flex-col items-center justify-center rounded-2xl border p-10 shadow-2xs">
        <Sparkles className="text-primary mb-4 h-8 w-8 animate-pulse" />
        <p className="text-muted-foreground text-sm">Loading analysis...</p>
      </div>
    );
  }

  // Handle No Analysis yet
  if (isError || !analysisRes?.data) {
    return (
      <div className="border-border/80 bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center shadow-2xs">
        <Brain className="text-muted-foreground mb-4 h-10 w-10" />
        <h3 className="text-foreground text-sm font-bold tracking-tight">No Analysis Available</h3>
        <p className="text-muted-foreground mt-2 max-w-sm text-xs">
          Discover hidden patterns, track your mood, and connect your journal entries with your
          daily metrics.
        </p>
        <button
          onClick={() => analyze()}
          disabled={isAnalyzing}
          className="bg-primary text-primary-foreground mt-6 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Activity className="h-4 w-4 animate-spin" /> Analyzing Entry...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Analyze Entry
            </>
          )}
        </button>
      </div>
    );
  }

  const analysis = analysisRes.data;

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header & Overview */}
      <div className="border-border/80 bg-card flex flex-wrap gap-6 rounded-2xl border p-5 shadow-2xs">
        <div className="flex-1 space-y-2">
          <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            Themes
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.themes.length > 0 ? (
              analysis.themes.map((theme) => (
                <span
                  key={theme}
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-medium capitalize ${themeColors[theme] || 'bg-muted text-muted-foreground border-border/50'}`}
                >
                  {theme}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground text-xs italic">No themes detected.</span>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {analysis.extractedMood && (
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Mood
              </h4>
              <div className="border-border/80 bg-muted/50 flex h-8 items-center rounded-md border px-3 text-sm font-medium capitalize">
                {analysis.extractedMood}
              </div>
            </div>
          )}

          {analysis.extractedEnergy && (
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                Energy
              </h4>
              <div className="flex h-8 items-center">
                <span
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase ${
                    analysis.extractedEnergy === 'high'
                      ? 'border-green-500/30 bg-green-500/10 text-green-500'
                      : analysis.extractedEnergy === 'low'
                        ? 'border-red-500/30 bg-red-500/10 text-red-500'
                        : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
                  }`}
                >
                  {analysis.extractedEnergy}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Phrases */}
      {analysis.keyPhrases.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-foreground text-sm font-bold tracking-tight">Key Phrases</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {analysis.keyPhrases.map((phrase, i) => (
              <div
                key={i}
                className="border-border/80 bg-card hover:border-primary/40 flex items-start gap-3 rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-xs"
              >
                <Quote className="text-primary/50 mt-1 h-4 w-4 shrink-0" />
                <p className="text-foreground text-sm italic">&quot;{phrase}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Connections */}
      <div className="space-y-3">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-bold tracking-tight">
          <LineChart className="text-primary h-4 w-4" /> Data Connections
        </h3>
        {analysis.dataConnections.length > 0 ? (
          <div className="grid gap-4">
            {analysis.dataConnections.map((conn, idx) => (
              <div
                key={idx}
                className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-2xs"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="border-border/50 border-b border-l-4 border-l-blue-500 p-4 md:border-b-0">
                    <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      Journal Observation
                    </p>
                    <p className="text-foreground text-sm">&quot;{conn.observation}&quot;</p>
                  </div>
                  <div className="border-l-4 border-l-emerald-500 bg-emerald-500/5 p-4 md:border-l">
                    <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      Recorded Data ({conn.metric})
                    </p>
                    <p className="text-foreground text-sm font-medium">{conn.recordedData}</p>
                  </div>
                </div>
                {conn.comparison && (
                  <div className="bg-muted/30 border-border/50 border-t px-4 py-3">
                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3 w-3" /> {conn.comparison}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="border-border/80 bg-card text-muted-foreground flex items-center gap-3 rounded-2xl border border-dashed p-6 text-sm shadow-2xs">
            <Activity className="h-5 w-5 opacity-50" />
            No distinct data connections found in this entry.
          </div>
        )}
      </div>
    </div>
  );
};
