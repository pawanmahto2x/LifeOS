# LifeOS Local AI Model Evaluation Plan

Before selecting the permanent local open-weight model for LifeOS, we will evaluate candidates against the following criteria to ensure they meet the specific needs of the application's Intelligence Layer.

## Evaluation Criteria

1. **Goal Planning (Structured Output)**
   - **Test:** Generate a 5-milestone, 15-task, 3-habit plan for a complex, multi-stage goal (e.g., "Transition career to AI Engineering").
   - **Requirement:** Must output strictly valid JSON conforming to the `IAIGoalPlan` Zod schema without trailing characters or markdown wrapping breaking the parser.
   - **Quality:** Tasks must be actionable; milestones must be sequential.

2. **Report Interpretation (Facts vs. Inference vs. Recommendation)**
   - **Test:** Provide the LLM with deterministic analytics (e.g., tasks completed = 12, focus hours = 8, sleep avg = 6.5h).
   - **Requirement:** Must clearly separate the stated facts from its inferences (e.g., "Your focus dropped late in the week") and recommendations (e.g., "Schedule focus blocks earlier").
   - **Quality:** Must not hallucinate metrics that were not provided in the context.

3. **Insight Interpretation**
   - **Test:** Provide deterministic correlation patterns (e.g., "High sleep correlates with high task completion").
   - **Requirement:** Must produce a cohesive narrative explaining *why* this pattern might exist, using empathetic, coaching-style language.

4. **Hallucination Resistance**
   - **Test:** Ask the AI Coach a question unrelated to the user's data (e.g., "What is the capital of France?" or "How many tasks did my friend complete?").
   - **Requirement:** Must refuse to answer or pivot back to the user's LifeOS context. Must accurately state when there is insufficient data to draw an inference.

5. **Response Latency & Hardware Requirements**
   - **Target Latency:** 
     - Structured JSON (Goals): < 15 seconds.
     - Text generation (Coach/Reports): < 8 seconds (time to first token if streaming, or total response if not).
   - **Hardware Constraint:** Must run comfortably on a standard developer machine (e.g., 16GB RAM, M-series Mac or equivalent Windows PC) with acceptable tokens/sec. 

## Top Candidates to Evaluate

1. **Llama 3.1 (8B)**
   - *Pros:* Excellent reasoning, fast on most hardware, highly capable JSON mode.
   - *Cons:* May be overly verbose in free-text coach responses if not prompted strictly.
2. **Qwen 2.5 (7B)**
   - *Pros:* Exceptional coding/JSON adherence, very fast, strong multilingual support.
   - *Cons:* Slightly less conversational empathy than Llama for coaching.
3. **Mistral (7B-v0.3 or NeMo)**
   - *Pros:* Solid instruction following, natively supports tool use/structured output well.
   - *Cons:* Sometimes hallucinates on complex multi-step reasoning compared to Llama 3.

## Evaluation Process
1. Initialize the `ProviderFactory` with the candidate model in `AI_MODEL`.
2. Run the `ai-provider.test.ts` suite.
3. Perform manual UX testing through the frontend for Goal Planning, Reports, and AI Coach.
4. Document latency and token usage metrics.
