/* SelfLabs — app screen mockups as plain HTML strings.
   Any element with data-screen="<id>" gets the matching phone rendered inside it.
   Edit copy here and both the landing page and the mockup board update. */
(function () {
  const check = '<svg viewBox="0 0 14 14"><path d="M2.5 7.5l3 3 6-7"/></svg>';
  const cross = '<svg viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8"/></svg>';
  const mark = (s, w) =>
    `<svg class="mark" width="${s}" height="${s}" viewBox="0 0 32 32"><circle class="ring" cx="16" cy="16" r="13" stroke-width="${w || 2.6}"/><circle class="dot" cx="20.2" cy="12.4" r="4.6"/></svg>`;

  const statusbar = (time) => `
    <div class="statusbar">
      <span class="num">${time}</span><span class="island"></span>
      <span class="sb-icons">
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.6c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8.5.8C5.700.8 3.200 1.900 1.300 3.700l1.200 1.300a8.600 8.600 0 0 1 6-2.400zm0 3.500c1.400 0 2.600.5 3.600 1.400l1.200-1.300a7 7 0 0 0-9.600 0l1.200 1.300c1-.9 2.200-1.400 3.600-1.400zm0 3.300c-.7 0-1.300.3-1.800.7l1.800 1.900 1.800-1.900c-.5-.4-1.100-.7-1.800-.7z"/></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="19" height="9" rx="2"/><rect x="24" y="4.300" width="2" height="4.400" rx="1" opacity=".45"/></svg>
      </span>
    </div>`;

  const tabbar = (on) => {
    const tabs = [
      ['Today', '<circle cx="13" cy="13" r="9"/><circle cx="13" cy="13" r="2.6" fill="currentColor" stroke="none"/>'],
      ['Insights', '<path d="M6 20v-6M13 20V6M20 20v-9"/>'],
      ['Friends', '<circle cx="9.5" cy="13" r="5.5"/><circle cx="17" cy="13" r="5.5"/>'],
    ];
    return `<div class="tabbar">${tabs
      .map(([n, p]) => `<div class="tab${n === on ? ' on' : ''}"><svg viewBox="0 0 26 26">${p}</svg>${n}</div>`)
      .join('')}</div>`;
  };

  const face = (label, mouth, on) => `
    <div class="face${on ? ' on' : ''}">
      <svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="50"/><circle class="eye" cx="36" cy="42" r="4.6"/><circle class="eye" cx="64" cy="42" r="4.6"/><path class="ft" d="${mouth}"/></svg>
      ${label}
    </div>`;

  const phone = (cls, time, body, tab) => `
    <div class="phone ${cls}">
      ${statusbar(time)}
      <div class="content${tab ? ' tabbed' : ''}">${body}</div>
      ${tab ? tabbar(tab) : ''}
      <div class="homebar"></div>
    </div>`;

  /* ---------- insight chart ---------- */
  const X = (v) => 20 + (v - 1) * 74.5;
  const dot = (v, y, c) => `<circle cx="${X(v)}" cy="${y}" r="9" fill="${c}"/>`;
  const chart = `
    <svg viewBox="0 0 338 206" width="338" height="206" style="display:block">
      ${[1, 2, 3, 4, 5].map((v) => `<line x1="${X(v)}" x2="${X(v)}" y1="22" y2="180" stroke="var(--line)" stroke-width="1"/><text x="${X(v)}" y="200" text-anchor="middle" font-family="var(--mono)" font-size="11" fill="var(--mute)">${v}</text>`).join('')}
      <text x="0" y="12" font-family="var(--mono)" font-size="11" letter-spacing=".08em" fill="var(--ink)">WALK DAYS</text>
      <text x="338" y="12" text-anchor="end" font-family="var(--mono)" font-size="11" fill="var(--ink)">AVG 4.3</text>
      ${dot(4, 38, 'var(--signal)')}${dot(4, 60, 'var(--signal)')}${dot(4, 82, 'var(--signal)')}${dot(5, 60, 'var(--signal)')}
      <line x1="${X(4.25)}" x2="${X(4.25)}" y1="24" y2="96" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>
      <text x="0" y="116" font-family="var(--mono)" font-size="11" letter-spacing=".08em" fill="var(--mute)">OTHER DAYS</text>
      <text x="338" y="116" text-anchor="end" font-family="var(--mono)" font-size="11" fill="var(--mute)">AVG 2.8</text>
      ${dot(3, 139, 'var(--faint)')}${dot(3, 161, 'var(--faint)')}${dot(2, 139, 'var(--faint)')}${dot(2, 161, 'var(--faint)')}${dot(4, 150, 'var(--faint)')}
      <line x1="${X(2.8)}" x2="${X(2.8)}" y1="124" y2="176" stroke="var(--mute)" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;

  const S = [
    {
      id: 'welcome', group: 'Onboarding', title: 'Welcome',
      note: 'One promise, one button. No account wall before the first experiment.',
      html: phone('', '9:41', `
        <div class="grow"></div>
        ${mark(60, 2.4)}
        <p class="eyebrow mt32">A study where n = you</p>
        <h1 class="xl mt12">Run experiments on your own life.</h1>
        <p class="lead mt16">14 days. 10 seconds a day. Find out what actually works for you.</p>
        <div class="grow"></div><div class="grow"></div>
        <div class="btn">Start my study</div>
        <p class="fine mt12">No account. Stays on your phone.</p>`),
    },
    {
      id: 'goal', group: 'Onboarding', title: 'Magic wand',
      note: 'The outcomes from the whiteboard, in the words the team used. These become the thing every experiment is scored against.',
      html: phone('', '9:41', `
        <p class="eyebrow">Step 1 of 3</p>
        <h1 class="mt12">Magic wand. What do you want more of?</h1>
        <p class="body mt12">Pick up to two. Your experiments get built around them.</p>
        <div class="stack g10 mt24">
          <div class="choice on">Feeling in control<span class="tick">${check}</span></div>
          <div class="choice">Staying ahead, not catching up<span class="tick">${check}</span></div>
          <div class="choice">Not procrastinating<span class="tick">${check}</span></div>
          <div class="choice on">Less stress<span class="tick">${check}</span></div>
          <div class="choice">Better mornings<span class="tick">${check}</span></div>
        </div>
        <div class="grow"></div>
        <div class="btn">Continue</div>`),
    },
    {
      id: 'privacy', group: 'Onboarding', title: 'The deal',
      note: 'Shown before any permission prompt. A teen should be able to repeat this screen from memory.',
      html: phone('', '9:41', `
        <p class="eyebrow">Step 3 of 3</p>
        <h1 class="mt12">What SelfLabs sees. And what it never will.</h1>
        <p class="eyebrow mt24">Sees</p>
        <ul class="plist mt8">
          <li><span class="ic">${check}</span>Which apps, and for how long</li>
          <li><span class="ic">${check}</span>When your phone goes down at night</li>
          <li><span class="ic">${check}</span>Sleep and steps, if you say yes</li>
        </ul>
        <p class="eyebrow mt16">Never</p>
        <ul class="plist never mt8">
          <li><span class="ic">${cross}</span>Messages, photos, anything you type</li>
          <li><span class="ic">${cross}</span>What you watch, post or search</li>
          <li><span class="ic">${cross}</span>Your grades</li>
        </ul>
        <div class="grow"></div>
        <p class="fine" style="color:var(--ink);font-weight:500">Stays on your phone. Not your parents'. Not your school's.</p>
        <div class="btn mt12">Sounds fair</div>`),
    },
    {
      id: 'experiment', group: 'Daily loop', title: "Tomorrow's experiment",
      note: 'Evening. One small thing to try, sized so nobody says no. Each experiment repeats on some days and skips others, so there is something to compare.',
      html: phone('', '8:32', `
        <p class="eyebrow">Experiment 02 · <b>Tomorrow</b></p>
        <div class="bignum mt44">20<small>min</small></div>
        <h1 class="mt24">Walk after school.<br>No phone in hand.</h1>
        <div class="mt24">
          <div class="kv"><span>We compare</span><span>How in control tomorrow feels</span></div>
          <div class="kv"><span>Against</span><span>Your no-walk days</span></div>
        </div>
        <div class="grow"></div>
        <div class="btn">I'm in</div>
        <div class="btn quiet">Swap for another</div>`),
    },
    {
      id: 'checkin', group: 'Daily loop', title: 'Morning check-in',
      note: 'Dark and huge on purpose: eyes barely open, one thumb, one tap. No typing, ever.',
      html: phone('dark', '7:04', `
        <p class="eyebrow">Thursday · 7:04 AM</p>
        <h1 class="xl mt12">Morning. How'd you wake up?</h1>
        <div class="grow"></div>
        <div class="faces">
          ${face('Rough', 'M35 69 Q50 58 65 69')}
          ${face('Okay', 'M36 65 H64')}
          ${face('Good', 'M33 60 Q50 77 67 60', true)}
        </div>
        <div class="grow"></div>
        <div class="steps"><i class="on"></i><i></i></div>
        <p class="fine mt16">One tap. Then a 20-second game.</p>`),
    },
    {
      id: 'game', group: 'Daily loop', title: 'Wake-up test',
      note: '"Instead of questions, think of a simple game." A reaction test is hard to fake. Scored against your own usual, never a clinical norm.',
      html: phone('dark', '7:04', `
        <div class="stack center">
          <p class="eyebrow">Wake-up test · 3 of 5</p>
          <h1 class="mt12">Tap when it turns orange.</h1>
        </div>
        <div class="grow"></div>
        <div class="stack center"><div class="target"><div><b class="num">287</b><div class="mono" style="font-size:14px;font-weight:600;text-align:center;margin-top:-4px">MS</div></div></div></div>
        <div class="grow"></div>
        <div class="trials"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div>
        <p class="eyebrow mt24" style="text-align:center">Your usual · 312 ms</p>
        <p class="fine mt8">Faster than your average morning.</p>`),
    },
    {
      id: 'today', group: 'Daily loop', title: 'Today',
      note: 'The whole app on one screen: where you are in the study, the one thing to try, what the phone noticed.',
      html: phone('', '3:15', `
        <div class="row between">
          <h1>Today</h1>
          <span class="chip ghost">DAY 6 / 14</span>
        </div>
        <div class="days mt16"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="now"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="card inked mt24">
          <p class="eyebrow">Experiment 02 · Walk day 3 of 6</p>
          <div class="row between g16 mt8">
            <div><h2>20-minute walk after school</h2><p class="body mt8" style="color:color-mix(in srgb, var(--paper) 62%, transparent)">No phone in hand.</p></div>
            <span class="roundcheck"><svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".5"><path d="M2.5 7.5l3 3 6-7"/></svg></span>
          </div>
        </div>
        <div class="card mt12">
          <p class="eyebrow">Last night</p>
          <div class="row between mt12">
            <div class="stat"><b>7<small>h</small> 10<small>m</small></b><span>Sleep</span></div>
            <div class="stat"><b>11:48</b><span>Phone down</span></div>
            <div class="stat"><b>64</b><span>Pickups</span></div>
          </div>
        </div>
        <div class="card outline mt12">
          <div class="row between">
            <div><p class="eyebrow">Tonight</p><p class="mt8" style="font-weight:600">10-second check-out</p></div>
            <span class="chip">8:00 PM</span>
          </div>
        </div>
        <div class="grow"></div>
        <div class="row between g12" style="padding:14px 4px 6px;border-top:1px solid var(--line)">
          <div><p class="eyebrow"><b>Early signal</b></p><p class="mt8" style="font-size:16px;font-weight:500;letter-spacing:-.015em">Walk days are looking good for you.</p></div>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="var(--faint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.500 1.500l6 6.500-6 6.500"/></svg>
        </div>`, 'Today'),
    },
    {
      id: 'checkout', group: 'Daily loop', title: 'Evening check-out',
      note: 'Two taps. "In control" is the outcome, because it is what the team said they want most.',
      html: phone('', '8:02', `
        <p class="eyebrow">Tonight · 2 taps</p>
        <h1 class="mt12">How in control did today feel?</h1>
        <div class="scale mt32"><i>1</i><i>2</i><i>3</i><i class="on">4</i><i>5</i></div>
        <div class="row between mt12" style="font-size:13px;color:var(--mute)"><span>Not at all</span><span>Totally</span></div>
        <h2 class="mt44">Did you do the walk?</h2>
        <div class="seg mt16"><span class="on">Yes</span><span>Kind of</span><span>No</span></div>
        <div class="grow"></div>
        <div class="btn">Done</div>
        <p class="fine mt12">That's it. See you in the morning.</p>`),
    },
    {
      id: 'insight', group: 'Payoff', title: 'Insight',
      note: 'Every dot is one of your days. Shows its own uncertainty: "early signal" until there is enough data.',
      html: phone('', '8:03', `
        <p class="eyebrow">Insight 02 · <b>Early signal</b></p>
        <h1 class="mt12">On walk days, you felt more in control.</h1>
        <div class="mt24">${chart}</div>
        <p class="body mt16">+1.4 on a 5-point scale across 9 days. Three more days and we'll know if it's real.</p>
        <div class="grow"></div>
        <div class="btn">Keep testing</div>
        <div class="btn quiet">Add to my playbook</div>`),
    },
    {
      id: 'playbook', group: 'Payoff', title: 'Your playbook',
      note: 'The day-14 payoff and the reason to stay: a short list nobody else has, including what turned out not to matter.',
      html: phone('', '9:41', `
        <p class="eyebrow">Day 14 · Study complete</p>
        <h1 class="xl mt12">Your playbook.</h1>
        <p class="lead mt12">Three things that work for you. Tested by you.</p>
        <div class="mt16">
          <div class="play"><span class="ix">01</span><div class="tx"><b>Walk after school</b><span>More in control · 5 of 6 days</span></div><span class="chip signal">+1.4</span></div>
          <div class="play"><span class="ix">02</span><div class="tx"><b>Phone down by 11:30</b><span>Better mornings · 4 of 5 days</span></div><span class="chip signal">+0.9</span></div>
          <div class="play"><span class="ix">03</span><div class="tx"><b>Call a friend when stressed</b><span>Less stress · 3 of 4 days</span></div><span class="chip signal">+0.8</span></div>
        </div>
        <p class="eyebrow mt16">No effect, for you</p>
        <div class="play"><span class="ix">—</span><div class="tx"><b style="color:var(--mute);font-weight:500">Short Instagram checks</b></div><span class="chip ghost">0.0</span></div>
        <div class="grow"></div>
        <div class="btn">Start round two</div>`),
    },
    {
      id: 'friends', group: 'Social and nudges', title: 'Lab partners',
      note: 'Friendly competition on the game and on showing up. Feelings are never ranked or shared.',
      html: phone('', '7:06', `
        <h1>Lab partners</h1>
        <p class="eyebrow mt24">This morning's wake-up test</p>
        <div class="mt8">
          <div class="lb"><span class="rk">1</span><span class="av">M</span><span class="nm">Maya</span><span class="sc num">271<small>ms</small></span></div>
          <div class="lb me"><span class="rk">2</span><span class="av">Y</span><span class="nm">You</span><span class="sc num">284<small>ms</small></span></div>
          <div class="lb"><span class="rk">3</span><span class="av">L</span><span class="nm">Leo</span><span class="sc num">302<small>ms</small></span></div>
          <div class="lb"><span class="rk">4</span><span class="av">S</span><span class="nm">Sam</span><span class="sc num">318<small>ms</small></span></div>
          <div class="lb idle"><span class="rk">–</span><span class="av">J</span><span class="nm">Jordan</span><span class="sc">still asleep</span></div>
        </div>
        <div class="card mt24">
          <div class="row between"><div><p class="eyebrow">Your streak</p><p class="mt8" style="font-size:24px;font-weight:700;letter-spacing:-.03em">6 mornings</p></div><span class="chip signal">BEST YET</span></div>
        </div>
        <div class="btn soft mt12">Invite a lab partner</div>
        <div class="grow"></div>
        <p class="fine">Friends see game scores and streaks. Never your check-ins.</p>`, 'Friends'),
    },
    {
      id: 'nudge', group: 'Social and nudges', title: 'The only nudge',
      note: 'No blocking, no breathing exercise in the way. Your own data, at the moment it is useful, with an off switch.',
      html: phone('lock', '11:42', `
        <p class="lock-date mt8">Wednesday, December 9</p>
        <p class="lock-time mt8">11:42</p>
        <div class="grow"></div>
        <div class="notif">
          <div class="row g12" style="align-items:flex-start">
            <span class="app"><svg width="26" height="26" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" stroke="#0a0a0b" stroke-width="2.800" fill="none"/><circle cx="20.200" cy="12.400" r="4.600" fill="#ff5b1f"/></svg></span>
            <div class="grow">
              <div class="row between"><span class="ttl">SelfLabs</span><span class="when">now</span></div>
              <p class="msg" style="margin-top:2px">When your phone goes down by midnight, your mornings are good 4 out of 5 times. Your call.</p>
            </div>
          </div>
          <div class="acts"><span>Got it</span><span>Don't show again</span></div>
        </div>
        <div class="lock-foot mt32"><i></i><i></i></div>`),
    },
  ];

  window.SELFLABS_SCREENS = S;
  window.mountPhones = function (root) {
    (root || document).querySelectorAll('[data-screen]').forEach((el) => {
      const s = S.find((x) => x.id === el.dataset.screen);
      if (s) el.innerHTML = s.html;
    });
  };
})();
