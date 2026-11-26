// demo.js: believable sample states for the ?demo= test hooks. They are built
// relative to "now" and live in memory only: the real saved state is untouched.
//   ?demo=1     day 9 of the walk experiment, every check-in done so far
//   ?demo=14    day 14, finished, with a clear positive result
//   ?demo=flat  day 14, finished, no effect

import { now, dayKey, addDays } from './clock.js';
import { blankState } from './state.js';

const SCHEDULE = ['base', 'base', 'on', 'off', 'off', 'on', 'on', 'off', 'on', 'off', 'on', 'off', 'off', 'on'];

const WAKE = [2, 1, 2, 3, 2, 2, 3, 1, 2, 2, 3, 2, 2, 3];
const GAME = [331, 318, 322, 304, 309, 297, 301, 312, 287, 295, 291, 299, 288, 284];
const SPREAD = [-21, -9, 0, 12, 30]; // five rounds around the median

// "In control" for each of the 14 days. Walk days are 3, 6, 7, 9, 11 and 14.
const CONTROL = {
  '1':    [3, 3, 4, 3, 2, 4, 4, 3, 4, 3, 5, 2, 3, 4],  // by day 9: 4.0 on walk days, 2.8 on the others
  '14':   [3, 3, 4, 3, 2, 4, 4, 3, 5, 2, 4, 3, 3, 4],  // 4.2 against 2.8
  'flat': [3, 3, 3, 3, 4, 3, 4, 3, 2, 2, 3, 3, 3, 3],  // 3.0 against 3.0
};
const SKIPPED_WALK = 11; // one assigned walk that did not happen ("Done 5 of 6")

export const DEMOS = ['1', '14', 'flat'];

export function buildDemo(name, date = now()) {
  if (!DEMOS.includes(name)) return null;
  const today = name === '1' ? 9 : 14;
  const state = blankState();
  state.step = null;
  state.goals = ['control', 'sleep'];
  state.experimentId = 'walk';
  state.schedule = SCHEDULE.slice();
  state.startedOn = addDays(dayKey(date), -(today - 1));

  for (let n = 1; n <= today; n++) {
    const key = addDays(state.startedOn, n - 1);
    const kind = SCHEDULE[n - 1];
    const entry = {
      wake: WAKE[n - 1],
      wakeAt: `${key}T07:${String(10 + n).padStart(2, '0')}:00`,
      game: { ms: GAME[n - 1], rounds: SPREAD.map((d) => GAME[n - 1] + d) },
    };
    const checkedOut = name !== '1' || n < today; // demo 1: today's night is still to come
    if (checkedOut) {
      entry.control = CONTROL[name][n - 1];
      if (kind !== 'base') entry.did = kind === 'on' && n !== SKIPPED_WALK;
      entry.checkoutAt = `${key}T21:${String(20 + n).padStart(2, '0')}:00`;
    }
    state.days[key] = entry;
  }
  return state;
}
