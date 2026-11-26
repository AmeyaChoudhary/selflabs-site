// stage.js: fits the fixed 390 x 844 stage to whatever screen it is on.
// Phones: one transform (scale + centre). The ground colours bleed past the
// stage edges, so there is never a letterbox seam.
// Wide windows: the stage sits inside a phone frame instead.

export const W = 390;
export const H = 844;
const SAFE_TOP = 59;     // the designs keep the top 59px ...
const SAFE_BOTTOM = 34;  // ... and the bottom 34px free of content
const FRAME_MIN_WIDTH = 700;

function insets() {
  const cs = getComputedStyle(document.getElementById('probe'));
  return { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 };
}

export function fitStage() {
  const stage = document.getElementById('stage');
  const root = document.documentElement;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const framed = vw >= FRAME_MIN_WIDTH;
  document.body.classList.toggle('framed', framed);

  if (framed) {
    stage.style.transform = 'none';
    root.style.setProperty('--frame-zoom', Math.min(1, (vh - 96) / 862).toFixed(4));
    for (const v of ['--bx', '--bt', '--bb']) root.style.setProperty(v, '0px');
  } else {
    const safe = insets();
    // Fit the whole stage in the window, and its content band inside the safe area.
    const s = Math.min(vw / W, vh / H, (vh - safe.top - safe.bottom) / (H - SAFE_TOP - SAFE_BOTTOM));
    const x = (vw - W * s) / 2;
    let y = (vh - H * s) / 2;
    y = Math.max(y, safe.top - SAFE_TOP * s);
    y = Math.min(y, vh - safe.bottom - (H - SAFE_BOTTOM) * s);
    stage.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(5)})`;
    // How much empty window there is around the stage, in stage pixels.
    root.style.setProperty('--bx', `${(Math.max(x, 0) / s + 2).toFixed(1)}px`);
    root.style.setProperty('--bt', `${(Math.max(y, 0) / s + 2).toFixed(1)}px`);
    root.style.setProperty('--bb', `${(Math.max(vh - y - H * s, 0) / s + 2).toFixed(1)}px`);
  }
  stage.classList.add('ready');
}

export function watchStage() {
  fitStage();
  window.addEventListener('resize', fitStage);
  window.addEventListener('orientationchange', fitStage);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fitStage);
}

// The browser chrome (and the strip behind it) follows the ground. The page
// colour itself only changes while the night ground covers the whole window,
// so it is never seen changing.
let chromeTimer = 0;
export function paintChrome(ground) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', ground === 'night' ? '#0A1640' : '#FFFFFF');
  clearTimeout(chromeTimer);
  if (ground === 'night') chromeTimer = setTimeout(() => document.documentElement.classList.add('night'), 600);
  else document.documentElement.classList.remove('night');
}
