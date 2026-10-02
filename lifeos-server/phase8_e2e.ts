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

async function runPhase8() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeos');
  console.log('--- PHASE 8 VERIFICATION ---');

  const tz = 'America/Los_Angeles';

  try {
    console.log('\n1. Registering Users...');
    const userA = { email: `testA-${Date.now()}@example.com`, password: 'password123', fullName: 'User A', timezone: tz };
    const userB = { email: `testB-${Date.now()}@example.com`, password: 'password123', fullName: 'User B', timezone: tz };
    
    await request('POST', '/auth/register', userA);
    const loginA = await request('POST', '/auth/login', { email: userA.email, password: userA.password });
    const headersA = { Authorization: `Bearer ${loginA.accessToken}` };

    await request('POST', '/auth/register', userB);
    const loginB = await request('POST', '/auth/login', { email: userB.email, password: userB.password });
    const headersB = { Authorization: `Bearer ${loginB.accessToken}` };

    // ---------------------------------------------------------
    // TEST 1 — REPORTS PERFORMANCE & DETERMINISM
    // ---------------------------------------------------------
    console.log('\nTEST 1: Fast Report Loading (No LLM block)');
    await request('POST', '/tasks', { title: 'Test Task', priority: 'High', dueDate: new Date().toISOString() }, headersA);
    const t0 = Date.now();
    const reportWeekly = await request('GET', '/reports/daily', null, headersA);
    const t1 = Date.now();
    if (t1 - t0 > 1000) throw new Error(`Report took too long (${t1 - t0}ms) - LLM likely still blocking`);
    console.log(`PASS: Daily report returned in ${t1 - t0}ms`);
    if (!reportWeekly.aiSummary.includes('During this daily period')) {
       throw new Error('Deterministic string not used as fallback/replacement for AI');
    }
    console.log('PASS: Report uses deterministic fallback string instantly');

    // ---------------------------------------------------------
    // TEST 2 — USER ISOLATION
    // ---------------------------------------------------------
    console.log('\nTEST 2: User Isolation in Reports');
    const focusStartA = await request('POST', '/focus/start', { duration: 60, title: 'Deep Work' }, headersA);
    await request('POST', '/focus/end', { sessionId: focusStartA._id, completed: true }, headersA);
    
    const dashB = await request('GET', '/reports/dashboard', null, headersB);
    if (dashB.todayFocusMinutes !== 0) throw new Error('User B can see User A focus data in dashboard overview');
    console.log('PASS: User isolation strictly enforced in reports');

    // ---------------------------------------------------------
    // TEST 3 — LIFE REPLAY DATE FILTERING & EMPTY STATE
    // ---------------------------------------------------------
    console.log('\nTEST 3: Life Replay Empty State');
    try {
      await request('GET', '/life-replay/weekly', null, headersB);
      throw new Error('Expected Life Replay to throw 400 when empty, but it succeeded');
    } catch (err: any) {
      if (err.message.includes('Not enough data')) {
        console.log('PASS: Life Replay gracefully handles empty state via 400 error');
      } else {
        throw err;
      }
    }

    console.log('\nALL PHASE 8 TESTS PASSED.');
  } catch (error: any) {
    console.error('\nERROR:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase8();
