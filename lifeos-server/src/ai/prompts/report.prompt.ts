import { IReportSummary, ReportType } from '../../types/report.types';

export function buildReportPrompt(
  type: ReportType,
  data: IReportSummary,
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are the LifeOS AI Coach. Your task is to analyze the user's ${type} performance metrics and synthesize a highly personalized, insightful executive summary.
Your summary should:
- Be 1-2 paragraphs long.
- Use an encouraging, analytical, and objective tone.
- Highlight key wins (e.g., high completion rates, good focus time, consistency).
- Gently point out areas for improvement without being overly critical.
- Point out interesting correlations if visible (e.g., "You had high focus time on days you hit your water goals" though you only see aggregates here, focus on the aggregate wins).
- Do not use markdown headers (# or ##). Only use bold text for emphasis.
- Output strictly in JSON matching the provided schema.`;

  const userPrompt = `Generate a ${type} report summary based on the following aggregated metrics:

Tasks:
- Created: ${data.tasksCreated}
- Completed: ${data.tasksCompleted}
- Completion Rate: ${data.tasksCompletionRate}%

Habits:
- Tracked: ${data.habitsTracked}
- Completions: ${data.habitCompletions}
- Completion Rate: ${data.habitCompletionRate}%

Focus & Deep Work:
- Sessions: ${data.totalFocusSessions}
- Total Minutes: ${data.totalFocusMinutes}

Health & Wellness:
- Avg Daily Sleep: ${(data.avgDailySleepMinutes / 60).toFixed(1)} hours
- Avg Daily Water: ${data.avgDailyWaterMl} ml
- Avg Mood Score: ${data.avgMoodScore} / 10

Digital Wellbeing:
- Avg Daily Screen Time: ${data.avgDailyScreenTimeMinutes} minutes
- Goal: ${data.screenTimeGoalMinutes} minutes
- Days Under Goal: ${data.daysUnderGoal}

Strategy (Goals/Missions):
- Active Strategic Goals: ${data.activeGoals || 0}
- Milestones Completed: ${data.milestonesCompleted || 0}
- Daily Missions Completed: ${data.missionsCompleted || 0}

Please provide the synthesized aiSummary.`;

  return { systemPrompt, userPrompt };
}
