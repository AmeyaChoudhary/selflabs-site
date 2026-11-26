// The wake-up game: five rounds of "tap when Nim wakes", then the result.
// Artboards: design/project/Game.dc.html and GameResult.dc.html (one screen
// here, so the ring and Nim stay exactly where they are when the number lands).

import { screen, onTap, buzz, fadeOut, reducedMotion } from '../ui.js';
import { nim, setPose } from '../nim.js';
import { now } from '../clock.js';
import { saveGame, usualMs, speedVerdict, todayView } from '../round.js';
import { pick, TOO_EARLY, MISSED_IT, SPEED } from '../lines.js';

const ROUNDS = 5;
const WAIT_MIN = 1200;   // ms asleep before waking, at least
const WAIT_MAX = 3500;   // ... and at most
const TOO_SLOW = 1500;   // no tap by then: the round starts again
const TOO_FAST = 100;    // nobody reacts this fast: it was a guess

// The ring is five arcs, clockwise from the top.
const ARCS = [
  'M185.2 8.6A163 163 0 0 1 321.0 107.3',
  'M329.8 134.3A163 163 0 0 1 277.9 294.0',
  'M255.0 310.7A163 163 0 0 1 87.0 310.7',
  'M64.1 294.0A163 163 0 0 1 12.2 134.3',
  'M21.0 107.3A163 163 0 0 1 156.8 8.6',
];

