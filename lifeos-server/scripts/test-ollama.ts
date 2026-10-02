import { ProviderFactory } from '../src/ai/provider.factory';
import { env } from '../src/config/env';
import { buildGoalPlannerPrompt } from '../src/ai/prompts/goal-planner.prompt';
import { aiGoalPlanSchema } from '../src/ai/schemas/goal-plan.schema';
import mongoose from 'mongoose';

async function runTest() {
  console.log('--- STARTING REAL MODEL INTEGRATION TEST ---');
  
  // Set up env to force local ollama if not already set
  env.AI_PROVIDER = 'ollama';
  env.AI_MODEL = env.AI_MODEL || 'qwen2.5:7b'; 
  env.AI_BASE_URL = env.AI_BASE_URL || 'http://localhost:11434';
  env.AI_TIMEOUT_MS = 120000;
  
  console.log(`[Diagnostic] Base URL: ${env.AI_BASE_URL}`);
  console.log(`[Diagnostic] Model: ${env.AI_MODEL}`);
  
  const dummyUserId = new mongoose.Types.ObjectId().toString();

  // Mock repo to bypass Mongoose connection
  const mockRepo = {
    findByUserId: async () => null // Force fallback to env variables
  };
  const factory = new ProviderFactory(mockRepo as any);

  try {
    const provider = await factory.getProvider(dummyUserId);
    console.log(`[+] Provider initialized: ${provider.name}`);
    
    const status = await provider.testConnection();
    if (!status.success) {
      console.error(`[-] Could not connect to Ollama at ${process.env.AI_BASE_URL}. Ensure Ollama is running and the model is pulled.`);
      process.exit(1);
    }
    console.log(`[+] Connection successful (latency: ${status.latencyMs}ms)`);

    const testGoals = [
      {
        title: 'Become an AI/ML Engineer',
        category: 'career',
        description: 'Transition from web development to machine learning and AI.',
        deadline: new Date('2026-12-31')
      },
      {
        title: 'Become a 3D Game Developer',
        category: 'career',
        description: 'Learn Unreal Engine and C++ to build 3D games.',
        deadline: new Date('2027-06-01')
      },
      {
        title: 'Improve my fitness and build a consistent exercise routine',
        category: 'fitness',
        description: 'I want to lose 10 lbs and build muscle.',
        deadline: null
      }
    ];

    for (let i = 0; i < testGoals.length; i++) {
      const goal = testGoals[i];
      console.log(`\n\n=== Evaluating Goal ${i + 1}: ${goal.title} ===`);
      
      const { systemPrompt, userPrompt } = buildGoalPlannerPrompt(goal);
      
      const start = Date.now();
      const rawOutput = await provider.generateStructured(userPrompt, systemPrompt);
      const elapsed = Date.now() - start;
      
      console.log(`[+] Received response in ${elapsed}ms`);
      
      try {
        const parsed = aiGoalPlanSchema.parse(rawOutput);
        console.log(`[+] Validation Passed! Received ${parsed.milestones.length} milestones, ${parsed.tasks.length} tasks, ${parsed.habits.length} habits.`);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (err) {
        console.error(`[-] Validation failed for Goal ${i+1}:`, err);
        console.log('Raw output was:', rawOutput);
      }
    }
    
    console.log('\n--- REAL MODEL TEST COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during test:', error);
    process.exit(1);
  }
}

runTest();
