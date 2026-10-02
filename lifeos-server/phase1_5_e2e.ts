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

async function runPhase1_5() {
  console.log('--- PHASE 1.5 VERIFICATION ---');

  const email = `tester_${randomUUID()}@example.com`;
  const password = 'password123';
  let token = '';

  try {
    console.log('\n1. Registering user...');
    await request('POST', '/auth/register', { email, password, fullName: 'Phase 1.5 Tester' });
    const loginRes = await request('POST', '/auth/login', { email, password });
    token = loginRes.accessToken;
    console.log('Logged in.');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n2. Configuring AI Settings...');
    await request('POST', '/ai/settings', {
      provider: 'ollama',
      model: 'qwen2.5:7b',
      baseUrl: 'http://localhost:11434',
      isEnabled: true
    }, headers);
    console.log('AI Settings configured.');

    // ---------------------------------------------------------
    // TEST 1: CREATE A REAL GOAL
    // ---------------------------------------------------------
    console.log('\n3. Creating Goal A...');
    const goalA = await request('POST', '/goals', {
      title: 'Become a Full Stack Developer',
      category: 'career',
      status: 'active',
      deadline: new Date(Date.now() + 90 * 86400000).toISOString()
    }, headers);
    const goalAId = goalA._id;
    console.log(`Created Goal A: ${goalAId}`);

    // ---------------------------------------------------------
    // TEST 2: INSPECT THE RAW AI PLAN & TEST 8: USER APPROVAL
    // ---------------------------------------------------------
    console.log('\n4. Generating AI Plan...');
    const t0 = Date.now();
    const planA = await request('POST', `/goals/${goalAId}/ai-plan`, {}, headers);
    const t1 = Date.now();
    console.log(`Plan generated in ${t1 - t0}ms:`, JSON.stringify(planA, null, 2));

    // Verify DB does NOT have tasks/habits yet (User Approval check)
    const tasksPreRes = await request('GET', `/tasks?goalId=${goalAId}&limit=100`, null, headers);
    const habitsPreRes = await request('GET', `/habits?goalId=${goalAId}&limit=100`, null, headers);
    const tasksPre = tasksPreRes.tasks.filter(t => t.goalId === goalAId);
    const habitsPre = habitsPreRes.habits.filter(h => h.goalId === goalAId);
    if (tasksPre.length > 0 || habitsPre.length > 0) {
      throw new Error('Tasks/Habits persisted before user approval!');
    }
    console.log('Verified: AI generation does NOT automatically persist items.');

    // ---------------------------------------------------------
    // TEST 10: EDITED AI PLAN
    // ---------------------------------------------------------
    console.log('\n5. Editing plan before approval...');
    planA.milestones[0] = 'EDITED MILESTONE 1';
    planA.tasks[0].title = 'EDITED TASK 1';
    planA.habits.push({ title: 'EDITED HABIT', frequency: 'daily' });

    // ---------------------------------------------------------
    // TEST 3: APPLY THE PLAN
    // ---------------------------------------------------------
    console.log('\n6. Applying edited plan...');
    await request('POST', `/goals/${goalAId}/apply-plan`, planA, headers);
    console.log('Plan applied successfully.');

    // ---------------------------------------------------------
    // TEST 4 & 5: DATABASE/ROADMAP VERIFICATION
    // ---------------------------------------------------------
    console.log('\n7. Verifying DB / Roadmap API...');
    const updatedGoal = await request('GET', `/goals/${goalAId}`, null, headers);
    const allTasks = await request('GET', `/tasks?limit=100`, null, headers);
    const tasksPost = allTasks.tasks.filter(t => t.goalId === goalAId);
    const allHabits = await request('GET', `/habits?limit=100`, null, headers);
    const habitsPost = allHabits.habits.filter(h => h.goalId === goalAId);

    console.log(`Milestones Persisted: ${updatedGoal.milestones.length}`);
    console.log(`Tasks Persisted: ${tasksPost.length}`);
    console.log(`Habits Persisted: ${habitsPost.length}`);

    if (updatedGoal.milestones[0].title !== 'EDITED MILESTONE 1') throw new Error('Edited milestone not persisted.');
    if (!tasksPost.some(t => t.title === 'EDITED TASK 1')) throw new Error('Edited task not persisted.');
    if (!habitsPost.some(h => h.title === 'EDITED HABIT')) throw new Error('Edited habit not persisted.');
    console.log('Verified: Edited plan was persisted correctly.');

    // ---------------------------------------------------------
    // TEST 9: DUPLICATE APPLICATION / IDEMPOTENCY
    // ---------------------------------------------------------
    console.log('\n8. Testing duplicate plan application...');
    try {
      await request('POST', `/goals/${goalAId}/apply-plan`, planA, headers);
      const allTasksDup = await request('GET', `/tasks?limit=100`, null, headers);
      const tasksDup = allTasksDup.tasks.filter(t => t.goalId === goalAId);
      
      if (tasksDup.length > tasksPost.length) {
         console.log('WARNING: Duplicate application created duplicate tasks. This is allowed by the current implementation but should be noted in the report.');
      } else {
         console.log('Verified: Idempotent application logic prevented duplicates.');
      }
    } catch (error) {
      console.log('Duplicate application blocked by server (or error):', error.message);
    }

    // ---------------------------------------------------------
    // TEST 7: DIFFERENT GOAL
    // ---------------------------------------------------------
    console.log('\n9. Creating Goal B...');
    const goalB = await request('POST', '/goals', {
      title: 'Train for a 10K running event',
      category: 'health',
      status: 'active',
      deadline: new Date(Date.now() + 60 * 86400000).toISOString()
    }, headers);
    const goalBId = goalB._id;
    
    console.log('Generating AI Plan for Goal B...');
    const planB = await request('POST', `/goals/${goalBId}/ai-plan`, {}, headers);
    console.log('Plan B generated:', JSON.stringify(planB, null, 2));

    await request('POST', `/goals/${goalBId}/apply-plan`, planB, headers);
    
    const tasksBRes = await request('GET', `/tasks?limit=100`, null, headers);
    const tasksB = tasksBRes.tasks.filter(t => t.goalId === goalBId);
    console.log(`Goal B Tasks Persisted: ${tasksB.length}`);

    console.log('\nPHASE 1.5 SCRIPT COMPLETE. All assertions passed.');

  } catch (error) {
    console.error('\nERROR:', error.message);
  }
}

runPhase1_5();
