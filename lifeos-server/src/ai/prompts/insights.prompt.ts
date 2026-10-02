export function buildInsightsPrompt(stats: any): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are an expert behavioral analyst. Analyze the user's past 30 days of daily logs (sleep, focus, tasks, habits, mood) and detect underlying patterns or correlations.
Return strictly a JSON object matching the provided schema.
- Limit to 3-5 of the most impactful patterns.
- Do NOT hallucinate data. Only infer patterns if the data supports it (e.g. higher focus on days with more sleep).
- Set 'confidence' based on the strength of the correlation in the provided data.`;

  const userPrompt = `Daily Aggregated Data (Last 30 Days):
${JSON.stringify(stats, null, 2)}

Please analyze this data and generate behavioral patterns.`;

  return { systemPrompt, userPrompt };
}
