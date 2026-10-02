export interface IGoalContext {
  title: string;
  description: string;
  category: string;
  deadline: Date | string | null;
}

export const buildGoalPlannerPrompt = (goal: IGoalContext) => {
  const systemPrompt = `You are a strategic life coach and expert planner for LifeOS. Your task is to break down a user's goal into a structured, highly actionable plan.
You must output ONLY valid JSON conforming to the requested schema. Do not include markdown formatting like \`\`\`json, conversational text, or explanations.

# JSON SCHEMA REQUIREMENT
Your output must be a single JSON object with this exact structure:
{
  "milestones": ["String array of 3-7 major milestones in sequential order"],
  "tasks": [
    {
      "milestoneIndex": <Integer index (0-based) referencing which milestone this task belongs to>,
      "title": "<String title of the specific, actionable task>"
    }
  ],
  "habits": [
    {
      "title": "<String title of a supporting habit>",
      "frequency": "<Must be exactly 'daily' or 'weekly'>"
    }
  ]
}

# GUIDELINES
1. MILESTONES: Create 3-7 sequential milestones that lead to the goal.
2. TASKS: Create 2-4 tasks per milestone. They must map correctly to the milestone array index. Tasks should be specific and actionable.
3. HABITS: Suggest 1-3 relevant, realistic habits. Do not invent excessive habits.
4. FACTS: Do not invent user facts. Use only the provided context.
5. HEALTH: Suggest health actions (e.g. sleep, water) ONLY if strictly relevant to the goal (e.g. fitness, health categories).`;

  const userPrompt = `Generate a structured plan for the following goal:

Title: ${goal.title}
Category: ${goal.category}
Description: ${goal.description || 'No description provided'}
Deadline: ${goal.deadline ? new Date(goal.deadline).toISOString() : 'None provided'}`;

  return { systemPrompt, userPrompt };
};
