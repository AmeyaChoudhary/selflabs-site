// Welcome: the first thing anyone sees. Nim leans in from the edge.
// Artboard: design/project/Welcome.dc.html

import { screen, onTap, buzz } from '../ui.js';

export default {
  ground: 'white',
  render(app) {
    const root = screen('welcome', `
<h1 style="position:absolute;top:76px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise 550ms cubic-bezier(.2,.8,.2,1) both">Test one change<br><span style="color:#2457F5">for 14 days.</span></h1>
<p style="position:absolute;top:182px;left:24px;right:24px;margin:0;font-size:17px;line-height:22px;font-weight:500;color:#0A1640;animation:rise 550ms cubic-bezier(.2,.8,.2,1) 80ms both">Ten-second check-ins. A straight answer.</p>
<div style="position:absolute;left:calc(-1 * var(--bx));top:102px;width:calc(390px + var(--bx));height:572px;overflow:hidden">
<svg viewBox="0 0 120 120" width="624" height="624" role="img" aria-label="Nim, leaning in from the edge and looking at you" style="display:block;position:absolute;left:calc(var(--bx) - 226px);top:21px;transform-origin:48.33% 88.33%;animation:welcome-lean 800ms cubic-bezier(.2,.8,.2,1) 160ms both">
<g style="transform-origin:58px 106px;animation:nim-breathe 5s ease-in-out infinite">
<path d="M58 30C70 30 80 27 90 20C95 17 100 21 98 27C93 38 96 52 96 66A38 38 0 1 1 58 30Z" fill="#2457F5"/>
<g style="transform-box:fill-box;transform-origin:center bottom;animation:welcome-blink 6s ease-in-out 1000ms infinite both">
<path d="M48.32 67.90A7 7 0 1 0 61.68 67.90ZM72.32 67.90A7 7 0 1 0 85.68 67.90Z" fill="#FFFFFF"/>
</g>
</g>
</svg>
</div>
<div style="position:absolute;left:calc(-1 * var(--bx));right:calc(-1 * var(--bx));top:674px;height:1px;background:#D8DFEE"></div>
<div style="position:absolute;left:24px;right:24px;top:703px;text-align:center;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:fade 500ms ease-out 650ms both">This is Nim. Mildly unimpressed.</div>
<button class="b btn" data-act="start" style="position:absolute;left:24px;top:754px;animation:rise 550ms cubic-bezier(.2,.8,.2,1) 240ms both">Start</button>`);

    onTap(root, 'start', () => {
      buzz();
      app.state.step = 'goal';
      app.save();
      app.go('goal');
    });
    return root;
  },
};
