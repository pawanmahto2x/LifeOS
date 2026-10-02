'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Target,
  CheckSquare,
  Repeat,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { IAIGoalPlan } from '@/types/goal.types';

interface AIPlanReviewProps {
  plan: IAIGoalPlan;
  isApplying: boolean;
  isGenerating: boolean;
  onApply: (plan: IAIGoalPlan) => void;
  onRegenerate: () => void;
  onDismiss: () => void;
}

export function AIPlanReview({
  plan,
  isApplying,
  isGenerating,
  onApply,
  onRegenerate,
  onDismiss,
}: AIPlanReviewProps) {
  // Keep local state for editing
  const [editedPlan, setEditedPlan] = useState<IAIGoalPlan>(plan);

  // Keep track of which items are being edited
  const [editingMilestone, setEditingMilestone] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingHabit, setEditingHabit] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Update local state when a new plan is generated
  useEffect(() => {
    setEditedPlan(plan);
  }, [plan]);

  // --- Handlers for Milestones ---
  const handleRemoveMilestone = (index: number) => {
    const updated = { ...editedPlan };
    updated.milestones.splice(index, 1);
    // Also remove tasks associated with this milestone, and shift indices
    updated.tasks = updated.tasks
      .filter((t) => t.milestoneIndex !== index)
      .map((t) => ({
        ...t,
        milestoneIndex:
          t.milestoneIndex !== undefined && t.milestoneIndex > index
            ? t.milestoneIndex - 1
            : t.milestoneIndex,
      }));
    setEditedPlan(updated);
  };

  const saveMilestone = (index: number) => {
    if (editValue.trim()) {
      const updated = { ...editedPlan };
      updated.milestones[index] = editValue.trim();
      setEditedPlan(updated);
    }
    setEditingMilestone(null);
  };

  // --- Handlers for Tasks ---
  const handleRemoveTask = (index: number) => {
    const updated = { ...editedPlan };
    updated.tasks.splice(index, 1);
    setEditedPlan(updated);
  };

  const saveTask = (index: number) => {
    if (editValue.trim()) {
      const updated = { ...editedPlan };
      updated.tasks[index].title = editValue.trim();
      setEditedPlan(updated);
    }
    setEditingTask(null);
  };

  // --- Handlers for Habits ---
  const handleRemoveHabit = (index: number) => {
    const updated = { ...editedPlan };
    updated.habits.splice(index, 1);
    setEditedPlan(updated);
  };

  const saveHabit = (index: number) => {
    if (editValue.trim()) {
      const updated = { ...editedPlan };
      updated.habits[index].title = editValue.trim();
      setEditedPlan(updated);
    }
    setEditingHabit(null);
  };

  if (isGenerating) {
    return (
      <div className="border-border/80 bg-card rounded-3xl border p-8 shadow-sm">
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-8 text-center">
          <RefreshCw className="text-primary h-8 w-8 animate-spin" />
          <div>
            <h3 className="text-foreground font-bold tracking-tight">Generating your roadmap...</h3>
            <p className="mt-1 text-sm">
              Analyze goal &middot; Build milestones &middot; Organize tasks &middot; Suggest habits
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!editedPlan) return null;

  return (
    <div className="border-border/80 bg-card relative overflow-hidden rounded-3xl border shadow-sm">
      {/* Background Watermark */}
      <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-[0.03]">
        <Bot className="h-64 w-64" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-6 w-6" />
              <h2 className="text-foreground text-xl font-bold tracking-tight">
                AI Suggested Roadmap
              </h2>
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                Review Required
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              AI suggestions are generated from your goal information. Review and edit them before
              adding them to LifeOS.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* MILESTONES & TASKS */}
          <div>
            <h3 className="text-muted-foreground mb-4 text-[11px] font-bold tracking-wider uppercase">
              Phase 1: Milestones & Actionable Tasks
            </h3>
            <div className="space-y-4">
              {editedPlan.milestones.map((milestone, mIndex) => {
                const isEditingM = editingMilestone === mIndex;
                const tasksForMilestone = editedPlan.tasks.filter(
                  (t) => t.milestoneIndex === mIndex,
                );

                return (
                  <div
                    key={`m-${mIndex}`}
                    className="border-border/60 bg-background/50 rounded-2xl border p-4"
                  >
                    {/* Milestone Header */}
                    <div className="group flex items-center justify-between gap-3">
                      <div className="flex flex-1 items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold">
                          {mIndex + 1}
                        </div>
                        {isEditingM ? (
                          <div className="flex flex-1 items-center gap-2">
                            <input
                              className="bg-background flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                            />
                            <button
                              onClick={() => saveMilestone(mIndex)}
                              className="text-primary hover:bg-primary/10 rounded-lg p-1.5"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 font-semibold">
                            {typeof milestone === 'string' ? milestone : (milestone as any).title}
                          </div>
                        )}
                      </div>

                      {!isEditingM && (
                        <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setEditingMilestone(mIndex);
                              setEditValue(
                                typeof milestone === 'string'
                                  ? milestone
                                  : (milestone as any).title,
                              );
                            }}
                            className="text-muted-foreground hover:text-foreground p-1.5"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveMilestone(mIndex)}
                            className="text-muted-foreground hover:text-destructive p-1.5"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Associated Tasks */}
                    {tasksForMilestone.length > 0 && (
                      <div className="border-border/60 mt-3 ml-11 space-y-2 border-l-2 border-dashed pl-4">
                        {editedPlan.tasks.map((task, tIndex) => {
                          if (task.milestoneIndex !== mIndex) return null;
                          const isEditingT = editingTask === tIndex;
                          return (
                            <div
                              key={`t-${tIndex}`}
                              className="group flex items-center justify-between gap-2"
                            >
                              {isEditingT ? (
                                <div className="flex flex-1 items-center gap-2">
                                  <input
                                    className="bg-background flex-1 rounded-lg border px-3 py-1.5 text-xs"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveTask(tIndex)}
                                    className="text-primary hover:bg-primary/10 rounded-lg p-1"
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 text-sm">
                                    <CheckSquare className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                                    <span className="text-muted-foreground">{task.title}</span>
                                  </div>
                                  <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                      onClick={() => {
                                        setEditingTask(tIndex);
                                        setEditValue(task.title);
                                      }}
                                      className="text-muted-foreground hover:text-foreground p-1"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveTask(tIndex)}
                                      className="text-muted-foreground hover:text-destructive p-1"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* HABITS */}
          {editedPlan.habits.length > 0 && (
            <div>
              <h3 className="text-muted-foreground mb-4 text-[11px] font-bold tracking-wider uppercase">
                Phase 2: Keystone Habits
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {editedPlan.habits.map((habit, hIndex) => {
                  const isEditingH = editingHabit === hIndex;
                  return (
                    <div
                      key={`h-${hIndex}`}
                      className="group bg-background/50 border-border/60 flex items-center justify-between gap-3 rounded-2xl border p-4"
                    >
                      {isEditingH ? (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            className="bg-background flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => saveHabit(hIndex)}
                            className="text-primary hover:bg-primary/10 rounded-lg p-1.5"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Repeat className="h-4 w-4 shrink-0 text-emerald-500" />
                            <div>
                              <div className="text-sm font-semibold">{habit.title}</div>
                              <div className="text-muted-foreground text-[10px] tracking-wider uppercase">
                                {habit.frequency}
                              </div>
                            </div>
                          </div>
                          <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => {
                                setEditingHabit(hIndex);
                                setEditValue(habit.title);
                              }}
                              className="text-muted-foreground hover:text-foreground p-1.5"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveHabit(hIndex)}
                              className="text-muted-foreground hover:text-destructive p-1.5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="border-border/50 mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:bg-muted rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onRegenerate}
              className="bg-muted text-foreground hover:bg-muted/80 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
            <button
              onClick={() => onApply(editedPlan)}
              disabled={isApplying}
              className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {isApplying ? 'Applying...' : 'Accept & Apply Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
