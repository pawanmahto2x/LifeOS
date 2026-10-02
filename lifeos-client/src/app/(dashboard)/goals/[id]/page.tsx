'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/features/goals/services/goal.service';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Flag,
  Activity,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { IAIGoalPlan, GoalStatus } from '@/types/goal.types';
import { AIPlanReview } from '@/features/goals/components/AIPlanReview';

export default function GoalDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const autoGenerate = searchParams.get('generate') === 'true';
  const [showAIPlan, setShowAIPlan] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (autoGenerate) {
      setShowAIPlan(true);
      fetchAIPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate]);

  const { data: goalData, isLoading } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalService.getById(id),
  });

  const {
    data: aiPlanData,
    isLoading: isLoadingAIPlan,
    isError: isErrorAIPlan,
    refetch: fetchAIPlan,
  } = useQuery({
    queryKey: ['goal-ai-plan', id],
    queryFn: () => goalService.generateAIPlan(id),
    enabled: false,
    retry: false, // If AI fails, let it show the error
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

      // Clean up the URL if it had ?generate=true
      if (autoGenerate) {
        router.replace(`/goals/${id}`);
      }
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

  const handleApplyAIPlan = (plan: IAIGoalPlan) => {
    applyAIPlanMutation.mutate(plan);
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground animate-pulse p-8 text-sm font-medium">
        Loading goal details...
      </div>
    );
  }

  const goal = goalData?.data;

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="bg-destructive/10 text-destructive mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-foreground text-lg font-bold">Goal not found</h2>
        <button
          onClick={() => router.push('/goals')}
          className="text-primary mt-2 font-medium hover:underline"
        >
          Return to Goals
        </button>
      </div>
    );
  }

  const isHealthCategory =
    goal.category?.toLowerCase() === 'health' || goal.category?.toLowerCase() === 'fitness';
  const currentMilestone = goal.milestones?.find((m) => !(m.completed ?? m.isCompleted));

  return (
    <div className="animate-in fade-in mx-auto max-w-5xl space-y-8 pb-20 duration-300">
      {/* HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push('/goals')}
            className="hover:bg-muted text-muted-foreground mt-1 cursor-pointer rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="bg-primary/10 text-primary border-primary/20 rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase">
                {goal.category}
              </span>
              <select
                value={goal.status}
                onChange={(e) => updateStatusMutation.mutate(e.target.value as GoalStatus)}
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase focus:outline-none ${
                  goal.status === 'completed' || goal.status === 'Completed'
                    ? 'border-green-500/20 bg-green-500/10 text-green-500'
                    : goal.status === 'paused' || goal.status === 'On Hold'
                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                      : goal.status === 'abandoned' || goal.status === 'Cancelled'
                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                        : 'border-blue-500/20 bg-blue-500/10 text-blue-500'
                }`}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight">{goal.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              {goal.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {goal.deadline && (
          <div className="border-border/80 bg-card flex shrink-0 items-center gap-3 rounded-2xl border p-4 shadow-sm">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Target Deadline
              </div>
              <div className="text-foreground text-sm font-bold">
                {new Date(goal.deadline).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {isHealthCategory && (
        <div className="border-border/80 bg-card flex items-start gap-3 rounded-2xl border border-blue-500/20 p-4 text-xs shadow-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Wellness Advisory:</strong> LifeOS
            recommendations support general lifestyle habits. LifeOS does not provide medical
            diagnoses.
          </p>
        </div>
      )}

      {/* AI PLAN REVIEW SECTION */}
      {showAIPlan && (
        <div className="mb-8">
          {isErrorAIPlan ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <div className="mb-2 text-lg font-bold text-red-500">AI Generation Failed</div>
              <p className="text-muted-foreground mb-6 text-sm">
                Ensure your AI provider (e.g., local Ollama) is running and the model is downloaded.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowAIPlan(false);
                    if (autoGenerate) router.replace(`/goals/${id}`);
                  }}
                  className="bg-muted hover:bg-muted/80 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => fetchAIPlan()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : isLoadingAIPlan || aiPlanData?.data ? (
            <AIPlanReview
              plan={aiPlanData?.data as IAIGoalPlan}
              isApplying={applyAIPlanMutation.isPending}
              isGenerating={isLoadingAIPlan}
              onApply={handleApplyAIPlan}
              onRegenerate={fetchAIPlan}
              onDismiss={() => {
                setShowAIPlan(false);
                if (autoGenerate) router.replace(`/goals/${id}`);
              }}
            />
          ) : null}
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* LEFT COLUMN: Roadmap & Progress */}
        <div className="space-y-6 md:col-span-2">
          {/* Progress Overview */}
          <div className="border-border/80 bg-card rounded-3xl border p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
                <Activity className="text-primary h-5 w-5" />
                Progress Tracker
              </h2>
              <div className="bg-primary/10 text-primary rounded-lg px-3 py-1 text-xs font-bold">
                {goal.progress}% Complete
              </div>
            </div>
            <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>

          {/* ROADMAP */}
          <div className="border-border/80 bg-card rounded-3xl border p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
                <Flag className="text-primary h-5 w-5" />
                Strategic Roadmap
              </h2>
              {goal.milestones?.length > 0 && !showAIPlan && (
                <button
                  onClick={handleGenerateAIPlan}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate Plan
                </button>
              )}
            </div>

            <div className="space-y-4">
              {goal.milestones?.length === 0 ? (
                <div className="border-border/50 bg-background/50 flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed py-12 text-center">
                  <Target className="text-muted-foreground h-8 w-8 opacity-50" />
                  <div>
                    <h3 className="text-foreground font-semibold">
                      This goal doesn&apos;t have a roadmap yet.
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Generate a roadmap to break this goal into manageable steps.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateAIPlan}
                    className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all hover:shadow-lg"
                  >
                    <Bot className="h-4 w-4" />
                    Generate AI Plan
                  </button>
                </div>
              ) : (
                <div className="border-border/60 relative ml-4 space-y-8 border-l-2 py-2 pl-6">
                  {goal.milestones?.map((milestone, index) => {
                    const isDone = Boolean(milestone.completed ?? milestone.isCompleted);
                    const isCurrent = currentMilestone?._id === milestone._id;

                    return (
                      <div key={milestone._id} className="relative">
                        {/* Timeline Node */}
                        <div
                          className={`absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                            isDone
                              ? 'bg-primary border-primary text-primary-foreground'
                              : isCurrent
                                ? 'bg-background border-primary text-primary'
                                : 'bg-background border-border text-muted-foreground'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-[10px] font-bold">{index + 1}</span>
                          )}
                        </div>

                        <div
                          onClick={() => toggleMilestoneMutation.mutate(milestone._id)}
                          className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                            isCurrent
                              ? 'border-primary/30 bg-primary/5 shadow-sm'
                              : 'border-border/50 bg-background/50 hover:border-border/80'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div
                                className={`text-base font-bold ${
                                  isDone
                                    ? 'text-muted-foreground line-through opacity-70'
                                    : 'text-foreground'
                                }`}
                              >
                                {milestone.title}
                              </div>
                              {isCurrent && (
                                <div className="text-primary mt-1 text-[10px] font-bold tracking-wider uppercase">
                                  Current Focus
                                </div>
                              )}
                            </div>
                            <div className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                              <CheckCircle2 className={`h-5 w-5 ${isDone ? 'text-primary' : ''}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Reports & Context */}
        <div className="space-y-6">
          <div className="border-border/80 bg-card rounded-3xl border p-6 shadow-sm">
            <h2 className="text-foreground mb-4 flex items-center gap-2 text-sm font-bold tracking-tight">
              <BarChart3 className="text-primary h-5 w-5" />
              Analysis
            </h2>

            <div className="space-y-3">
              <button
                onClick={handleViewReport}
                disabled={showReport || isLoadingReport}
                className="bg-muted text-foreground hover:bg-muted/80 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingReport ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Analyze Progress
              </button>
            </div>

            {showReport && reportData?.data && (
              <div className="border-border/50 mt-6 space-y-6 border-t pt-6">
                <div>
                  <div className="text-muted-foreground mb-3 text-[10px] font-bold tracking-wider uppercase">
                    Facts (Recorded Activity)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background border-border/50 rounded-xl border p-3 text-center">
                      <div className="text-foreground text-xl font-bold">
                        {reportData.data.completed?.tasks || 0}
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-[10px] font-bold uppercase">
                        Tasks
                      </div>
                    </div>
                    <div className="bg-background border-border/50 rounded-xl border p-3 text-center">
                      <div className="text-foreground text-xl font-bold">
                        {reportData.data.completed?.habits || 0}
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-[10px] font-bold uppercase">
                        Habits
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    Obstacles
                  </div>
                  <p className="text-foreground text-xs leading-relaxed">
                    {reportData.data.obstacles}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
