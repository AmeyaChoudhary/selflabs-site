// nim.js: draws Nim, the drop of sky with a quiff.
// One body path. A mood is only: how far the quiff leans, and the eyes.
// No mouth, no arms. Deadpan by default.

export const BLUE = '#2457F5';
export const WHITE = '#FFFFFF';
export const NIGHT = '#0A1640';
export const HAZE = '#AFC6FF';
export const SUN = '#FFB23E';

const UP = 'M58 30C70 30 80 27 90 20C95 17 100 21 98 27C93 38 96 52 96 66A38 38 0 1 1 58 30Z';
const FLAT = 'M54 52C68 52 80 53 92 50.500C98 49 103 53.5 100 58.500C97 63.5 96 70 96 78C96 94 78 106 54 106C30 106 12 94 12 78C12 62 30 52 54 52Z';
const SPARK = 'M109 11C110 19 112 21 120 22C112 23 110 25 109 33C108 25 106 23 98 22C106 21 108 19 109 11Z';
const Z = 'M101 29h7.500l-7.500 9.500h7.500';

// Eyes: f = filled shapes (path data), s = stroked line (path data),
// c = circles [cx, cy, r]. dx shifts them (a glance).
export const POSES = {
  asleep:  { flat: true, s: 'M35 85q6.5 3.5 13 0M60 85q6.5 3.5 13 0' },
  okay:    { rot: 0, f: 'M48.32 67.90A7 7 0 1 0 61.68 67.90ZM72.32 67.90A7 7 0 1 0 85.68 67.90Z' },
  okayLeft: { rot: 0, f: 'M31.32 67.90A7 7 0 1 0 44.68 67.90ZM55.32 67.90A7 7 0 1 0 68.68 67.90Z' },
  okayRight: { rot: 0, f: 'M52.32 67.90A7 7 0 1 0 65.68 67.90ZM76.32 67.90A7 7 0 1 0 89.68 67.90Z' },
  shut:    { rot: 0, s: 'M48.5 68q6.5 3.5 13 0M72.5 68q6.5 3.5 13 0' },
  happy:   { rot: -16, ty: -9, s: 'M39 63q7 -10 14 0M63 63q7 -10 14 0' },
  proud:   { rot: -10, s: 'M40 59q6.5 6.5 13 0M63 59q6.5 6.5 13 0', spark: true },
  curious: { rot: 13, tx: 2, c: [[60, 63, 5.5], [83, 59, 8.5]] },
  peek:    { rot: -22, c: [[33, 68, 8.5], [56, 72, 5.5]] },
  awake:   { rot: 10, c: [[43, 58, 8.5], [67, 59.5, 5.5]] },
  shrug:   { rot: 14, tx: 2, f: 'M57.82 64A6.5 6.5 0 1 0 70.18 64ZM78.32 63A6.5 6.5 0 1 0 90.68 63Z' },
  settled: { rot: -12, f: 'M34.32 74A7 7 0 1 0 47.68 74ZM58.32 74A7 7 0 1 0 71.68 74Z' },
  ahead:   { rot: 7, f: 'M54.32 66.9A7 7 0 1 0 67.68 66.9ZM77.32 65.9A7 7 0 1 0 90.68 65.9Z' },
  patient: { rot: -6, f: 'M34.32 66.9A7 7 0 1 0 47.68 66.9ZM58.32 65.9A7 7 0 1 0 71.68 65.9Z' },
  lounge:  { flat: true, flatRot: -6, s: 'M33.5 86.5q7 -9.5 14 0M58.5 84q7 -9.5 14 0' }, // flat out, eyes smiling
  // the five answers of the night scale, 1 (not at all) to 5 (totally)
  scale1:  { flat: true, s: 'M35 85q6.5 3.5 13 0M60 85q6.5 3.5 13 0' },
  scale2:  { rot: 14, s: 'M49 71h12M73 71h12' },
  scale3:  { rot: 5, f: 'M48.32 67.90A7 7 0 1 0 61.68 67.90ZM72.32 67.90A7 7 0 1 0 85.68 67.90Z' },
  scale4:  { rot: -5, c: [[43, 60, 6.5], [67, 60, 6.5]] },
  scale5:  { rot: -9, ty: -9, s: 'M39 63q7 -10 14 0M63 63q7 -10 14 0' },
};

function eyes(p, color) {
  let out = '';
  if (p.f) out += `<path d="${p.f}" fill="${color}"/>`;
  if (p.s) out += `<path d="${p.s}" fill="none" stroke="${color}" stroke-width="4.6" stroke-linecap="round"/>`;
  if (p.c) out += p.c.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join('');
  return out;
}

