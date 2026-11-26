// state.js: everything SelfLabs knows lives in one object, saved on this
// device under one localStorage key. No accounts, no server.
//
// { v: 1,
//   startedOn: "YYYY-MM-DD"        local date of day 1 of the current round
//   goals: ["control", "sleep"]    the two picked in onboarding
//   experimentId: "walk"
//   schedule: ["base","base","on","off", ...]   14 entries, fixed at "I'm in"
//   days: { "YYYY-MM-DD": { wake: 1|2|3, wakeAt, game: { ms, rounds: [..] },
//                           control: 1..5, did: true|false, checkoutAt } }
//   round: 1
//   history: [ { experimentId, startedOn, schedule, result } ]   finished rounds
//   step: "welcome"|"goal"|"privacy"|"pick"|"how"|null   where onboarding is
//   pick: "walk"            the experiment showing in the picker
//   seenResult: false       has the final answer of this round been opened
// }

export const KEY = 'selflabs.v0';

export function blankState() {
  return {
    v: 1,
    startedOn: null,
    goals: [],
    experimentId: null,
    schedule: [],
    days: {},
    round: 1,
    history: [],
    step: 'welcome',
    pick: null,
    seenResult: false,
  };
}

function looksRight(s) {
  return s && typeof s === 'object' && s.v === 1 && s.days && typeof s.days === 'object';
}

// A store that reads and writes the real saved state.
export function localStore(storage) {
  let state = blankState();
  let ok = true;
  try {
    const raw = storage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (looksRight(parsed)) state = { ...blankState(), ...parsed };
    }
  } catch (e) {
    ok = false; // private mode or blocked storage: keep going in memory
  }
  return {
    get state() { return state; },
    save() {
      if (!ok) return;
      try { storage.setItem(KEY, JSON.stringify(state)); } catch (e) { ok = false; }
    },
    reset() {
      state = blankState();
      try { storage.removeItem(KEY); } catch (e) { /* nothing to clear */ }
    },
    demo: false,
  };
}

// A store that never touches the saved state (used by the ?demo= modes).
export function memoryStore(initial) {
  let state = initial || blankState();
  return {
    get state() { return state; },
    save() {},
    reset() { state = blankState(); },
    demo: true,
  };
}

// What "Export my data" writes.
export function exportJSON(state, exportedAt) {
  return JSON.stringify({ app: 'selflabs', exportedAt, state }, null, 2);
}
