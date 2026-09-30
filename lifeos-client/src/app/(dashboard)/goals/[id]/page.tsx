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
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { IAIGoalPlan, GoalStatus } from '@/types/goal.types';

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
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowAIPlan(false);
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => {
      const milestone = goal?.milestones.find((m) => m._id === milestoneId);
      const isDone = Boolean(milestone?.completed ?? milestone?.isCompleted);
      return goalService.update(id, {
        milestones: goal?.milestones.map((m) =>
          m._id === milestoneId ? { ...m, completed: !isDone, isCompleted: !isDone } : m,
        ),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: GoalStatus) => goalService.update(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
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
    return <div className="text-muted-foreground animate-pulse p-6 text-sm">Loading goal...</div>;
  }

  const goal = goalData?.data;

  if (!goal) {
    return <div className="text-muted-foreground p-6 text-sm">Goal not found.</div>;
  }

  const isHealthCategory =
    goal.category?.toLowerCase() === 'health' || goal.category?.toLowerCase() === 'fitness';

  return (
    <div className="animate-in fade-in mx-auto max-w-4xl space-y-6 pb-20 duration-300">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="hover:bg-muted text-muted-foreground cursor-pointer rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <span className="border-border/80 bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize">
                {goal.category}
              </span>
              <span
                className={`border-border/80 rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                  goal.status === 'completed'
                    ? 'border-green-500/20 bg-green-500/10 text-green-500'
                    : goal.status === 'paused'
                      ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500'
                      : goal.status === 'abandoned'
                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                        : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {goal.status}
              </span>
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">{goal.title}</h1>
          </div>
        </div>

        {/* Goal Review / Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden text-xs sm:inline">Status:</span>
          <select
            value={goal.status}
            onChange={(e) => updateStatusMutation.mutate(e.target.value as GoalStatus)}
            className="border-border/80 bg-card text-foreground rounded-xl border px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </div>

      {/* Wellness & Non-Medical Guidance Alert */}
      {isHealthCategory && (
        <div className="border-border/80 bg-card flex items-start gap-3 rounded-2xl border border-blue-500/20 p-4 text-xs shadow-2xs">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Wellness Advisory:</strong> LifeOS
            recommendations support general lifestyle habits, hydration, and exercise consistency.
            LifeOS does not provide medical diagnoses or clinical care. For any symptoms or medical
            conditions, please consult a licensed healthcare professional.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Milestones Card */}
          <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-sm font-bold tracking-tight">Milestones</h2>
              <div className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                {goal.progress}% Complete
              </div>
            </div>

            <div className="bg-muted mb-6 h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            <div className="space-y-3">
              {goal.milestones?.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  No milestones added yet. Click &apos;Generate AI Plan&apos; to propose a roadmap.
                </div>
              ) : (
                goal.milestones?.map((milestone) => {
                  const isDone = Boolean(milestone.completed ?? milestone.isCompleted);
                  return (
                    <div
                      key={milestone._id}
                      onClick={() => toggleMilestoneMutation.mutate(milestone._id)}
                      className="hover:bg-muted/50 hover:border-border/40 flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-3 transition-colors"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="text-primary h-5 w-5" />
                        ) : (
                          <Circle className="text-muted-foreground h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-sm ${
                            isDone
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground font-medium'
                          }`}
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
                  );
                })
              )}
            </div>
          </div>

          {/* AI Plan Section */}
          {(showAIPlan || aiPlanData?.data) && (
            <div className="border-border/80 bg-card relative overflow-hidden rounded-2xl border p-5 shadow-2xs">
              <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-5">
                <Bot className="h-32 w-32" />
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary h-5 w-5" />
                  <h2 className="text-foreground text-sm font-bold tracking-tight">
                    AI Suggested Roadmap
                  </h2>
                </div>
                <span className="border-border/70 bg-muted/60 text-muted-foreground rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase">
                  Requires Approval
                </span>
              </div>

              {isLoadingAIPlan ? (
                <div className="text-muted-foreground flex animate-pulse items-center justify-center gap-2 py-8 text-center text-sm">
                  <RefreshCw className="text-primary h-4 w-4 animate-spin" />
                  Generating personalized strategy...
                </div>
              ) : aiPlanData?.data ? (
                <div className="relative z-10 space-y-6">
                  {aiPlanData.data.milestones?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
                        Proposed Milestones
                      </div>
                      <div className="space-y-2">
                        {aiPlanData.data.milestones.map((m, i) => (
                          <div
                            key={i}
                            className="text-foreground bg-muted/40 border-border/40 flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium"
                          >
                            <Target className="text-primary h-4 w-4 shrink-0" />
                            <span>{typeof m === 'string' ? m : (m as any).title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiPlanData.data.tasks?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
                        Recommended Actionable Tasks
                      </div>
                      <div className="space-y-2">
                        {aiPlanData.data.tasks.map((t, i) => (
                          <div
                            key={i}
                            className="text-foreground bg-muted/40 border-border/40 flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium"
                          >
                            <CheckSquare className="h-4 w-4 shrink-0 text-blue-500" />
                            <span>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiPlanData.data.habits?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
                        Keystone Habits (1-3 Realistic Behaviours)
                      </div>
                      <div className="space-y-2">
                        {aiPlanData.data.habits.map((h, i) => (
                          <div
                            key={i}
                            className="text-foreground bg-muted/40 border-border/40 flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium"
                          >
                            <div className="flex items-center gap-2.5">
                              <Repeat className="h-4 w-4 shrink-0 text-emerald-500" />
                              <span>{h.title}</span>
                            </div>
                            <span className="text-muted-foreground bg-background border-border/50 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase">
                              {h.frequency}
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
                      className="bg-primary text-primary-foreground cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs transition-opacity hover:opacity-90"
                    >
                      {applyAIPlanMutation.isPending ? 'Applying...' : 'Accept All & Add to LifeOS'}
                    </button>
                    <button
                      onClick={() => setShowAIPlan(false)}
                      className="bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
                    >
                      Dismiss
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
                  Goal Progress Report
                </h2>
              </div>

              {isLoadingReport ? (
                <div className="text-muted-foreground flex animate-pulse items-center justify-center gap-2 py-8 text-center text-sm">
                  <RefreshCw className="text-primary h-4 w-4 animate-spin" />
                  Analyzing progress and activity connections...
                </div>
              ) : reportData?.data ? (
                <div className="space-y-6">
                  {/* Facts Grid */}
                  <div>
                    <div className="text-muted-foreground mb-2 text-[10px] font-bold tracking-wider uppercase">
                      FACTS (Recorded Activity)
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/30 border-border/50 rounded-xl border p-3 text-center">
                        <div className="text-foreground text-2xl font-bold">
                          {reportData.data.completed?.tasks || 0}
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                          Tasks
                        </div>
                      </div>
                      <div className="bg-muted/30 border-border/50 rounded-xl border p-3 text-center">
                        <div className="text-foreground text-2xl font-bold">
                          {reportData.data.completed?.habits || 0}
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                          Habits
                        </div>
                      </div>
                      <div className="bg-muted/30 border-border/50 rounded-xl border p-3 text-center">
                        <div className="text-foreground text-2xl font-bold">
                          {reportData.data.completed?.focusSessions || 0}
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                          Focus Sessions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interpretation & Obstacles */}
                  <div>
                    <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      INTERPRETATION & OBSTACLES
                    </div>
                    <p className="text-foreground bg-muted/40 border-border/50 rounded-xl border p-3 text-xs leading-relaxed">
                      {reportData.data.obstacles}
                    </p>
                  </div>

                  {/* Recommendations */}
                  {reportData.data.nextMonthPriorities?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-2 text-[10px] font-bold tracking-wider uppercase">
                        RECOMMENDATIONS & PRIORITIES
                      </div>
                      <ul className="space-y-2">
                        {reportData.data.nextMonthPriorities.map((rec, i) => (
                          <li
                            key={i}
                            className="text-foreground bg-primary/5 border-primary/10 flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed"
                          >
                            <Sparkles className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
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

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
            <h2 className="text-foreground mb-4 text-sm font-bold tracking-tight">Actions</h2>

            <div className="space-y-3">
              <button
                onClick={handleGenerateAIPlan}
                disabled={showAIPlan || isLoadingAIPlan}
                className="bg-primary/10 text-primary hover:bg-primary/20 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Bot className="h-4 w-4" />
                Generate AI Plan
              </button>

              <button
                onClick={handleViewReport}
                disabled={showReport || isLoadingReport}
                className="border-border/80 bg-card text-foreground hover:bg-muted flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <BarChart3 className="h-4 w-4" />
                View Goal Report
              </button>
            </div>
          </div>

          <div className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs">
            <h2 className="text-foreground mb-4 text-sm font-bold tracking-tight">Goal Context</h2>

            <div className="space-y-4">
              <div>
                <div className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wider uppercase">
                  Description
                </div>
                <div className="text-foreground text-xs leading-relaxed">
                  {goal.description || 'No description provided.'}
                </div>
              </div>

              {goal.deadline && (
                <div>
                  <div className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wider uppercase">
                    Target Deadline
                  </div>
                  <div className="text-foreground text-xs font-medium">
                    {new Date(goal.deadline).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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
