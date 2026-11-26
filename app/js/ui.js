// ui.js: small helpers the screens share.

export const EASE = 'cubic-bezier(.2,.8,.2,1)';
export const BLUE = '#2457F5';
export const SKY = '#E9F0FF';
export const HAZE = '#AFC6FF';
export const NIGHT = '#0A1640';
export const MIST = '#5A688C';
export const WHITE = '#FFFFFF';

// Build one element from an HTML string.
export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// A screen root: a 390 x 844 box the screen positions things in.
export function screen(name, html) {
  return el(`<div class="screen" data-screen="${name}">${html}</div>`);
}

export function reducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// A tiny tick on key taps, where the phone supports it.
export function buzz() {
  try {
    if (navigator.vibrate) navigator.vibrate(8);
  } catch (e) { /* not supported: fine */ }
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Run fn when something inside `root` with data-act="name" is tapped.
export function onTap(root, name, fn) {
  root.addEventListener('click', (e) => {
    const target = e.target.closest(`[data-act="${name}"]`);
    if (target && root.contains(target) && !target.disabled) fn(target, e);
  });
}

// Fade an element out (and up a little), then call done. Uses the Web
// Animations API so it also wins over a finished entrance animation.
export function fadeOut(node, { ms = 200, dy = -8 } = {}) {
  const to = reducedMotion() || !dy ? { opacity: 0 } : { opacity: 0, translate: `0 ${dy}px` };
  return node.animate([to], { duration: ms, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
}

export function fadeIn(node, { ms = 400, dy = 14, delay = 0 } = {}) {
  const from = reducedMotion() || !dy ? { opacity: 0 } : { opacity: 0, translate: `0 ${dy}px` };
  return node.animate([from, { opacity: 1, translate: '0 0' }], { duration: ms, delay, easing: EASE, fill: 'backwards' }).finished.catch(() => {});
}

// A hero numeral as HTML: ":" and "." get a little air so the gaps look even,
// and a real minus or plus sign sits slightly apart from the digits.
export function numeral(text) {
  const air = {
    '+': '<span style="margin-right:.05em">+</span>',
    '−': '<span style="margin-right:.05em">−</span>',
    ':': '<span style="margin:0 .01em 0 .03em">:</span>',
    '.': '<span style="margin:0 .02em 0 -.015em">.</span>',
  };
  return String(text).replace(/[+−:.]/g, (mark) => air[mark]);
}

export const CHEVRON = (color) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;flex:none"><path d="M9 5l7 7-7 7"/></svg>`;