function bodyStyle(p) {
  if (p.flat) return p.flatRot ? `transform:rotate(${p.flatRot}deg);transform-origin:40px 106px` : '';
  return `transform:translate(${p.tx || 0}px,${p.ty || 0}px) rotate(${p.rot || 0}deg);transform-origin:58px 68px;transition:transform 480ms cubic-bezier(.2,.8,.2,1)`;
}

// The inside of a Nim <svg>. Options:
//   body, eye   colours (Blue with white eyes by default)
//   breathe     seconds for one slow breath (0 = still)
//   blink       seconds between blinks (0 = never; a sleeping Nim never blinks)
//   delay       ms offset so two Nims on a screen are not in step
//   z           show the little "z" (colour) next to a sleeping Nim
//   eyeAnim     an extra animation on the eyes (e.g. a glance)
export function nimInner(pose, o = {}) {
  const p = POSES[pose];
  const body = o.body || BLUE;
  const eye = o.eye || WHITE;
  const breathe = o.breathe === undefined ? 5 : o.breathe;
  const blink = p.flat || p.s ? 0 : o.blink === undefined ? 4.4 : o.blink;
  const delay = o.delay || 0;
  let e = eyes(p, eye);
  if (blink) e = `<g style="transform-box:fill-box;transform-origin:center;animation:nim-blink ${blink}s ${delay}ms infinite">${e}</g>`;
  if (o.eyeAnim) e = `<g style="${o.eyeAnim}">${e}</g>`;
  e = `<g data-nim-eyes>${e}</g>`;
  const path = `<path data-nim-body d="${p.flat ? FLAT : UP}" fill="${body}" style="${bodyStyle(p)}"/>`;
  const breath = breathe ? `animation:nim-breathe ${breathe}s ease-in-out ${delay}ms infinite` : '';
  let out = `<g data-nim-all style="transform-box:fill-box;transform-origin:50% 100%;${breath}">${path}${e}</g>`;
  if (p.spark && o.spark !== false) {
    out += `<path d="${SPARK}" fill="${SUN}" style="transform-box:fill-box;transform-origin:center;animation:twinkle 3.2s ease-in-out 1800ms infinite"/>`;
  }
  if (o.z) {
    out += `<g data-nim-z style="animation:nim-z 5s ease-in-out infinite"><path d="${Z}" fill="none" stroke="${o.z}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  return out;
}

// A whole Nim as an <svg> string.
export function nim(pose, o = {}) {
  const size = o.size || 120;
  const a11y = o.label ? `role="img" aria-label="${o.label}"` : 'aria-hidden="true"';
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" ${a11y} data-nim="${pose}" style="display:block;overflow:visible;${o.style || ''}">${nimInner(pose, o)}</svg>`;
}

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Change a live Nim (an <svg> made by nim()) to another pose, in character:
//   upright to upright: the quiff swings over and Nim blinks into the new eyes
//   asleep to upright:  it springs up; upright to asleep: it slumps
export function setPose(svg, pose, o = {}) {
  const from = svg.dataset.nim;
  if (from === pose && !o.force) return;
  const a = POSES[from];
  const b = POSES[pose];
  svg.dataset.nim = pose;
  if (o.label) svg.setAttribute('aria-label', o.label);
  svg.innerHTML = nimInner(pose, o);
  if (reduced()) return;
  const all = svg.querySelector('[data-nim-all]');
  const body = svg.querySelector('[data-nim-body]');
  const eyeGroup = svg.querySelector('[data-nim-eyes]');
  const ease = 'cubic-bezier(.2,.8,.2,1)';
  if (a.flat && !b.flat) {
    all.animate([{ transform: 'scale(1.14,.6)' }, { transform: 'scale(.96,1.06)', offset: 0.55 }, { transform: 'scale(1,1)' }], { duration: 480, easing: ease });
  } else if (!a.flat && b.flat) {
    all.animate([{ transform: 'scale(.88,1.5)' }, { transform: 'scale(1.05,.92)', offset: 0.6 }, { transform: 'scale(1,1)' }], { duration: 520, easing: ease });
  } else if (!a.flat && !b.flat) {
    // start from the old lean, then let the CSS transition swing to the new one
    const to = body.style.transform;
    body.style.transition = 'none';
    body.style.transform = `translate(${a.tx || 0}px,${a.ty || 0}px) rotate(${a.rot || 0}deg)`;
    body.getBoundingClientRect();
    body.style.transition = '';
    body.style.transform = to;
  }
  if (!o.quiet) {
    eyeGroup.style.transformBox = 'fill-box';
    eyeGroup.style.transformOrigin = 'center';
    eyeGroup.animate([{ transform: 'scaleY(.08)' }, { transform: 'scaleY(1)' }], { duration: 240, easing: ease });
  }
}
