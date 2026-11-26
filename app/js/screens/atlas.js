// Your atlas: a map of what works for you. Only finished experiments that
// worked become coloured regions (Blue for the best); the one in progress is a
// pale region; the rest of the map stays unmapped.
// Artboards: design/project/Atlas.dc.html and AtlasEmpty.dc.html

import { screen, onTap, buzz, numeral, CHEVRON } from '../ui.js';
import { nim, WHITE, BLUE, HAZE, NIGHT } from '../nim.js';
import { now } from '../clock.js';
import { signed } from '../stats.js';
import { AREAS, PALE } from '../experiments.js';
import { todayView, roundResult, pastRounds } from '../round.js';
import { pick, ATLAS_EMPTY } from '../lines.js';

const LEFT = 'M-10 236C40 220 120 224 210 250L210 420L-10 420Z';
const RIGHT = 'M360 184C300 172 222 184 184 220C150 252 144 312 156 420L360 420Z';
const SKY = '#E9F0FF';

export default {
  ground: 'white',
  tabs: 'atlas',
  render(app) {
    const state = app.state;
    const date = now();
    const v = todayView(state, date);
    const past = pastRounds(state, date);
    const running = !v.finished;
    const current = running ? roundResult(state, date) : null;

    // What goes on the map: the ones that worked (best first), then the one in progress.
    const worked = past.filter((p) => p.result.status === 'works').sort((a, b) => b.result.diff - a.result.diff).slice(0, 3);
    const regions = worked.map((p) => ({ kind: 'works', exp: p.exp, diff: p.result.diff, index: p.index }));
    if (running && regions.length < 3) regions.push({ kind: 'running', exp: current.exp });
    const [top, right, left] = regions;

    // What goes under the map: an early signal for the one in progress, and
    // the most recent experiment that did not earn a region.
    const rows = [];
    if (running && current.status !== 'none') rows.push({ kind: 'signal', r: current });
    const rest = past.filter((p) => p.result.status !== 'works');
    if (rest.length) rows.push({ kind: 'past', p: rest[rest.length - 1] });
    const cta = !running;
    const shown = rows.slice(0, cta ? 1 : 2);

    const subtitle = worked.length || !running
      ? 'In-control points, out of 5'
      : `${pick(ATLAS_EMPTY, v.day - 1)} Day ${v.day} of 14.`;

    // ---- the top region
    let topFill = '';
    let topText = '';
    let topNim = '';
    if (top && top.kind === 'works') {
      topFill = `<circle cx="268" cy="150" r="330" fill="#2457F5" style="transform-box:fill-box;transform-origin:center;animation:playbook-fill .7s cubic-bezier(.2,.8,.2,1) 420ms both"/>`;
      topText = `<div aria-hidden="true" style="position:absolute;left:0;top:0;width:342px;height:200px;animation:rise .5s cubic-bezier(.2,.8,.2,1) 620ms both">
<div style="position:absolute;left:22px;top:38px;font-size:104px;line-height:96px;font-weight:500;letter-spacing:-0.05em;color:#FFFFFF;white-space:nowrap">${numeral(signed(top.diff))}</div>
<div style="position:absolute;left:28px;top:146px;font-size:17px;line-height:22px;font-weight:600;color:#FFFFFF">${top.exp.atlasName}</div>
</div>
<button class="b" data-open="${top.index}" aria-label="${top.exp.atlasName}, ${signed(top.diff)}" style="position:absolute;left:0;top:0;width:342px;height:196px;border-radius:28px"></button>`;
      topNim = `<div style="position:absolute;right:22px;top:24px;width:88px;height:88px;pointer-events:none;animation:pop .5s cubic-bezier(.2,.8,.2,1) 700ms both">
${nim('proud', { size: 88, body: WHITE, eye: BLUE, breathe: 4.5, delay: 500 })}</div>`;
    } else if (top && top.kind === 'running') {
      topFill = `<circle cx="268" cy="150" r="330" fill="${PALE[top.exp.area]}" style="transform-box:fill-box;transform-origin:center;animation:playbook-fill .7s cubic-bezier(.2,.8,.2,1) 560ms both"/>
<g style="animation:atlas-empty-pulse 4.5s ease-in-out 700ms infinite both">
<circle cx="268" cy="150" r="330" fill="${AREAS[top.exp.area]}" style="transform-box:fill-box;transform-origin:center;animation:playbook-fill .7s cubic-bezier(.2,.8,.2,1) 560ms both"/>
</g>`;
      topText = `<div style="position:absolute;left:0;top:0;width:342px;height:230px;animation:rise .5s cubic-bezier(.2,.8,.2,1) 700ms both">
<div style="position:absolute;left:28px;top:136px;font-size:34px;line-height:40px;font-weight:600;letter-spacing:-0.03em;color:#0A1640">${top.exp.noun}</div>
<div style="position:absolute;left:28px;top:180px;font-size:17px;line-height:22px;font-weight:500;color:#0A1640">In progress</div>
</div>`;
    }
    if (!topNim) {
      topNim = `<div style="position:absolute;left:216px;top:81px;width:112px;height:112px;transform-origin:48% 88%;animation:pop .5s cubic-bezier(.2,.8,.2,1) 460ms both">
${nim(running ? 'patient' : 'shrug', { size: 112, label: running ? 'Nim, waiting patiently, watching the map' : 'Nim, shrugging', breathe: 5.5, blink: 6, delay: 500 })}</div>`;
    }

    // ---- the two lower regions
    const small = (slot, side) => {
      if (!slot) return '';
      const pos = side === 'right'
        ? { num: 'left:192px;top:236px;font-size:44px;line-height:48px', name: 'left:194px;top:290px;width:132px', button: 'left:174px;top:200px;width:168px;height:204px' }
        : { num: 'left:26px;top:270px;font-size:34px;line-height:40px', name: 'left:28px;top:314px;width:120px', button: 'left:0;top:238px;width:168px;height:166px' };
      const delay = side === 'right' ? 760 : 1040;
      if (slot.kind === 'running') {
        return `<div style="position:absolute;left:0;top:0;width:342px;height:404px;pointer-events:none;animation:rise .5s cubic-bezier(.2,.8,.2,1) ${delay}ms both">
<div style="position:absolute;${pos.name.replace(/top:\d+px/, `top:${side === 'right' ? 250 : 284}px`)};font-size:17px;line-height:22px;font-weight:600;color:#0A1640">${slot.exp.noun}<br><span style="font-weight:500">In progress</span></div>
</div>`;
      }
      return `<div aria-hidden="true" style="position:absolute;left:0;top:0;width:342px;height:404px;pointer-events:none;animation:rise .5s cubic-bezier(.2,.8,.2,1) ${delay}ms both">
<div style="position:absolute;${pos.num};font-weight:500;letter-spacing:-0.02em;color:#0A1640">${signed(slot.diff)}</div>
<div style="position:absolute;${pos.name};font-size:17px;line-height:22px;font-weight:600;color:#0A1640">${slot.exp.atlasName}</div>
</div>
<button class="b" data-open="${slot.index}" aria-label="${slot.exp.atlasName}, ${signed(slot.diff)}" style="position:absolute;${pos.button};border-radius:28px"></button>`;
    };
    const fillOf = (slot) => (!slot ? SKY : slot.kind === 'works' ? AREAS[slot.exp.area] : PALE[slot.exp.area]);
    const grow = (slot, origin, delay) => (slot ? `transform-box:fill-box;transform-origin:${origin};animation:playbook-fill .55s cubic-bezier(.2,.8,.2,1) ${delay}ms both` : '');

    // ---- the rows under the map
    const rowHTML = shown.map((row, i) => {
      const y = 616 + i * 64;
      const enter = `animation:rise .5s cubic-bezier(.2,.8,.2,1) ${900 + i * 120}ms both`;
      if (row.kind === 'signal') {
        return `<button class="b" data-open="signal" style="position:absolute;left:24px;top:${y}px;width:342px;height:56px;display:flex;align-items:center;gap:16px;text-align:left;${enter}">
<span style="flex:none;font-size:34px;line-height:40px;font-weight:500;letter-spacing:-0.02em;color:#2457F5">${signed(row.r.diff)}</span>
<span style="flex:1"><span style="display:block;font-size:17px;line-height:22px;font-weight:600;color:#0A1640">${row.r.exp.atlasName}</span>
<span style="display:block;font-size:13px;line-height:16px;font-weight:500;color:#5A688C;margin-top:2px">${row.r.label}</span></span>
${CHEVRON('#5A688C')}</button>`;
      }
      const res = row.p.result;
      const drawable = res.nOn >= 3 && res.nOff >= 3;
      const sub = res.label || 'Too few check-outs to tell';
      const tag = drawable ? 'button' : 'div';
      return `<${tag} ${drawable ? `class="b" data-open="${row.p.index}"` : ''} style="position:absolute;left:24px;top:${y}px;width:342px;height:56px;display:flex;align-items:center;gap:16px;text-align:left;${enter}">
<span style="flex:none;font-size:34px;line-height:40px;font-weight:500;letter-spacing:-0.02em;color:#5A688C">${res.diff === null ? '–' : signed(res.diff)}</span>
<span style="flex:1"><span style="display:block;font-size:17px;line-height:22px;font-weight:600;color:#0A1640">${row.p.exp.atlasName}</span>
<span style="display:block;font-size:13px;line-height:16px;font-weight:500;color:#5A688C;margin-top:2px">${sub}</span></span>
${nim('shrug', { size: 48, body: HAZE, eye: NIGHT, label: 'Nim, shrugging', breathe: 4.5, blink: 5, delay: 1000, style: 'flex:none' })}
</${tag}>`;
    }).join('');

    const root = screen('atlas', `
<h1 style="position:absolute;top:76px;left:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise .5s cubic-bezier(.2,.8,.2,1) both">Your atlas</h1>
<div style="position:absolute;top:130px;left:24px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise .5s cubic-bezier(.2,.8,.2,1) 80ms both">${subtitle}</div>
<div style="position:absolute;left:24px;top:182px;width:342px;height:404px">
<svg viewBox="0 0 342 404" width="342" height="404" style="display:block;position:absolute;left:0;top:0;overflow:visible" aria-hidden="true">
<defs>
<clipPath id="atlasClip"><path d="M44 8C120 2 236 2 298 10C330 15 338 44 338 112C338 200 340 296 332 356C326 392 296 402 190 402C92 402 26 403 12 366C1 332 4 220 3 126C2 46 8 14 44 8Z"/></clipPath>
<clipPath id="atlasLeft"><path d="${LEFT}"/></clipPath>
<clipPath id="atlasRight"><path d="${RIGHT}"/></clipPath>
</defs>
<g style="transform-box:fill-box;transform-origin:center;animation:pop .5s cubic-bezier(.2,.8,.2,1) 160ms both">
<g clip-path="url(#atlasClip)">
<rect width="342" height="404" fill="${SKY}"/>
${topFill}
<path d="${LEFT}" fill="${SKY}"/>
<g clip-path="url(#atlasLeft)"><path d="${LEFT}" fill="${fillOf(left)}" style="${grow(left, '0% 100%', 800)}"/></g>
<path d="${LEFT}" fill="none" stroke="#FFFFFF" stroke-width="6"/>
<path d="${RIGHT}" fill="${SKY}"/>
<g clip-path="url(#atlasRight)"><path d="${RIGHT}" fill="${fillOf(right)}" style="${grow(right, '100% 100%', 520)}"/></g>
<path d="${RIGHT}" fill="none" stroke="#FFFFFF" stroke-width="6"/>
</g>
</g>
</svg>
${topText}
${topNim}
${small(right, 'right')}
${small(left, 'left')}
</div>
${rowHTML}
${cta ? `<button class="b btn" data-act="next" style="position:absolute;left:24px;top:680px;animation:rise .5s cubic-bezier(.2,.8,.2,1) 1100ms both">Start round ${state.round + 1}</button>` : ''}`);

    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-open]');
      if (!t) return;
      buzz();
      const which = t.dataset.open;
      if (which === 'signal' || which === 'current') app.go('insight', { from: 'atlas' });
      else app.go('insight', { from: 'atlas', h: Number(which) });
    });
    onTap(root, 'next', () => {
      buzz();
      state.step = 'pick';
      app.save();
      app.go('experiment');
    });
    return root;
  },
};
