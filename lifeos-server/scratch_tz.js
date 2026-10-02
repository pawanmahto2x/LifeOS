const tz = 'America/Los_Angeles';
const d = new Date(); // e.g. 2026-10-02T21:18:00+05:30 (India) => 2026-10-02T15:48:00Z => 08:48 AM in LA
console.log('Now UTC:', d.toISOString());
const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: tz });
const localDateString = formatter.format(d);
console.log('Local LA Date:', localDateString);
const userMidnight = new Date(localDateString + 'T00:00:00Z');
console.log('Stored DB Date:', userMidnight.toISOString());
