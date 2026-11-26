// tests.js: checks for the logic that has to be right for 14 real days.
// Open ../tests.html in a browser, or run with node:
//   node -e "import('./site/app/js/tests.js').then(m => m.report())"

import { setNow, clearNow, now, dayKey, dayNumber, addDays, daysBetween, isEvening } from './clock.js';
import { makeSchedule, isValidSchedule, maxRun } from './schedule.js';
import { median, compare, classify, signed, compareSpeed, round1 } from './stats.js';
import { EXPERIMENTS, offerList, detailFor, onLine, getExperiment } from './experiments.js';
import { blankState } from './state.js';
import { buildDemo } from './demo.js';
import { todayView, nextCard, roundResult, startRound, saveWake, saveGame, saveControl, saveCheckout,
  streak, usualMs, todayNumbers, pastRounds, pickerList, roughStretch, roughMornings, missedDays } from './round.js';

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
function eq(actual, expected, what = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${what} expected ${e}, got ${a}`);
}
const ok = (cond, what) => { if (!cond) throw new Error(what); };
const at = (iso) => new Date(iso);

// A small seeded random generator, so schedule tests are repeatable.
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ schedule
test('schedule: 2 base + 6 on + 6 off, never more than three in a row (2000 seeds)', () => {
  for (let seed = 1; seed <= 2000; seed++) {
    const s = makeSchedule(seeded(seed));
    eq(s.length, 14, 'length');
    eq(s.slice(0, 2), ['base', 'base'], 'baseline days');
    eq(s.filter((x) => x === 'on').length, 6, 'on days');
    eq(s.filter((x) => x === 'off').length, 6, 'off days');
    ok(maxRun(s.slice(2)) <= 3, `seed ${seed} has a run longer than 3: ${s.join(' ')}`);
    ok(isValidSchedule(s), 'isValidSchedule');
  }
});
test('schedule: the order really is random (many different schedules)', () => {
  const seen = new Set();
  for (let seed = 1; seed <= 300; seed++) seen.add(makeSchedule(seeded(seed)).join(''));
  ok(seen.size > 150, `only ${seen.size} different schedules in 300`);
});
test('schedule: isValidSchedule rejects bad ones', () => {
  ok(!isValidSchedule(['base', 'base', 'on', 'on', 'on', 'on', 'off', 'off', 'off', 'on', 'on', 'off', 'off', 'off']), 'run of 4');
  ok(!isValidSchedule(['base', 'on', 'on', 'off', 'on', 'off', 'on', 'off', 'on', 'off', 'on', 'off', 'off', 'off']), 'one baseline day');
});

// ------------------------------------------------------------------ clock
test('clock: a day rolls over at 4am, not midnight', () => {
  eq(dayKey(at('2026-12-03T23:59')), '2026-12-03');
  eq(dayKey(at('2026-12-04T00:00')), '2026-12-03');
  eq(dayKey(at('2026-12-04T03:59')), '2026-12-03');
  eq(dayKey(at('2026-12-04T04:00')), '2026-12-04');
  eq(dayKey(at('2027-01-01T02:00')), '2026-12-31', 'across a year');
});
test('clock: day number counts whole local days from startedOn', () => {
  eq(dayNumber('2026-12-01', at('2026-12-01T07:00')), 1);
  eq(dayNumber('2026-12-01', at('2026-12-02T03:30')), 1, '3:30am still day 1');
  eq(dayNumber('2026-12-01', at('2026-12-02T04:00')), 2);
  eq(dayNumber('2026-12-01', at('2026-12-14T22:00')), 14);
  eq(dayNumber('2026-12-01', at('2026-12-15T09:00')), 15);
  eq(dayNumber('2026-12-25', at('2027-01-07T09:00')), 14, 'across a year');
});
test('clock: addDays and daysBetween agree, including across daylight saving', () => {
  eq(addDays('2026-12-30', 3), '2027-01-02');
  eq(daysBetween('2026-10-30', '2026-11-03'), 4);
  eq(daysBetween('2027-03-12', '2027-03-16'), 4);
  eq(addDays('2027-03-13', 1), '2027-03-14');
});
test('clock: evening is 6pm until the 4am rollover', () => {
  ok(!isEvening(at('2026-12-03T17:59')), '5:59pm');
  ok(isEvening(at('2026-12-03T18:00')), '6pm');
  ok(isEvening(at('2026-12-04T01:00')), '1am');
  ok(!isEvening(at('2026-12-04T04:00')), '4am');
});
test('clock: setNow overrides now() and keeps ticking', () => {
  setNow('2026-12-03T07:30');
  eq(dayKey(now()), '2026-12-03');
  eq(now().getHours(), 7);
  ok(!setNow('nonsense'), 'bad value is refused');
  eq(now().getHours(), 7, 'bad value leaves the clock alone');
  clearNow();
});

// ------------------------------------------------------------------ stats
test('stats: median reaction time', () => {
  eq(median([310, 250, 287, 400, 260]), 287);
  eq(median([5, 1, 3]), 3);
  eq(median([300, 200]), 250);
  eq(median([280]), 280);
  eq(median([]), null);
  eq(median([900, 250, 251, 252, 253]), 252, 'one slow round does not move it');
});
test('stats: compare uses the displayed (one decimal) averages', () => {
  const c = compare([4, 4, 3], [3, 2, 3]);
  eq([c.onMean, c.offMean, c.diff, c.nOn, c.nOff], [3.7, 2.7, 1, 3, 3]);
  eq(compare([4, 4, 4], [3, 3, 4, 3, 3, 4]).diff, 0.7, 'no floating point dust');
  eq(compare([3, 3, 3], []).diff, null);
  eq(round1(2.25), 2.3);
});
test('stats: fewer than 3 on-days or 3 off-days means nothing to show', () => {
  eq(classify({ nOn: 2, nOff: 6, diff: 2, day: 9 }).status, 'none');
  eq(classify({ nOn: 6, nOff: 2, diff: 2, day: 14 }).status, 'none');
  eq(classify({ nOn: 3, nOff: 3, diff: 1, day: 9 }).status, 'early');
});
test('stats: before day 14, 0.5 is the line between early signal and cannot tell', () => {
  eq(classify({ nOn: 3, nOff: 3, diff: 0.5, day: 9 }).label, 'Early signal · 6 days');
  eq(classify({ nOn: 4, nOff: 3, diff: -0.5, day: 10 }).label, 'Early signal · 7 days');
  eq(classify({ nOn: 3, nOff: 3, diff: 0.4, day: 9 }).label, 'Can’t tell yet · 6 days');
  eq(classify({ nOn: 5, nOff: 6, diff: 1.5, day: 13 }).status, 'early', 'day 13 is still early');
});
test('stats: day 14 thresholds (0.7 works, under 0.3 no effect, in between cannot tell)', () => {
  const f = (diff, nOn = 6, nOff = 6, day = 14) => classify({ nOn, nOff, diff, day });
  eq(f(0.7).label, 'Works for you');
  eq(f(1.3).label, 'Works for you');
  eq(f(-0.7).label, 'Made days worse');
  eq(f(0.6).label, 'Can’t tell. Worth another round.');
  eq(f(0.3).label, 'Can’t tell. Worth another round.');
  eq(f(-0.3).status, 'unsure');
  eq(f(0.2).label, 'No effect for you');
  eq(f(0).label, 'No effect for you');
  eq(f(-0.2).label, 'No effect for you');
  eq(f(1.3, 5, 5).label, 'Works for you', '5 and 5 is enough');
  eq(f(1.3, 4, 6).label, 'Can’t tell. Worth another round.', '4 on-days is not enough for a verdict');
  eq(f(0, 6, 4).label, 'Can’t tell. Worth another round.', '4 off-days is not enough for a verdict');
  eq(f(1.3, 6, 6, 20).label, 'Works for you', 'still final after day 14');
});
test('stats: signed and compareSpeed', () => {
  eq([signed(1.2), signed(-0.8), signed(0), signed(0.04)], ['+1.2', '−0.8', '0.0', '0.0']);
  eq(compareSpeed(287, 310), 'faster');
  eq(compareSpeed(305, 310), 'same');
  eq(compareSpeed(340, 310), 'slower');
  eq(compareSpeed(300, null), 'first');
});

// ------------------------------------------------------------------ a round
function fresh(startAt = '2026-12-01T07:00', experimentId = 'walk', seed = 7) {
  const s = blankState();
  s.goals = ['control', 'sleep'];
  s.step = null;
  startRound(s, experimentId, at(startAt), seeded(seed));
  return s;
}
function morning(s, iso, ms = 300, wake = 2) {
  saveWake(s, wake, at(iso));
  saveGame(s, [ms - 20, ms - 5, ms, ms + 10, ms + 40], at(iso));
}
function night(s, iso, control, did = null) {
  saveControl(s, control, at(iso));
  saveCheckout(s, did, at(iso));
}
const ALTERNATING = ['base', 'base', 'on', 'off', 'on', 'off', 'on', 'off', 'on', 'off', 'on', 'off', 'on', 'off'];

test('round: the card walks through a day', () => {
  const s = fresh();
  s.schedule = ALTERNATING.slice();
  eq(s.startedOn, '2026-12-01');
  eq(nextCard(s, at('2026-12-01T07:00')).kind, 'checkin');
  eq(nextCard(s, at('2026-12-01T07:00')).line, 'Ten seconds.');
  morning(s, '2026-12-01T07:01');
  eq(nextCard(s, at('2026-12-01T07:02')).kind, 'baseline');
  eq(nextCard(s, at('2026-12-01T18:00')).kind, 'checkout');
  night(s, '2026-12-01T21:00', 3);
  const done = nextCard(s, at('2026-12-01T21:01'));
  eq([done.kind, done.line, done.note, done.nim], ['done', 'Nim’s asleep.', 'Tomorrow: baseline day', 'asleep']);
  eq(nextCard(s, at('2026-12-02T02:00')).kind, 'done', 'still day 1 at 2am');
  eq(nextCard(s, at('2026-12-02T04:00')).kind, 'checkin', 'day 2 from 4am');
  night(s, '2026-12-02T21:00', 3);
  eq(nextCard(s, at('2026-12-02T21:01')).note, 'Tomorrow: walk day');
  morning(s, '2026-12-03T07:00');
  const on = nextCard(s, at('2026-12-03T07:05'));
  eq([on.kind, on.title, on.line, on.tone], ['on', 'Walk day', '20 minutes. Nim’s not coming.', '#FBC2C1']);
  eq(on.note, 'After school, phone in your bag.', 'Thursday 3 December');
  s.schedule[4] = 'on';
  eq(nextCard(s, at('2026-12-05T10:00')).kind, 'checkin');
  morning(s, '2026-12-05T10:00');
  eq(nextCard(s, at('2026-12-05T10:05')).note, 'This afternoon, phone in your bag.', 'Saturday 5 December');
  delete s.days['2026-12-05'];
  night(s, '2026-12-03T21:00', 4, true);
  eq(nextCard(s, at('2026-12-03T21:01')).note, 'Tomorrow: off day');
  morning(s, '2026-12-04T07:00');
  const off = nextCard(s, at('2026-12-04T07:05'));
  eq([off.kind, off.title, off.line], ['off', 'Off day', 'Nothing assigned. That’s the test.']);
});
test('round: a missed morning never blocks the night check-out', () => {
  const s = fresh();
  eq(nextCard(s, at('2026-12-01T19:00')).kind, 'checkout');
  night(s, '2026-12-01T19:01', 2);
  eq(nextCard(s, at('2026-12-01T19:02')).kind, 'done');
});
test('round: the same line never shows two days running', () => {
  for (const id of ['walk', 'first25', 'friend', 'outside', 'breaths', 'stretch', 'songs', 'clearspace', 'thanks', 'help', 'nothing']) {
    for (let seed = 1; seed <= 20; seed++) {
      const s = fresh('2026-12-01T07:00', id, seed);
      let before = null;
      let beforeDone = null;
      for (let n = 1; n <= 14; n++) {
        const key = addDays(s.startedOn, n - 1);
        morning(s, `${key}T07:00`);
        const card = nextCard(s, at(`${key}T12:00`));
        ok(card.line !== before, `${id} seed ${seed} day ${n}: "${card.line}" twice in a row`);
        ok(!/[{}]/.test(card.line), `unfilled slot in "${card.line}"`);
        ok(!/^No \w+ today/.test(card.line), 'the off-day line never names the experiment');
        before = card.line;
        night(s, `${key}T21:00`, 3, s.schedule[n - 1] === 'base' ? null : true);
        if (n < 14) {
          const done = nextCard(s, at(`${key}T21:01`));
          ok(done.line !== beforeDone, `${id} day ${n}: done line "${done.line}" twice in a row`);
          beforeDone = done.line;
        }
      }
    }
  }
});
test('round: a gap gets a quiet line and an empty ring, never a streak message', () => {
  const s = fresh();
  const GAPS = ['A gap. Experiments have those.', 'Yesterday’s blank. Fine.', 'No check-in yesterday. Onward.', 'Blank day. The rest still counts.'];
  const BACK = ['Oh. Hi.', 'Been a while. Nothing broke.', 'No catching up. Just today.'];
  morning(s, '2026-12-01T07:00');
  night(s, '2026-12-01T21:00', 3);
  eq(nextCard(s, at('2026-12-02T07:00')).gap, null, 'no gap');
  const c = nextCard(s, at('2026-12-03T07:00'));
  eq([c.title, c.line, c.nim], ['Check in', 'Ten seconds.', 'ahead'], 'the card itself does not change');
  ok(GAPS.includes(c.gap), 'one blank day');
  eq(missedDays(s, at('2026-12-03T07:00')), [2]);
  ok(BACK.includes(nextCard(s, at('2026-12-10T07:00')).gap), 'a week away');
  ok(BACK.includes(nextCard(s, at('2026-12-10T19:00')).gap), 'also with the check-out card');
  morning(s, '2026-12-10T07:00');
  eq(nextCard(s, at('2026-12-10T19:00')).gap, null, 'only until the first check-in of the day');
  eq(missedDays(s, at('2026-12-10T19:00')), [2, 3, 4, 5, 6, 7, 8, 9]);
});
test('round: results compare by ASSIGNED day; baseline days count with off days', () => {
  const s = fresh();
  s.schedule = ALTERNATING.slice();
  // walk days: 5 when done, 2 when skipped. A "did it" comparison would flatter the walk.
  const plan = { 3: [5, true], 5: [2, false], 7: [5, true], 9: [2, false], 11: [5, true], 13: [5, true] };
  for (let n = 1; n <= 14; n++) {
    const key = addDays(s.startedOn, n - 1);
    if (plan[n]) night(s, `${key}T21:00`, plan[n][0], plan[n][1]);
    else night(s, `${key}T21:00`, 3, n <= 2 ? null : n === 4); // one off day where the walk happened anyway
  }
  const r = roundResult(s, at('2026-12-14T22:00'));
  eq([r.nOn, r.nOff], [6, 8], '6 assigned days against 6 off + 2 baseline');
  eq([r.onMean, r.offMean, r.diff], [4, 3, 1]);
  eq([r.done, r.assigned], [4, 6], 'Done 4 of 6');
  eq(r.label, 'Works for you');
});
test('round: 14 days of check-ins give the right result and finish the round', () => {
  const s = fresh();
  for (let n = 1; n <= 14; n++) {
    const key = addDays(s.startedOn, n - 1);
    const kind = s.schedule[n - 1];
    eq(todayView(s, at(`${key}T07:00`)).day, n);
    morning(s, `${key}T07:00`, 320 - n);
    ok(!todayView(s, at(`${key}T12:00`)).finished, `not finished on day ${n} before check-out`);
    night(s, `${key}T21:30`, kind === 'on' ? 4 : 3, kind === 'base' ? null : kind === 'on');
  }
  const end = at(`${addDays(s.startedOn, 13)}T21:31`);
  ok(todayView(s, end).finished, 'finished after the day-14 check-out');
  const r = roundResult(s, end);
  eq([r.nOn, r.nOff, r.onMean, r.offMean, r.diff, r.label, r.done, r.assigned], [6, 8, 4, 3, 1, 'Works for you', 6, 6]);
  eq(nextCard(s, end).kind, 'answer');
  eq(streak(s, end), 14);
  eq(usualMs(s, end), Math.round(median([319, 318, 317, 316, 315, 314, 313, 312, 311, 310, 309, 308, 307])));
  eq(pastRounds(s, end).length, 1);
  const later = at(`${addDays(s.startedOn, 20)}T09:00`);
  eq([todayView(s, later).day, todayView(s, later).finished], [14, true], 'day stays 14 of 14');
  s.seenResult = true;
  eq([nextCard(s, later).kind, nextCard(s, later).title], ['next', 'Round 2?']);
});
test('round: nothing to show until 3 assigned days and 3 other days are checked out', () => {
  const s = fresh();
  s.schedule = ALTERNATING.slice();
  night(s, '2026-12-01T21:00', 3);
  night(s, '2026-12-02T21:00', 3);
  night(s, '2026-12-03T21:00', 4, true);
  night(s, '2026-12-04T21:00', 3, false);
  night(s, '2026-12-05T21:00', 4, true);
  eq(roundResult(s, at('2026-12-06T08:00')).status, 'none', '2 walk days so far');
  night(s, '2026-12-07T21:00', 4, true);
  const r = roundResult(s, at('2026-12-08T08:00'));
  eq([r.nOn, r.nOff, r.diff, r.label], [3, 3, 1, 'Early signal · 6 days']);
});
test('round: a half-finished check-out (control tapped, question not answered) does not count', () => {
  const s = fresh();
  saveControl(s, 4, at('2026-12-03T21:00'));
  eq(todayView(s, at('2026-12-03T21:01')).nightDone, false);
  const r = roundResult(s, at('2026-12-03T21:01'));
  eq(r.nOn + r.nOff, 0);
});
test('round: round 2 keeps history, excludes the last experiment, never shares a day', () => {
  const s = buildDemo('14', at('2026-12-14T22:00'));
  eq(pickerList(s).some((e) => e.id === 'walk'), false, 'walk is not offered again');
  startRound(s, 'friend', at('2026-12-14T22:05'), seeded(3));
  eq([s.round, s.history.length, s.history[0].experimentId, s.history[0].result.label], [2, 1, 'walk', 'Works for you']);
  eq(s.history[0].unfinished, undefined);
  eq(s.startedOn, '2026-12-15', 'started on the last day of round 1, so day 1 is tomorrow');
  eq(nextCard(s, at('2026-12-14T22:06')).kind, 'soon');
  eq(nextCard(s, at('2026-12-15T07:00')).kind, 'checkin');
  ok(isValidSchedule(s.schedule), 'new schedule');
  eq(Object.keys(s.days).length, 14, 'old days are kept');
  eq(pastRounds(s, at('2026-12-15T07:00')).length, 1);
  eq(roundResult(s, at('2026-12-20T07:00'), s.history[0]).diff, 1.4, 'an old round can still be drawn');
  const t = buildDemo('14', at('2026-12-14T22:00'));
  startRound(t, 'friend', at('2026-12-16T09:00'), seeded(3));
  eq(t.startedOn, '2026-12-16', 'started later: day 1 is that day');
});
test('round: Change experiment ends the round early and keeps it, marked unfinished', () => {
  const s = buildDemo('1', at('2026-12-09T08:00')); // day 9, this morning's check-in done
  startRound(s, 'breaths', at('2026-12-09T08:30'), seeded(5));
  const h = s.history[0];
  eq([s.round, s.experimentId, h.experimentId, h.unfinished, h.endedOn], [2, 'breaths', 'walk', true, '2026-12-09']);
  eq([h.result.status, h.result.label, h.result.diff], ['unfinished', 'Stopped on day 9', 1.2]);
  eq(s.startedOn, '2026-12-10', 'today already has a check-in, so the new round starts tomorrow');
  eq(Object.keys(s.days).length, 9, 'nothing recorded is lost');
  eq(pastRounds(s, at('2026-12-10T08:00'))[0].result.status, 'unfinished');
  // changing before today's first check-in: the new round can start today
  const t = buildDemo('1', at('2026-12-09T08:00'));
  delete t.days['2026-12-09'];
  startRound(t, 'breaths', at('2026-12-09T08:30'), seeded(5));
  eq([t.startedOn, t.history[0].endedOn, t.history[0].result.label], ['2026-12-09', '2026-12-08', 'Stopped on day 8']);
  // changing your mind right after picking leaves no empty round behind
  const u = fresh('2026-12-01T07:00');
  startRound(u, 'breaths', at('2026-12-01T07:05'), seeded(5));
  eq([u.round, u.history.length, u.startedOn], [1, 0, '2026-12-01']);
});
test('round: the three numbers on Today', () => {
  const s = fresh();
  eq(todayNumbers(s, at('2026-12-01T07:00')), { ms: null, control: null, streak: null });
  morning(s, '2026-12-01T07:00', 300);
  night(s, '2026-12-01T21:00', 4);
  eq(todayNumbers(s, at('2026-12-01T21:01')), { ms: 300, control: null, streak: 1 });
  eq(todayNumbers(s, at('2026-12-02T07:00')), { ms: null, control: 4, streak: 1 });
  morning(s, '2026-12-02T07:00', 280);
  eq(todayNumbers(s, at('2026-12-02T07:01')), { ms: 280, control: 4, streak: 2 });
  eq(streak(s, at('2026-12-04T07:00')), 0, 'after a gap it quietly starts again');
});
test('round: three "Not at all" nights in a row show the 988 line, a better night clears it', () => {
  const s = fresh();
  night(s, '2026-12-01T21:00', 1);
  night(s, '2026-12-02T21:00', 1);
  ok(!roughStretch(s), 'two is not three');
  night(s, '2026-12-03T21:00', 1, false);
  ok(roughStretch(s), 'three 1s in a row');
  saveControl(s, 1, at('2026-12-04T21:00'));
  ok(roughStretch(s), 'a half-finished check-out changes nothing');
  night(s, '2026-12-05T21:00', 2, false);
  ok(!roughStretch(s), 'gone after a 2');
  const t = fresh();
  night(t, '2026-12-01T21:00', 1);
  night(t, '2026-12-03T21:00', 1, false);
  night(t, '2026-12-06T21:00', 1, false);
  ok(roughStretch(t), 'the last three check-outs, even with blank days between');
});
test('round: three rough mornings in a row are noticed', () => {
  const s = fresh();
  morning(s, '2026-12-01T07:00', 300, 1);
  morning(s, '2026-12-02T07:00', 300, 1);
  ok(!roughMornings(s, at('2026-12-02T07:01')));
  morning(s, '2026-12-03T07:00', 300, 1);
  ok(roughMornings(s, at('2026-12-03T07:01')));
});
test('round: a night experiment (not offered in v0) is announced from 6pm', () => {
  const s = fresh('2026-12-01T07:00', 'phonedown');
  s.schedule = ALTERNATING.slice();
  morning(s, '2026-12-02T07:00');
  eq(nextCard(s, at('2026-12-02T12:00')).kind, 'baseline');
  const co = nextCard(s, at('2026-12-02T18:30'));
  eq([co.kind, co.note], ['checkout', 'Tonight: phone-down night']);
  night(s, '2026-12-02T21:00', 3);
  const t = nextCard(s, at('2026-12-02T21:01'));
  eq([t.kind, t.title, t.tone], ['tonight-on', 'Phone-down night', '#D9C9F8']);
  morning(s, '2026-12-03T07:00');
  eq(nextCard(s, at('2026-12-03T09:00')).kind, 'wait');
});

// ------------------------------------------------------------------ library + demos
test('library: eleven daytime experiments on offer, every field filled in', () => {
  const offered = offerList([]);
  eq(offered.map((e) => e.id), ['walk', 'friend', 'first25', 'outside', 'stretch', 'thanks', 'clearspace', 'breaths', 'songs', 'help', 'nothing']);
  ok(offered.every((e) => e.when === 'day'), 'no night experiments in the v0 picker');
  const fields = ['id', 'noun', 'area', 'when', 'hero', 'unit', 'onTitle', 'amount', 'question', 'daysLabel', 'tomorrow', 'atlasName', 'works'];
  for (const e of EXPERIMENTS) {
    for (const f of fields) ok(typeof e[f] === 'string' && e[f].length, `${e.id}.${f}`);
    ok(e.lines.length >= 1 && e.goals.length >= 1, `${e.id} lines and goals`);
    ok(detailFor(e, at('2026-12-02T12:00')).length > 0, `${e.id} detail`);
    for (let i = 0; i < 8; i++) ok(!/[{}]/.test(onLine(e, i)), `${e.id} line ${i}`);
  }
  eq(getExperiment('nothing').works, 'Doing nothing works.');
  eq(offerList(['control', 'sleep'])[0].id, 'walk', 'goals choose what is offered first');
  eq(offerList(['focus', 'calm'])[0].id, 'first25');
  eq(offerList(['control', 'sleep'], 'walk').length, 10);
});
test('library: wording does not depend on school', () => {
  const walk = getExperiment('walk');
  eq(detailFor(walk, at('2026-12-04T12:00')), 'after school, phone in your bag', 'Friday');
  eq(detailFor(walk, at('2026-12-05T12:00')), 'this afternoon, phone in your bag', 'Saturday');
  eq(detailFor(walk, at('2026-12-06T12:00')), 'this afternoon, phone in your bag', 'Sunday');
  eq(detailFor(walk, at('2026-12-07T12:00')), 'after school, phone in your bag', 'Monday');
  eq(getExperiment('first25').question, 'Did you start without your phone?');
  for (const e of offerList([])) {
    if (e.id === 'walk') continue;
    ok(!/school|homework|first screen/.test(JSON.stringify(e)), `${e.id} mentions school`);
  }
});
test('demo: ?demo=1 is day 9 with an early signal', () => {
  const date = at('2026-12-09T08:00');
  const s = buildDemo('1', date);
  const v = todayView(s, date);
  eq([v.day, v.kind, v.morningDone, v.nightDone, v.finished], [9, 'on', true, false, false]);
  ok(isValidSchedule(s.schedule), 'schedule');
  const r = roundResult(s, date);
  eq([r.nOn, r.nOff, r.onMean, r.offMean, r.diff, r.label, r.done, r.assigned], [3, 5, 4, 2.8, 1.2, 'Early signal · 8 days', 3, 3]);
  eq(nextCard(s, date).title, 'Walk day');
  eq(nextCard(s, at('2026-12-09T19:00')).kind, 'checkout');
  eq(todayNumbers(s, date), { ms: 287, control: 3, streak: 9 });
});
test('demo: ?demo=14 is a finished round that works', () => {
  const date = at('2026-12-14T08:00');
  const s = buildDemo('14', date);
  const r = roundResult(s, date);
  eq([todayView(s, date).day, todayView(s, date).finished], [14, true]);
  eq([r.nOn, r.nOff, r.onMean, r.offMean, r.diff, r.label, r.done, r.assigned], [6, 8, 4.2, 2.8, 1.4, 'Works for you', 5, 6]);
  eq(nextCard(s, date).kind, 'answer');
});
test('demo: ?demo=flat is a finished round with no effect', () => {
  const date = at('2026-12-14T08:00');
  const s = buildDemo('flat', date);
  const r = roundResult(s, date);
  eq([r.nOn, r.nOff, r.onMean, r.offMean, r.diff, r.label], [6, 8, 3, 3, 0, 'No effect for you']);
  eq(buildDemo('nope', date), null);
});

// ------------------------------------------------------------------ runner
export function run() {
  return tests.map(({ name, fn }) => {
    try {
      fn();
      return { name, pass: true };
    } catch (e) {
      clearNow();
      return { name, pass: false, error: e.message };
    }
  });
}

export function report(log = console.log) {
  const results = run();
  for (const r of results) log(`${r.pass ? 'ok  ' : 'FAIL'} ${r.name}${r.pass ? '' : '\n       ' + r.error}`);
  const failed = results.filter((r) => !r.pass).length;
  log(`\n${results.length - failed} of ${results.length} passed`);
  return failed;
}
