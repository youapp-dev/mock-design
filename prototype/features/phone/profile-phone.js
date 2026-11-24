/* ===== Edit profile › Mobile Number: change the number with an SMS code · 24 Nov 2026 =====
   The verified number is shared with the Fiat Wallet (features/phone/countries.js, localStorage).
   Changing it here asks for a new 6-digit code; the Fiat Wallet then uses the new number. */
(function(){
  const P = window.YA_PHONE; if (!P) return;
  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];
  const KPL = {2:'ABC', 3:'DEF', 4:'GHI', 5:'JKL', 6:'MNO', 7:'PQRS', 8:'TUV', 9:'WXYZ'};
  const keypad = act => `<div class="ya-kpad" role="group" aria-label="Keypad">${KEYS.map(k => k === '' ? '<span></span>'
    : `<button data-act="${k === 'del' ? act + 'Del' : act}" data-k="${k}" aria-label="${k === 'del' ? 'Delete' : k}">${k === 'del' ? ic('del') : `<b>${k}</b>${KPL[k] ? `<small>${KPL[k]}</small>` : ''}`}</button>`).join('')}</div>`;
  const cur = () => { const v = P.load(); if (v) return v; const raw = ((C6().prof || {}).phone || ''); return {cc:'MY', num:P.digits(raw.replace(/^\+60\s*/, '')), disp:raw}; };
  const keepFocus = (id, pos) => { const el = document.getElementById(id); if (el) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch(_){} } };

  /* Edit profile shows the shared number and its flag */
  const _pe = V.profedit;
  V.profedit = () => { const v = P.load(); if (v && S.pf) { S.pf.phone = v.disp; S.pf.cc = v.cc; if (C6().prof) C6().prof.phone = v.disp; }
    const h = _pe(); const cc = (S.pf && S.pf.cc) || 'MY'; if (cc === 'MY') return h;
    const t = document.createElement('template'); t.innerHTML = h; const row = t.content.querySelector('[data-act="pfPhone"]');
    const fl = row && row.querySelector('.flag'); if (fl) fl.outerHTML = P.flag(cc); return t.innerHTML; };

  /* 1. new number */
  V.pfPhone = () => { const f = S.pph; const c = P.get(f.cc); const ok = P.ok(f.cc, f.num);
    return `<div class="screen">${statusBar()}${topBar('Mobile Number')}
    <div class="scroll"><div class="pad16 ya-phw">
      <div class="ya-phh"><h1 class="t-title">Change mobile number</h1><p class="t-body muted">Your number now is <b>${esc(cur().disp)}</b>. Enter the new one and we’ll text it a 6-digit code.</p></div>
      <button class="ya-fl ya-ctry" data-act="pphCc" aria-label="Country: ${esc(c[1])}, ${c[2]}. Change"><span class="ya-fll">Country</span>${P.flag(f.cc)}<b>${esc(c[1])}</b>${ic('chev')}</button>
      <label class="ya-fl ya-num ${f.err ? 'err' : ''}" for="pphNum"><span class="ya-fll">New mobile number</span><span class="ya-dial">${c[2]}</span>
        <input id="pphNum" type="tel" inputmode="tel" autocomplete="tel-national" value="${esc(f.num)}" placeholder="${f.cc === 'MY' ? '12-345 6789' : 'Phone number'}" aria-describedby="pphH" ${f.busy ? 'disabled' : ''}></label>
      <p class="ya-flh ${f.err ? 'err' : ''}" id="pphH">${f.err ? esc(f.err) : 'This number is also used for your Fiat Wallet.'}</p>
      <p class="t-caption subtle ya-demo">Demo: 12-345 0000 (Malaysia) is already linked to another account.</p>
    </div></div>
    <div class="cta">${btn(f.busy ? 'Sending code…' : 'Send code', 'pphSend', {disabled: !ok || f.busy, loading: f.busy})}</div></div>`; };

  /* country list */
  V.pfCountry = () => { const q = (S.pphQ || '').trim().toLowerCase(); const sel = S.pph.cc; const list = P.list.filter(c => !q || (c[1] + ' ' + c[2]).toLowerCase().includes(q));
    const head = S.pphSearch ? `<div class="topbar ya-cch"><button class="iconbtn" data-act="pphSearchX" aria-label="Close search">${ic('back')}</button><input id="pphQ" value="${esc(S.pphQ || '')}" placeholder="Search country or code" aria-label="Search country or code" autocomplete="off">${q ? `<button class="iconbtn" data-act="pphClear" aria-label="Clear search">${ic('close')}</button>` : ''}</div>`
      : `<div class="topbar"><button class="iconbtn" data-act="back" aria-label="Back">${ic('back')}</button><span class="t-headline" style="flex:1; text-align:center">Choose country</span><button class="iconbtn" data-act="pphSearch" aria-label="Search">${ic('search')}</button></div>`;
    return `<div class="screen">${statusBar()}${head}<div class="scroll"><div class="ya-ccl" role="radiogroup" aria-label="Country">${list.map(c => `<button class="ya-ccrow ${sel === c[0] ? 'on' : ''}" role="radio" aria-checked="${sel === c[0]}" data-act="pphPick" data-c="${c[0]}">${P.flag(c[0])}<b>${esc(c[1])}</b><span>${c[2]}</span></button>`).join('')
      || '<div class="ya-ccnone"><b>No country found</b><span>Try another name or code.</span></div>'}</div></div></div>`; };

  /* 2. code */
  V.pfPhoneOtp = () => { const f = S.pph; const v = f.otp || ''; const err = f.otpErr; const lock = f.tries >= 5; const t = f.t ?? 30;
    return `<div class="screen">${statusBar()}${topBar('Verify new number')}
    <div class="scroll"><div class="pad16" style="display:grid; gap:14px; padding-top:8px; text-align:center">
      <div><h1 class="t-title" style="margin:0 0 4px">Enter the 6-digit code</h1><p class="t-body muted" style="margin:0">Sent by SMS to <b style="color:var(--a-ink)">${esc(P.fmt(f.cc, f.num))}</b></p>
        <button class="link" data-act="pphChange" style="margin-top:4px">Change number</button></div>
      <div class="ya-otp ${err ? 'err' : ''}" role="img" aria-label="Code: ${v.length} of 6 digits entered">${[0,1,2,3,4,5].map(i => `<span class="${i === v.length && !err && !lock ? 'cur' : ''}">${v[i] || ''}</span>`).join('')}</div>
      <p style="margin:0; min-height:18px" aria-live="polite">${lock ? '<span class="ya-err">Too many wrong codes. Try again in 10 minutes or change the number.</span>'
        : err ? `<span class="ya-err">That code isn’t right. ${5 - f.tries} ${5 - f.tries === 1 ? 'try' : 'tries'} left.</span>`
        : f.busy ? '<span class="t-caption subtle">Checking…</span>' : '<span class="t-caption subtle">Demo code: 123456</span>'}</p>
      ${lock ? '' : t > 0 ? `<p class="t-caption subtle" style="margin:0">Resend code in <b id="pphT">0:${String(t).padStart(2, '0')}</b></p>` : '<button class="link" data-act="pphResend">Resend code</button>'}
    </div></div>${keypad('pphK')}</div>`; };

  let timer = null;
  const tick = () => { clearInterval(timer); timer = setInterval(() => { const f = S.pph; if (S.screen !== 'pfPhoneOtp' || !f) { clearInterval(timer); return; }
    f.t = Math.max(0, (f.t ?? 30) - 1); const el = document.getElementById('pphT'); if (f.t === 0) { clearInterval(timer); render(); } else if (el) el.textContent = '0:' + String(f.t).padStart(2, '0'); }, 1000); };
  const verify = () => { const f = S.pph; if (f.busy || (f.otp || '').length < 6 || f.tries >= 5) return; f.busy = true; render();
    setTimeout(() => { f.busy = false;
      if (f.otp !== '123456') { f.tries = (f.tries || 0) + 1; f.otpErr = true; f.otp = ''; render(); return; }
      clearInterval(timer); const v = P.save(f.cc, f.num); if (C6().prof) C6().prof.phone = v.disp; if (S.pf) { S.pf.phone = v.disp; S.pf.cc = v.cc; }
      const i = S.hist.lastIndexOf('profedit'); if (i >= 0) S.hist = S.hist.slice(0, i); S.screen = 'profedit'; render(); toast('Mobile number updated.'); }, 600); };

  Object.assign(A, {
    pfPhone: () => { const c = cur(); S.pph = {cc:c.cc || 'MY', num:'', err:'', busy:false}; go('pfPhone'); },
    pphCc: () => { S.pphQ = ''; S.pphSearch = false; go('pfCountry'); },
    pphSearch: () => { S.pphSearch = true; render(); keepFocus('pphQ'); },
    pphSearchX: () => { S.pphSearch = false; S.pphQ = ''; render(); },
    pphClear: () => { S.pphQ = ''; render(); keepFocus('pphQ'); },
    pphPick: el => { const f = S.pph; if (f.cc !== el.dataset.c) { f.cc = el.dataset.c; f.err = ''; } S.pphSearch = false; S.pphQ = ''; back(); setTimeout(() => keepFocus('pphNum'), 50); },
    pphSend: el => { const f = S.pph; if ((el && el.getAttribute && el.getAttribute('aria-disabled')) || f.busy) return; const c = cur();
      if (f.cc === c.cc && P.digits(f.num) === P.digits(c.num)) { f.err = 'This is already your number.'; render(); return; }
      if (f.cc === 'MY' && P.digits(f.num) === P.TAKEN) { f.err = 'This number is linked to another account. Use a different number.'; render(); return; }
      f.busy = true; render(); setTimeout(() => { f.busy = false; f.otp = ''; f.otpErr = false; f.tries = 0; f.t = 30; go('pfPhoneOtp'); toast('Code sent to ' + P.fmt(f.cc, f.num) + '.'); tick(); }, 700); },
    pphChange: () => { clearInterval(timer); back(); setTimeout(() => keepFocus('pphNum'), 50); },
    pphResend: () => { const f = S.pph; f.otp = ''; f.otpErr = false; f.t = 30; render(); toast('New code sent.'); tick(); },
    pphK: el => { const f = S.pph; if (!f || f.busy || f.tries >= 5) return; if (f.otpErr) { f.otp = ''; f.otpErr = false; } if ((f.otp || '').length >= 6) return; f.otp = (f.otp || '') + el.dataset.k; render(); if (f.otp.length === 6) verify(); },
    pphKDel: () => { const f = S.pph; if (!f || f.busy) return; f.otp = (f.otp || '').slice(0, -1); f.otpErr = false; render(); },
  });
  document.addEventListener('input', e => { const id = e.target.id;
    if (id === 'pphNum' && S.pph) { S.pph.num = e.target.value.replace(/[^\d\s-]/g, ''); S.pph.err = ''; const pos = e.target.selectionStart; render(); keepFocus('pphNum', pos); }
    if (id === 'pphQ') { S.pphQ = e.target.value; const pos = e.target.selectionStart; render(); keepFocus('pphQ', pos); } });
  document.addEventListener('keydown', e => { if (S.screen !== 'pfPhoneOtp') return; if (/^\d$/.test(e.key)) A.pphK({dataset:{k:e.key}}); else if (e.key === 'Backspace') A.pphKDel(); });

  Object.assign(META, {
    pfPhone:{name:'Change mobile number', group:'You · Edit profile', rules:['Opened from Edit profile › Mobile Number','Country field (full-screen list with search) and the new number with its dial code','Same number as now or a number linked to another account shows an error','The verified number is shared with the Fiat Wallet']},
    pfCountry:{name:'Choose country', group:'You · Edit profile', rules:['A–Z with flag, name and dial code; search from the header']},
    pfPhoneOtp:{name:'Verify new number', group:'You · Edit profile', rules:['6-digit SMS code on the number keypad, checks at 6 digits','Wrong code shows tries left; 5 wrong codes lock for 10 minutes; resend after 30 s','Correct code saves the number right away (no need to tap Save Changes) and goes back to Edit profile']},
  });

  document.head.insertAdjacentHTML('beforeend', `<style id="ya-phone-css">
  .ya-phw{display:grid; grid-template-columns:minmax(0,1fr); padding-top:20px}
  .ya-phh{text-align:center; margin:0 0 24px} .ya-phh .t-title{margin:0 0 6px} .ya-phh p{margin:0; text-wrap:balance} .ya-phh p b{color:var(--a-ink)}
  .ya-fl{position:relative; display:flex; align-items:center; gap:12px; width:100%; min-height:56px; padding:0 14px; border:1px solid var(--a-line); border-radius:12px; background:#fff; text-align:left; font:inherit; box-sizing:border-box}
  .ya-fll{position:absolute; left:12px; top:0; transform:translateY(-50%); padding:0 4px; background:#fff; font:500 12px/16px Inter, sans-serif; color:var(--a-ink-3)}
  .ya-ctry{margin-bottom:20px; cursor:pointer} .ya-ctry b{flex:1; font:500 16px Inter, sans-serif; color:var(--a-ink)} .ya-ctry > .ico{width:18px; height:18px; color:var(--a-ink-3); flex:none}
  .ya-num{cursor:text} .ya-num:focus-within{border:1.5px solid var(--a-indigo); padding:0 13.5px} .ya-num:focus-within .ya-fll{color:var(--a-indigo)}
  .ya-num.err, .ya-num.err:focus-within{border:1.5px solid var(--a-error); padding:0 13.5px} .ya-num.err .ya-fll{color:var(--a-error)}
  .ya-dial{flex:none; padding-right:12px; border-right:1px solid var(--a-line); font:500 16px/24px Inter, sans-serif; color:var(--a-ink)}
  .ya-num input{flex:1; min-width:0; height:54px; border:0; outline:0; background:none; font:400 16px Inter, sans-serif; color:var(--a-ink); padding:0}
  .ya-flh{margin:6px 2px 0; font-size:12px; line-height:16px; color:var(--a-ink-3)} .ya-flh.err{color:var(--a-error)}
  .ya-demo{margin:14px 2px 0}
  .ya-flag{display:block; width:28px; height:28px; border-radius:50%; overflow:hidden; flex:none; box-shadow:0 0 0 1px rgba(9,20,26,.08)} .ya-flag svg{display:block; width:100%; height:100%}
  .selrow .ya-flag{width:24px; height:24px}
  .ya-ccl{display:grid; align-content:start}
  .ya-ccrow{display:flex; align-items:center; gap:14px; width:100%; min-height:56px; padding:0 16px; border:0; border-bottom:1px solid var(--a-line); background:#fff; text-align:left; font:inherit; cursor:pointer}
  .ya-ccrow b{flex:1; font:500 16px Inter, sans-serif; color:var(--a-ink)} .ya-ccrow > span:last-child{font:600 15px Inter, sans-serif; color:var(--a-indigo)}
  .ya-ccrow.on{background:var(--a-indigo-100)} .ya-ccrow.on b{font-weight:700}
  .ya-ccrow:focus-visible, .ya-ctry:focus-visible{outline:2px solid var(--a-indigo); outline-offset:-2px}
  .ya-cch{gap:4px} .ya-cch input{flex:1; min-width:0; height:40px; border:0; outline:0; background:none; font:400 16px Inter, sans-serif; color:var(--a-ink)}
  .ya-ccnone{display:grid; justify-items:center; gap:4px; padding:48px 24px; text-align:center} .ya-ccnone b{color:var(--a-ink)} .ya-ccnone span{color:var(--a-ink-3); font-size:14px}
  .ya-otp{display:grid; grid-template-columns:repeat(6,1fr); gap:8px}
  .ya-otp span{height:62px; border:1px solid var(--a-line); border-radius:12px; display:grid; place-items:center; font-size:24px; font-weight:600; color:var(--a-indigo)}
  .ya-otp span.cur{border-color:var(--a-indigo); background:var(--a-indigo-100)} .ya-otp.err span{border-color:var(--a-error); color:var(--a-error)}
  .ya-err{font-size:13px; color:var(--a-error)}
  .ya-kpad{display:grid; grid-template-columns:repeat(3,1fr); gap:6px; padding:6px 4px 30px; background:#d1d3d9; flex:none}
  .ya-kpad button{height:46px; border:0; border-radius:8px; background:#fff; box-shadow:0 1px 0 #898a8d; display:flex; flex-direction:column; align-items:center; justify-content:center; font:inherit; color:#000; line-height:1}
  .ya-kpad button b{font-size:25px; font-weight:400; line-height:28px} .ya-kpad button small{font-size:9px; font-weight:700; letter-spacing:2px; color:#000; line-height:10px}
  .ya-kpad button[data-k="del"]{background:none; box-shadow:none} .ya-kpad .ico{width:24px; height:24px}
  .ya-kpad button:active{background:#bcc0c8}
  </style>`);
})();
