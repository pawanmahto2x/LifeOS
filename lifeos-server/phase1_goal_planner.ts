import mongoose from 'mongoose';
import { GoalService } from './src/services/goal.service.ts';
import { User } from './src/models/user.model.ts';
import { AISettings } from './src/models/ai-settings.model.ts';
import { Goal } from './src/models/goal.model.ts';
import dotenv from 'dotenv';
dotenv.config();

async function runGoalPlannerTests() {
  console.log('--- PHASE 1: GOAL PLANNER OLLAMA INTEGRATION ---');
  
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifeos-test');
  console.log('Connected to MongoDB.');

  const goalService = new GoalService();
  
  try {
    // 1. Setup Test User
    let user = await User.findOne({ email: 'ollama_tester@test.com' });
    if (!user) {
      user = await User.create({ email: 'ollama_tester@test.com', password: 'password123', fullName: 'Tester' });
    }
    
    // 2. Setup AI Settings for Ollama
    await AISettings.findOneAndUpdate(
      { userId: user._id },
      { 
        provider: 'ollama', 
        model: 'qwen2.5:7b',
        baseUrl: 'http://localhost:11434',
        isEnabled: true 
      },
      { upsert: true }
    );
    console.log('AI Settings configured for local Ollama.');

    // 3. Create Goal A
    let goalA = await Goal.create({
      userId: user._id,
      title: 'Become a Full Stack Developer',
      category: 'career',
      status: 'active',
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    });
    
    console.log(`\nGenerating Plan for Goal A: "${goalA.title}"...`);
    const t0 = Date.now();
    const planA = await goalService.generateAIPlan(goalA._id.toString(), user._id.toString());
    const t1 = Date.now();
    console.log(`Goal A Latency: ${t1 - t0}ms`);
    console.log(JSON.stringify(planA, null, 2));

    // 4. Create Goal B
    let goalB = await Goal.create({
      userId: user._id,
      title: 'Train for a 10K running event',
      category: 'health',
      status: 'active',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    });
    
    console.log(`\nGenerating Plan for Goal B: "${goalB.title}"...`);
    const t2 = Date.now();
    const planB = await goalService.generateAIPlan(goalB._id.toString(), user._id.toString());
    const t3 = Date.now();
    console.log(`Goal B Latency: ${t3 - t2}ms`);
    console.log(JSON.stringify(planB, null, 2));

  } catch (error) {
    console.error('\nERROR:', error.message);
  } finally {
    // Cleanup
    const user = await User.findOne({ email: 'ollama_tester@test.com' });
    if (user) {
      await Goal.deleteMany({ userId: user._id });
      await AISettings.deleteOne({ userId: user._id });
      await User.deleteOne({ _id: user._id });
    }
    await mongoose.disconnect();
  }
}

runGoalPlannerTests();
