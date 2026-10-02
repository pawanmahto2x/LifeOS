export function buildAICoachPrompt(
  question: string,
  _contextSummary: any,
  fact: string,
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are the LifeOS AI Coach, a highly intelligent, empathetic, and analytical productivity and wellness coach.
The user is asking you a direct question about their performance, well-being, or strategy.
You will be provided with factual context about their recent behavior (tasks completed, deep work, hydration, daily mission, etc.).
Your goal is to answer their question intelligently.
- Directly answer the question.
- Draw inferences from their actual data (the 'fact' string).
- Provide a concrete, actionable recommendation.
- Do NOT hallucinate data they haven't provided.
- Write naturally, without headers, formatted strictly as JSON.`;

  const userPrompt = `User's Question: "${question}"

Recent Context Facts:
${fact}

Please provide your coaching response.`;

  return { systemPrompt, userPrompt };
}

export function buildWeeklyReportPrompt(stats: any): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are the LifeOS AI Coach. Generate a weekly performance report based strictly on the provided JSON data. Do not hallucinate. Format strictly as JSON.`;
  const userPrompt = `Weekly Stats:\n${JSON.stringify(stats, null, 2)}\n\nGenerate the weekly report.`;
  return { systemPrompt, userPrompt };
}

export function buildHealthAnalysisPrompt(stats: any): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are the LifeOS AI Health Coach. Generate a health analysis based strictly on the provided JSON data. Format strictly as JSON.`;
  const userPrompt = `Health Stats (14 days):\n${JSON.stringify(stats, null, 2)}\n\nGenerate the health analysis.`;
  return { systemPrompt, userPrompt };
}
