// experiments.js: the library of small changes, as plain data.
// Wording comes from docs/experiments.md. Each experiment has:
//   area       which atlas tint it wears (move, sleep, focus, people, calm)
//   goals      which onboarding goals it is offered for
//   hero/unit  the big numeral and the words after it on the picker card
//   detail     the small line on the card (walk has a weekend wording)
//   onTitle    the Today card title on an "on" day
//   lines      dry lines for that card; a different one each on-day
//   question   the yes/no at the night check-out
//   noun       its one-word name ("Walk · In progress" on the atlas)
//   daysLabel  the chart label, tomorrow: "Tomorrow: walk day"
//   atlasName  its name on the atlas, works: "Okay, fine. Walks work."
//
// v0 only offers experiments that are done during the day, so every answer is
// scored against the same day. The three night ones stay in this file with
// inV0: false (they would be scored against the NEXT day's answer).

export const AREA_NAMES = { move: 'Move', sleep: 'Sleep', people: 'People', focus: 'Focus', calm: 'Calm' };

// The paler version of each tint: a region that is still in progress.
export const PALE = {
  move: '#FFE5E4',
  sleep: '#F0E9FF',
  people: '#DBF4E9',
  focus: '#FBEAD8',
  calm: '#DEEFFF',
};

export const AREAS = {
  move: '#FBC2C1',
  sleep: '#D9C9F8',
  people: '#A9E1CA',
  focus: '#F0CBA5',
  calm: '#B2D7FD',
};

export const GOALS = ['control', 'focus', 'calm', 'sleep', 'energy', 'time'];

// Lines that fit any experiment. {amount} and {title} are filled in.
const ANY = ['{amount}. That’s the whole thing.', '{amount}. Then you’re done.', '{amount}. No one’s timing you.', '{title}. The app picked.'];

