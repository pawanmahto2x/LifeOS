const d = new Date('2026-10-02T00:00:00Z');
const day = d.getUTCDay();
console.log('day of week', day);
const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
const startOfWeek = new Date(d);
startOfWeek.setUTCDate(diff);
console.log('start', startOfWeek.toISOString());
