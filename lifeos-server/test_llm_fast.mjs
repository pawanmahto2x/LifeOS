import { execSync } from 'child_process';

const API_BASE = 'http://localhost:5000/api/v1';

async function main() {
  const email = `testuser_${Date.now()}@test.com`;
  const password = 'password123';
  
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName: 'Test User' })
  });
  const regData = await regRes.json();

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

  await fetch(`${API_BASE}/ai/settings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ provider: 'ollama', model: 'qwen2.5:7b', isEnabled: true })
  });

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
  console.log('Insights Patterns:', JSON.stringify(insightsData, null, 2));
}

main().catch(console.error);