export const EXPERIMENTS = [
  {
    id: 'walk', noun: 'Walk', area: 'move', when: 'day', inV0: true, goals: ['control', 'energy'],
    hero: '20', unit: 'minute walk',
    detail: { weekday: 'after school, phone in your bag', weekend: 'this afternoon, phone in your bag' },
    onTitle: 'Walk day', amount: '20 minutes',
    lines: ['20 minutes. Nim’s not coming.', 'Nim has no legs. You go.', '20 minutes. Out, then back.', 'Phone in the bag. Twenty minutes.', 'Walk day. Any direction works.'],
    question: 'Did you do the walk?',
    daysLabel: 'Walk days', tomorrow: 'walk day', atlasName: 'Walk after school', works: 'Walks work.',
  },
  {
    id: 'friend', noun: 'Friend', area: 'people', when: 'day', inV0: true, goals: ['calm'],
    hero: '10', unit: 'minutes with a friend',
    detail: 'a call or in person, no scrolling',
    onTitle: 'Friend day', amount: 'Ten minutes',
    lines: ['10 minutes. Out loud.', 'Friend day. Typing doesn’t count.', 'Ten minutes. Actual voice.', 'Friend day. Say words at someone.'],
    question: 'Did you talk to a friend?',
    daysLabel: 'Friend days', tomorrow: 'friend day', atlasName: 'Ten minutes with a friend', works: 'Friend days work.',
  },
  {
    id: 'first25', noun: 'Phone-out', area: 'focus', when: 'day', inV0: true, goals: ['focus', 'time', 'control'],
    hero: '25', unit: 'minutes, phone out',
    detail: 'first 25 of whatever you have to do, phone in another room',
    onTitle: 'Phone-out day', amount: '25 minutes',
    lines: ['25 minutes. It can wait.', ...ANY],
    question: 'Did you start without your phone?',
    daysLabel: 'Phone-out days', tomorrow: 'phone-out day', atlasName: 'Phone out for 25', works: 'Phone-out works.',
  },
  {
    id: 'outside', noun: 'Outside', area: 'calm', when: 'day', inV0: true, goals: ['calm', 'energy'],
    hero: '5', unit: 'minutes outside',
    detail: 'before you open anything else',
    onTitle: 'Outside morning', amount: 'Five minutes',
    lines: ['Five minutes. Sky first.', 'Five minutes. The sky’s already on.', 'Outside morning. Sky, then screens.', 'Outside first. The feed can wait.', 'Door, then phone. That order.'],
    question: 'Did you go outside first?',
    daysLabel: 'Outside mornings', tomorrow: 'outside morning', atlasName: 'Outside first', works: 'Outside works.',
  },
  {
    id: 'stretch', noun: 'Stretch', area: 'move', when: 'day', inV0: true, goals: ['energy', 'calm'],
    hero: '5', unit: 'minute stretch',
    detail: 'on the floor, any time before dinner',
    onTitle: 'Stretch day', amount: 'Five minutes',
    lines: ['Five minutes. Floor’s right there.', ...ANY],
    question: 'Did you do the stretch?',
    daysLabel: 'Stretch days', tomorrow: 'stretch day', atlasName: 'Five-minute stretch', works: 'Stretching works.',
  },
  {
    id: 'thanks', noun: 'Thank-you', area: 'people', when: 'day', inV0: true, goals: ['calm'],
    hero: '1', unit: 'thank-you text',
    detail: 'to anyone, for one specific thing',
    onTitle: 'Thank-you day', amount: 'One text',
    lines: ['One text. Be specific.', ...ANY],
    question: 'Did you send the thank-you?',
    daysLabel: 'Thank-you days', tomorrow: 'thank-you day', atlasName: 'One thank-you text', works: 'Thank-yous work.',
  },
  {
    id: 'clearspace', noun: 'Clear-space', area: 'focus', when: 'day', inV0: true, goals: ['focus', 'control', 'time'],
    hero: '5', unit: 'minutes clearing your space',
    detail: 'wherever you work, before you start',
    onTitle: 'Clear-space day', amount: 'Five minutes',
    lines: ['Five minutes. Just the surface.', ...ANY],
    question: 'Did you clear your space first?',
    daysLabel: 'Clear-space days', tomorrow: 'clear-space day', atlasName: 'Clear your space first', works: 'A clear space works.',
  },
  {
    id: 'breaths', noun: 'Breathing', area: 'calm', when: 'day', inV0: true, goals: ['calm', 'focus'],
    hero: '10', unit: 'slow breaths',
    detail: 'right before the thing you’re putting off',
    onTitle: 'Breathing day', amount: 'Ten breaths',
    lines: ['Ten breaths. Slowly.', ...ANY],
    question: 'Did you do the breaths?',
    daysLabel: 'Breathing days', tomorrow: 'breathing day', atlasName: 'Ten slow breaths', works: 'Breathing works.',
  },
  {
    id: 'songs', noun: 'Two-song', area: 'move', when: 'day', inV0: true, goals: ['energy'],
    hero: '2', unit: 'songs, moving',
    detail: 'door shut, any two, don’t sit still',
    onTitle: 'Two-song day', amount: 'Two songs',
    lines: ['Two songs. Door shut.', ...ANY],
    question: 'Did you move for two songs?',
    daysLabel: 'Two-song days', tomorrow: 'two-song day', atlasName: 'Two songs, moving', works: 'Two songs work.',
  },
  {
    id: 'help', noun: 'Help', area: 'people', when: 'day', inV0: true, goals: ['control'],
    hero: '1', unit: 'thing for someone else',
    detail: 'small, unasked, under ten minutes',
    onTitle: 'Help day', amount: 'One thing',
    lines: ['One thing. Don’t announce it.', ...ANY],
    question: 'Did you do one thing for someone?',
    daysLabel: 'Help days', tomorrow: 'help day', atlasName: 'One thing for someone', works: 'Helping works.',
  },
  {
    id: 'nothing', noun: 'Do-nothing', area: 'calm', when: 'day', inV0: true, goals: ['calm', 'focus', 'control'],
    hero: '3', unit: 'minutes of nothing',
    detail: 'sit, timer on, no phone, no music',
    onTitle: 'Do-nothing day', amount: 'Three minutes',
    lines: ['Three minutes. Do nothing. Properly.', ...ANY],
    question: 'Did you do the three minutes?',
    daysLabel: 'Do-nothing days', tomorrow: 'do-nothing day', atlasName: 'Three minutes of nothing', works: 'Doing nothing works.',
  },

  // ---- not offered in v0: done at night, so scored against the next day ----
  {
    id: 'phonedown', noun: 'Phone-down', area: 'sleep', when: 'night', inV0: false, goals: ['sleep', 'energy'],
    hero: '11:30', unit: 'phone down',
    detail: 'across the room, not next to your bed',
    onTitle: 'Phone-down night', amount: '11:30',
    lines: ['11:30. It’ll survive without you.', '11:30. The group chat will cope.', '11:30. It’ll still be there.'],
    question: 'Was your phone down by 11:30 last night?',
    daysLabel: 'Phone-down nights', tomorrow: 'phone-down night', atlasName: 'Phone down by 11:30', works: 'Phone-down works.',
  },
  {
    id: 'noscreens', noun: 'Screen-free', area: 'sleep', when: 'night', inV0: false, goals: ['sleep', 'time'],
    hero: '20', unit: 'screen-free minutes',
    detail: 'the last 20 before you sleep',
    onTitle: 'Screen-free night', amount: '20 minutes',
    lines: ['20 minutes. Stare at the ceiling.'],
    question: 'Did you skip screens before bed last night?',
    daysLabel: 'Screen-free nights', tomorrow: 'screen-free night', atlasName: 'No screens before bed', works: 'Screen-free works.',
  },
  {
    id: 'top3', noun: 'List', area: 'focus', when: 'night', inV0: false, goals: ['time', 'control', 'focus'],
    hero: '3', unit: 'things for tomorrow',
    detail: 'write them down before bed',
    onTitle: 'List night', amount: 'Three things',
    lines: ['Three things. On paper.'],
    question: 'Did you write your three last night?',
    daysLabel: 'List nights', tomorrow: 'list night', atlasName: 'Three things on paper', works: 'Lists work.',
  },
];

export function getExperiment(id) {
  return EXPERIMENTS.find((e) => e.id === id) || null;
}

export function tint(exp) {
  return AREAS[exp.area];
}

// The small line on the picker card. "After school" does not exist on a
// Saturday, so the walk has a weekend wording.
export function detailFor(exp, date) {
  if (typeof exp.detail === 'string') return exp.detail;
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6 ? exp.detail.weekend : exp.detail.weekday;
}

// The dry line for the n-th "on" day (n starts at 0), slots filled in.
export function onLine(exp, n) {
  const line = exp.lines[((n % exp.lines.length) + exp.lines.length) % exp.lines.length];
  return line.replace('{amount}', exp.amount).replace('{title}', exp.onTitle);
}

// The experiments to offer, best match for the user's two goals first.
// `exclude` is the id of the experiment being left behind (round 2+).
export function offerList(goals = [], exclude = null) {
  const score = (e) => {
    const hits = goals.map((g, i) => (e.goals.includes(g) ? i : -1)).filter((i) => i >= 0);
    return hits.length ? hits[0] : goals.length + 1;
  };
  return EXPERIMENTS.filter((e) => e.inV0 && e.id !== exclude)
    .map((e, i) => ({ e, i, s: score(e) }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.e);
}

// Which of the user's goals an experiment is "for" (null if neither).
export function goalFor(exp, goals = []) {
  return goals.find((g) => exp.goals.includes(g)) || null;
}
