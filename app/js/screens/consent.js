// Consent: a parent has to say yes. "Send them the note" opens the phone's
// share sheet with a short text (or copies it); "They already said yes" goes on.
// Artboard: design/project/Consent.dc.html

import { screen, onTap, buzz } from '../ui.js';
import { now, localISO } from '../clock.js';

// Short, and every sentence is something the app really does.
function noteText() {
  const site = new URL('../', location.href).href;
  return (
    'I’d like to try SelfLabs, a student project. I test one small habit for 14 days ' +
    '(like a 20-minute walk) with a ten-second check-in morning and night. ' +
    'My answers stay on my phone: no account, nothing is sent anywhere. ' +
    'It’s not medical and I can stop any time. Is that okay with you? ' +
    site
  );
}

export default {
  ground: 'white',
  render(app) {
    const root = screen('consent', `
<h1 style="position:absolute;top:76px;left:24px;right:24px;margin:0;font-size:44px;line-height:48px;font-weight:600;letter-spacing:-0.035em;color:#0A1640;animation:rise 520ms cubic-bezier(.2,.8,.2,1) both">One grown-up<br><span style="color:#2457F5">thing.</span></h1>
<p style="position:absolute;top:186px;left:24px;margin:0;font-size:17px;line-height:22px;font-weight:500;color:#5A688C;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 80ms both">You&rsquo;re under 18, so a parent<br>has to say yes.<br><span style="font-weight:600;color:#0A1640">They never see your check-ins.</span></p>
<div aria-hidden="true" style="position:absolute;left:40px;top:322px;width:176px;height:224px;animation:consent-drop 600ms cubic-bezier(.2,.8,.2,1) 200ms both">
<svg viewBox="0 0 176 224" width="176" height="224" style="display:block;overflow:visible;transform:rotate(-8deg)">
<rect width="176" height="224" rx="22" fill="#E9F0FF"/>
<path d="M26 40H88M26 72H148M26 94H132M26 116H142" fill="none" stroke="#AFC6FF" stroke-width="8" stroke-linecap="round"/>
<path d="M26 184H128" fill="none" stroke="#AFC6FF" stroke-width="2.5" stroke-linecap="round"/>
<path d="M30 174C38 150 48 148 46 164C44 178 54 176 60 162C64 152 70 156 68 166C67 174 76 172 82 162C88 152 96 158 104 164C110 168 116 166 122 160" fill="none" stroke="#2457F5" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="150" style="--len:150;animation:draw 700ms cubic-bezier(.4,0,.2,1) 1050ms both, fade 100ms linear 1050ms both"/>
</svg>
</div>
<div style="position:absolute;left:150px;top:392px;width:216px;height:216px;transform-origin:48% 88%;animation:pop 500ms cubic-bezier(.2,.8,.2,1) 300ms both">
<svg viewBox="0 0 120 120" width="216" height="216" role="img" aria-label="Nim, giving the paperwork a look" style="display:block;overflow:visible">
<g style="transform-box:fill-box;transform-origin:50% 100%;animation:nim-breathe 5s ease-in-out 1400ms infinite">
<path transform="translate(2 0) rotate(13 58 68)" d="M58 30C70 30 80 27 90 20C95 17 100 21 98 27C93 38 96 52 96 66A38 38 0 1 1 58 30Z" fill="#2457F5"/>
<g style="animation:consent-glance 380ms cubic-bezier(.2,.8,.2,1) 900ms both">
<g style="transform-box:fill-box;transform-origin:center;animation:nim-blink 5.5s 2000ms infinite">
<path d="M31.32 64A7 7 0 1 0 44.68 64ZM55.32 64A7 7 0 1 0 68.68 64Z" fill="#FFFFFF"/>
</g>
</g>
</g>
</svg>
</div>
<button class="b btn" data-act="send" style="position:absolute;left:24px;top:682px;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 380ms both">Send them the note</button>
<button class="b btn soft" data-act="yes" style="position:absolute;left:24px;top:754px;animation:rise 520ms cubic-bezier(.2,.8,.2,1) 450ms both">They already said yes</button>`);

    const send = root.querySelector('[data-act="send"]');
    let timer = 0;
    const say = (text) => {
      send.textContent = text;
      clearTimeout(timer);
      timer = setTimeout(() => { send.textContent = 'Send them the note'; }, 2600);
    };
    root.cleanup = () => clearTimeout(timer);

    onTap(root, 'send', async () => {
      buzz();
      const text = noteText();
      if (navigator.share) {
        try {
          await navigator.share({ text });
        } catch (e) { /* they closed the share sheet: nothing to do */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        say('Copied. Paste it to them.');
      } catch (e) {
        say('Couldn’t copy. Ask them in person.');
      }
    });

    onTap(root, 'yes', () => {
      buzz();
      app.state.consentAt = localISO(now());
      app.state.step = 'pick';
      app.save();
      app.go('experiment');
    });
    return root;
  },
};