export default {
  ground: 'night',
  step: 2,
  render(app) {
    const state = app.state;
    const arcs = ARCS.map((d, i) => `
<path d="${d}" fill="none" stroke="#5A688C" stroke-width="4" stroke-linecap="round"/>
<path data-arc="${i}" d="${d}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" style="stroke-dasharray:178 400;stroke-dashoffset:180;transition:stroke-dashoffset 420ms cubic-bezier(.2,.8,.2,1)"/>`).join('');

    const root = screen('game', `
<h1 data-title style="position:absolute;top:104px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#FFFFFF;animation:rise 500ms cubic-bezier(.2,.8,.2,1) both">Tap when<br><span style="color:#AFC6FF">Nim wakes.</span></h1>
<div data-result></div>
<svg viewBox="0 0 342 342" width="342" height="342" role="img" aria-label="Rounds done" style="display:block;position:absolute;left:24px;top:397px;animation:fade 500ms cubic-bezier(.2,.8,.2,1) 160ms both">${arcs}</svg>
<button class="b" data-target aria-label="Tap when Nim wakes" style="position:absolute;left:53px;top:426px;width:284px;height:284px;border-radius:50%;background:#0A1640;animation:pop 550ms cubic-bezier(.2,.8,.2,1) 80ms both;touch-action:none">
<span data-nimbox style="position:absolute;left:38px;top:3px;display:block;transition:translate 360ms cubic-bezier(.2,.8,.2,1)">${nim('asleep', { size: 216, z: '#AFC6FF' })}</span>
</button>
<div data-label role="status" style="position:absolute;left:24px;right:24px;top:762px;text-align:center;font-size:13px;line-height:16px;font-weight:500;color:#AFC6FF;animation:fade 500ms cubic-bezier(.2,.8,.2,1) 400ms both">Round 1 of ${ROUNDS}</div>`);

    const q = (sel) => root.querySelector(sel);
    const target = q('[data-target]');
    const nimBox = q('[data-nimbox]');
    const label = q('[data-label]');
    const nimSvg = () => nimBox.querySelector('svg');

    const times = [];
    let phase = 'intro'; // intro | sleep | awake | pause | done
    let wokeAt = 0;
    let timer = 0;
    let earlyCount = 0;
    const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(fn, ms); };

    function say(text, loud) {
      label.textContent = text;
      label.style.color = loud ? '#FFFFFF' : '#AFC6FF';
      label.style.fontWeight = loud ? '600' : '500';
    }

    function sleep() {
      // Nim flat and asleep (the flat body sits 12px higher in the ring).
      if (nimSvg().dataset.nim !== 'asleep') setPose(nimSvg(), 'asleep', { z: '#AFC6FF', quiet: true });
      nimBox.style.translate = '0 0';
    }

    function startRound() {
      phase = 'sleep';
      root.dataset.phase = 'sleep';
      sleep();
      say(`Round ${times.length + 1} of ${ROUNDS}`, false);
      later(wake, WAIT_MIN + Math.random() * (WAIT_MAX - WAIT_MIN));
    }

    function wake() {
      // Change the picture in one frame, and start the clock on the frame
      // after it: that is when the awake Nim is actually on the screen.
      requestAnimationFrame(() => {
        if (phase !== 'sleep') return;
        setPose(nimSvg(), 'awake', { quiet: true });
        nimBox.style.translate = '0 12px';
        requestAnimationFrame(() => {
          if (phase !== 'sleep') return;
          wokeAt = performance.now();
          phase = 'awake';
          root.dataset.phase = 'awake';
          later(tooSlow, TOO_SLOW);
        });
      });
    }

    function tooEarly() {
      phase = 'pause';
      root.dataset.phase = 'pause';
      clearTimeout(timer);
      sleep();
      say(pick(TOO_EARLY, earlyCount++), true);
      later(startRound, 1100);
    }

    function tooSlow() {
      phase = 'pause';
      root.dataset.phase = 'pause';
      say(MISSED_IT, true);
      sleep();
      later(startRound, 1100);
    }

    function hit(ms) {
      phase = 'pause';
      root.dataset.phase = 'pause';
      clearTimeout(timer);
      buzz();
      times.push(Math.round(ms));
      q(`[data-arc="${times.length - 1}"]`).style.strokeDashoffset = '0';
      say(`${Math.round(ms)} ms`, true);
      if (times.length < ROUNDS) later(startRound, 1000); // Nim drops back asleep
      else later(finish, 750);
    }

    target.addEventListener('pointerdown', (e) => {
      if (phase === 'sleep') return tooEarly();
      if (phase !== 'awake') return;
      // The event's own timestamp is when the finger landed, not when this code ran.
      const t = e.timeStamp > 0 && Math.abs(performance.now() - e.timeStamp) < 250 ? e.timeStamp : performance.now();
      const ms = t - wokeAt;
      if (ms < TOO_FAST) tooEarly();
      else hit(ms);
    });

    // The median of the five is today's number; then the result takes over
    // the top of the screen while the ring and Nim stay put.
    function finish() {
      phase = 'done';
      root.dataset.phase = 'done';
      const usual = usualMs(state, now());
      const game = saveGame(state, times, now());
      app.save();
      const verdict = speedVerdict(game.ms, usual);
      const day = todayView(state, now()).raw;
      const line = pick(SPEED[verdict], day - 1);
      target.setAttribute('aria-label', 'Nim, wide awake');
      target.style.pointerEvents = 'none';
      fadeOut(q('[data-title]'));
      fadeOut(label, { dy: 0 });
      q('[data-result]').innerHTML = `
<h1 aria-label="${game.ms} milliseconds" style="position:absolute;top:103px;left:21px;margin:0;display:flex;align-items:baseline;font-size:128px;line-height:112px;font-weight:500;letter-spacing:-0.05em;color:#FFFFFF;transform-origin:0 70%;animation:pop 500ms cubic-bezier(.2,.8,.2,1) 160ms both">${game.ms}<span style="margin-left:10px;font-size:17px;line-height:22px;font-weight:500;letter-spacing:0;color:#AFC6FF">ms</span></h1>
${verdict === 'first'
    ? `<div style="position:absolute;top:224px;left:24px;right:24px;font-size:17px;line-height:22px;font-weight:600;color:#FFFFFF;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 300ms both">${line}</div>`
    : `<div style="position:absolute;top:224px;left:24px;right:24px;font-size:17px;line-height:22px;font-weight:500;color:#AFC6FF;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 300ms both">Your usual: ${usual}</div>
<div style="position:absolute;top:250px;left:24px;right:24px;font-size:17px;line-height:22px;font-weight:600;color:#FFFFFF;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 380ms both">${line}</div>`}
<button class="b btn" data-act="done" style="position:absolute;left:24px;top:754px;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 520ms both">Done</button>`;
    }

    onTap(root, 'done', () => {
      buzz();
      app.go('today');
    });

    // If the phone locks or the tab is hidden mid-round, that round starts over.
    const onHide = () => {
      if (phase === 'done' || phase === 'intro') return;
      clearTimeout(timer);
      if (document.hidden) {
        phase = 'pause';
        sleep();
      } else startRound();
    };
    document.addEventListener('visibilitychange', onHide);
    root.cleanup = () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onHide);
    };

    // Let the screen arrive, then begin.
    root.mounted = () => later(startRound, reducedMotion() ? 300 : 900);
    return root;
  },
};
