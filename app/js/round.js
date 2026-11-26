// round.js: turns the saved state plus the clock into "what is true right now":
// which day it is, what the one card on Today should say, what the result is.
// Pure functions of (state, date), so they can be tested without a browser.

import { now, dayKey, dayNumber, addDays, daysBetween, isEvening, localISO } from './clock.js';
import { makeSchedule, ROUND_DAYS } from './schedule.js';
import { median, compare, classify, compareSpeed } from './stats.js';
import { getExperiment, tint, offerList, onLine, detailFor } from './experiments.js';
import { pick, OFF_DAY, BASELINE, DONE, HALFWAY, GAP, AWAY, NEXT_ROUND } from './lines.js';

// ---------------------------------------------------------------- the round

// The days of a round: [{ n, key, kind, entry }]. `round` is the state itself
// (the current round) or one item of state.history. A round that was ended
// early (Settings > Change experiment) stops at its endedOn day.
export function roundDays(state, round = state) {
  return round.schedule
    .map((kind, i) => {
      const key = addDays(round.startedOn, i);
      return { n: i + 1, key, kind, entry: state.days[key] || {} };
    })
    .filter((d) => !round.endedOn || d.key <= round.endedOn);
}

// "In control" on the days the app ASSIGNED the experiment, against all other
// days (off days and the two baseline days). Deliberately not "days you did
// it" against "days you didn't": people skip on days that are already going
// badly, so that comparison flatters every experiment. How many assigned days
// were actually done is reported next to the result instead (done / assigned).
export function roundResult(state, date = now(), round = state) {
  const exp = getExperiment(round.experimentId);
  const days = roundDays(state, round).filter((d) => typeof d.entry.control === 'number' && d.entry.checkoutAt);
  const onDays = days.filter((d) => d.kind === 'on');
  const on = onDays.map((d) => d.entry.control);
  const off = days.filter((d) => d.kind !== 'on').map((d) => d.entry.control);
  const day = round.endedOn ? daysBetween(round.startedOn, round.endedOn) + 1 : dayNumber(round.startedOn, date);
  const c = compare(on, off);
  return {
    exp, on, off, day, ...c, ...classify({ ...c, day }),
    assigned: onDays.length,
    done: onDays.filter((d) => d.entry.did === true).length,
  };
}

// The part of a result that is kept in history.
function summary(r) {
  return { status: r.status, label: r.label, diff: r.diff, onMean: r.onMean, offMean: r.offMean, nOn: r.nOn, nOff: r.nOff, done: r.done, assigned: r.assigned };
}

// A snapshot of today.
export function todayView(state, date = now()) {
  const raw = dayNumber(state.startedOn, date);
  const key = dayKey(date);
  const entry = state.days[key] || {};
  const inRound = raw >= 1 && raw <= ROUND_DAYS;
  const nightDone = !!entry.checkoutAt;
  return {
    raw,
    key,
    entry,
    day: Math.min(Math.max(raw, 1), ROUND_DAYS),      // what "Day N" shows
    kind: inRound ? state.schedule[raw - 1] : null,    // base | on | off
    next: raw >= 0 && raw < ROUND_DAYS ? state.schedule[raw] : null, // tomorrow's kind
    morningDone: !!entry.game,
    nightDone,
    evening: isEvening(date),
    notStarted: raw < 1,
    finished: raw > ROUND_DAYS || (raw === ROUND_DAYS && nightDone),
  };
}

// For the row of 14 dots on Today: which earlier days of this round had no
// check-in at all (drawn as an empty ring, never as a warning).
export function missedDays(state, date = now()) {
  const v = todayView(state, date);
  const out = [];
  for (let n = 1; n < v.day; n++) {
    if (!hasCheckIn(state.days[addDays(state.startedOn, n - 1)])) out.push(n);
  }
  return out;
}

// How many days of `kind` the schedule has had up to and including day n.
function ordinal(schedule, n, kind) {
  return schedule.slice(0, n).filter((k) => k === kind).length;
}

// Blank days just before today: 0 if yesterday has a check-in, null if there
// has never been one.
function blankDaysBefore(state, key) {
  const earlier = Object.keys(state.days).filter((k) => k < key && hasCheckIn(state.days[k])).sort();
  if (!earlier.length) return null;
  return daysBetween(earlier[earlier.length - 1], key) - 1;
}

function hasCheckIn(e) {
  return !!(e && (e.game || e.checkoutAt || e.wake));
}

// ---------------------------------------------------------------- the card

