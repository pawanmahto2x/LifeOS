'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApiService } from '../services/ai.service';
import { IAICoachResponse } from '@/types/ai.types';
import { Bot, Send, Sparkles, CheckSquare, Flame, Repeat, Droplets } from 'lucide-react';

interface AICoachCardProps {
  hasKey: boolean;
}

export function AICoachCard({ hasKey }: AICoachCardProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<IAICoachResponse | null>(null);

  const coachMutation = useMutation({
    mutationFn: (q: string) => aiApiService.askCoach(q),
    onSuccess: (res) => {
      setResponse(res.data || null);
    },
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    coachMutation.mutate(question.trim());
  };

  const sampleQuestions = [
    'How can I improve my task completion rate?',
    'What should I prioritize during my next focus block?',
    'How is my hydration affecting my energy levels?',
  ];

  if (!hasKey) {
    return (
      <div className="border-border bg-card rounded-2xl border p-8 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
          <Bot className="text-muted-foreground h-6 w-6" />
        </div>
        <p className="text-foreground text-sm font-semibold">AI Coach is Inactive</p>
        <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs leading-relaxed">
          Add your API key above to unlock personalized coaching grounded strictly in your real
          LifeOS database metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card space-y-4 rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-foreground text-sm font-bold tracking-wider uppercase">
            AI Productivity Coach
          </h2>
          <p className="text-muted-foreground text-xs">
            Grounded entirely in your verified tasks, focus sessions, and habits.
          </p>
        </div>
      </div>

      {/* Suggestion prompt chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sampleQuestions.map((sq) => (
          <button
            key={sq}
            type="button"
            onClick={() => setQuestion(sq)}
            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl border px-3 py-1.5 text-left text-xs whitespace-nowrap transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleAsk} className="relative flex items-center">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your coach anything about your progress..."
          className="border-input bg-background text-foreground focus:ring-primary/20 w-full rounded-xl border px-4 py-2.5 pr-12 text-xs outline-none focus:ring-2"
        />
        <button
          type="submit"
          disabled={coachMutation.isPending || !question.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground absolute right-2 rounded-lg p-1.5 transition-colors disabled:opacity-50"
          title="Send query"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Response Box */}
      {coachMutation.isPending && (
        <div className="border-border bg-muted/30 text-muted-foreground flex animate-pulse items-center gap-2.5 rounded-xl border p-4 text-xs">
          <Sparkles className="text-primary h-4 w-4 animate-spin" />
          <span>Analyzing your verified database metrics...</span>
        </div>
      )}

      {response && (
        <div className="border-primary/20 bg-primary/5 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Coach Insights
            </h3>
          </div>
          <p className="text-foreground text-xs leading-relaxed">{response.answer}</p>

          {/* Context badges */}
          <div className="border-border/50 text-muted-foreground flex flex-wrap items-center gap-3 border-t pt-2.5 text-[10px] font-semibold">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" /> {response.contextSummary.tasksCompletedThisWeek}{' '}
              tasks this week
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3" /> {response.contextSummary.focusMinutesThisWeek}m focus
            </span>
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3" /> {response.contextSummary.activeHabitCount} habits
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" /> {response.contextSummary.currentHydrationMl}ml today
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
