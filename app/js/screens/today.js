// Today: "Day N of 14", the row of 14 dots with Nim on today, and ONE card
// that always says what is next.
// Artboards: design/project/Main.dc.html, TodayOff.dc.html, TodayMissed.dc.html

import { screen, onTap, buzz, CHEVRON } from '../ui.js';
import { nim } from '../nim.js';
import { now } from '../clock.js';
import { todayView, nextCard, todayNumbers, roundResult, roughStretch, missedDays } from '../round.js';
import { signed } from '../stats.js';
import { ROUGH_STRETCH } from '../lines.js';
import { openSettings } from './settings.js';

const DOT = 9;
const DAYS = 14;

// "Nothing assigned. That's the test." -> the last sentence carries the weight.
function lastBold(line) {
  const cut = line.indexOf('. ');
  return cut < 0 ? line : `${line.slice(0, cut + 1)} <span style="font-weight:600">${line.slice(cut + 2)}</span>`;
}
// "A gap. Experiments have those." -> the first sentence is the dark one.
function firstBold(line) {
  const cut = line.indexOf('. ');
  return cut < 0 ? `<span style="font-weight:600;color:#0A1640">${line}</span>` : `<span style="font-weight:600;color:#0A1640">${line.slice(0, cut + 1)}</span> ${line.slice(cut + 2)}`;
}

const big = (value, unit, gap = 3) =>
  value === null
    ? '<span style="color:#AFC6FF" role="img" aria-label="nothing yet">&ndash;</span>'
    : `${value}${unit ? `<span style="font-size:17px;font-weight:500;color:#5A688C;letter-spacing:0;margin-left:${gap}px">${unit}</span>` : ''}`;

