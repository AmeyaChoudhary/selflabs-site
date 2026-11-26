// lines.js: the short dry lines, by moment. Picked from docs/nim-lines.md.
// Where a moment has several, the app rotates through them so the same line
// never shows two days running. Rules that shaped the choice:
//   - at most three screens a day name Nim (the game, the on-day card and
//     "Nim's asleep." already do), so everything else here is nameless
//   - nothing here guesses at the time of day or at why a day went badly

// Take the i-th line, wrapping round.
export function pick(list, i) {
  const n = list.length;
  return list[((Math.floor(i) % n) + n) % n];
}

// After the morning tap, for one beat. wake: 1 rough, 2 okay, 3 good.
export const WAKE = {
  1: ['Rough. Noted. No follow-up questions.', 'Same.', 'Rough it is. Bar lowered.', 'Fair. Mornings are a lot.'],
  2: ['Okay is a real answer.', 'Okay. The honest one.', 'Solidly okay. Carry on.', 'Okay. Nothing to report. Good.'],
  3: ['Good morning, apparently.', 'Good. Writing that down.', 'Noted. Enjoy it quietly.'],
};
export const WAKE_PLAIN = 'Rough counts. It’s all data.'; // a third rough morning in a row: no joke

export const TOO_EARLY = ['Too early.', 'Early. Keen, though.', 'Not yet. Go again.', 'Jumped it. Happens.'];
export const MISSED_IT = 'Missed it. Go again.';

export const SPEED = {
  first: ['First one. That’s your baseline.'],
  faster: ['Faster than usual. Not bad.', 'Quicker than usual. Noted.', 'Faster. Somebody’s awake.'],
  same: ['About your usual. Consistent.', 'Same as usual. Reliable.', 'Your usual. Nothing to see.', 'Right on your usual. Boring. Good.'],
  slower: ['Slower today. One day means nothing.', 'A bit slower. Still counts.', 'Slow morning. They happen.'],
};

export const OFF_DAY = ['Nothing assigned. That’s the test.', 'Off days are half the data.', 'Nothing to do. Do it well.'];
export const BASELINE = ['Nothing to do. Be normal.', 'Nothing to do. Do it well.']; // day 1, day 2

export const DONE = ['Nim’s asleep.', 'Nothing else. Really.', 'That’s everything. Close the app.', 'Done. This app is now boring.'];
export const HALFWAY = 'Seven down. Seven to go.'; // the done card on day 7

// On the check-in card, when the app was not opened yesterday / for a week.
export const GAP = ['A gap. Experiments have those.', 'Yesterday’s blank. Fine.', 'No check-in yesterday. Onward.', 'Blank day. The rest still counts.'];
export const AWAY = ['Oh. Hi.', 'Been a while. Nothing broke.', 'No catching up. Just today.'];

// Under "Night." after the check-out. For a 1 it is always just "Noted."
export const NIGHT = {
  1: ['Noted.'],
  2: ['Noted. That one’s over.', 'Low. That’s allowed.', 'Days like that count too.', 'Some days are just long.'],
  3: ['Three. A day happened.', 'Middle. Most days are.', 'Fine. Fine is fine.', 'An ordinary day. Logged.'],
  4: ['A good one. It happens.', 'High. Noted without fuss.', 'Good one. Writing it down.'],
  5: ['A good one. It happens.', 'High. Noted without fuss.', 'Good one. Writing it down.'],
};

// The result headline, as [first line, second line]. "Works" takes the
// experiment's own phrase (never built from its noun).
export function verdict(status, exp) {
  switch (status) {
    case 'works': return ['Okay, fine.', exp.works];
    case 'worse': return ['Huh. Worse.', 'Good to know.'];
    case 'noeffect': return ['Huh.', 'No difference.'];
    case 'early': return ['Something’s there.', 'Maybe.'];
    default: return ['Can’t tell yet.', '']; // unsure (day 14) and unclear (earlier)
  }
}

export const ATLAS_EMPTY = ['Nothing to show yet.', 'Unmapped. All of it.', 'Blank map. Give it time.', 'Empty for now. On purpose.', 'No results yet. Check-ins first.', 'The map fills in slowly.'];

export const NEXT_ROUND = 'New experiment. Same fourteen days.';

// Plain words, not Nim's: shown on Today after three "Not at all" nights in a row.
export const ROUGH_STRETCH = 'Rough stretch? You can call or text 988 any time.';

// The one-word result on the day-14 reveal, and the dry line under it.
export const REVEAL = {
  works: { word: 'Works.', line: 'Fine. Good job.' },
  worse: { word: 'Worse.', line: 'That one’s not for you.' },
  noeffect: { word: 'Flat.', line: 'No difference. One less thing.' },
  unsure: { word: 'Unclear.', line: 'Too close to call.' },
};
