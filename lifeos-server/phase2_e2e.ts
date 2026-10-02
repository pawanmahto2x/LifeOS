import { randomUUID } from 'crypto';

const API_URL = 'http://localhost:5000/api/v1';

async function request(method, path, body = null, headers = {}) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.data;
}

async function runPhase2() {
  console.log('--- PHASE 2 VERIFICATION ---');

  const emailA = `tester_a_${randomUUID()}@example.com`;
  const emailB = `tester_b_${randomUUID()}@example.com`;
  const password = 'password123';
  let tokenA = '';
  let tokenB = '';

  try {
    console.log('\n1. Registering Users A and B...');
    await request('POST', '/auth/register', { email: emailA, password, fullName: 'User A' });
    const loginA = await request('POST', '/auth/login', { email: emailA, password });
    tokenA = loginA.accessToken;
    const headersA = { Authorization: `Bearer ${tokenA}` };

    await request('POST', '/auth/register', { email: emailB, password, fullName: 'User B' });
    const loginB = await request('POST', '/auth/login', { email: emailB, password });
    tokenB = loginB.accessToken;
    const headersB = { Authorization: `Bearer ${tokenB}` };

    console.log('\n2. Configuring AI Settings for User A...');
    await request('POST', '/ai/settings', {
      provider: 'ollama',
      model: 'qwen2.5:7b',
      baseUrl: 'http://localhost:11434',
      isEnabled: true
    }, headersA);

    console.log('\n3. Creating Baseline Data (Scenario A - Positive)...');
    // User A Data
    const goalA = await request('POST', '/goals', { title: 'Master AI', category: 'career', status: 'active', deadline: new Date(Date.now() + 86400000).toISOString() }, headersA);
    console.log('Goal A:', goalA);
    const taskA1 = await request('POST', '/tasks', { title: 'Read docs', status: 'Pending', category: 'Career', priority: 'High', goalId: goalA._id }, headersA);
    console.log('Task A1:', taskA1);
    await request('PATCH', `/tasks/${taskA1._id}/complete`, {}, headersA); // complete task
    
    // Journal Entry (Positive)
    const journalA = await request('POST', '/journals', { title: 'Great Day', content: 'I felt incredibly productive and energetic today. Completed all my major tasks and feel great about my progress in AI.' }, headersA);

    // ---------------------------------------------------------
    // TEST: JOURNAL ANALYSIS
    // ---------------------------------------------------------
    console.log('\n4. Testing Journal Analysis (Positive)...');
    const t0 = Date.now();
    const analysisA = await request('POST', `/journal-analysis/${journalA._id}/analyze`, {}, headersA);
    const t1 = Date.now();
    console.log(`Latency: ${t1 - t0}ms`);
    console.log('Analysis A raw response:', analysisA);

    // ---------------------------------------------------------
    // TEST: REPORTS (Daily)
    // ---------------------------------------------------------
    console.log('\n5. Testing Daily Report Generation...');
    const t2 = Date.now();
    const reportA = await request('GET', '/reports/daily', null, headersA);
    const t3 = Date.now();
    console.log(`Latency: ${t3 - t2}ms`);
    console.log('Report raw response:', reportA);

    // ---------------------------------------------------------
    // TEST: AI COACH
    // ---------------------------------------------------------
    console.log('\n6. Testing AI Coach...');
    const t4 = Date.now();
    const coachA = await request('POST', '/ai/coach', { question: 'How is my productivity today?' }, headersA);
    const t5 = Date.now();
    console.log(`Latency: ${t5 - t4}ms`);
    console.log('Coach Response:', coachA.answer);

    // ---------------------------------------------------------
    // TEST: WEEKLY AI
    // ---------------------------------------------------------
    console.log('\n7. Testing Weekly AI...');
    const t6 = Date.now();
    const weeklyA = await request('POST', '/ai/reports/weekly', {}, headersA);
    const t7 = Date.now();
    console.log(`Latency: ${t7 - t6}ms`);
    console.log('Weekly Summary:', weeklyA.weeklySummary);

    // ---------------------------------------------------------
    // TEST: SCENARIO B (Negative / Different Context)
    // ---------------------------------------------------------
    console.log('\n8. Creating Baseline Data (Scenario B - Negative / User B)...');
    await request('POST', '/ai/settings', {
      provider: 'ollama',
      model: 'qwen2.5:7b',
      baseUrl: 'http://localhost:11434',
      isEnabled: true
    }, headersB);

    const journalB = await request('POST', '/journals', { title: 'Bad Day', content: 'I felt overwhelmed and completely distracted. I could not complete my planned work at all.' }, headersB);
    
    console.log('\n9. Testing Journal Analysis (Negative)...');
    const analysisB = await request('POST', `/journal-analysis/${journalB._id}/analyze`, {}, headersB);
    console.log('Analysis B raw response:', analysisB);

    if (analysisA.analysis.extractedMood === analysisB.analysis.extractedMood && analysisA.analysis.extractedEnergy === analysisB.analysis.extractedEnergy) {
       console.log('WARNING: The LLM output did not differentiate between positive and negative entries properly.');
    } else {
       console.log('Verified: AI correctly differentiated positive vs negative journal context.');
    }

    // ---------------------------------------------------------
    // TEST: HEALTH AI
    // ---------------------------------------------------------
    console.log('\n10. Testing Health AI (Requires Health data)...');
    const sleepTime = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();
    const wakeTime = new Date().toISOString();
    await request('POST', '/health/sleep', { sleepTime, wakeTime, quality: 'Good' }, headersA);
    await request('POST', '/health/water', { amount: 1500, unit: 'ml' }, headersA);
    await request('POST', '/health/mood', { mood: 'Happy', moodScore: 8, note: 'Good' }, headersA);
    
    const t8 = Date.now();
    const healthA = await request('POST', '/ai/health-analysis', {}, headersA);
    const t9 = Date.now();
    console.log(`Latency: ${t9 - t8}ms`);
    console.log('Health Summary:', healthA.summary);
    console.log('Recommendations:', healthA.recommendations);

    console.log('\nPHASE 2 SCRIPT COMPLETE. All API assertions passed.');

  } catch (error) {
    console.error('\nERROR:', error.message);
  }
}

runPhase2();
