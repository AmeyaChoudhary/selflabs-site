// Experiment: one small change on a big card. "Swap" opens the list of all of
// them, "I'm in" locks this one and builds the 14-day schedule.
// Artboard: design/project/Experiment.dc.html

import { screen, onTap, buzz, numeral } from '../ui.js';
import { now } from '../clock.js';
import { tint, goalFor, detailFor } from '../experiments.js';
import { pickerList, startRound } from '../round.js';

const HERO_SIZE = 256;   // px, the designed size of the big numeral
const HERO_MAX_WIDTH = 296;
const BODY_MAX_HEIGHT = 300; // numeral + name + detail, below the small label

export default {
  ground: 'white',
  render(app) {
    const state = app.state;
    const list = pickerList(state);
    const again = !!state.experimentId;          // round 2+, or changing experiment
    const number = again ? state.round + 1 : state.round;
    const index = Math.max(0, list.findIndex((e) => e.id === state.pick));

    const label = (exp) => {
      const goal = goalFor(exp, state.goals);
      return `Experiment ${number}` + (goal ? `<span style="margin:0 3px 0 4px">·</span>for ${goal}` : '');
    };

    const root = screen('experiment', `
<h1 style="position:absolute;top:76px;left:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise 500ms cubic-bezier(.2,.8,.2,1) both">${again ? 'Again,' : 'First,'}<br><span style="color:#2457F5">${again ? 'but different.' : 'try this.'}</span></h1>
${again ? `<button class="b" data-act="close" aria-label="Not now" style="position:absolute;right:14px;top:65px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:#5A688C;animation:fade 400ms ease-out 200ms both">
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="display:block"><path d="M6 6l12 12M18 6L6 18"/></svg>
</button>` : ''}
<div data-nim style="position:absolute;left:232px;top:206px;animation:experiment-peek 620ms cubic-bezier(.2,.8,.2,1) 520ms both">
<svg viewBox="0 0 120 120" width="96" height="96" role="img" aria-label="Nim, peeking" style="display:block;animation:nim-bob 5s ease-in-out infinite">
<path transform="rotate(-22 58 68)" d="M58 30C70 30 80 27 90 20C95 17 100 21 98 27C93 38 96 52 96 66A38 38 0 1 1 58 30Z" fill="#2457F5"/>
<g style="transform-box:fill-box;transform-origin:center;animation:nim-blink 6s infinite">
<circle cx="33" cy="68" r="8.5" fill="#FFFFFF"/>
<circle cx="56" cy="72" r="5.5" fill="#FFFFFF"/>
</g>
</svg>
</div>
<div style="position:absolute;left:24px;top:272px;width:342px;height:434px;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 90ms both">
<svg viewBox="0 0 342 434" width="342" height="434" style="display:block;position:absolute;left:0;top:0" aria-hidden="true">
<path data-blob d="M44 8C120 2 236 2 298 10C330 15 338 44 338 104C338 215 340 332 332 386C326 422 296 432 190 432C92 432 26 433 12 396C1 362 4 235 3 118C2 46 8 14 44 8Z" fill="${tint(list[index])}" style="transition:fill 450ms ease"/>
</svg>
<div data-label style="position:absolute;left:28px;top:28px;font-size:13px;line-height:16px;font-weight:600;color:#0A1640"></div>
<div data-body style="position:absolute;left:28px;right:24px;bottom:58px" aria-live="polite">
<div style="margin-left:-8px;font-size:${HERO_SIZE}px;line-height:.797;font-weight:500;letter-spacing:-0.05em;color:#2457F5;white-space:nowrap"><span data-hero></span></div>
<div data-unit style="margin-top:10px;font-size:34px;line-height:40px;font-weight:600;letter-spacing:-0.03em;color:#0A1640"></div>
<div data-detail style="margin-top:4px;font-size:17px;line-height:22px;font-weight:500;color:#0A1640"></div>
</div>
</div>
<div style="position:absolute;left:24px;top:754px;width:342px;display:flex;gap:10px;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 180ms both">
<button class="b btn soft" data-act="swap" style="width:112px">Swap</button>
<button class="b btn" data-act="in" style="flex:1;width:auto">I&rsquo;m in</button>
</div>`);

    const q = (sel) => root.querySelector(sel);
    const hero = q('[data-hero]');

    function fill() {
      const exp = list[index];
      q('[data-label]').innerHTML = label(exp);
      hero.innerHTML = numeral(exp.hero);
      q('[data-unit]').textContent = exp.unit;
      q('[data-detail]').textContent = detailFor(exp, now());
      q('[data-blob]').setAttribute('fill', tint(exp));
      // Shrink the numeral if it is wider than the card ("11:30"), or if a
      // long name below it would push it into the label at the top.
      const box = hero.parentElement;
      let size = HERO_SIZE;
      box.style.fontSize = size + 'px';
      if (hero.offsetWidth > HERO_MAX_WIDTH) size = Math.floor((size * HERO_MAX_WIDTH) / hero.offsetWidth);
      box.style.fontSize = size + 'px';
      const over = q('[data-body]').offsetHeight - BODY_MAX_HEIGHT;
      if (over > 0) size = Math.floor(size - over / 0.797);
      box.style.fontSize = size + 'px';
    }
    root.mounted = fill;

    // "Swap" opens the whole list (swap.js); it comes back here with the pick.
    onTap(root, 'swap', () => {
      buzz();
      state.pick = list[index].id;
      app.save();
      app.go('swap');
    });

    onTap(root, 'in', () => {
      buzz();
      const first = !again;
      startRound(state, list[index].id, now());
      state.step = first ? 'how' : null;
      app.save();
      app.go(first ? 'how' : 'today');
    });

    onTap(root, 'close', () => {
      state.step = null;
      state.pick = null;
      app.save();
      app.go('today');
    });

    return root;
  },
};