// The one card on Today. Returns
// { kind, title, line, tone: 'blue'|'sky'|'#hex', action, note, nim, gap }
export function nextCard(state, date = now()) {
  const v = todayView(state, date);
  const exp = getExperiment(state.experimentId);
  const night = exp.when === 'night';
  const sky = (title, line, extra = {}) => ({ title, line, tone: 'sky', action: null, note: null, gap: null, nim: 'okay', ...extra });
  const blue = (title, line, action, extra = {}) => ({ title, line, tone: 'blue', action, note: null, gap: null, nim: 'okay', ...extra });

  if (v.notStarted) {
    return sky('Starts tomorrow', `Round ${state.round}. Nim’s asleep.`, { kind: 'soon', nim: 'asleep' });
  }

  if (v.finished) {
    const r = roundResult(state, date);
    if (r.status === 'none') {
      return blue(`Round ${state.round + 1}?`, 'Too few check-outs to tell. Go again?', 'picker', { kind: 'next' });
    }
    if (state.seenResult) {
      return blue(`Round ${state.round + 1}?`, NEXT_ROUND, 'picker', { kind: 'next', nim: r.status === 'works' ? 'proud' : 'okay' });
    }
    return blue('Your answer’s in', '14 days. One result.', 'reveal', { kind: 'answer', nim: 'proud' });
  }

  // A quiet word if the app was not opened yesterday (never a broken-streak
  // message). It sits under the card until today has its first check-in.
  let gap = null;
  if (!hasCheckIn(v.entry)) {
    const blank = blankDaysBefore(state, v.key);
    if (blank >= 7) gap = pick(AWAY, v.raw);
    else if (blank >= 1) gap = pick(GAP, v.raw);
  }

  // Tonight's task, for experiments that happen at night (decided by tomorrow's slot).
  const tonight = night && v.next && v.next !== 'base' ? v.next : null;
  const onNumber = ordinal(state.schedule, v.raw, 'on');
  const offNumber = ordinal(state.schedule, v.raw, 'off');

  if (!v.evening) {
    if (!v.morningDone) return blue('Check in', 'Ten seconds.', 'morning', { kind: 'checkin', gap, nim: gap ? 'ahead' : 'okay' });
    if (v.kind === 'base') return sky('Baseline day', pick(BASELINE, v.raw - 1), { kind: 'baseline' });
    if (night) return sky('Free until 6', 'Tonight’s plan shows up then.', { kind: 'wait' });
    if (v.kind === 'on') {
      // Under the card: exactly what to do ("After school, phone in your bag.").
      const how = detailFor(exp, date);
      const note = how.charAt(0).toUpperCase() + how.slice(1) + '.';
      return { kind: 'on', title: exp.onTitle, line: onLine(exp, onNumber - 1), tone: tint(exp), action: null, note, gap: null, nim: 'okay' };
    }
    return sky('Off day', pick(OFF_DAY, offNumber - 1), { kind: 'off', nim: 'lounge' });
  }

  if (!v.nightDone) {
    const note = tonight ? `Tonight: ${tonight === 'on' ? exp.tomorrow : 'off night'}` : null;
    return blue('Check out', 'Two taps.', 'night', { kind: 'checkout', note, gap, nim: gap ? 'ahead' : 'okay' });
  }

  // Evening, checked out.
  if (tonight === 'on') {
    return { kind: 'tonight-on', title: exp.onTitle, line: onLine(exp, onNumber), tone: tint(exp), action: null, note: 'Done for today.', nim: 'asleep' };
  }
  if (tonight === 'off') {
    return sky('Off night', pick(OFF_DAY, offNumber), { kind: 'tonight-off', note: 'Done for today.', nim: 'asleep' });
  }
  let note = null;
  if (!night && v.next) {
    note = 'Tomorrow: ' + (v.next === 'base' ? 'baseline day' : v.next === 'on' ? exp.tomorrow : 'off day');
  } else if (night && v.next === 'base') {
    note = 'Tomorrow: baseline day';
  }
  const line = v.raw === 7 ? HALFWAY : pick(DONE, v.raw - 1);
  return sky('Done for today.', line, { kind: 'done', note, nim: 'asleep' });
}

// ---------------------------------------------------------------- the numbers

// Days in a row with at least one check-in, ending today (or yesterday, if
// today has none yet). It only ever counts up: a gap is not announced.
export function streak(state, date = now()) {
  const has = (key) => hasCheckIn(state.days[key]);
  let key = dayKey(date);
  if (!has(key)) key = addDays(key, -1);
  let n = 0;
  while (has(key)) {
    n++;
    key = addDays(key, -1);
  }
  return n;
}

