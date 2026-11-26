// Insight: the dot chart drawn from the real days. Experiment days on top,
// other days below, each dot one night's "in control" answer (1 to 5).
// Artboards: design/project/Insight.dc.html and InsightUnsure.dc.html

import { screen, onTap, buzz, numeral } from '../ui.js';
import { nim } from '../nim.js';
import { now } from '../clock.js';
import { signed } from '../stats.js';
import { roundResult, startRound } from '../round.js';
import { verdict } from '../lines.js';

const X = (value) => 92 + (value - 1) * 60; // where a 1-to-5 answer sits on the chart

// Stack equal answers: one column while it is short, two side by side after that.
function stacks(values, single) {
  const out = [];
  for (let v = 1; v <= 5; v++) {
    const count = values.filter((x) => x === v).length;
    if (!count) continue;
    const two = count > single;
    const rows = two ? Math.ceil(count / 2) : count;
    for (let i = 0; i < count; i++) {
      const row = two ? Math.floor(i / 2) : i;
      const alone = two && i === count - 1 && count % 2 === 1;
      const dx = !two || alone ? 0 : i % 2 ? 11 : -11;
      out.push({ v, x: X(v) + dx, row });
    }
    out.push({ v, top: true, rows, count });
  }
  return out;
}

export default {
  ground: 'white',
  render(app, params) {
    const state = app.state;
    const past = typeof params.h === 'number' ? state.history[params.h] : null;
    const r = roundResult(state, now(), past || state);
    const back = params.from || 'atlas';
    const status = past && past.unfinished ? (r.status === 'none' ? 'none' : r.status) : r.status;

    if (status === 'none') {
      const root = screen('insight', `
<button class="b" data-act="back" aria-label="Back" style="position:absolute;left:24px;top:76px;width:44px;height:44px;border-radius:50%;background:#E9F0FF;color:#2457F5;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block"><path d="M14.5 6l-6 6 6 6"/></svg></button>
<h1 style="position:absolute;top:140px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise .5s cubic-bezier(.2,.8,.2,1) both">Nothing to<br><span style="color:#2457F5">show yet.</span></h1>`);
      onTap(root, 'back', () => app.go(back));
      return root;
    }

    // Two layouts: the verdict one (Nim on the chart), and the can't-tell one
    // (Nim shrugging on the number, smaller chart, room for two buttons).
    const unsure = status === 'unsure' || status === 'unclear';
    const L = unsure
      ? { numTop: 208, rowTop: 372, labelTop: 396, chartTop: 438, chartH: 238, yOn: 70, yOff: 202, d: -70 }
      : { numTop: 262, rowTop: 426, labelTop: 450, chartTop: 486, chartH: 316, yOn: 153, yOff: 279, d: 0 };
    const head = verdict(status, r.exp);
    const label = unsure ? (r.final ? 'Day 14 · worth another round' : `Day ${r.day} · too early to call`) : r.label;
    const canAct = unsure && r.final && !past; // "Run it again" only for the round that just ended

    // ---- the dots
    const offStack = stacks(r.off, 4);
    const onStack = stacks(r.on, 3);
    const total = r.on.length + r.off.length;
    const step = Math.min(60, 480 / total);
    let k = 0;
    let dots = '';
    for (const d of offStack.filter((s) => !s.top)) {
      dots += `<circle cx="${d.x}" cy="${L.yOff - 16 - 22 * d.row}" r="8.75" fill="#FFFFFF" stroke="#2457F5" stroke-width="2.5" style="animation:insight-drop .45s cubic-bezier(.4,0,.6,1) ${Math.round(260 + step * k++)}ms both"/>`;
    }
    for (const d of onStack.filter((s) => !s.top)) {
      dots += `<circle cx="${d.x}" cy="${L.yOn - 16 - 22 * d.row}" r="10" fill="#2457F5" style="animation:insight-drop .45s cubic-bezier(.4,0,.6,1) ${Math.round(260 + step * k++)}ms both"/>`;
    }
    const after = Math.round(260 + step * total); // when the last dot has started to fall

    // ---- Nim: on the tallest stack of experiment days, or on the number
    let nimHTML = '';
    if (unsure) {
      nimHTML = `<div data-nim style="position:absolute;left:273px;top:135px;width:84px;height:84px;transform-origin:48% 88%;animation:insight-unsure-shrug .65s cubic-bezier(.2,.8,.2,1) ${after + 500}ms both">
<svg viewBox="0 0 120 120" width="84" height="84" role="img" aria-label="Nim, sitting on the number, shrugging and looking away" style="display:block;overflow:visible">
<g style="transform-box:fill-box;transform-origin:50% 100%;animation:nim-tilt 6s ease-in-out 2200ms infinite">
<path transform="translate(2 0) rotate(14 58 68)" d="M58 30C70 30 80 27 90 20C95 17 100 21 98 27C93 38 96 52 96 66A38 38 0 1 1 58 30Z" fill="#2457F5"/>
<g style="transform-box:fill-box;transform-origin:center;animation:nim-blink 5.5s 600ms infinite">
<path d="M57.82 64A6.5 6.5 0 1 0 70.18 64ZM78.32 63A6.5 6.5 0 1 0 90.68 63Z" fill="#FFFFFF"/>
</g>
</g>
</svg>
</div>`;
    }
    let chartNim = '';
    if (!unsure) {
      const tops = onStack.filter((s) => s.top).sort((a, b) => b.rows - a.rows || b.v - a.v);
      const seat = tops[0];
      const left = Math.max(0, Math.min(262, X(seat.v) - 42.5));
      const top = L.yOn - 16 - 22 * (seat.rows - 1) - 93;
      const proud = r.diff > 0 && (status === 'works' || status === 'early');
      chartNim = `<div style="position:absolute;left:${left}px;top:${top}px;width:88px;height:88px;transform-origin:48% 88%;animation:insight-land .55s cubic-bezier(.4,0,.6,1) ${after + 20}ms both">
${nim(proud ? 'proud' : 'shrug', { size: 88, label: proud ? 'Nim, proud, sitting on the experiment days' : 'Nim, shrugging, sitting on the experiment days', breathe: 4.5, delay: 500 })}
</div>`;
    }

    const xOn = X(r.onMean);
    const xOff = X(r.offMean);
    const t = after + 300; // ticks, then labels, then the number
    const rowLabel = (text, y) => `<div style="position:absolute;left:0;top:${y - 16}px;width:80px;height:32px;display:flex;align-items:center;font-size:13px;line-height:16px;font-weight:600;color:#0A1640">${text}</div>`;
    const aria = `In control, 1 to 5. ${r.exp.daysLabel}: ${r.on.join(', ')}, average ${r.onMean.toFixed(1)}. Other days: ${r.off.join(', ')}, average ${r.offMean.toFixed(1)}. Difference ${signed(r.diff)}.`;

    const root = screen('insight', `
<button class="b" data-act="back" aria-label="Back" style="position:absolute;left:24px;top:76px;width:44px;height:44px;border-radius:50%;background:#E9F0FF;color:#2457F5;display:flex;align-items:center;justify-content:center">
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block"><path d="M14.5 6l-6 6 6 6"/></svg>
</button>
<h1 data-head style="position:absolute;top:140px;left:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;white-space:nowrap;animation:rise .5s cubic-bezier(.2,.8,.2,1) both">${head[0]}${head[1] ? `<br><span style="color:#2457F5">${head[1]}</span>` : ''}</h1>
<div data-num style="position:absolute;top:${L.numTop}px;left:13px;font-size:188px;line-height:152px;font-weight:500;letter-spacing:-0.05em;color:#2457F5;white-space:nowrap;transform-origin:30% 70%;animation:pop .5s cubic-bezier(.2,.8,.2,1) ${t + 150}ms both"><span>${numeral(signed(r.diff))}</span></div>
<div style="position:absolute;top:${L.rowTop}px;left:24px;display:flex;align-items:center;gap:6px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise .45s cubic-bezier(.2,.8,.2,1) ${t + 230}ms both">
<span>In control:</span>
<span style="font-weight:600;color:#0A1640">${r.offMean.toFixed(1)}</span>
<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="#0A1640" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="to" style="display:block;flex:none"><path d="M3.5 10h13M11.5 5l5 5-5 5"/></svg>
<span style="font-weight:600;color:#0A1640">${r.onMean.toFixed(1)}</span>
</div>
<div style="position:absolute;top:${L.rowTop}px;right:24px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise .45s cubic-bezier(.2,.8,.2,1) ${t + 230}ms both">Done ${r.done} of ${r.assigned}</div>
<div style="position:absolute;top:${L.labelTop}px;left:24px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise .45s cubic-bezier(.2,.8,.2,1) ${t + 300}ms both">${label}</div>
${nimHTML}
<div style="position:absolute;left:24px;top:${L.chartTop}px;width:342px;height:${L.chartH}px">
<svg viewBox="0 0 342 ${L.chartH}" width="342" height="${L.chartH}" role="img" aria-label="${aria}" style="display:block;position:absolute;left:0;top:0;overflow:visible">
<path d="M85 ${L.yOn}H339M85 ${L.yOff}H339" fill="none" stroke="#E9F0FF" stroke-width="6" stroke-linecap="round" style="animation:fade .5s cubic-bezier(.2,.8,.2,1) 160ms both"/>
${dots}
<path d="M${xOn} ${L.yOn - 3}V${L.yOn + 12}" fill="none" stroke="#0A1640" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="15" style="--len:15;animation:draw .3s cubic-bezier(.2,.8,.2,1) ${t}ms both, fade .12s linear ${t}ms both"/>
<path d="M${xOff} ${L.yOff - 3}V${L.yOff + 12}" fill="none" stroke="#0A1640" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="15" style="--len:15;animation:draw .3s cubic-bezier(.2,.8,.2,1) ${t + 60}ms both, fade .12s linear ${t + 60}ms both"/>
</svg>
<div aria-hidden="true" style="position:absolute;left:0;top:0;width:342px;height:${L.chartH}px;animation:fade .5s cubic-bezier(.2,.8,.2,1) 160ms both">
${rowLabel(r.exp.daysLabel, L.yOn)}
${rowLabel('Other days', L.yOff)}
<div style="position:absolute;left:0;top:${L.yOff + 20}px;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">In control</div>
${Math.abs(xOff - 92) > 26 ? `<div style="position:absolute;left:82px;top:${L.yOff + 20}px;width:20px;text-align:center;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">1</div>` : ''}
${Math.abs(xOff - 332) > 26 ? `<div style="position:absolute;left:322px;top:${L.yOff + 20}px;width:20px;text-align:center;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">5</div>` : ''}
</div>
<div aria-hidden="true" style="position:absolute;left:${xOn - 20}px;top:${L.yOn + 21}px;width:40px;text-align:center;font-size:13px;line-height:16px;font-weight:600;color:#0A1640;animation:fade .3s linear ${t + 100}ms both">${r.onMean.toFixed(1)}</div>
<div aria-hidden="true" style="position:absolute;left:${xOff - 20}px;top:${L.yOff + 20}px;width:40px;text-align:center;font-size:13px;line-height:16px;font-weight:600;color:#0A1640;animation:fade .3s linear ${t + 160}ms both">${r.offMean.toFixed(1)}</div>
${chartNim}
</div>
${canAct ? `<button class="b btn" data-act="again" style="position:absolute;left:24px;top:702px;animation:rise .5s cubic-bezier(.2,.8,.2,1) ${t + 350}ms both">Run it again</button>
<button class="b" data-act="else" style="position:absolute;left:95px;top:766px;width:200px;height:44px;text-align:center;color:#2457F5;font-size:17px;line-height:44px;font-weight:600;animation:rise .5s cubic-bezier(.2,.8,.2,1) ${t + 420}ms both">Try something else</button>` : ''}`);

    root.mounted = () => {
      // A long verdict ("A clear space works.") is set a little smaller so it fits.
      const h1 = root.querySelector('[data-head]');
      if (h1.offsetWidth > 342) h1.style.fontSize = `${Math.max(32, Math.floor((44 * 342) / h1.offsetWidth))}px`;
      // In the can't-tell layout Nim sits on the last digit of the number.
      const seat = root.querySelector('[data-nim]');
      if (seat) {
        const right = 13 + root.querySelector('[data-num] span').offsetWidth;
        seat.style.left = `${Math.min(288, right - 92)}px`;
      }
    };

    onTap(root, 'back', () => app.go(back));
    onTap(root, 'again', () => {
      buzz();
      startRound(state, state.experimentId, now());
      state.step = null;
      app.save();
      app.go('today');
    });
    onTap(root, 'else', () => {
      buzz();
      state.step = 'pick';
      app.save();
      app.go('experiment');
    });
    return root;
  },
};
