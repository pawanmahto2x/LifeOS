import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

const API_URL = 'http://localhost:5000/api/v1';

async function request(method: string, path: string, body: any = null, headers: any = {}) {
  const options: any = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data.errors) || data.message || JSON.stringify(data));
  return data.data;
}

async function runPhase7() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeos');
  console.log('--- PHASE 7 VERIFICATION ---');

  const tz = 'America/Los_Angeles';
  const emailA = `userA_${randomUUID()}@example.com`;
  const emailB = `userB_${randomUUID()}@example.com`;
  const password = 'password123';
  
  let tokenA, tokenB;

  try {
    // ---------------------------------------------------------
    // SETUP
    // ---------------------------------------------------------
    console.log('\n1. Registering Users...');
    await request('POST', '/auth/register', { email: emailA, password, fullName: 'User A', timezone: tz });
    const loginA = await request('POST', '/auth/login', { email: emailA, password });
    tokenA = loginA.accessToken;
    const headersA = { Authorization: `Bearer ${tokenA}` };

    await request('POST', '/auth/register', { email: emailB, password, fullName: 'User B', timezone: tz });
    const loginB = await request('POST', '/auth/login', { email: emailB, password });
    tokenB = loginB.accessToken;
    const headersB = { Authorization: `Bearer ${tokenB}` };

    // ---------------------------------------------------------
    // TEST 1 — INSIGHTS FAST LOADING (No LLM)
    // ---------------------------------------------------------
    console.log('\nTEST 1: Fast Insights Loading (No LLM block)');
    const t0 = Date.now();
    const insightsA = await request('GET', '/insights', null, headersA);
    const dt = Date.now() - t0;
    
    if (dt > 2000) {
      throw new Error(`Insights took ${dt}ms, expected fast deterministic response.`);
    }
    console.log(`PASS: Insights returned in ${dt}ms`);
    
    if (!insightsA.baselines || !insightsA.patterns) {
      throw new Error('Insights response missing expected fields');
    }
    console.log('PASS: Insights structural contract verified');

    // ---------------------------------------------------------
    // TEST 2 — USER ISOLATION
    // ---------------------------------------------------------
    console.log('\nTEST 2: User Isolation in Insights');
    // User A logs some focus
    const focusStartA = await request('POST', '/focus/start', { duration: 60 }, headersA);
    await request('POST', '/focus/end', { sessionId: focusStartA._id, completed: true }, headersA);
    
    // User B insights
    const insightsB = await request('GET', '/insights', null, headersB);
    const focusB = insightsB.baselines['7d']?.metrics?.avgFocusMinutesPerDay || 0;
    if (focusB !== 0) throw new Error('User B can see User A focus data in insights');
    console.log('PASS: User isolation strictly enforced in insights');

    // ---------------------------------------------------------
    // TEST 3 — DETERMINISTIC PATTERN DETECTION
    // ---------------------------------------------------------
    console.log('\nTEST 3: Deterministic Patterns');
    // We will inject past data directly to bypass API limitations
    const { FocusSession } = await import('./src/models/focus-session.model');
    const { Task } = await import('./src/models/task.model');
    const { SleepLog } = await import('./src/models/sleep-log.model');

    const me = await request('GET', '/users/me', null, headersB);
    const userBId = new mongoose.Types.ObjectId(me._id);
    
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(today.getTime() - i * 86400000);
      await FocusSession.create({ userId: userBId, duration: 25, completed: true, startedAt: d, endedAt: d });
      await SleepLog.create({ userId: userBId, duration: 8, quality: 'Good', sleepTime: d, wakeTime: d });
      await Task.create({ userId: userBId, title: `Task ${i}`, priority: 'Medium', dueDate: d, status: 'Completed', completedAt: d, isDeleted: false });
    }
    
    // Re-fetch insights
    const newInsightsB = await request('GET', '/insights', null, headersB);
    if (!newInsightsB.patterns || newInsightsB.patterns.length === 0) {
      throw new Error('Patterns did not generate after injecting 4 days of data');
    }
    console.log('PASS: Deterministic patterns generated successfully:', newInsightsB.patterns.map((p: any) => p.category));

    console.log('\nALL PHASE 7 TESTS PASSED.');
  } catch (error) {
    console.error('\nERROR:', error.message);
  } finally {
    await mongoose.disconnect();
  }}

runPhase7();
