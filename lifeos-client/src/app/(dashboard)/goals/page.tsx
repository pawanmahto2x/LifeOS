'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { goalService } from '@/features/goals/services/goal.service';
import { Target, Plus, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });

  const goals = data?.data || [];

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1 text-sm">Define and track your life strategy.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Goal
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse text-sm">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="border-border/80 bg-card flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed p-12 text-center shadow-2xs">
          <div className="bg-primary/10 text-primary mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-foreground text-sm font-bold tracking-tight">No goals yet</h3>
          <p className="text-muted-foreground max-w-sm text-xs">
            Define what you want from your life. Set your first goal to start tracking milestones
            and AI-driven plans.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary/10 text-primary hover:bg-primary/20 mt-4 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const currentMilestone = goal.milestones?.find((m) => !(m.completed ?? m.isCompleted));

            return (
              <Link key={goal._id} href={`/goals/${goal._id}`}>
                <div className="border-border/80 bg-card hover:border-primary/40 flex h-full cursor-pointer flex-col rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="border-border/80 bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                      {goal.category}
                    </span>
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  </div>

                  <h3 className="text-foreground mb-2 line-clamp-2 text-sm font-bold tracking-tight">
                    {goal.title}
                  </h3>

                  {goal.deadline && (
                    <div className="text-muted-foreground mb-4 flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="mt-auto space-y-2 pt-4">
                    <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase">
                      <span>Progress</span>
                      <span className="text-primary">{goal.progress}%</span>
                    </div>
                    <div className="bg-muted h-1.5 w-full rounded-full">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {currentMilestone && (
                    <div className="border-border/50 mt-4 border-t pt-4">
                      <div className="text-muted-foreground mb-1 text-[10px] font-semibold uppercase">
                        Current Milestone
                      </div>
                      <div className="text-foreground truncate text-xs">
                        {currentMilestone.title}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Basic Create Goal Modal */}
      {isModalOpen && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-border/80 animate-in fade-in zoom-in-95 w-full max-w-md rounded-2xl border p-6 shadow-lg duration-200">
            <h2 className="mb-4 text-xl font-bold">Create New Goal</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as string,
                  deadline: new Date(formData.get('deadline') as string).toISOString(),
                };
                goalService
                  .create(payload as any)
                  .then(() => {
                    setIsModalOpen(false);
                    window.location.reload();
                  })
                  .catch((err) => console.error(err));
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-muted-foreground text-xs font-semibold uppercase">
                  Title
                </label>
                <input
                  name="title"
                  required
                  className="bg-background mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="e.g. Become a Full Stack Developer"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-semibold uppercase">
                  Description
                </label>
                <textarea
                  name="description"
                  className="bg-background mt-1 h-20 w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Optional details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-xs font-semibold uppercase">
                    Category
                  </label>
                  <select
                    name="category"
                    className="bg-background mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  >
                    <option value="career">Career</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                    <option value="finance">Finance</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-semibold uppercase">
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    className="bg-background mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
