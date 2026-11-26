// Morning check-in: one tap on a face, then straight into the game.
// Artboard: design/project/Checkin.dc.html

import { screen, buzz, wait, fadeIn, reducedMotion } from '../ui.js';
import { nim, setPose, HAZE, NIGHT, WHITE, BLUE } from '../nim.js';
import { now } from '../clock.js';
import { saveWake, todayView, roughMornings } from '../round.js';
import { pick, WAKE, WAKE_PLAIN } from '../lines.js';

const FACES = [
  { wake: 1, label: 'Rough', pose: 'asleep', react: 'asleep' },
  { wake: 2, label: 'Okay', pose: 'okay', react: 'okay' },
  { wake: 3, label: 'Good', pose: 'happy', react: 'happy' },
];

export default {
  ground: 'night',
  step: 1,
  render(app) {
    const faces = FACES.map((f) => `
<button class="b" data-wake="${f.wake}" aria-pressed="false" style="flex:1;height:132px;border-radius:28px;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:17px;line-height:22px;font-weight:500;color:#AFC6FF">
${nim(f.pose, { size: 64, body: HAZE, eye: NIGHT, breathe: 0, blink: 0 })}
<span>${f.label}</span>
</button>`).join('');

    const root = screen('checkin', `
<h1 style="position:absolute;top:104px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#FFFFFF;animation:rise 500ms cubic-bezier(.2,.8,.2,1) both">Morning.<br><span style="color:#AFC6FF">How&rsquo;d you<br>wake up?</span></h1>
<div data-line style="position:absolute;top:262px;left:24px;right:24px;font-size:17px;line-height:22px;font-weight:600;color:#FFFFFF;opacity:0"></div>
<div style="position:absolute;left:262px;top:528px;width:80px;height:40px;overflow:hidden">
<div style="width:80px;height:80px;border-radius:50%;background:#FFB23E;animation:checkin-sun 1400ms cubic-bezier(.2,.8,.2,1) 300ms both"></div>
</div>
<div style="position:absolute;left:64px;top:391px;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 80ms both">
${nim('okayRight', { size: 200, label: 'Nim, giving the sun a side-eye', eyeAnim: 'animation:checkin-glance 1300ms cubic-bezier(.4,0,.2,1) 300ms both' })}
</div>
<div role="group" aria-label="How did you wake up?" style="position:absolute;left:24px;top:634px;width:342px;display:flex;gap:9px;animation:rise 500ms cubic-bezier(.2,.8,.2,1) 160ms both">${faces}</div>`);

    const big = root.querySelector('svg[data-nim]');
    const line = root.querySelector('[data-line]');
    let chosen = false;

    root.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-wake]');
      if (!btn || chosen) return;
      chosen = true;
      buzz();
      const face = FACES.find((f) => f.wake === Number(btn.dataset.wake));

      // The tapped face turns solid Blue with a white Nim, and pops.
      btn.setAttribute('aria-pressed', 'true');
      btn.style.background = BLUE;
      btn.style.color = WHITE;
      btn.style.fontWeight = '600';
      btn.querySelector('svg').outerHTML = nim(face.pose, { size: 64, body: WHITE, eye: BLUE, breathe: 0, blink: 0 });
      if (!reducedMotion()) {
        btn.animate([{ transform: 'scale(.9)' }, { transform: 'scale(1.06)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
      setPose(big, face.react, { label: `Nim, ${face.label.toLowerCase()}` });

      saveWake(app.state, face.wake, now());
      app.save();

      // One dry line for a beat, then the game.
      const day = todayView(app.state, now()).raw;
      line.textContent = face.wake === 1 && roughMornings(app.state, now()) ? WAKE_PLAIN : pick(WAKE[face.wake], day - 1);
      line.style.opacity = '1';
      fadeIn(line, { ms: 420, dy: 10, delay: 120 });
      await wait(1250);
      app.go('game');
    });

    return root;
  },
};
