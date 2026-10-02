import { randomUUID } from 'crypto';

const API_URL = 'http://localhost:5000/api/v1';

async function request(method: string, path: string, body: any = null, headers: any = {}) {
  const options: any = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || JSON.stringify(data));
  return data.data;
}

async function runPhase6() {
  console.log('--- PHASE 6 VERIFICATION ---');

  const tz = 'America/Los_Angeles';
  const emailA = `userA_${randomUUID()}@example.com`;
  const emailB = `userB_${randomUUID()}@example.com`;
  const password = 'password123';
  
  let tokenA, tokenB, idA, idB;
  let taskId: string;

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

    // Create a real task for User A
    const taskData = await request('POST', '/tasks', { title: 'Strategic Mission Task', priority: 'Urgent' }, headersA);
    taskId = taskData._id;

    // ---------------------------------------------------------
    // TEST 1 — CREATE/RETRIEVE DAILY MISSION
    // ---------------------------------------------------------
    console.log('\nTEST 1: Generate Mission');
    const mission = await request('POST', '/daily-mission/generate', null, headersA);
    if (!mission || !mission.primaryMission) throw new Error('Failed to generate daily mission');
    console.log('PASS: Mission generated deterministically');

    // ---------------------------------------------------------
    // TEST 2 — MISSION PERSISTENCE
    // ---------------------------------------------------------
    console.log('\nTEST 2: Mission persistence (Get Today)');
    const todayMission = await request('GET', '/daily-mission/today', null, headersA);
    if (todayMission._id !== mission._id) throw new Error('Persistence mismatch');
    console.log('PASS: Mission correctly retrieved from DB');

    // ---------------------------------------------------------
    // TEST 3 & 4 — REAL PROGRESS (Sync via toggle)
    // ---------------------------------------------------------
    console.log('\nTEST 3 & 4: Mission Progress syncs with actual Application Data');
    // We toggle the primary mission from the UI
    await request('PATCH', '/daily-mission/toggle', { itemType: 'primary', completed: true }, headersA);
    
    // Check if the underlying Task was completed
    const updatedTask = await request('GET', '/tasks', null, headersA);
    const taskMatch = updatedTask.tasks.find((t: any) => t._id === todayMission.primaryMission.taskId);
    if (!taskMatch || taskMatch.status !== 'Completed') {
      throw new Error('Toggle did not sync down to underlying Task');
    }
    console.log('PASS: Toggling primary mission successfully completed the real Task');

    // ---------------------------------------------------------
    // TEST 5 — REJECT MISSION
    // ---------------------------------------------------------
    console.log('\nTEST 5: Reject Mission');
    await request('DELETE', `/daily-mission/${mission._id}`, null, headersA);
    let rejectedPass = false;
    try {
      await request('GET', '/daily-mission/today', null, headersA);
    } catch(e) {
      if (e.message.includes('No mission generated')) rejectedPass = true;
    }
    if (!rejectedPass) throw new Error('Reject did not delete mission');
    console.log('PASS: Reject successfully deletes mission from DB allowing regeneration');

    // ---------------------------------------------------------
    // TEST 7 — WEEKLY MISSIONS
    // ---------------------------------------------------------
    console.log('\nTEST 7: Weekly Missions connection to Goals');
    const weeklyMissions = await request('GET', '/daily-mission/weekly', null, headersA);
    if (!Array.isArray(weeklyMissions) || weeklyMissions.length !== 0) throw new Error('Expected 0 since no goals exist');
    console.log('PASS: Weekly missions correctly return empty array when no Goals exist');

    // ---------------------------------------------------------
    // TEST 9 — USER ISOLATION
    // ---------------------------------------------------------
    console.log('\nTEST 9: User Isolation');
    let isolationPass = false;
    try {
      await request('GET', '/daily-mission/today', null, headersB);
    } catch(e) {
      if (e.message.includes('No mission generated')) isolationPass = true;
    }
    if (!isolationPass) throw new Error('User B can see User A mission');
    console.log('PASS: User B cannot access User A missions');

    console.log('\nALL PHASE 6 TESTS PASSED.');
  } catch (error) {
    console.error('\nERROR:', error.message);
  }
}

runPhase6();