// The median of all earlier mornings' game results ("Your usual").
export function usualMs(state, date = now()) {
  const today = dayKey(date);
  const past = Object.keys(state.days)
    .filter((key) => key < today && state.days[key].game)
    .map((key) => state.days[key].game.ms);
  const m = median(past);
  return m === null ? null : Math.round(m);
}

export function speedVerdict(ms, usual) {
  return compareSpeed(ms, usual);
}

// The three numbers on Today. null = no data yet (shown as a quiet dash).
export function todayNumbers(state, date = now()) {
  const key = dayKey(date);
  const today = state.days[key] || {};
  const yesterday = state.days[addDays(key, -1)] || {};
  return {
    ms: today.game ? today.game.ms : null,
    control: yesterday.checkoutAt ? yesterday.control : null,
    streak: streak(state, date) || null,
  };
}

// True when the last three night check-outs were all 1 ("Not at all"). Today
// then shows one plain line with the 988 number. Nothing is sent anywhere.
export function roughStretch(state) {
  const last = Object.keys(state.days)
    .filter((key) => state.days[key].checkoutAt)
    .sort()
    .slice(-3)
    .map((key) => state.days[key].control);
  return last.length === 3 && last.every((c) => c === 1);
}

// Has "Rough" been the answer three mornings running (today included)?
export function roughMornings(state, date = now()) {
  const key = dayKey(date);
  return [0, -1, -2].every((back) => (state.days[addDays(key, back)] || {}).wake === 1);
}

// ---------------------------------------------------------------- writing

export function saveWake(state, wake, date = now()) {
  const e = (state.days[dayKey(date)] ||= {});
  e.wake = wake;
  e.wakeAt = localISO(date);
}

export function saveGame(state, rounds, date = now()) {
  const e = (state.days[dayKey(date)] ||= {});
  e.game = { ms: Math.round(median(rounds)), rounds: rounds.slice() };
  return e.game;
}

export function saveControl(state, control, date = now()) {
  const e = (state.days[dayKey(date)] ||= {});
  e.control = control;
}

// `did` is null on baseline days (the question is not asked).
export function saveCheckout(state, did, date = now()) {
  const e = (state.days[dayKey(date)] ||= {});
  if (did !== null) e.did = did;
  e.checkoutAt = localISO(date);
}

// Lock in an experiment and build its 14-day schedule.
// If a round is already running or finished, it moves into history first:
// a finished one with its result, an unfinished one (Settings > Change
// experiment) marked unfinished, with what was recorded so far.
export function startRound(state, experimentId, date = now(), random = Math.random) {
  const today = dayKey(date);
  let start = today;
  if (state.experimentId) {
    const v = todayView(state, date);
    // Two rounds never share a calendar day: a day that already has a
    // check-in stays with the old round and the new one starts tomorrow.
    const used = hasCheckIn(v.entry);
    const record = { experimentId: state.experimentId, startedOn: state.startedOn, schedule: state.schedule };
    if (!v.finished) {
      record.unfinished = true;
      record.endedOn = used ? today : addDays(today, -1);
    }
    const r = roundResult(state, date, { ...record });
    record.result = record.unfinished
      ? { ...summary(r), status: 'unfinished', label: `Stopped on day ${Math.max(r.day, 0)}` }
      : summary(r);
    // A round dropped before its first day leaves nothing worth keeping.
    if (!record.unfinished || record.endedOn >= state.startedOn) {
      state.history.push(record);
      state.round += 1;
    }
    if (used) start = addDays(today, 1);
  }
  state.experimentId = experimentId;
  state.schedule = makeSchedule(random);
  state.startedOn = start;
  state.seenResult = false;
  state.pick = null;
}

// What the picker offers: best match for the goals first, minus the
// experiment being left behind.
export function pickerList(state) {
  return offerList(state.goals, state.experimentId);
}

// Every past experiment, oldest first, for the atlas. The current round
// counts once it is finished.
export function pastRounds(state, date = now()) {
  const list = state.history.map((h, i) => ({ index: i, exp: getExperiment(h.experimentId), result: h.result }));
  if (state.experimentId && todayView(state, date).finished) {
    const r = roundResult(state, date);
    list.push({ index: 'current', exp: r.exp, result: summary(r) });
  }
  return list;
}
