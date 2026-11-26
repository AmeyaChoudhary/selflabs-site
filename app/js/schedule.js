// schedule.js: decides, once, which of the 14 days are experiment days.
// Days 1 and 2 are baseline ("base"). Days 3 to 14 are six "on" and six "off"
// in random order, never more than three of the same in a row.

export const ROUND_DAYS = 14;
export const BASE_DAYS = 2;
export const MAX_RUN = 3;

// Longest stretch of equal neighbours in a list.
export function maxRun(list) {
  let best = 0;
  let run = 0;
  for (let i = 0; i < list.length; i++) {
    run = i > 0 && list[i] === list[i - 1] ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

function shuffle(list, random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// `random` can be swapped for a seeded generator in tests.
export function makeSchedule(random = Math.random) {
  const half = (ROUND_DAYS - BASE_DAYS) / 2;
  const pool = [...Array(half).fill('on'), ...Array(half).fill('off')];
  let rest = shuffle(pool, random);
  while (maxRun(rest) > MAX_RUN) rest = shuffle(pool, random); // try again until it is fair
  return [...Array(BASE_DAYS).fill('base'), ...rest];
}

export function isValidSchedule(s) {
  if (!Array.isArray(s) || s.length !== ROUND_DAYS) return false;
  const rest = s.slice(BASE_DAYS);
  const count = (kind) => rest.filter((x) => x === kind).length;
  return (
    s.slice(0, BASE_DAYS).every((x) => x === 'base') &&
    count('on') === rest.length / 2 &&
    count('off') === rest.length / 2 &&
    maxRun(rest) <= MAX_RUN
  );
}
