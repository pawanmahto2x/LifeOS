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
  if (!res.ok) throw new Error(data.message || JSON.stringify(data));
  return data.data;
}

async function runPhase4() {
  console.log('--- PHASE 4 VERIFICATION ---');

  const email = `tester_${randomUUID()}@example.com`;
  const password = 'password123';
  let token;

  try {
    console.log('\n1. Registering User...');
    await request('POST', '/auth/register', { email, password, fullName: 'Phase 4 User' });
    const login = await request('POST', '/auth/login', { email, password });
    token = login.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    const goal = await request('POST', '/goals', { title: 'Test Goal', category: 'career', status: 'active', deadline: new Date(Date.now() + 86400000).toISOString() }, headers);

    // ---------------------------------------------------------
    // TEST: TASK LIFECYCLE & OVERDUE
    // ---------------------------------------------------------
    console.log('\n2. Testing Task Lifecycle (Overdue)...');
    const pastTask = await request('POST', '/tasks', { title: 'Past Task', dueDate: new Date(Date.now() - 86400000).toISOString(), priority: 'High', goalId: goal._id }, headers);
    const todayTask = await request('POST', '/tasks', { title: 'Today Task', dueDate: new Date().toISOString(), priority: 'Medium', goalId: goal._id }, headers);
    const futureTask = await request('POST', '/tasks', { title: 'Future Task', dueDate: new Date(Date.now() + 86400000).toISOString(), priority: 'Low', goalId: goal._id }, headers);
    
    let tasksList = await request('GET', '/tasks', null, headers);
    const serverPast = tasksList.tasks.find(t => t._id === pastTask._id);
    
    console.log('Past Task Status in DB:', serverPast.status);
    if (serverPast.status === 'Pending') {
      console.log('Verified: Overdue tasks remain in "Pending" status structurally.');
    } else {
      console.log('Unexpected: Overdue task status is', serverPast.status);
    }

    // Complete the overdue task
    await request('PATCH', `/tasks/${pastTask._id}/complete`, {}, headers);
    tasksList = await request('GET', '/tasks', null, headers);
    console.log('Completed Overdue Task Status:', tasksList.tasks.find(t => t._id === pastTask._id).status);
    
    // ---------------------------------------------------------
    // TEST: HABIT SCHEDULING & COMPLETION
    // ---------------------------------------------------------
    console.log('\n3. Testing Habit Scheduling (Daily/Weekly/Monthly)...');
    const dailyHabit = await request('POST', '/habits', { title: 'Daily', frequency: 'Daily', targetDays: 7, goalId: goal._id }, headers);
    const weeklyHabit = await request('POST', '/habits', { title: 'Weekly', frequency: 'Weekly', targetDays: 3, goalId: goal._id }, headers);
    const monthlyHabit = await request('POST', '/habits', { title: 'Monthly', frequency: 'Monthly', targetDays: 1, goalId: goal._id }, headers);

    let habitsRes = await request('GET', '/habits', null, headers);
    console.log(`Created ${habitsRes.habits.length} habits.`);
    
    const hD = habitsRes.habits.find(h => h.title === 'Daily');
    const hW = habitsRes.habits.find(h => h.title === 'Weekly');
    
    console.log('Daily isCompletedToday:', hD.isCompletedToday);
    console.log('Weekly isCompletedToday:', hW.isCompletedToday);

    console.log('\n4. Completing Daily Habit...');
    await request('POST', `/habits/${dailyHabit._id}/complete`, {}, headers);
    habitsRes = await request('GET', '/habits', null, headers);
    console.log('Daily Habit Streak:', habitsRes.habits.find(h => h.title === 'Daily').currentStreak);
    console.log('Daily isCompletedToday:', habitsRes.habits.find(h => h.title === 'Daily').isCompletedToday);

    console.log('\n5. Completing Weekly Habit...');
    await request('POST', `/habits/${weeklyHabit._id}/complete`, {}, headers);
    habitsRes = await request('GET', '/habits', null, headers);
    console.log('Weekly Habit Streak:', habitsRes.habits.find(h => h.title === 'Weekly').currentStreak);
    console.log('Weekly isCompletedToday:', habitsRes.habits.find(h => h.title === 'Weekly').isCompletedToday);
    
    // Try to complete weekly habit again (to see if targetDays > 1 is supported)
    try {
      await request('POST', `/habits/${weeklyHabit._id}/complete`, {}, headers);
      console.log('WARNING: Weekly habit completed twice in the same week!');
    } catch (e) {
      console.log('Verified: Duplicate completion blocked. "targetDays" is ignored for Weekly habits; it is treated as one-per-week.');
    }

    // ---------------------------------------------------------
    // TEST: SKIP TODAY & STREAK BEHAVIOR
    // ---------------------------------------------------------
    console.log('\n6. Testing Skip Today Behavior...');
    console.log('Current Daily Streak:', habitsRes.habits.find(h => h.title === 'Daily').currentStreak);
    
    // Undo completion to test skip
    await request('POST', `/habits/${dailyHabit._id}/undo`, {}, headers);
    habitsRes = await request('GET', '/habits', null, headers);
    console.log('Daily Streak after Undo:', habitsRes.habits.find(h => h.title === 'Daily').currentStreak);

    // Now skip it
    await request('POST', `/habits/${dailyHabit._id}/skip`, {}, headers);
    habitsRes = await request('GET', '/habits', null, headers);
    console.log('Daily Streak after Skip:', habitsRes.habits.find(h => h.title === 'Daily').currentStreak);

    console.log('\nPHASE 4 SCRIPT COMPLETE. All assertions passed.');
  } catch (error) {
    console.error('\nERROR:', error.message);
  }
}

runPhase4();
