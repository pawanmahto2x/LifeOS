'use client';

import React, { useState } from 'react';
import { Target, X, Bot, Sparkles, Activity } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '../services/goal.service';
import { useRouter } from 'next/navigation';

interface CreateGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGoalDialog({ isOpen, onClose }: CreateGoalDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'career',
    deadline: '',
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: typeof formData) => goalService.create(data as any),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      // Redirect to goal detail page with an auto-generate trigger
      router.push(`/goals/${res.data?._id}?generate=true`);
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      createGoalMutation.mutate({
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '',
      });
    }
  };

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card border-border/80 animate-in fade-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-3xl border shadow-xl duration-200">
        <div className="border-border/50 flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
              <Target className="h-4 w-4" />
            </div>
            <h2 className="text-foreground font-bold tracking-tight">
              {step === 1 ? 'Define Your Goal' : 'Add Context for AI'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 ? (
            <div className="animate-in slide-in-from-right-4 space-y-5 duration-300">
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-semibold">
                  What do you want to achieve?
                </label>
                <input
                  name="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-background focus:border-primary/50 focus:ring-primary/20 border-input w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:outline-none"
                  placeholder="e.g. Become an AI/ML Engineer, Run a Marathon..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-semibold">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-background focus:border-primary/50 focus:ring-primary/20 border-input w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:outline-none"
                  >
                    <option value="career">Career</option>
                    <option value="health">Health & Fitness</option>
                    <option value="education">Education</option>
                    <option value="finance">Finance</option>
                    <option value="personal">Personal Growth</option>
                    <option value="relationships">Relationships</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-semibold">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="bg-background focus:border-primary/50 focus:ring-primary/20 border-input w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 space-y-5 duration-300">
              <div className="bg-primary/5 border-primary/20 flex items-start gap-3 rounded-2xl border p-4 text-sm">
                <Sparkles className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground font-semibold">AI Context Building:</strong>{' '}
                  Provide specific constraints, your current skill level, or time limitations so the
                  AI can build a realistic, tailored roadmap for you.
                </p>
              </div>

              <div>
                <label className="text-foreground mb-1.5 block text-sm font-semibold">
                  Why is this important & what are your constraints?
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background focus:border-primary/50 focus:ring-primary/20 border-input min-h-[120px] w-full resize-none rounded-xl border px-4 py-3 text-sm shadow-sm transition-all focus:ring-2 focus:outline-none"
                  placeholder="e.g. I only have 10 hours a week to dedicate to this. I'm currently a web developer transitioning to AI..."
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-semibold transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={createGoalMutation.isPending}
              className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {step === 1 ? (
                'Continue'
              ) : createGoalMutation.isPending ? (
                'Creating...'
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Create Goal & Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
