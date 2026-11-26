// main.js: starts the app.
// Test hooks (never shown in the UI):
//   ?now=2026-12-03T07:30   pretend it is this local time
//   ?demo=1 | 14 | flat     load a sample state, without touching the saved one
//   ?reset=1                clear the saved state

import { setNow, now, dayKey, isEvening } from './clock.js';
import { KEY, localStore, memoryStore } from './state.js';
import { buildDemo } from './demo.js';
import { watchStage } from './stage.js';
import { createRouter } from './router.js';

import welcome from './screens/welcome.js';
import goal from './screens/goal.js';
import privacy from './screens/privacy.js';
import consent from './screens/consent.js';
import experiment from './screens/experiment.js';
import swap from './screens/swap.js';
import how from './screens/how.js';
import today from './screens/today.js';
import checkin from './screens/checkin.js';
import game from './screens/game.js';
import checkout from './screens/checkout.js';
import day14 from './screens/day14.js';
import insight from './screens/insight.js';
import atlas from './screens/atlas.js';

const screens = { welcome, goal, privacy, consent, experiment, swap, how, today, checkin, game, checkout, day14, insight, atlas };

const query = new URLSearchParams(location.search);
if (query.get('now')) setNow(query.get('now'));
if (query.has('reset')) {
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing saved */ }
  query.delete('reset');
  const rest = query.toString();
  history.replaceState(null, '', location.pathname + (rest ? '?' + rest : ''));
}

const demo = query.get('demo') ? buildDemo(query.get('demo'), now()) : null;
const store = demo ? memoryStore(demo) : localStore(window.localStorage);

const app = {
  store,
  get state() { return store.state; },
  save() { store.save(); },
  go(name, params) { return router.go(name, params); },
  // Where the app should be, given the saved state: onboarding, or Today.
  home() {
    const step = store.state.step;
    if (step === 'pick') return 'experiment';
    if (step) return step;
    return 'today';
  },
};
const router = createRouter(screens, app);
app.router = router;

watchStage();

// Wait for the font (briefly) so the first screen does not re-flow mid-entrance.
const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(() => router.start(app.home()));

// If the app stays open across 4am or 6pm, Today and the atlas catch up.
let stamp = dayKey(now()) + isEvening(now());
function catchUp() {
  const fresh = dayKey(now()) + isEvening(now());
  if (fresh === stamp) return;
  stamp = fresh;
  if (router.current === 'today' || router.current === 'atlas') router.refresh();
}
setInterval(catchUp, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) catchUp(); });

// iOS: without a touch listener :active never shows; and no pinch-zoom on the stage.
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('gesturestart', (e) => e.preventDefault());
