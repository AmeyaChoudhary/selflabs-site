// Goal: "What do you want more of?" Six regions of one soft map; pick two.
// Picking a third lets go of the oldest. Artboard: design/project/Goal.dc.html

import { screen, onTap, buzz, reducedMotion } from '../ui.js';

const CHECK = 'M5 12.500l4.500 4.500L19 7.500';

// Each region: where its button sits, where the tick goes, and the circle that
// floods it with Blue when picked (cx, cy, r in the map's own 342 x 480 space).
const REGIONS = [
  { id: 'control', label: 'Control', box: 'left:0;top:4px;width:192px;height:146px;padding:22px 0 0 24px', tick: 'right:14px;top:20px', fill: [164, 38, 232] },
  { id: 'focus', label: 'Focus', box: 'left:204px;top:4px;width:138px;height:146px;padding:22px 0 0 20px', tick: 'right:14px;top:20px', fill: [270, 60, 200] },
  { id: 'calm', label: 'Calm', box: 'left:0;top:174px;width:122px;height:144px;padding:18px 0 0 24px', tick: 'right:10px;top:12px', fill: [60, 240, 200] },
  { id: 'sleep', label: 'Sleep', box: 'left:134px;top:174px;width:208px;height:144px;padding:18px 0 0 30px', tick: 'right:22px;top:16px', fill: [306, 204, 236] },
  { id: 'energy', label: 'Energy', box: 'left:0;top:330px;width:176px;height:148px;padding:18px 0 0 24px', tick: 'right:12px;top:14px', fill: [88, 400, 220] },
  { id: 'time', label: 'Time', box: 'left:188px;top:330px;width:154px;height:148px;padding:18px 0 0 20px', tick: 'right:14px;top:16px', fill: [266, 400, 220] },
];

const FOCUS = 'M196 -10C206 40 184 96 200 200L352 200L352 -10Z';
const CALM = 'M-10 170C40 156 110 180 180 168C240 158 300 170 352 176L352 500L-10 500Z';
const SLEEP = 'M360 150C290 136 190 140 150 182C120 214 122 270 130 500L360 500Z';
const FLOOR = 'M-10 322C60 334 120 310 180 322C240 334 300 316 352 326L352 500L-10 500Z';
const TIME = 'M178 300C190 350 170 420 184 500L352 500L352 300Z';

const flood = (id) => {
  const [cx, cy, r] = REGIONS.find((x) => x.id === id).fill;
  return `<circle data-fill="${id}" cx="${cx}" cy="${cy}" r="${r}" fill="#2457F5" style="transform-box:fill-box;transform-origin:center;transform:scale(0);transition:transform 480ms cubic-bezier(.2,.8,.2,1)"/>`;
};
const edge = (d) => `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="6"/>`;