export default {
  ground: 'white',
  tabs: 'today',
  render(app) {
    const state = app.state;
    const date = now();
    const v = todayView(state, date);
    const card = nextCard(state, date);
    const nums = todayNumbers(state, date);
    const result = roundResult(state, date);
    const missed = missedDays(state, date);

    // Days 10 to 14 have a two-digit numeral, so the dots run underneath it.
    const wide = v.day >= 10;
    const down = wide ? 26 : 0; // everything below the hero sits a little lower
    const flat = card.nim === 'asleep' || card.nim === 'lounge';
    const size = wide ? (card.nim === 'lounge' ? 80 : 72) : card.nim === 'lounge' ? 140 : 126;
    const trackTop = wide ? 362 : 292;
    const filled = v.notStarted ? 0 : v.day;
    const step = Math.min(70, 350 / Math.max(filled - 1, 1));
    const nimDelay = 270 + step * Math.max(filled - 1, 0);

    const pose = { okay: 'okayLeft', ahead: 'ahead', asleep: 'asleep', lounge: 'lounge', proud: 'proud' }[card.nim];
    const nimLabel = { okay: `Nim, eyeing the ${v.day}`, ahead: 'Nim, unbothered, looking ahead', asleep: 'Nim, asleep', lounge: 'Nim, flat out on the track', proud: 'Nim, proud' }[card.nim];

    let dots = '';
    for (let i = 0; i < DAYS; i++) {
      dots += `<span data-dot="${i}" style="position:absolute;top:0;width:${DOT}px;height:${DOT}px;border-radius:50%;background:#E9F0FF"></span>`;
    }
    for (let i = 0; i < filled; i++) {
      const ring = missed.includes(i + 1);
      dots += `<span data-dot="${i}" style="position:absolute;top:0;width:${DOT}px;height:${DOT}px;box-sizing:border-box;border-radius:50%;${ring ? 'background:#FFFFFF;border:2px solid #2457F5' : 'background:#2457F5'};animation:pop 320ms cubic-bezier(.2,.8,.2,1) ${Math.round(260 + step * i)}ms both"></span>`;
    }

    const tone = card.tone === 'blue' ? ['#2457F5', '#FFFFFF'] : card.tone === 'sky' ? ['#E9F0FF', '#0A1640'] : [card.tone, '#0A1640'];
    const cardInner = `
<span style="position:absolute;left:24px;top:28px;font-size:34px;line-height:40px;font-weight:600;letter-spacing:-0.03em;white-space:nowrap">${card.title}</span>
<span style="position:absolute;left:24px;top:72px;font-size:17px;line-height:22px;font-weight:500;white-space:nowrap">${card.kind === 'off' ? lastBold(card.line) : card.line}</span>`;
    const cardBox = `position:absolute;left:24px;top:${366 + down}px;width:342px;height:122px;border-radius:28px;background:${tone[0]};color:${tone[1]};animation:rise 520ms cubic-bezier(.2,.8,.2,1) 120ms both`;
    const cardHTML = card.action
      ? `<button class="b" data-act="card" style="${cardBox}">${cardInner}<span style="position:absolute;right:20px;top:49px">${CHEVRON(tone[1])}</span></button>`
      : `<div style="${cardBox}">${cardInner}</div>`;

    // Under the card: either the quiet gap line, or the note and the numbers.
    const showSignal = result.status !== 'none' && card.kind !== 'answer' && card.kind !== 'soon';
    const rough = roughStretch(state);
    let lower = '';
    if (card.gap) {
      lower += `<div style="margin-top:24px;display:flex;align-items:center;gap:10px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C">
<span aria-hidden="true" style="flex:none;width:9px;height:9px;box-sizing:border-box;border-radius:50%;border:2px solid #2457F5"></span>
<span>${firstBold(card.gap)}</span></div>`;
      if (card.note) lower += `<div style="margin-top:12px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C">${card.note}</div>`;
    } else {
      lower += `<div style="min-height:22px;margin-bottom:${wide ? 18 : 24}px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C">${card.note || ''}</div>
<div>
<div style="font-size:13px;line-height:16px;font-weight:600;color:#5A688C">Your check-ins</div>
<div style="margin-top:10px;display:flex">
<div style="width:149px">
<div style="height:48px;font-size:44px;line-height:48px;font-weight:500;letter-spacing:-0.02em;color:#0A1640;white-space:nowrap">${big(nums.ms, 'ms')}</div>
<div style="margin-top:2px;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">This morning</div>
</div>
<div style="width:127px">
<div style="height:48px;font-size:44px;line-height:48px;font-weight:500;letter-spacing:-0.02em;color:#0A1640;white-space:nowrap">${big(nums.streak, '')}</div>
<div style="margin-top:2px;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">In a row</div>
</div>
<div>
<div style="height:48px;font-size:44px;line-height:48px;font-weight:500;letter-spacing:-0.02em;color:#0A1640;white-space:nowrap">${big(nums.control, 'of 5', 4)}</div>
<div style="margin-top:2px;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">In control</div>
</div>
</div>
</div>`;
    }
    // Plain words, no mascot: only after three "Not at all" nights in a row.
    if (rough) lower += `<div style="margin-top:8px;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">${ROUGH_STRETCH}</div>`;
    if (showSignal) {
      lower += `<button class="b" data-act="signal" style="margin-top:${rough ? 10 : 22}px;width:342px;height:56px;display:flex;align-items:center;gap:16px;text-align:left">
<span style="flex:none;font-size:34px;line-height:40px;font-weight:500;letter-spacing:-0.02em;color:#2457F5">${signed(result.diff)}</span>
<span style="flex:1">
<span style="display:block;font-size:17px;line-height:22px;font-weight:600;color:#0A1640">${result.label.split(' · ')[0]}</span>
<span style="display:block;margin-top:2px;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">${result.final ? `Done ${result.done} of ${result.assigned}` : `${result.nOn + result.nOff} days so far`}</span>
</span>
${CHEVRON('#5A688C')}
</button>`;
    }

    const root = screen('today', `
<div style="position:absolute;top:76px;left:24px;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 0ms both">Day</div>
<button class="b" data-act="settings" aria-label="Settings" style="position:absolute;right:14px;top:65px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:#5A688C;animation:fade 400ms ease-out 200ms both">
<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" style="display:block"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>
</button>
<h1 aria-label="Day ${v.day} of 14" style="position:absolute;top:98px;left:${String(v.day) === '7' ? 18 : 13}px;margin:0;font-size:264px;line-height:212px;font-weight:500;letter-spacing:-0.05em;color:#2457F5;white-space:nowrap;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 0ms both"><span data-num>${v.day}</span></h1>
<div data-track aria-hidden="true" style="position:absolute;left:172px;top:${trackTop}px;width:194px;height:9px;animation:fade 400ms ease-out 80ms both">${dots}</div>
<div data-of style="position:absolute;${wide ? 'left:300px;top:112px' : 'right:24px;top:308px'};font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:fade 400ms ease-out 80ms both">of 14</div>
<div data-nim style="position:absolute;left:0;top:0;width:${size}px;height:${size}px;transform-origin:${flat ? '47% 88%' : '48.3% 88.3%'};animation:${card.nim === 'lounge' ? 'today-off-flop 600ms' : 'today-land 540ms'} cubic-bezier(.2,.8,.2,1) ${Math.round(nimDelay)}ms both">
${nim(pose, { size, label: nimLabel, z: card.nim === 'asleep' ? '#5A688C' : null, breathe: flat ? 6 : 5 })}
</div>
${cardHTML}
<div style="position:absolute;left:24px;top:${500 + down}px;width:342px;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 210ms both">${lower}</div>`);

    // Place the dots and stand Nim on today's dot. This needs the numeral's
    // real width, so it runs once the screen is on the page.
    root.mounted = () => {
      const track = root.querySelector('[data-track]');
      const nimBox = root.querySelector('[data-nim]');
      // (+13: the numeral's tight letter-spacing pulls its measured width in by that much)
      const numRight = root.querySelector('h1').offsetLeft + root.querySelector('[data-num]').offsetWidth + 13;
      const today = Math.max(filled, 1);
      let start = 172;
      let end = 357; // left edge of the last dot
      if (wide) {
        start = 24;
        end = 324;
        // "of 14" sits beside the top of the numeral, like a small superscript.
        root.querySelector('[data-of]').style.left = `${Math.min(numRight + 4, 322)}px`;
      } else {
        // Nim must clear the numeral: nudge the row right on days 1 to 3 if needed.
        const need = numRight + 12 + (flat ? 0.4 * size : 0.32 * size);
        const share = (today - 1) / (DAYS - 1);
        if (share < 1) start = Math.max(start, (need - DOT / 2 - share * end) / (1 - share));
        start = Math.min(start, 230);
      }
      const gap = (end - start) / (DAYS - 1);
      track.style.left = `${start}px`;
      track.style.width = `${end - start + DOT}px`;
      for (const d of track.querySelectorAll('[data-dot]')) d.style.left = `${(gap * Number(d.dataset.dot)).toFixed(1)}px`;
      const x = start + gap * (today - 1) + DOT / 2;
      nimBox.style.left = `${(x - (flat ? 0.47 : 0.483) * size).toFixed(1)}px`;
      nimBox.style.top = `${(trackTop - (flat ? 2.5 : 5) - 0.883 * size).toFixed(1)}px`;
    };

    onTap(root, 'card', () => {
      buzz();
      if (card.action === 'morning') app.go(v.entry.wake ? 'game' : 'checkin');
      else if (card.action === 'night') app.go('checkout');
      else if (card.action === 'reveal') app.go('day14');
      else if (card.action === 'picker') {
        state.step = 'pick';
        app.save();
        app.go('experiment');
      }
    });
    onTap(root, 'signal', () => app.go('insight', { from: 'today' }));
    onTap(root, 'settings', () => openSettings(app));
    return root;
  },
};
