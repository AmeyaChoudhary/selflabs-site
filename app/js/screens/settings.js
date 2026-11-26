// Settings: a quiet sheet that slides up over Today.
//   Export my data      the pilot team needs the file
//   Change experiment   ends this round early (kept in history), pick another
//   Start over          asks once, then clears everything

import { buzz } from '../ui.js';
import { now, dayKey, localISO } from '../clock.js';
import { exportJSON } from '../state.js';
import { todayView } from '../round.js';

const NOTE = 'SelfLabs is a student project, not a medical product. If you’re struggling, call or text 988 in the US.';

async function exportData(app) {
  const text = exportJSON(app.state, localISO(now()));
  const name = `selflabs-${dayKey(now())}.json`;
  let file = null;
  try { file = new File([text], name, { type: 'application/json' }); } catch (e) { /* very old browser */ }
  // On a phone: the share sheet (Messages, AirDrop, Files ...).
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'SelfLabs data' });
      return 'Shared.';
    } catch (e) {
      if (e && e.name === 'AbortError') return null; // they closed the sheet
    }
  }
  // Otherwise: a plain download.
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return 'Saved to your downloads.';
}

export function openSettings(app) {
  const layer = document.getElementById('sheet');
  const v = app.state.experimentId ? todayView(app.state, now()) : null;
  const canChange = v && !v.finished;

  // A row is either a plain action, or (after one tap) a yes/no question.
  const ask = (id, label, question, yes, no) => `
<div class="row" data-row="${id}">
<button class="b" data-do="${id}" style="flex:1;min-height:56px;display:flex;align-items:center">${label}</button>
<span data-ask hidden style="flex:1;font-weight:500">${question}</span>
<span data-ask hidden style="display:flex;gap:8px"><button class="b pill strong" data-yes="${id}">${yes}</button><button class="b pill" data-no="${id}">${no}</button></span>
</div>`;

  layer.innerHTML = `
<div class="scrim" data-close></div>
<div class="panel" role="dialog" aria-label="Settings">
<div aria-hidden="true" style="width:36px;height:4px;border-radius:2px;background:#D8DFEE;margin:0 auto 8px"></div>
<div class="row" data-row="export"><button class="b" data-do="export" style="flex:1;min-height:56px;display:flex;align-items:center">Export my data</button><span data-said style="font-weight:500;color:#5A688C"></span></div>
${canChange ? ask('change', 'Change experiment', 'Swap it for a new 14 days?', 'Swap', 'Keep') : ''}
${ask('reset', 'Start over', 'Erase everything?', 'Erase', 'Keep')}
<p style="margin:16px 0 0;font-size:13px;line-height:16px;font-weight:500;color:#5A688C">${NOTE}</p>
</div>`;

  const close = () => {
    layer.classList.remove('open');
    layer.onclick = null;
    setTimeout(() => { if (!layer.classList.contains('open')) layer.innerHTML = ''; }, 450);
  };
  const flip = (id, asking) => {
    const row = layer.querySelector(`[data-row="${id}"]`);
    row.querySelector('[data-do]').hidden = asking;
    row.querySelectorAll('[data-ask]').forEach((n) => { n.hidden = !asking; });
  };

  layer.onclick = async (e) => {
    const t = e.target.closest('button, [data-close]');
    if (!t) return;
    if (t.hasAttribute('data-close')) return close();
    buzz();
    if (t.dataset.do === 'export') {
      const said = await exportData(app);
      const out = layer.querySelector('[data-said]');
      if (said && out) out.textContent = said;
    } else if (t.dataset.do) flip(t.dataset.do, true);
    else if (t.dataset.no) flip(t.dataset.no, false);
    else if (t.dataset.yes === 'change') {
      app.state.step = 'pick';
      app.state.pick = null;
      app.save();
      close();
      app.go('experiment');
    } else if (t.dataset.yes === 'reset') {
      app.store.reset();
      close();
      app.go('welcome');
    }
  };

  layer.getBoundingClientRect(); // so the slide-up animates from its start
  layer.classList.add('open');
}
