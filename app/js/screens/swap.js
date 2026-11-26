// Swap: every experiment on offer, as one atlas-shaped stack of tinted
// regions. Tap one and Nim moves in. Artboard: design/project/Swap.dc.html

import { screen, onTap, buzz, wait, numeral, reducedMotion } from '../ui.js';
import { nim, WHITE, BLUE } from '../nim.js';
import { AREAS, AREA_NAMES } from '../experiments.js';
import { pickerList } from '../round.js';

const PITCH = 132; // one region every 132px

// The wavy top edge of region k (two shapes, alternating, like the artboard).
function wave(k) {
  const y = 4 + PITCH * k;
  return k % 2
    ? `M-10 ${y}C60 ${y + 6} 120 ${y - 6} 180 ${y}C240 ${y + 6} 300 ${y - 3} 352 ${y + 2}`
    : `M-10 ${y}C60 ${y - 7} 120 ${y + 4} 180 ${y - 1}C240 ${y - 8} 300 ${y + 2} 352 ${y - 3}`;
}

export default {
  ground: 'white',
  render(app) {
    const state = app.state;
    const list = pickerList(state);
    const n = list.length;
    const H = PITCH * n + 8;
    let chosen = Math.max(0, list.findIndex((e) => e.id === state.pick));
    let leaving = false;

    const below = `L352 ${H + 60}L-10 ${H + 60}Z`;
    const flood = (i) => `<circle data-fill="${i}" cx="70" cy="${72 + PITCH * i}" r="340" fill="#2457F5" style="transform-box:fill-box;transform-origin:center;transform:scale(0);transition:transform 520ms cubic-bezier(.2,.8,.2,1)"/>`;

    let regions = `<rect width="342" height="${H}" fill="${AREAS[list[0].area]}"/>${flood(0)}`;
    let clips = '';
    for (let k = 1; k < n; k++) {
      clips += `<clipPath id="swapRow${k}"><path d="${wave(k)}${below}"/></clipPath>`;
      regions += `<path d="${wave(k)}${below}" fill="${AREAS[list[k].area]}"/><g clip-path="url(#swapRow${k})">${flood(k)}</g><path d="${wave(k)}" fill="none" stroke="#FFFFFF" stroke-width="6"/>`;
    }

    const rows = list.map((exp, i) => `
<button class="b" data-pick="${i}" aria-pressed="false" style="position:absolute;left:0;top:${6 + PITCH * i}px;width:342px;height:126px;color:#0A1640;animation:rise 500ms cubic-bezier(.2,.8,.2,1) ${250 + Math.min(i, 5) * 70}ms both">
<span style="position:absolute;left:22px;right:118px;bottom:20px;display:flex;align-items:flex-end;gap:12px">
<span data-num style="flex:none;font-size:104px;line-height:84px;font-weight:500;letter-spacing:-0.05em;color:#2457F5;white-space:nowrap;transition:color 220ms ease">${numeral(exp.hero)}</span>
<span data-words style="min-width:0;height:84px;display:flex;flex-direction:column;justify-content:space-between;transition:color 220ms ease">
<span style="font-size:13px;line-height:16px;font-weight:600">${AREA_NAMES[exp.area]}</span>
<span style="font-size:17px;line-height:22px;font-weight:600">${exp.unit}</span>
</span>
</span>
</button>`).join('');

    const root = screen('swap', `
<div class="scroller">
<div style="position:relative;width:390px;height:${240 + H + 34}px">
<button class="b" data-act="back" aria-label="Back" style="position:absolute;left:24px;top:76px;width:44px;height:44px;border-radius:50%;background:#E9F0FF;color:#2457F5;display:flex;align-items:center;justify-content:center">
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block"><path d="M14.5 6l-6 6 6 6"/></svg>
</button>
<h1 style="position:absolute;top:140px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise 500ms cubic-bezier(.2,.8,.2,1) both">Pick one.</h1>
<div style="position:absolute;top:194px;left:24px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 80ms both">One at a time. 14 days each.</div>
<div style="position:absolute;left:24px;top:240px;width:342px;height:${H}px">
<svg viewBox="0 0 342 ${H}" width="342" height="${H}" style="display:block;position:absolute;left:0;top:0;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 150ms both" aria-hidden="true">
<defs>
<clipPath id="swapClip"><path d="M44 8C120 2 236 2 298 10C330 15 338 44 338 112C338 ${Math.round(H * 0.4)} 340 ${Math.round(H * 0.77)} 332 ${H - 48}C326 ${H - 12} 296 ${H - 2} 190 ${H - 2}C92 ${H - 2} 26 ${H - 1} 12 ${H - 38}C1 ${H - 72} 4 ${Math.round(H * 0.58)} 3 126C2 46 8 14 44 8Z"/></clipPath>
${clips}
</defs>
<g clip-path="url(#swapClip)">${regions}</g>
</svg>
${rows}
<span data-nim style="position:absolute;left:232px;top:0;width:84px;height:84px;display:block;pointer-events:none;transform-origin:50% 85%;animation:pop 460ms cubic-bezier(.2,.8,.2,1) 880ms both">
${nim('settled', { size: 84, body: WHITE, eye: BLUE, label: 'Nim, settled in the current pick', delay: 900, blink: 5.5 })}
</span>
</div>
</div>
</div>`);

    const nimBox = root.querySelector('[data-nim]');

    function paint(instant) {
      list.forEach((exp, i) => {
        const on = i === chosen;
        const btn = root.querySelector(`[data-pick="${i}"]`);
        const circle = root.querySelector(`[data-fill="${i}"]`);
        btn.setAttribute('aria-pressed', String(on));
        btn.querySelector('[data-num]').style.color = on ? WHITE : BLUE;
        btn.querySelector('[data-words]').style.color = on ? WHITE : '#0A1640';
        if (instant) circle.style.transition = 'none';
        circle.style.transform = on ? 'scale(1)' : 'scale(0)';
        if (instant) {
          circle.getBoundingClientRect();
          circle.style.transition = '';
        }
      });
      nimBox.style.top = `${6 + PITCH * chosen + 30}px`;
    }
    paint(true);

    // Bring the current pick into view if it is far down the list.
    root.mounted = () => {
      const scroller = root.querySelector('.scroller');
      const y = 240 + 6 + PITCH * chosen;
      if (y > 600) scroller.scrollTop = y - 360;
    };

    root.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-pick]');
      if (!btn || leaving) return;
      buzz();
      const i = Number(btn.dataset.pick);
      if (i !== chosen) {
        chosen = i;
        state.pick = list[i].id;
        app.save();
        paint(reducedMotion());
        if (!reducedMotion()) {
          nimBox.animate([{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1.06)', offset: 0.6 }, { opacity: 1, transform: 'scale(1)' }], { duration: 460, delay: 220, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
        }
      }
      leaving = true;
      await wait(i === chosen && reducedMotion() ? 200 : 760);
      app.go('experiment');
    });

    onTap(root, 'back', () => app.go('experiment'));
    return root;
  },
};
