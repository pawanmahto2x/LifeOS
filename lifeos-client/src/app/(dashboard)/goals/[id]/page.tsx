'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/features/goals/services/goal.service';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Bot,
  BarChart3,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Repeat,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { IAIGoalPlan } from '@/types/goal.types';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [showAIPlan, setShowAIPlan] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const { data: goalData, isLoading } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalService.getById(id),
  });

  const {
    data: aiPlanData,
    isLoading: isLoadingAIPlan,
    refetch: fetchAIPlan,
  } = useQuery({
    queryKey: ['goal-ai-plan', id],
    queryFn: () => goalService.generateAIPlan(id),
    enabled: false,
  });

  const {
    data: reportData,
    isLoading: isLoadingReport,
    refetch: fetchReport,
  } = useQuery({
    queryKey: ['goal-report', id],
    queryFn: () => goalService.getReport(id),
    enabled: false,
  });

  const applyAIPlanMutation = useMutation({
    mutationFn: (plan: Partial<IAIGoalPlan>) => goalService.applyAIPlan(id, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', id] });
      setShowAIPlan(false);
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => {
      const milestone = goal?.milestones.find((m) => m._id === milestoneId);
      return goalService.update(id, {
        milestones: goal?.milestones.map((m) =>
          m._id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m,
        ),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', id] });
    },
  });

  const handleGenerateAIPlan = () => {
    setShowAIPlan(true);
    fetchAIPlan();
  };

  const handleViewReport = () => {
    setShowReport(true);
    fetchReport();
  };

  if (isLoading) {
    return <div className="text-muted-foreground animate-pulse text-sm">Loading goal...</div>;
  }

  const goal = goalData?.data;

  if (!goal) {
    return <div className="text-muted-foreground text-sm">Goal not found.</div>;
  }

  return (
    <div className="animate-in fade-in mx-auto max-w-4xl space-y-6 pb-12 duration-300">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="hover:bg-muted text-muted-foreground rounded-full p-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="mb-1 flex items-center gap-3">
            <span className="border-border/80 bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold">
              {goal.category}
            </span>
            <span
              className={`border-border/80 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                goal.status === 'Completed'
                  ? 'border-green-500/20 bg-green-500/10 text-green-500'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}
            >
              {goal.status}
            </span>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">{goal.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-sm font-bold tracking-tight">Milestones</h2>
              <div className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                {goal.progress}% Complete
              </div>
            </div>

            <div className="bg-muted mb-6 h-2 w-full rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            <div className="space-y-3">
              {goal.milestones?.length === 0 ? (
                <div className="text-muted-foreground py-4 text-center text-xs">
                  No milestones added yet.
                </div>
              ) : (
                goal.milestones?.map((milestone) => (
                  <div
                    key={milestone._id}
                    onClick={() => toggleMilestoneMutation.mutate(milestone._id)}
                    className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {milestone.isCompleted ? (
                        <CheckCircle2 className="text-primary h-5 w-5" />
                      ) : (
                        <Circle className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-sm ${milestone.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}
                      >
                        {milestone.title}
                      </div>
                      {milestone.targetDate && (
                        <div className="text-muted-foreground mt-0.5 text-xs">
                          Due: {new Date(milestone.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Plan Section */}
          {(showAIPlan || aiPlanData?.data) && (
            <div className="border-border/80 bg-card relative overflow-hidden rounded-2xl border p-5 shadow-2xs">
              <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-5">
                <Bot className="h-32 w-32" />
              </div>

              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="text-primary h-5 w-5" />
                <h2 className="text-foreground text-sm font-bold tracking-tight">
                  AI Suggested Plan
                </h2>
              </div>

              {isLoadingAIPlan ? (
                <div className="text-muted-foreground animate-pulse py-8 text-center text-sm">
                  Generating optimal strategy...
                </div>
              ) : aiPlanData?.data ? (
                <div className="relative z-10 space-y-6">
                  {aiPlanData.data.milestones?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
                        Suggested Milestones
                      </div>
                      <div className="space-y-2">
                        {aiPlanData.data.milestones.map((m, i) => (
                          <div
                            key={i}
                            className="text-foreground bg-muted/50 flex items-center gap-2 rounded-lg p-2 text-sm"
                          >
                            <Target className="text-muted-foreground h-4 w-4" />
                            {typeof m === 'string' ? m : (m as any).title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiPlanData.data.tasks?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
                        Recommended Tasks
                      </div>
                      <div className="space-y-2">
                        {aiPlanData.data.tasks.map((t, i) => (
                          <div
                            key={i}
                            className="text-foreground bg-muted/50 flex items-center gap-2 rounded-lg p-2 text-sm"
                          >
                            <CheckSquare className="text-muted-foreground h-4 w-4" />
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiPlanData.data.habits?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
                        Keystone Habits
                      </div>
                      <div className="space-y-2">
                        {aiPlanData.data.habits.map((h, i) => (
                          <div
                            key={i}
                            className="text-foreground bg-muted/50 flex items-center gap-2 rounded-lg p-2 text-sm"
                          >
                            <Repeat className="text-muted-foreground h-4 w-4" />
                            <span>
                              {h.title}{' '}
                              <span className="text-muted-foreground ml-1 text-xs">
                                ({h.frequency})
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-border/50 flex items-center gap-3 border-t pt-4">
                    <button
                      onClick={() =>
                        applyAIPlanMutation.mutate(aiPlanData.data as Partial<IAIGoalPlan>)
                      }
                      disabled={applyAIPlanMutation.isPending}
                      className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                    >
                      {applyAIPlanMutation.isPending ? 'Applying...' : 'Accept Selected'}
                    </button>
                    <button
                      onClick={() => setShowAIPlan(false)}
                      className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Goal Report Section */}
          {(showReport || reportData?.data) && (
            <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
              <div className="mb-6 flex items-center gap-2">
                <BarChart3 className="text-primary h-5 w-5" />
                <h2 className="text-foreground text-sm font-bold tracking-tight">
                  Progress Report
                </h2>
              </div>

              {isLoadingReport ? (
                <div className="text-muted-foreground animate-pulse py-8 text-center text-sm">
                  Analyzing progress...
                </div>
              ) : reportData?.data ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-xl p-4 text-center">
                      <div className="text-foreground mb-1 text-3xl font-bold">
                        {reportData.data.completed?.tasks || 0}
                      </div>
                      <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Tasks
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 text-center">
                      <div className="text-foreground mb-1 text-3xl font-bold">
                        {reportData.data.completed?.habits || 0}
                      </div>
                      <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Habits
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 text-center">
                      <div className="text-foreground mb-1 text-3xl font-bold">
                        {reportData.data.completed?.focusSessions || 0}
                      </div>
                      <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Focus Sessions
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      Consistency Analysis
                    </div>
                    <p className="text-foreground bg-muted/50 rounded-lg p-3 text-sm">
                      Your general consistency score is {reportData.data.consistency?.general || 0}
                      %.
                    </p>
                  </div>

                  {reportData.data.obstacles && (
                    <div>
                      <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Identified Obstacles
                      </div>
                      <p className="text-foreground bg-muted/50 rounded-lg p-3 text-sm">
                        {reportData.data.obstacles}
                      </p>
                    </div>
                  )}

                  {reportData.data.nextMonthPriorities?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                        Next Month Priorities
                      </div>
                      <ul className="space-y-2">
                        {reportData.data.nextMonthPriorities.map((rec, i) => (
                          <li
                            key={i}
                            className="text-foreground bg-primary/5 border-primary/10 flex items-start gap-2 rounded-lg border p-3 text-sm"
                          >
                            <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
            <h2 className="text-foreground mb-4 text-sm font-bold tracking-tight">Actions</h2>

            <div className="space-y-3">
              <button
                onClick={handleGenerateAIPlan}
                disabled={showAIPlan || isLoadingAIPlan}
                className="bg-primary/10 text-primary hover:bg-primary/20 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Bot className="h-4 w-4" />
                Generate AI Plan
              </button>

              <button
                onClick={handleViewReport}
                disabled={showReport || isLoadingReport}
                className="border-border/80 bg-card text-foreground hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <BarChart3 className="h-4 w-4" />
                View Monthly Report
              </button>
            </div>
          </div>

          <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
            <h2 className="text-foreground mb-4 text-sm font-bold tracking-tight">Details</h2>

            <div className="space-y-4">
              <div>
                <div className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wider uppercase">
                  Description
                </div>
                <div className="text-foreground text-sm">
                  {goal.description || 'No description provided.'}
                </div>
              </div>

              {goal.deadline && (
                <div>
                  <div className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wider uppercase">
                    Target Date
                  </div>
                  <div className="text-foreground text-sm">
                    {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
