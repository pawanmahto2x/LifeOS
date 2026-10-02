import { execSync } from 'child_process';

const API_BASE = 'http://localhost:5000/api/v1';

async function main() {
  const email = `testuser_${Date.now()}@test.com`;
  const password = 'password123';
  
  console.log('1. Registering user...');
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName: 'Test User' })
  });
  const regData = await regRes.json();
  console.log('Reg Response:', regData);

  console.log('1.5 Logging in user...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  if (!token) throw new Error('No token found');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  console.log('2. Configuring AI Settings...');
  const aiRes = await fetch(`${API_BASE}/ai/settings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ provider: 'ollama', model: 'qwen2.5:7b', isEnabled: true })
  });
  console.log('AI Settings:', await aiRes.json());

  console.log('\n--- 3. Testing Goal AI Planner ---');
  const goalRes = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Become a 3D game developer', description: 'I want to build a small indie game', category: 'career', deadline: new Date(Date.now() + 90*24*60*60*1000).toISOString() })
  });
  const goalData = await goalRes.json();
  console.log('Goal created:', goalData);
  const goalId = goalData.data?._id;
  if (!goalId) throw new Error('Goal ID not found');

  const planRes = await fetch(`${API_BASE}/goals/${goalId}/ai-plan`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ context: 'I have some basic programming knowledge but zero 3D experience.' })
  });
  const planData = await planRes.json();
  console.log('Goal AI Plan:', JSON.stringify(planData, null, 2));

  console.log('\n--- 4. Testing Journal Analysis ---');
  const journalRes = await fetch(`${API_BASE}/journals`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Tough Day', content: 'I struggled to focus today. I kept procrastinating and spent a lot of time scrolling. I feel really tired.', mood: 'Stressed', tags: [] })
  });
  const journalData = await journalRes.json();
  console.log('Journal created:', journalData);
  const journalId = journalData.data?._id;
  if (!journalId) throw new Error('Journal ID not found');

  const journalAnalysisRes = await fetch(`${API_BASE}/journal-analysis/${journalId}/analyze`, {
    method: 'POST',
    headers: authHeaders,
  });
  const journalAnalysisData = await journalAnalysisRes.json();
  console.log('Journal Analysis:', JSON.stringify(journalAnalysisData.data, null, 2));

  console.log('\n--- 5. Testing AI Coach ---');
  const coachRes = await fetch(`${API_BASE}/ai/coach`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ question: 'Why am I struggling to complete my goals?' })
  });
  const coachData = await coachRes.json();
  console.log('AI Coach:', JSON.stringify(coachData.data, null, 2));

  console.log('\n--- 6. Testing Health Analysis ---');
  const healthRes = await fetch(`${API_BASE}/ai/health-analysis`, {
    method: 'POST',
    headers: authHeaders,
  });
  const healthData = await healthRes.json();
  console.log('Health Analysis:', JSON.stringify(healthData, null, 2));

  console.log('\n--- 7. Testing Weekly Report ---');
  const weeklyRes = await fetch(`${API_BASE}/ai/reports/weekly`, {
    method: 'POST',
    headers: authHeaders,
  });
  const weeklyData = await weeklyRes.json();
  console.log('Weekly Report:', JSON.stringify(weeklyData, null, 2));

  console.log('\n--- 8. Testing AI Insights ---');
  const insightsRes = await fetch(`${API_BASE}/insights`, {
    method: 'GET',
    headers: authHeaders,
  });
  const insightsData = await insightsRes.json();
  console.log('Insights Patterns:', JSON.stringify(insightsData.data?.patterns, null, 2));
}

main().catch(console.error);
