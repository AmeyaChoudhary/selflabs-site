// Privacy: what v0 really sees (check-ins and a game score) and what it never
// does. Nim shuts its eyes. Artboard: design/project/Privacy.dc.html

import { screen, onTap, buzz } from '../ui.js';

const struck = (word, delay) =>
  `<span style="position:relative;display:inline-block">${word}<span style="position:absolute;left:-1px;right:-3px;top:22px;height:2px;border-radius:1px;background:#2457F5;transform-origin:left center;animation:privacy-strike 350ms cubic-bezier(.2,.8,.2,1) ${delay}ms both"></span></span>`;

export default {
  ground: 'white',
  render(app) {
    const root = screen('privacy', `
<h1 style="position:absolute;top:76px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise 550ms cubic-bezier(.2,.8,.2,1) both">Yours only.</h1>
<div style="position:absolute;left:24px;top:248px;animation:rise 550ms cubic-bezier(.2,.8,.2,1) 70ms both">
<div style="font-size:13px;line-height:16px;font-weight:600;color:#5A688C">SelfLabs sees</div>
<div style="margin-top:8px;font-size:34px;line-height:40px;font-weight:600;letter-spacing:-0.03em;color:#0A1640">Your check-ins<br>Your game score</div>
</div>
<div style="position:absolute;left:24px;top:464px;animation:rise 550ms cubic-bezier(.2,.8,.2,1) 140ms both">
<div style="font-size:13px;line-height:16px;font-weight:600;color:#5A688C">Off limits</div>
<div style="margin-top:8px;font-size:34px;line-height:40px;font-weight:500;letter-spacing:-0.03em;color:#5A688C">
${struck('Messages', 700)}<br>${struck('Photos', 800)}<br>${struck('Grades', 900)}
</div>
<p style="margin:16px 0 0 0;font-size:17px;line-height:22px;font-weight:500;color:#0A1640">Stays on this phone.<br>Parents can&rsquo;t see it.</p>
</div>
<div style="position:absolute;left:182px;top:429px;animation:pop 500ms cubic-bezier(.2,.8,.2,1) 210ms both">
<svg viewBox="0 0 120 120" width="220" height="220" role="img" aria-label="Nim, eyes shut, not looking" style="display:block">
<g style="transform-origin:58px 106px;animation:nim-breathe 5s ease-in-out infinite">
<path d="M58 30C70 30 80 27 90 20C95 17 100 21 98 27C93 38 96 52 96 66A38 38 0 1 1 58 30Z" fill="#2457F5"/>
<g style="opacity:0;transform-box:fill-box;transform-origin:center;animation:privacy-shut 320ms ease-in 720ms both">
<circle cx="55" cy="68" r="6.5" fill="#FFFFFF"/>
<circle cx="79" cy="68" r="6.5" fill="#FFFFFF"/>
</g>
<path d="M48.5 68q6.5 3.5 13 0M72.5 68q6.5 3.5 13 0" fill="none" stroke="#FFFFFF" stroke-width="4.6" stroke-linecap="round" style="animation:fade 110ms linear 960ms both"/>
</g>
</svg>
</div>
<button class="b btn" data-act="ok" style="position:absolute;left:24px;top:754px;animation:rise 550ms cubic-bezier(.2,.8,.2,1) 280ms both">Sounds fair</button>`);

    onTap(root, 'ok', () => {
      buzz();
      app.state.step = 'consent';
      app.save();
      app.go('consent');
    });
    return root;
  },
};
