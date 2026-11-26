// Day 14: the answer, in one word, before any chart.
// Artboard: design/project/Day14.dc.html

import { screen, onTap, buzz } from '../ui.js';
import { nim } from '../nim.js';
import { now } from '../clock.js';
import { signed } from '../stats.js';
import { roundResult } from '../round.js';
import { REVEAL } from '../lines.js';

const WORD_MAX_WIDTH = 346;

export default {
  ground: 'white',
  render(app) {
    const state = app.state;
    const r = roundResult(state, now());
    const say = REVEAL[r.status] || REVEAL.unsure;
    const proud = r.status === 'works';

    // Opening this screen is "seeing the result": Today then offers the next round.
    if (!state.seenResult) {
      state.seenResult = true;
      app.save();
    }

    let dots = '';
    for (let i = 0; i < 14; i++) {
      dots += `<span style="position:absolute;left:${(i * 24.154).toFixed(1)}px;top:0;width:10px;height:10px;border-radius:50%;background:#2457F5;animation:pop 320ms cubic-bezier(.2,.8,.2,1) ${220 + i * 45}ms both"></span>`;
    }

    const root = screen('day14', `
<div style="position:absolute;top:76px;left:24px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise 500ms cubic-bezier(.2,.8,.2,1) both">Day 14 of 14</div>
<h1 style="position:absolute;top:356px;left:19px;margin:0;font-size:112px;line-height:104px;font-weight:500;letter-spacing:-0.05em;color:#2457F5;white-space:nowrap;transform-origin:30% 70%;animation:pop 520ms cubic-bezier(.2,.8,.2,1) 900ms both"><span data-word>${say.word}</span></h1>
<div style="position:absolute;left:4px;top:225px;width:160px;height:160px;transform-origin:48% 88%;animation:insight-land 560ms cubic-bezier(.4,0,.6,1) 1060ms both">
${nim(proud ? 'proud' : 'shrug', { size: 160, label: proud ? 'Nim, proud, sitting on the result' : 'Nim, shrugging, sitting on the result', breathe: 4.5, delay: 1800 })}
</div>
<div role="img" aria-label="All 14 days done" style="position:absolute;left:24px;top:478px;width:324px;height:10px">${dots}</div>
<div style="position:absolute;left:24px;right:24px;top:512px;font-size:17px;line-height:22px;font-weight:600;color:#0A1640;animation:rise 480ms cubic-bezier(.2,.8,.2,1) 1240ms both">${r.exp.atlasName}<span style="margin:0 7px;color:#5A688C;font-weight:500">·</span><span style="white-space:nowrap">${signed(r.diff)} <span style="font-weight:500;color:#5A688C">in control</span></span></div>
<div data-line style="position:absolute;left:24px;top:538px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise 480ms cubic-bezier(.2,.8,.2,1) 1320ms both">${say.line}</div>
<button class="b btn" data-act="why" style="position:absolute;left:24px;top:698px;animation:rise 480ms cubic-bezier(.2,.8,.2,1) 1400ms both">See why</button>
<button class="b" data-act="atlas" style="position:absolute;left:95px;top:762px;width:200px;height:44px;text-align:center;color:#2457F5;font-size:17px;line-height:44px;font-weight:600;animation:fade 480ms ease-out 1480ms both">Add it to my atlas</button>`);

    root.mounted = () => {
      // A longer word ("Unclear.") is set a little smaller so it fits.
      const word = root.querySelector('[data-word]');
      const h1 = word.parentElement;
      if (word.offsetWidth > WORD_MAX_WIDTH) h1.style.fontSize = `${Math.floor((112 * WORD_MAX_WIDTH) / word.offsetWidth)}px`;
      // If the name wrapped onto two lines, the dry line moves down with it.
      const name = root.querySelector('[data-line]').previousElementSibling;
      root.querySelector('[data-line]').style.top = `${512 + name.offsetHeight + 4}px`;
    };

    onTap(root, 'why', () => {
      buzz();
      app.go('insight', { from: 'day14' });
    });
    onTap(root, 'atlas', () => {
      buzz();
      app.go('atlas');
    });
    return root;
  },
};
