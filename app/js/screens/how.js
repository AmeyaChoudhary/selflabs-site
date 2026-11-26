// How the round works, once, right after "I'm in". Nim flips a coin: the app
// picks which days are experiment days. Artboard: design/project/HowItWorks.dc.html

import { screen, onTap, buzz } from '../ui.js';
import { getExperiment, tint } from '../experiments.js';

// The 14 dots: two check-in days, then a mix. An illustration of "some days
// on, some days off", not this round's real order (that stays a surprise).
// [left, big?]: big dots are experiment days, small ones are off days.
const DOTS = [
  [24, 'base'], [48.4, 'base'], [72.8, 'on'], [103.2, 'off'], [121.5, 'on'], [145.9, 'on'], [176.3, 'off'],
  [200.7, 'off'], [219.1, 'on'], [249.5, 'off'], [267.8, 'on'], [298.2, 'off'], [322.6, 'off'], [341, 'on'],
];
const DELAYS = [240, 310, 700, 760, 820, 880, 940, 1000, 1060, 1120, 1180, 1240, 1300, 1360];

export default {
  ground: 'white',
  render(app) {
    const exp = getExperiment(app.state.experimentId);
    const on = tint(exp);
    const days = exp.daysLabel.toLowerCase(); // "walk days"

    const dots = DOTS.map(([left, kind], i) => {
      const small = kind === 'off';
      const size = small ? 8 : 20;
      const color = kind === 'on' ? on : '#AFC6FF';
      return `<span style="position:absolute;left:${left}px;top:${small ? 446 : 440}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};animation:pop 320ms cubic-bezier(.2,.8,.2,1) ${DELAYS[i]}ms both"></span>`;
    }).join('');

    const root = screen('how', `
<h1 style="position:absolute;top:76px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise 520ms cubic-bezier(.2,.8,.2,1) both">Here&rsquo;s the deal.</h1>
<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true" style="display:block;position:absolute;left:128px;top:236px;animation:fade 300ms ease-out 1180ms both">
<circle cx="60" cy="66" r="2.5" fill="#D8DFEE"/>
<circle cx="44" cy="45" r="3" fill="#D8DFEE"/>
<circle cx="31" cy="22" r="3.5" fill="#D8DFEE"/>
</svg>
<div aria-hidden="true" style="position:absolute;left:126px;top:196px;width:44px;height:44px;animation:how-toss 900ms cubic-bezier(.3,.1,.3,1) 380ms both">
<svg viewBox="0 0 44 44" width="44" height="44" style="display:block;overflow:visible">
<g transform="rotate(-24 22 22)">
<ellipse cx="22" cy="22" rx="21" ry="16" fill="#FFB23E"/>
<ellipse cx="22" cy="22" rx="13.5" ry="9.5" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
</g>
</svg>
</div>
<div style="position:absolute;left:172px;top:204px;width:190px;height:190px;transform-origin:48% 88%;animation:pop 500ms cubic-bezier(.2,.8,.2,1) 120ms both">
<svg viewBox="0 0 120 120" width="190" height="190" role="img" aria-label="Nim, flipping a coin and watching it" style="display:block;overflow:visible">
<ellipse cx="58" cy="110" rx="30" ry="3.5" fill="#E9F0FF"/>
<g style="transform-box:fill-box;transform-origin:50% 100%;animation:nim-breathe 4.5s ease-in-out 1300ms infinite">
<path transform="rotate(11 58 68)" d="M58 30C70 30 80 27 90 20C95 17 100 21 98 27C93 38 96 52 96 66A38 38 0 1 1 58 30Z" fill="#2457F5"/>
<g style="transform-box:fill-box;transform-origin:center;animation:nim-blink 5s 1500ms infinite">
<circle cx="40" cy="54" r="8.5" fill="#FFFFFF"/>
<circle cx="63.5" cy="56.5" r="5.5" fill="#FFFFFF"/>
</g>
</g>
</svg>
</div>
<div role="img" aria-label="Fourteen days: two check-in days, then six ${days} and six off days in a mixed order, ending on day 14" style="position:absolute;left:0;top:0;width:390px;height:844px;pointer-events:none">
${dots}
<span style="position:absolute;left:336px;top:435px;width:30px;height:30px;box-sizing:border-box;border-radius:50%;border:2.5px solid #2457F5;animation:pop 360ms cubic-bezier(.2,.8,.2,1) 1480ms both"></span>
</div>
<div style="position:absolute;left:24px;top:516px;width:342px;display:flex;flex-direction:column;gap:18px">
<div style="position:relative;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 220ms both">
<span aria-hidden="true" style="position:absolute;left:0;top:0;width:30px;height:22px;display:block">
<span style="position:absolute;left:1px;top:5px;width:12px;height:12px;border-radius:50%;background:#AFC6FF"></span>
<span style="position:absolute;left:16px;top:5px;width:12px;height:12px;border-radius:50%;background:#AFC6FF"></span>
</span>
<p style="margin:0 0 0 44px;font-size:17px;line-height:22px;font-weight:500;color:#0A1640"><span style="font-weight:600">Days 1&ndash;2:</span> just check in.</p>
</div>
<div style="position:relative;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 290ms both">
<span aria-hidden="true" style="position:absolute;left:0;top:0;width:30px;height:22px;display:block">
<span style="position:absolute;left:3px;top:5px;width:12px;height:12px;border-radius:50%;background:${on}"></span>
<span style="position:absolute;left:21px;top:8px;width:6px;height:6px;border-radius:50%;background:#AFC6FF"></span>
</span>
<p style="margin:0 0 0 44px;font-size:17px;line-height:22px;font-weight:500;color:#0A1640;text-wrap:balance">Then some days are ${days}, some aren&rsquo;t. <span style="font-weight:600">The app picks.</span></p>
</div>
<div style="position:relative;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 360ms both">
<span aria-hidden="true" style="position:absolute;left:0;top:0;width:30px;height:22px;display:block">
<span style="position:absolute;left:9px;top:5px;width:12px;height:12px;border-radius:50%;background:${on}"></span>
<span style="position:absolute;left:5px;top:1px;width:20px;height:20px;box-sizing:border-box;border-radius:50%;border:2px solid #2457F5"></span>
</span>
<p style="margin:0 0 0 44px;font-size:17px;line-height:22px;font-weight:500;color:#0A1640"><span style="font-weight:600">Day 14:</span> a straight answer.</p>
</div>
</div>
<button class="b btn" data-act="ok" style="position:absolute;left:24px;top:754px;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 440ms both">Got it</button>`);

    onTap(root, 'ok', () => {
      buzz();
      app.state.step = null;
      app.save();
      app.go('today');
    });
    return root;
  },
};
