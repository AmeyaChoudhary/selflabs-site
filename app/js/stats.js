// stats.js: the maths behind every number the app shows. Pure functions only.

export function median(list) {
  if (!list.length) return null;
  const a = list.slice().sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

export function mean(list) {
  if (!list.length) return null;
  return list.reduce((sum, x) => sum + x, 0) / list.length;
}

// One decimal place, the precision everything is shown at.
export function round1(x) {
  return Math.round((x + Number.EPSILON) * 10) / 10;
}

// Compare "in control" (1 to 5) on experiment days with the off days.
// The difference is taken between the two averages as they are displayed
// (one decimal each), so the big number, "2.8 → 4.0" and the label can never
// disagree with each other.
export function compare(on, off) {
  const out = { nOn: on.length, nOff: off.length, onMean: null, offMean: null, diff: null };
  if (on.length) out.onMean = round1(mean(on));
  if (off.length) out.offMean = round1(mean(off));
  if (on.length && off.length) out.diff = round1(out.onMean - out.offMean);
  return out;
}

export const MIN_DAYS_TO_SHOW = 3;   // per side, before anything is shown
export const MIN_DAYS_TO_CALL = 5;   // per side, before a final answer
export const FINAL_DAY = 14;
export const EARLY_SIGNAL = 0.5;
export const WORKS = 0.7;
export const NO_EFFECT = 0.3;

// The honest label for a comparison. `day` is the day of the round (1 to 14+).
//   status: none | early | unclear | works | worse | noeffect | unsure
export function classify({ nOn, nOff, diff, day }) {
  if (nOn < MIN_DAYS_TO_SHOW || nOff < MIN_DAYS_TO_SHOW || diff === null) {
    return { status: 'none', final: day >= FINAL_DAY, label: null };
  }
  const n = nOn + nOff;
  const size = Math.abs(diff);
  if (day < FINAL_DAY) {
    return size >= EARLY_SIGNAL
      ? { status: 'early', final: false, label: `Early signal · ${n} days` }
      : { status: 'unclear', final: false, label: `Can’t tell yet · ${n} days` };
  }
  const enough = nOn >= MIN_DAYS_TO_CALL && nOff >= MIN_DAYS_TO_CALL;
  if (enough && size >= WORKS) {
    return diff > 0
      ? { status: 'works', final: true, label: 'Works for you' }
      : { status: 'worse', final: true, label: 'Made days worse' };
  }
  if (enough && size < NO_EFFECT) return { status: 'noeffect', final: true, label: 'No effect for you' };
  return { status: 'unsure', final: true, label: 'Can’t tell. Worth another round.' };
}

// "+1.2", "−0.8", "0.0" (a real minus sign, never a hyphen).
export function signed(x) {
  if (x === null || x === undefined) return '–';
  const v = round1(x);
  if (v === 0) return '0.0';
  return (v > 0 ? '+' : '−') + Math.abs(v).toFixed(1);
}

// Is this morning's tap faster than the usual one? Within 5% counts as the same.
export function compareSpeed(ms, usual) {
  if (usual === null || usual === undefined) return 'first';
  const band = usual * 0.05;
  if (ms < usual - band) return 'faster';
  if (ms > usual + band) return 'slower';
  return 'same';
}
