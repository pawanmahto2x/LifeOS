export function buildJournalAnalysisPrompt(content: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are an expert psychological text analyst. Your task is to analyze the user's journal entry and extract themes, mood, energy, and key phrases.
You must return the analysis strictly as a JSON object matching the provided schema.
- 'themes': Select all applicable themes from the predefined list.
- 'extractedMood': 'positive', 'negative', 'neutral', or null if undeterminable.
- 'extractedEnergy': 'high', 'medium', 'low', or null if undeterminable.
- 'keyPhrases': 1 to 5 sentences that capture the essence of the entry. Keep them concise.`;

  const userPrompt = `Analyze the following journal entry:

"""
${content}
"""

Please provide the structured analysis.`;

  return { systemPrompt, userPrompt };
}
