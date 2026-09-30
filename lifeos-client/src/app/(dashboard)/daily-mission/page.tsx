'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyMissionApiService } from '@/features/daily-mission/services/daily-mission.service';
import { useAuthStore } from '@/store/auth.store';
import {
  Battery,
  Target,
  Zap,
  Repeat,
  Flame,
  HeartPulse,
  CheckSquare,
  AlertCircle,
  ShieldAlert,
  Compass,
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { IDailyMission, ISubmitReviewInput } from '@/types/daily-mission.types';

export default function DailyMissionPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [showExplanation, setShowExplanation] = useState(false);

  const [reviewForm, setReviewForm] = useState<ISubmitReviewInput>({
    whatWentWell: '',
    whatRemainedIncomplete: '',
    moodReflection: '',
    tomorrowChange: '',
  });

  const {
    data: missionResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['daily-mission', 'today'],
    queryFn: dailyMissionApiService.getTodayMission,
  });

  const generateMutation = useMutation({
    mutationFn: dailyMissionApiService.generateMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-mission', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['daily-mission', 'today', 'dashboard'] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { id: string; review: ISubmitReviewInput }) =>
      dailyMissionApiService.submitReview(data.id, data.review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-mission', 'today'] });
    },
  });

  const mission = missionResponse?.data;

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = () => {
    if (!mission?._id) return;
    reviewMutation.mutate({ id: mission._id, review: reviewForm });
  };

  if (isLoading) {
    return (
      <div className="animate-in fade-in flex h-64 items-center justify-center duration-300">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  if (!mission && !generateMutation.isPending) {
    return (
      <div className="animate-in fade-in space-y-6 duration-300">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Good morning, {user?.fullName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-muted-foreground">{todayFormatted}</p>
        </div>

        <div className="border-border flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center shadow-sm">
          <div className="bg-primary/10 mb-4 rounded-full p-4">
            <Compass className="text-primary h-8 w-8" />
          </div>
          <h2 className="text-foreground mb-2 text-xl font-semibold">
            No mission generated yet for today
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md text-sm">
            Click 'Generate Mission' to create your personalized day plan based on your tasks,
            habits, and recent performance.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Star className="mr-2 h-4 w-4" />
            )}
            Generate Mission
          </button>
        </div>
      </div>
    );
  }

  if (generateMutation.isPending) {
    return (
      <div className="animate-in fade-in flex h-64 flex-col items-center justify-center space-y-4 duration-300">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          Generating your personalized mission for today...
        </p>
      </div>
    );
  }

  if (!mission) return null;

  const getDayTypeStyles = (type: IDailyMission['dayType']) => {
    switch (type) {
      case 'recovery':
        return {
          badge: 'bg-red-500/10 text-red-500 border-red-500/20',
          icon: <Battery className="mr-1 h-3 w-3" />,
          label: 'Recovery Day',
          border: 'border-t-red-500',
        };
      case 'high-focus':
        return {
          badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          icon: <Zap className="mr-1 h-3 w-3" />,
          label: 'High-Focus Day',
          border: 'border-t-emerald-500',
        };
      case 'normal':
      default:
        return {
          badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          icon: <Target className="mr-1 h-3 w-3" />,
          label: 'Normal Day',
          border: 'border-t-blue-500',
        };
    }
  };

  const dayTypeStyle = getDayTypeStyles(mission.dayType);

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'habit':
        return <Repeat className="h-4 w-4 text-purple-500" />;
      case 'focus':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'health':
        return <HeartPulse className="h-4 w-4 text-rose-500" />;
      case 'task':
      default:
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 pb-12 duration-300">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Today's Mission</h1>
          <p className="text-muted-foreground">{todayFormatted}</p>
        </div>
        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${dayTypeStyle.badge}`}
        >
          {dayTypeStyle.icon}
          {dayTypeStyle.label}
        </div>
      </div>

      {/* Primary Mission Card */}
      <div
        className={`border-border/80 bg-card overflow-hidden rounded-2xl border border-t-4 ${dayTypeStyle.border} shadow-2xs`}
      >
        <div className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <Star className="text-primary h-5 w-5" />
            <h2 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              Primary Mission
            </h2>
          </div>
          <h3 className="text-foreground mb-3 text-2xl font-bold">
            {mission.primaryMission.title}
          </h3>
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-semibold">WHY:</span>{' '}
            {mission.primaryMission.reason}
          </p>
          {mission.primaryMission.taskId && (
            <div className="mt-4">
              <a
                href={`/tasks/${mission.primaryMission.taskId}`}
                className="text-primary text-sm font-medium hover:underline"
              >
                View related task &rarr;
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Reminder */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-2xs dark:border-amber-900/50 dark:bg-amber-900/10">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">
              Personal Reminder
            </h3>
          </div>
          <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
            {mission.personalReminder}
          </p>
        </div>

        {/* Avoidance */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-2xs dark:border-red-900/50 dark:bg-red-900/10">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-500" />
            <h3 className="text-sm font-bold text-red-800 dark:text-red-400">One Thing to Avoid</h3>
          </div>
          <p className="text-sm text-red-900/80 dark:text-red-200/80">{mission.avoidance}</p>
        </div>
      </div>

      {/* Supporting Goals */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-sm font-bold tracking-tight">Supporting Goals</h3>
        </div>
        <p className="text-muted-foreground mb-4 text-xs italic">
          Note: This plan serves as your high-level strategy for today. To mark these habits or
          focus sessions as completed, use their dedicated modules (Health, Habits, Focus) from the
          sidebar. Your progress will automatically sync here!
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mission.supportingGoals.map((goal, idx) => (
            <div
              key={idx}
              className="border-border/80 bg-card hover:border-primary/40 rounded-xl border p-4 shadow-2xs transition-all hover:shadow-xs"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="bg-muted rounded-md p-2">{getGoalIcon(goal.type)}</div>
                {goal.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="text-muted-foreground/30 h-5 w-5" />
                )}
              </div>
              <h4 className="text-foreground mb-1 line-clamp-2 text-sm font-medium">
                {goal.title}
              </h4>
              {goal.targetValue && (
                <p className="text-muted-foreground text-xs">{goal.targetValue}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Why This Plan? */}
      <div className="border-border/80 bg-card rounded-2xl border shadow-2xs">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <span className="text-foreground text-sm font-bold tracking-tight">Why This Plan?</span>
          {showExplanation ? (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          )}
        </button>
        {showExplanation && (
          <div className="border-border/50 border-t p-5 text-sm">
            <div className="space-y-4">
              <div>
                <span className="text-foreground mb-1 block font-semibold">Day Type Reason:</span>
                <p className="text-muted-foreground">{mission.explanation.dayTypeReason}</p>
              </div>
              <div>
                <span className="text-foreground mb-1 block font-semibold">Mission Reason:</span>
                <p className="text-muted-foreground">{mission.explanation.missionReason}</p>
              </div>
              <div>
                <span className="text-foreground mb-1 block font-semibold">Reminder Reason:</span>
                <p className="text-muted-foreground">{mission.explanation.reminderReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Daily Review */}
      <div className="border-border/80 bg-card mt-8 rounded-2xl border p-6 shadow-2xs">
        <h3 className="text-foreground mb-6 text-lg font-bold tracking-tight">End of Day Review</h3>

        {mission.review ? (
          <div className="space-y-6">
            <div className="bg-muted/50 grid grid-cols-3 gap-4 rounded-xl p-4">
              <div className="text-center">
                <p className="text-foreground text-2xl font-bold">
                  {mission.review.completedTasks}/{mission.review.plannedTasks}
                </p>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Tasks
                </p>
              </div>
              <div className="text-center">
                <p className="text-foreground text-2xl font-bold">
                  {mission.review.completedHabits}/{mission.review.plannedHabits}
                </p>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Habits
                </p>
              </div>
              <div className="text-center">
                <p className="text-foreground text-2xl font-bold">{mission.review.focusMinutes}m</p>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Focus
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-foreground mb-2 text-sm font-semibold">What went well</h4>
                <p className="text-muted-foreground text-sm">
                  {mission.review.whatWentWell || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="text-foreground mb-2 text-sm font-semibold">
                  What remained incomplete
                </h4>
                <p className="text-muted-foreground text-sm">
                  {mission.review.whatRemainedIncomplete || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="text-foreground mb-2 text-sm font-semibold">Mood reflection</h4>
                <p className="text-muted-foreground text-sm">
                  {mission.review.moodReflection || 'No notes'}
                </p>
              </div>
              <div>
                <h4 className="text-foreground mb-2 text-sm font-semibold">Change for tomorrow</h4>
                <p className="text-muted-foreground text-sm">
                  {mission.review.tomorrowChange || 'No notes'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-foreground text-xs font-semibold">
                  What went well today?
                </label>
                <textarea
                  name="whatWentWell"
                  value={reviewForm.whatWentWell}
                  onChange={handleReviewChange}
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  placeholder="Celebrate your wins..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-foreground text-xs font-semibold">
                  What remained incomplete & why?
                </label>
                <textarea
                  name="whatRemainedIncomplete"
                  value={reviewForm.whatRemainedIncomplete}
                  onChange={handleReviewChange}
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  placeholder="Reflect without judgment..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-foreground text-xs font-semibold">
                  Mood & energy reflection
                </label>
                <textarea
                  name="moodReflection"
                  value={reviewForm.moodReflection}
                  onChange={handleReviewChange}
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  placeholder="How did you feel today?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-foreground text-xs font-semibold">
                  One change for tomorrow
                </label>
                <textarea
                  name="tomorrowChange"
                  value={reviewForm.tomorrowChange}
                  onChange={handleReviewChange}
                  rows={3}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  placeholder="What will you do differently?"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleReviewSubmit}
                disabled={reviewMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
