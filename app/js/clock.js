// clock.js: the one place the app asks "what time is it?".
// Everything date-related goes through here, so the ?now= test hook (and the
// tests) can move time without touching the rest of the code.

export const ROLLOVER_HOUR = 4;  // a SelfLabs day runs from 4am to 4am, not midnight
export const EVENING_HOUR = 18;  // the night check-out opens at 6pm

let offsetMs = 0; // how far the app clock is shifted from the real clock

// Pretend it is `value` (e.g. "2026-12-03T07:30", read as local time) right now.
// The clock keeps ticking from there. Returns false if the value is not a date.
export function setNow(value) {
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return false;
  offsetMs = t - Date.now();
  return true;
}

export function clearNow() {
  offsetMs = 0;
}

export function now() {
  return new Date(Date.now() + offsetMs);
}

const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parts = (key) => key.split('-').map(Number);

// The "YYYY-MM-DD" name of the SelfLabs day that `date` belongs to.
// 2am on the 4th still belongs to the 3rd.
export function dayKey(date = now()) {
  const back = date.getHours() < ROLLOVER_HOUR ? 1 : 0;
  return keyOf(new Date(date.getFullYear(), date.getMonth(), date.getDate() - back));
}

export function addDays(key, n) {
  const [y, m, d] = parts(key);
  return keyOf(new Date(y, m - 1, d + n));
}

// Whole days from key a to key b (b later = positive). Uses UTC so daylight
// saving changes cannot make a day 23 or 25 hours long.
export function daysBetween(a, b) {
  const utc = (key) => {
    const [y, m, d] = parts(key);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(b) - utc(a)) / 86400000);
}

// Day 1 is the day the round started.
export function dayNumber(startedOn, date = now()) {
  return daysBetween(startedOn, dayKey(date)) + 1;
}

// From 6pm until the 4am rollover.
export function isEvening(date = now()) {
  const h = date.getHours();
  return h >= EVENING_HOUR || h < ROLLOVER_HOUR;
}

// ISO 8601 with the local offset, e.g. "2026-12-03T07:31:05-08:00", so an
// exported file still shows what time of day a check-in happened.
export function localISO(date = now()) {
  const off = -date.getTimezoneOffset();
  const sign = off < 0 ? '-' : '+';
  const a = Math.abs(off);
  return (
    `${keyOf(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`
  );
}
