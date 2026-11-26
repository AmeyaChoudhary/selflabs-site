// router.js: moves between screens. A move is choreographed, not a cut:
//   1. the old screen's content fades out (and drifts up a little)
//   2. if the ground changes, night opens from (or closes to) the horizon
//   3. the new screen arrives with its own entrance animations
// The ground, the two progress ticks and the tab bar live outside the screens,
// so they stay put (or change smoothly) while the content swaps.
//
// A screen is an object: { ground: 'white'|'night', tabs: 'today'|'atlas'|null,
//   step: 1|2|null, render(app, params) -> element }.
// An element may set element.cleanup = () => {...} to stop timers on leaving,
// and element.mounted = () => {...} to run once it is on the page.

import { paintChrome } from './stage.js';
import { reducedMotion, wait } from './ui.js';

export function createRouter(screens, app) {
  const stage = document.getElementById('stage');
  const host = document.getElementById('screens');
  const steps = document.getElementById('steps');
  const tabs = document.getElementById('tabs');
  let current = null; // { name, def, el }
  let busy = false;

  function chrome(def) {
    stage.dataset.ground = def.ground;
    paintChrome(def.ground);
    if (def.step) steps.dataset.step = def.step;
    else delete steps.dataset.step;
    tabs.classList.toggle('on', !!def.tabs);
    for (const t of tabs.querySelectorAll('.tab')) {
      const on = t.dataset.tab === def.tabs;
      t.classList.toggle('active', on);
      if (on) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    }
  }

  function mount(name, params) {
    const def = screens[name];
    const node = def.render(app, params || {});
    host.appendChild(node);
    if (node.mounted) node.mounted(); // for screens that need to measure text
    current = { name, def, el: node, params: params || {} };
    stage.dataset.screen = name;
  }

  function unmount(old) {
    if (!old) return;
    if (old.el.cleanup) old.el.cleanup();
    old.el.remove();
  }

  async function go(name, params) {
    if (busy) return;
    const def = screens[name];
    if (!def) throw new Error('no screen called ' + name);
    busy = true;
    stage.classList.add('busy');
    const old = current;
    const groundChanges = old && old.def.ground !== def.ground;
    const still = reducedMotion();

    if (old) {
      for (const child of old.el.children) {
        child.animate([still ? { opacity: 0 } : { opacity: 0, translate: '0 -8px' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
      }
    }
    if (groundChanges && def.ground === 'white') {
      // Leaving night: let the content go first, then close the night to the horizon.
      delete steps.dataset.step;
      await wait(150);
      chrome(def);
      await wait(230);
    } else {
      chrome(def);
      if (old) await wait(groundChanges ? 280 : 190);
    }
    unmount(old);
    try {
      mount(name, params);
    } catch (e) {
      // A screen that fails to draw must never leave a blank, frozen app.
      console.error(e);
      host.textContent = '';
      if (name !== 'today' && app.state.experimentId) {
        chrome(screens.today);
        mount('today');
      }
    } finally {
      stage.classList.remove('busy');
      busy = false;
    }
  }

  // Draw the current screen again in place (e.g. the day rolled over).
  function refresh() {
    if (!current || busy) return;
    const { name, params } = current;
    unmount(current);
    mount(name, params);
  }

  tabs.addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (t && current && t.dataset.tab !== current.def.tabs) go(t.dataset.tab);
  });

  return {
    go,
    refresh,
    start(name, params) {
      chrome(screens[name]);
      mount(name, params);
    },
    get current() { return current ? current.name : null; },
  };
}
