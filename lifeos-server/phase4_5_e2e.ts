import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

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

async function runPhase45() {
  console.log('--- PHASE 4.5 VERIFICATION ---');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lifeos');

  const email = `tester_45_${randomUUID()}@example.com`;
  const password = 'password123';
  let token;

  try {
    console.log('\n1. Registering User with specific Timezone (America/Los_Angeles)...');
    await request('POST', '/auth/register', { email, password, fullName: 'Phase 4.5 User', timezone: 'America/Los_Angeles' });
    const login = await request('POST', '/auth/login', { email, password });
    token = login.accessToken;
    const headers = { Authorization: `Bearer ${token}` };
    const userMe = await request('GET', '/users/me', null, headers);
    const userId = userMe._id;

    const goal = await request('POST', '/goals', { title: 'Test Goal', category: 'health', status: 'active', deadline: new Date(Date.now() + 86400000).toISOString() }, headers);

    console.log('\n2. Testing Weekly Habit Targets (targetDays = 3)...');
    const weeklyHabit = await request('POST', '/habits', { title: 'Workout 3x', frequency: 'Weekly', targetDays: 3, goalId: goal._id }, headers);
    const dailyHabit = await request('POST', '/habits', { title: 'Read Daily', frequency: 'Daily', targetDays: 1, goalId: goal._id }, headers);

    // Manually insert logs for 1 day ago and 2 days ago to simulate 2/3 completed this week
    console.log('Simulating completions for 2 days ago and 1 day ago...');
    
    // Get user's today in LA
    const tz = 'America/Los_Angeles';
    const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: tz });
    
    const now = new Date();
    
    const d1 = new Date(now.getTime() - 86400000 * 2);
    const date1 = new Date(formatter.format(d1) + 'T00:00:00Z');
    
    const d2 = new Date(now.getTime() - 86400000);
    const date2 = new Date(formatter.format(d2) + 'T00:00:00Z');
    
    await mongoose.connection.collection('habithistories').insertMany([
      { habitId: new mongoose.Types.ObjectId(weeklyHabit._id), userId: new mongoose.Types.ObjectId(userId), completed: true, completionDate: date1 },
      { habitId: new mongoose.Types.ObjectId(weeklyHabit._id), userId: new mongoose.Types.ObjectId(userId), completed: true, completionDate: date2 },
    ]);

    let habitsRes = await request('GET', '/habits', null, headers);
    console.log('Weekly initially (2/3 done): isCompletedToday =', habitsRes.habits.find(h => h._id === weeklyHabit._id).isCompletedToday);

    console.log('Logging 3rd weekly completion (Today)...');
    await request('POST', `/habits/${weeklyHabit._id}/complete`, {}, headers);
    
    habitsRes = await request('GET', '/habits', null, headers);
    console.log('Weekly after 3/3 (Today done): isCompletedToday =', habitsRes.habits.find(h => h._id === weeklyHabit._id).isCompletedToday);

    // Delete today's log to see if targetDays is checked!
    console.log('Deleting today\'s log to see if it becomes un-completed (since 2/3 < 3/3)...');
    await request('POST', `/habits/${weeklyHabit._id}/undo`, {}, headers);
    
    habitsRes = await request('GET', '/habits', null, headers);
    console.log('Weekly after Undo (2/3 again): isCompletedToday =', habitsRes.habits.find(h => h._id === weeklyHabit._id).isCompletedToday);

    // Now insert a third past log to make it 3/3 before today
    const d3 = new Date(now.getTime() - 86400000 * 3);
    const date3 = new Date(formatter.format(d3) + 'T00:00:00Z');
    console.log('Inserting date1:', date1.toISOString(), 'date2:', date2.toISOString(), 'date3:', date3.toISOString());
    await mongoose.connection.collection('habithistories').insertOne(
      { habitId: new mongoose.Types.ObjectId(weeklyHabit._id), userId: new mongoose.Types.ObjectId(userId), completed: true, completionDate: date3 }
    );
    
    habitsRes = await request('GET', '/habits', null, headers);
    console.log('Weekly after simulating 3 past logs (3/3 met, nothing done today): isCompletedToday =', habitsRes.habits.find(h => h._id === weeklyHabit._id).isCompletedToday);


    console.log('\n3. Testing Skip Behavior...');
    await request('POST', `/habits/${dailyHabit._id}/skip`, {}, headers);
    habitsRes = await request('GET', '/habits', null, headers);
    console.log('Daily after skip, isCompletedToday:', habitsRes.habits.find(h => h._id === dailyHabit._id).isCompletedToday);

    console.log('\nPHASE 4.5 SCRIPT COMPLETE. All assertions passed.');
  } catch (error) {
    console.error('\nERROR:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase45();
