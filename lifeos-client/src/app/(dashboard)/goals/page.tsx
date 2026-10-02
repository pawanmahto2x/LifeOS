'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { goalService } from '@/features/goals/services/goal.service';
import { Target, Plus, ChevronRight, Calendar, Flag, Activity } from 'lucide-react';
import Link from 'next/link';
import { CreateGoalDialog } from '@/features/goals/components/CreateGoalDialog';

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });

  const goals = data?.data || [];

  const activeGoals = goals.filter(
    (g) => g.status === 'active' || g.status === 'In Progress' || g.status === 'Not Started',
  );
  const completedGoals = goals.filter((g) => g.status === 'completed' || g.status === 'Completed');

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
            Strategic Goals
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Design your life roadmap and let AI break it down into actionable steps.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all hover:opacity-90 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create Goal
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse text-sm">
          Loading strategic roadmap...
        </div>
      ) : goals.length === 0 ? (
        <div className="border-border/80 bg-card flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed p-16 text-center shadow-sm">
          <div className="bg-primary/10 text-primary mb-2 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-foreground text-lg font-bold tracking-tight">
            Start with something you want to change, build, or achieve.
          </h3>
          <p className="text-muted-foreground max-w-md text-sm">
            LifeOS uses AI to help you break down ambitious goals into realistic milestones, tasks,
            and daily habits.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground mt-6 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-all hover:shadow-lg"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active Goals Section */}
          <section>
            <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-bold tracking-tight">
              <Activity className="text-primary h-5 w-5" />
              Active Goals
            </h2>
            {activeGoals.length === 0 ? (
              <div className="text-muted-foreground bg-muted/40 rounded-2xl border border-dashed p-8 text-center text-sm">
                No active goals. Time to start a new mission.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {activeGoals.map((goal) => {
                  const currentMilestone = goal.milestones?.find(
                    (m) => !(m.completed ?? m.isCompleted),
                  );

                  return (
                    <Link key={goal._id} href={`/goals/${goal._id}`}>
                      <div className="border-border/80 bg-card hover:border-primary/40 flex h-full cursor-pointer flex-col rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-4 flex items-start justify-between">
                          <span className="bg-primary/10 text-primary border-primary/20 rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase">
                            {goal.category}
                          </span>
                          <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>

                        <h3 className="text-foreground mb-2 line-clamp-2 text-lg font-bold tracking-tight">
                          {goal.title}
                        </h3>

                        {goal.deadline && (
                          <div className="text-muted-foreground mb-5 flex items-center gap-1.5 text-xs font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="mt-auto space-y-2 pt-4">
                          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground">{goal.progress}%</span>
                          </div>
                          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-500"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>

                        {currentMilestone && (
                          <div className="bg-muted/40 border-border/50 mt-5 rounded-xl border p-3">
                            <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                              <Flag className="h-3 w-3 text-emerald-500" />
                              Current Milestone
                            </div>
                            <div className="text-foreground truncate text-xs font-semibold">
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
          </section>

          {/* Completed Goals Section */}
          {completedGoals.length > 0 && (
            <section className="opacity-80">
              <h2 className="text-foreground text-muted-foreground mb-4 text-sm font-bold tracking-tight">
                Recently Completed
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {completedGoals.map((goal) => (
                  <Link key={goal._id} href={`/goals/${goal._id}`}>
                    <div className="border-border/60 bg-muted/20 hover:bg-muted/40 rounded-2xl border p-4 transition-colors">
                      <h3 className="text-foreground truncate text-sm font-semibold">
                        {goal.title}
                      </h3>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {new Date(goal.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <CreateGoalDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