export default {
  ground: 'white',
  render(app) {
    const picked = app.state.goals.slice(0, 2); // oldest first

    const buttons = REGIONS.map((r) => `
<button class="b" data-goal="${r.id}" aria-pressed="false" style="position:absolute;${r.box};font-size:34px;line-height:40px;font-weight:600;letter-spacing:-0.03em;color:#0A1640;transition:color 220ms ease, scale 120ms ease-out">${r.label}
<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;position:absolute;${r.tick};opacity:0;scale:.7;transition:opacity 200ms ease, scale 400ms cubic-bezier(.2,.8,.2,1)"><path d="${CHECK}"/></svg>
</button>`).join('');

    const root = screen('goal', `
<h1 style="position:absolute;top:76px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise 550ms cubic-bezier(.2,.8,.2,1) both">What do you<br><span style="color:#2457F5">want more of?</span></h1>
<div data-hint style="position:absolute;top:178px;left:24px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise 550ms cubic-bezier(.2,.8,.2,1) 80ms both">Pick two.</div>
<div style="position:absolute;left:24px;top:226px;width:342px;height:480px;animation:rise 550ms cubic-bezier(.2,.8,.2,1) 150ms both">
<svg viewBox="0 0 342 480" width="342" height="480" style="display:block;position:absolute;left:0;top:0" aria-hidden="true">
<defs>
<clipPath id="goalClip"><path d="M44 8C120 2 236 2 298 10C330 15 338 44 338 112C338 240 340 372 332 432C326 468 296 478 190 478C92 478 26 479 12 442C1 408 4 260 3 126C2 46 8 14 44 8Z"/></clipPath>
<clipPath id="goalFocus"><path d="${FOCUS}"/></clipPath>
<clipPath id="goalCalm"><path d="${CALM}"/></clipPath>
<clipPath id="goalSleep"><path d="${SLEEP}"/></clipPath>
<clipPath id="goalFloor"><path d="${FLOOR}"/></clipPath>
<clipPath id="goalTime"><path d="${TIME}"/></clipPath>
</defs>
<g clip-path="url(#goalClip)">
<rect width="342" height="480" fill="#E9F0FF"/>
${flood('control')}
<g style="transform-origin:270px 76px;animation:pop 450ms cubic-bezier(.2,.8,.2,1) 200ms both">
<path d="${FOCUS}" fill="#FBEAD8"/><g clip-path="url(#goalFocus)">${flood('focus')}</g>${edge(FOCUS)}
</g>
<g style="transform-origin:64px 246px;animation:pop 450ms cubic-bezier(.2,.8,.2,1) 260ms both">
<path d="${CALM}" fill="#DEEFFF"/><g clip-path="url(#goalCalm)">${flood('calm')}</g>${edge(CALM)}
</g>
<g style="transform-origin:240px 246px;animation:pop 450ms cubic-bezier(.2,.8,.2,1) 320ms both">
<path d="${SLEEP}" fill="#F0E9FF"/><g clip-path="url(#goalSleep)">${flood('sleep')}</g>${edge(SLEEP)}
</g>
<g style="transform-origin:90px 402px;animation:pop 450ms cubic-bezier(.2,.8,.2,1) 380ms both">
<path d="${FLOOR}" fill="#FFE5E4"/><g clip-path="url(#goalFloor)">${flood('energy')}</g>
<g clip-path="url(#goalFloor)">
<g style="transform-origin:266px 402px;animation:pop 450ms cubic-bezier(.2,.8,.2,1) 440ms both">
<path d="${TIME}" fill="#DBF4E9"/><g clip-path="url(#goalTime)">${flood('time')}</g>${edge(TIME)}
</g>
</g>
<path d="M-10 322C60 334 120 310 180 322C240 334 300 316 352 326" fill="none" stroke="#FFFFFF" stroke-width="6"/>
</g>
</g>
</svg>
${buttons}
<svg data-sleeper viewBox="0 0 120 120" width="76" height="76" role="img" aria-label="Nim, asleep in the Sleep region" style="display:block;position:absolute;left:259px;top:254px;pointer-events:none;animation:pop 420ms cubic-bezier(.2,.8,.2,1) 780ms both">
<g style="transform-origin:54px 106px;animation:nim-breathe 5s ease-in-out infinite">
<path d="M54 52C68 52 80 53 92 50.500C98 49 103 53.5 100 58.500C97 63.5 96 70 96 78C96 94 78 106 54 106C30 106 12 94 12 78C12 62 30 52 54 52Z" fill="#2457F5" style="transition:fill 300ms ease"/>
<path d="M35 85q6.5 3.5 13 0M60 85q6.5 3.5 13 0" fill="none" stroke="#FFFFFF" stroke-width="4.6" stroke-linecap="round" style="transition:stroke 300ms ease"/>
</g>
</svg>
</div>
<button class="b btn" data-act="next" disabled style="position:absolute;left:24px;top:754px;animation:rise 550ms cubic-bezier(.2,.8,.2,1) 240ms both">Next</button>`);

    const hint = root.querySelector('[data-hint]');
    const next = root.querySelector('[data-act="next"]');
    const sleeper = root.querySelector('[data-sleeper]');

    // Show the current picks. `instant` skips the flood animation (first paint).
    function paint(instant) {
      for (const r of REGIONS) {
        const on = picked.includes(r.id);
        const btn = root.querySelector(`[data-goal="${r.id}"]`);
        const circle = root.querySelector(`[data-fill="${r.id}"]`);
        btn.setAttribute('aria-pressed', String(on));
        btn.style.color = on ? '#FFFFFF' : '#0A1640';
        const tick = btn.querySelector('svg');
        tick.style.opacity = on ? '1' : '0';
        tick.style.scale = on ? '1' : '.7';
        if (instant) circle.style.transition = 'none';
        circle.style.transform = on ? 'scale(1)' : 'scale(0)';
        if (instant) {
          circle.getBoundingClientRect();
          circle.style.transition = '';
        }
      }
      // Nim sleeps in the Sleep region either way: blue on pale, white on Blue.
      const sleepOn = picked.includes('sleep');
      sleeper.querySelectorAll('path')[0].setAttribute('fill', sleepOn ? '#FFFFFF' : '#2457F5');
      sleeper.querySelectorAll('path')[1].setAttribute('stroke', sleepOn ? '#2457F5' : '#FFFFFF');
      hint.textContent = picked.length === 0 ? 'Pick two.' : picked.length === 1 ? 'One more.' : 'That’s two.';
      next.disabled = picked.length !== 2;
    }
    paint(true);

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-goal]');
      if (!btn) return;
      buzz();
      const id = btn.dataset.goal;
      const at = picked.indexOf(id);
      if (at >= 0) picked.splice(at, 1);
      else {
        picked.push(id);
        if (picked.length > 2) picked.shift(); // a third pick lets go of the oldest
      }
      app.state.goals = picked.slice();
      app.save();
      paint(reducedMotion());
    });

    onTap(root, 'next', () => {
      if (picked.length !== 2) return;
      buzz();
      app.state.step = 'privacy';
      app.save();
      app.go('privacy');
    });

    return root;
  },
};
