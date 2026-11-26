// Night check-out: tap one of five Nims (the big one mirrors it), answer one
// yes/no, then a two-second "Night." Artboard: design/project/Checkout.dc.html

import { screen, buzz, fadeOut, reducedMotion } from '../ui.js';
import { nim, setPose, HAZE, NIGHT, WHITE, BLUE } from '../nim.js';
import { now } from '../clock.js';
import { getExperiment } from '../experiments.js';
import { todayView, saveControl, saveCheckout } from '../round.js';
import { pick, NIGHT as NIGHT_LINES } from '../lines.js';

const SCALE = [
  { n: 1, label: '1 of 5, not at all' },
  { n: 2, label: '2 of 5' },
  { n: 3, label: '3 of 5' },
  { n: 4, label: '4 of 5' },
  { n: 5, label: '5 of 5, totally' },
];
const PILL = 'width:72px;height:56px;border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:17px;line-height:22px;font-weight:600;background:#1B3182;color:#AFC6FF';

export default {
  ground: 'night',
  render(app) {
    const state = app.state;
    const v = todayView(state, now());
    const exp = getExperiment(state.experimentId);
    const asks = v.kind === 'on' || v.kind === 'off'; // baseline days skip the yes/no
    let control = typeof v.entry.control === 'number' ? v.entry.control : null;
    let closing = false;

    const scale = SCALE.map((s) => `
<button class="b" data-scale="${s.n}" aria-pressed="false" aria-label="${s.label}" style="position:relative;width:66px;height:66px;border-radius:50%;display:flex;align-items:center;justify-content:center">
${nim('scale' + s.n, { size: 56, body: HAZE, eye: NIGHT, breathe: 0, blink: 0 })}
</button>`).join('');

    const root = screen('checkout', `
<h1 data-fade style="position:absolute;top:76px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#FFFFFF;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 0ms both">In control<br><span style="color:#AFC6FF">today?</span></h1>
<div data-night></div>
<svg viewBox="0 0 48 48" width="52" height="52" aria-hidden="true" style="position:absolute;left:76px;top:286px;display:block;animation:fade 700ms ease-out 120ms both">
<path d="M44.01 33.15A22 22 0 1 1 22.25 2.07A19 19 0 1 0 44.01 33.15Z" fill="#AFC6FF"/>
</svg>
<div style="position:absolute;left:186.7px;top:426.7px;width:160px;height:160px;transform-origin:48.3% 88.3%;animation:checkout-settle 600ms cubic-bezier(.2,.8,.2,1) 380ms both">
${nim(control ? 'scale' + control : 'scale3', { size: 160, label: 'Nim' })}
</div>
<div data-fade role="group" aria-label="In control today, 1 to 5" style="position:absolute;left:24px;top:600px;width:342px;display:flex;justify-content:space-between;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 90ms both">${scale}</div>
<div data-fade style="position:absolute;top:676px;font-size:13px;line-height:16px;font-weight:500;color:#AFC6FF;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 90ms both;left:24px">Not at all</div>
<div data-fade style="position:absolute;top:676px;font-size:13px;line-height:16px;font-weight:500;color:#AFC6FF;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 90ms both;right:24px">Totally</div>
<div data-fade data-second hidden style="position:absolute;left:24px;top:740px;width:342px;min-height:56px;display:flex;align-items:center;justify-content:space-between;gap:12px">
${asks ? `<div style="font-size:17px;line-height:22px;font-weight:600;color:#FFFFFF;text-wrap:balance">${exp.question}</div>
<div role="group" aria-label="${exp.question}" style="flex:none;display:flex;gap:8px">
<button class="b" data-did="yes" style="${PILL}">Yes</button>
<button class="b" data-did="no" style="${PILL}">No</button>
</div>` : '<button class="b btn" data-did="skip">Done</button>'}
</div>`);

    const big = root.querySelector('svg[data-nim]');
    const second = root.querySelector('[data-second]');

    function select(n, animate) {
      control = n;
      for (const btn of root.querySelectorAll('[data-scale]')) {
        const on = Number(btn.dataset.scale) === n;
        btn.setAttribute('aria-pressed', String(on));
        const old = btn.querySelector('[data-on]');
        if (old) old.remove();
        if (on) {
          // Selection is solid Blue with a white Nim, popped on top.
          btn.insertAdjacentHTML('beforeend', `<span data-on aria-hidden="true" style="position:absolute;left:0;top:0;width:66px;height:66px;border-radius:50%;background:#2457F5;display:flex;align-items:center;justify-content:center;${animate ? 'animation:pop 440ms cubic-bezier(.2,.8,.2,1) both' : ''}">${nim('scale' + n, { size: 56, body: WHITE, eye: BLUE, breathe: 0, blink: 0 })}</span>`);
        }
      }
      setPose(big, 'scale' + n, { label: `Nim, ${n} of 5` });
      if (second.hidden) {
        second.hidden = false;
        if (animate && !reducedMotion()) second.animate([{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    }
    if (control) select(control, false); // came back after a reload: carry on where it stopped

    // The closing beat: everything but Nim leaves, Nim settles, "Night."
    let timer = 0;
    function close(did) {
      closing = true;
      saveCheckout(state, did, now());
      app.save();
      for (const node of root.querySelectorAll('[data-fade]')) fadeOut(node, { ms: 260 });
      setPose(big, 'asleep', { z: '#AFC6FF', label: 'Nim, asleep' });
      const line = pick(NIGHT_LINES[control], v.raw - 1);
      root.querySelector('[data-night]').innerHTML = `
<h1 style="position:absolute;top:76px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#FFFFFF;animation:rise 600ms cubic-bezier(.2,.8,.2,1) 260ms both">Night.</h1>
<div style="position:absolute;top:134px;left:24px;right:24px;font-size:17px;line-height:22px;font-weight:500;color:#AFC6FF;animation:rise 600ms cubic-bezier(.2,.8,.2,1) 420ms both">${line}</div>`;
      timer = setTimeout(() => app.go('today'), 2200);
    }
    root.cleanup = () => clearTimeout(timer);

    root.addEventListener('click', (e) => {
      if (closing) return;
      const s = e.target.closest('[data-scale]');
      if (s) {
        buzz();
        saveControl(state, Number(s.dataset.scale), now());
        app.save();
        select(Number(s.dataset.scale), true);
        return;
      }
      const d = e.target.closest('[data-did]');
      if (d && control) {
        buzz();
        if (d.dataset.did !== 'skip') {
          d.style.background = BLUE;
          d.style.color = WHITE;
        }
        close(d.dataset.did === 'skip' ? null : d.dataset.did === 'yes');
      }
    });

    return root;
  },
};
