/* ===== eWallet (MYR e-money account) · 23 Nov 2026 =====
   Needed only for Receive (via eWallet), Bill payment and Mobile reload. Scan to Pay and the
   crypto wallets do not need it. Opening costs a one-time RM50 account opening fee, paid from
   MYRT first (burned), otherwise from a top-up method. Existing KYC covers it.
   Assumptions pending Kevon (marked ⚠️ in META): opening is instant, account details are a
   DuitNow QR + account number, a failed opening refunds the fee, received MYR stays as eWallet
   balance and is used before MYRT. */
(function(){
  const FEE = 50;
  const ACCT = '8812 0045 7731';
  const on = () => scen.ew === 'on';
  const NEXT = {bills:['Pay bills', 'bills'], mreload:['Reload a number', 'mreload'], ewRecv:['Receive money', 'ewRecv']};
  const ewTx = () => S.ewTx || (S.ewTx = []);
  const ewBal = () => S.ewBal || 0;
  const ewIc = () => `<span class="wr-currency-icon ew-ic" aria-hidden="true">${ic('wallet2')}</span>`;
  const now = () => new Date();
  /* brand illustration: wallet + RM coin + the three things it unlocks (receive, bills, reload) */
  const ART = (w = 168) => `<svg class="ew-art" width="${w}" height="${Math.round(w * 0.72)}" viewBox="0 0 200 144" fill="none" aria-hidden="true">
    <defs><linearGradient id="ewg" x1="40" y1="44" x2="150" y2="124" gradientUnits="userSpaceOnUse"><stop stop-color="#8B5CF0"/><stop offset="1" stop-color="#4B2A9E"/></linearGradient></defs>
    <ellipse cx="100" cy="82" rx="86" ry="56" fill="#F4EFFF"/>
    <path d="M38 132c20-6 104-6 124 0" stroke="#E9E0FB" stroke-width="6" stroke-linecap="round"/>
    <rect x="62" y="30" width="76" height="46" rx="8" transform="rotate(-8 100 53)" fill="#fff" stroke="#E9E0FB" stroke-width="2"/>
    <rect x="70" y="40" width="40" height="6" rx="3" transform="rotate(-8 100 53)" fill="#C9B6F5"/>
    <rect x="48" y="52" width="104" height="70" rx="16" fill="url(#ewg)"/>
    <path d="M48 70h104" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
    <rect x="118" y="78" width="40" height="26" rx="13" fill="#fff" fill-opacity=".22"/>
    <circle cx="131" cy="91" r="6" fill="#fff"/>
    <circle cx="76" cy="104" r="17" fill="#F5B82E" stroke="#fff" stroke-width="3"/>
    <text x="76" y="109" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="800" fill="#fff">RM</text>
    <g><circle cx="34" cy="50" r="14" fill="#fff" stroke="#E9E0FB" stroke-width="2"/><path d="M39 45l-9 9m0-6v6h6" stroke="#2FA36B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g><circle cx="168" cy="44" r="14" fill="#fff" stroke="#E9E0FB" stroke-width="2"/><path d="M170 36l-7 10h5l-2 8 7-10h-5l2-8z" fill="#C05CA8"/></g>
    <g><circle cx="174" cy="96" r="12" fill="#fff" stroke="#E9E0FB" stroke-width="2"/><rect x="169.5" y="88.5" width="9" height="15" rx="2" stroke="#5E35B8" stroke-width="2"/><path d="M172.5 100h3" stroke="#5E35B8" stroke-width="2" stroke-linecap="round"/></g>
    <path d="M150 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#F5B82E"/><path d="M24 92l1.5 3.5L29 97l-3.5 1.5L24 102l-1.5-3.5L19 97l3.5-1.5z" fill="#C05CA8"/><circle cx="58" cy="22" r="3" fill="#C9B6F5"/>
  </svg>`;
  const fmtD = d => d.toLocaleString('en-MY', {dateStyle:'medium', timeStyle:'short'});

  /* ---------- styles (reuse wallet tokens; only layout for the new pieces) ---------- */
  const css = document.createElement('style');
  css.textContent = `
  .ew-ic{display:grid; place-items:center; color:#4B2A9E; background:#F4EFFF}
  .ew-ic svg{width:20px; height:20px}
  .cr.ew-row .rt a{font-weight:700; color:#5E35B8; text-decoration:none}
  .cr.ew-row small.ew-sub{display:block; font-weight:500; color:#6E6688; margin-top:2px}
  .ew-unlock{display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:0; padding:0; list-style:none}
  .ew-unlock li{display:grid; justify-items:center; gap:6px; padding:12px 6px; border-radius:16px; background:#F8F5FF; text-align:center}
  .ew-unlock li > span{display:grid; place-items:center; width:36px; height:36px; border-radius:12px; background:#fff; color:#4B2A9E}
  .ew-unlock li > span svg{width:20px; height:20px}
  .ew-unlock b{font-size:12.5px; line-height:1.25; color:#1E1050}
  .ew-hero{display:grid; justify-items:center; gap:4px; text-align:center; padding:0 0 2px}
  .ew-hero p{margin:0; color:#6E6688}
  .ew-art{display:block; margin:0 auto; max-width:100%; height:auto}
  .ew-intro{display:grid; justify-items:center; gap:6px; text-align:center}
  .ew-intro .t-title{margin:6px 0 0} .ew-intro p{margin:0}
  .ew-ph{display:flex; gap:8px} .ew-ph .input{flex:1; min-width:0}
  .ew-cc{display:flex; align-items:center; gap:4px; flex:none; height:48px; padding:0 10px 0 14px; border:1px solid var(--a-line); border-radius:12px; background:#fff; font:600 16px Inter, sans-serif; color:var(--a-ink)} .ew-cc svg{display:block; width:16px; height:16px; color:var(--a-ink-3)}
  .field.err .input{border-color:var(--a-error)}
  .ew-otp{position:relative; display:block} .ew-otp input{position:absolute; inset:0; width:100%; height:100%; opacity:0; border:0; font-size:16px; caret-color:transparent}
  .ew-otp:focus-within .otp-boxes span.cur{box-shadow:0 0 0 2px var(--a-indigo-100)}
  .ew-otph{margin:0; min-height:18px}
  .ew-okph{display:inline-flex; align-items:center; gap:4px} .ew-okph svg{width:16px; height:16px; color:#2FA36B}
  .ew-ccs{margin:0 0 6px!important; width:100%!important} .ew-ccs input{border:0; outline:0; flex:1; font:inherit; font-size:16px; background:none; min-width:0}
  .ew-ccl{display:grid; align-content:start; height:50vh; overflow:auto}
  .ew-ccr{display:flex; align-items:center; gap:12px} .ew-ccr small{font:500 14px Inter, sans-serif; color:var(--a-ink-3)}
  .ew-tools{display:grid; grid-template-columns:1fr 1fr; gap:10px}
  .ew-assume{font-size:12px; color:#8A6D00; background:#FFF6D6; border-radius:12px; padding:8px 10px; margin:0}
  .wr-quick-actions + .wr-quick-actions{margin-top:10px}
  .ew-lst .grp{text-transform:none}
  .ew-recv{display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; min-height:44px; margin-top:14px; border:0; border-radius:999px; background:rgba(255,255,255,.18); color:#fff; font:600 15px/1 Inter,sans-serif; cursor:pointer}
  .ew-recv svg{width:18px; height:18px}
  .ew-recv:focus-visible{outline:2px solid #fff; outline-offset:2px}
  `;
  document.head.appendChild(css);

  /* ---------- YouPage: Bills and Mobile reload tiles below Top up / Rewards ---------- */
  const _home = V.home;
  V.home = () => { const h = _home(); if (!kycOk() || h.indexOf('wr-quick-actions') < 0) return h;
    const t = document.createElement('template'); t.innerHTML = h;
    const row = t.content.querySelector('.wr-quick-actions');
    if (row && !t.content.querySelector('[data-act="bills"].wr-quick-action')) {
      row.insertAdjacentHTML('afterend', `<div class="wr-quick-actions" role="group" aria-label="Bills and reload">
        <button type="button" class="wr-quick-action" data-act="bills"><span class="wr-quick-icon" aria-hidden="true">${ic('bill')}</span><span class="wr-quick-copy"><b>Bill payment</b></span></button>
        <button type="button" class="wr-quick-action" data-act="mreload"><span class="wr-quick-icon" aria-hidden="true">${ic('mreload')}</span><span class="wr-quick-copy"><b>Mobile reload</b></span></button></div>`);
    }
    return t.innerHTML; };

  /* ---------- My money: eWallet section ---------- */
  const _wallets = V.wallets;
  V.wallets = () => { const h = _wallets(); const t = document.createElement('template'); t.innerHTML = h;
    const list = t.content.querySelector('.lst'); if (!list) return h;
    const row = on()
      ? `<div class="cr ew-row" data-act="nav" data-to="ewDetail" role="button" tabindex="0" aria-label="eWallet, ${S.balHide ? 'balance hidden' : RM(ewBal())}">${ewIc()}<div><b>eWallet</b><small class="ew-sub">Ringgit · DuitNow</small></div><div class="rt"><b>${S.balHide ? '••••' : RM(ewBal())}</b></div>${ic('chev')}</div>`
      : `<div class="cr ew-row" data-act="ewGate" data-n="" role="button" tabindex="0" aria-label="eWallet, not activated. Activate">${ewIc()}<div><b>eWallet</b><small class="ew-sub">Receive, pay bills and reload</small></div><div class="rt"><a>Activate</a></div>${ic('chev')}</div>`;
    list.insertAdjacentHTML('afterend', `<div class="lst ew-lst"><div class="grp">eWallet</div>${row}</div>`);
    return t.innerHTML; };

  /* ---------- wallet detail (crypto wallets): Receive ---------- */
  const _wd = V.wDetail;
  V.wDetail = () => { const h = _wd(); const w = wList().find(e => e.id === S.wSel) || wMain(); if (!w) return h;
    /* Receive sits inside the balance card so the asset list still follows it directly */
    return h.replace(/(<section class="wr-asset-summary wr-wallet-summary"[\s\S]*?)(<\/section>)/, `$1<button type="button" class="ew-recv" data-act="ewCryptoRecv" data-id="${w.id}">${ic('xsDown')}Receive</button>$2`); };

  /* ---------- gate: Bills, Mobile reload, eWallet Receive ---------- */
  const gate = (n, go_) => { if (on()) return go_(); S.ewNext = n; S.sheet = 'ewGate'; render(); };
  const _bills = A.bills, _mr = A.mreload;
  A.bills = el => gate('bills', () => _bills(el));
  A.mreload = el => gate('mreload', () => _mr(el));

  SHEETS.ewGate = () => { const n = NEXT[S.ewNext];
    return `<div class="grab"></div><div class="stack" style="gap:14px">
      <div class="ew-intro">${ART(152)}<h2 class="t-title">${n ? `Activate your eWallet to ${n[0].toLowerCase()}` : 'Activate your eWallet'}</h2>
        <p class="t-body muted">Bills, reloads and receiving ringgit run on your eWallet. Scan to Pay doesn’t need it.</p></div>
      <div class="kvbox sp-box"><div class="kv"><span>One-time opening fee</span><b>${RM(FEE)}</b></div><div class="kv"><span>Identity check</span><b>Already done</b></div><div class="kv"><span>Phone number</span><b>Verify next</b></div></div>
      ${bal() < FEE ? `<p class="t-caption subtle" style="margin:0; text-align:center">Your MYRT is ${RM(bal())}. You can top up the rest on the next step.</p>` : ''}
      ${btn('Continue', 'ewStart')}${btn('Not now', 'closeSheet', {kind:'btn-tertiary'})}</div>`; };

  /* ---------- activation step 1–2: phone number + SMS OTP (verify before paying) ---------- */
  const CC = [['Malaysia','+60',[9,10]],['Indonesia','+62',[9,12]],['Singapore','+65',[8,8]],['Thailand','+66',[9,9]],['Philippines','+63',[10,10]],['Vietnam','+84',[9,10]],['Brunei','+673',[7,7]],['China','+86',[11,11]],['India','+91',[10,10]],['Japan','+81',[10,10]],['South Korea','+82',[9,10]],['Australia','+61',[9,9]],['United Kingdom','+44',[10,10]],['United States','+1',[10,10]]];
  const ccOf = c => CC.find(x => x[1] === c) || CC[0];
  const digits = v => (v || '').replace(/\D/g, '').replace(/^0+/, '');
  const phoneOk = (cc, n) => { const [a, b] = ccOf(cc)[2]; const d = digits(n); return d.length >= a && d.length <= b; };
  const fmtPh = (cc, n) => { const d = digits(n); return `${cc} ${cc === '+60' ? d.replace(/^(\d{2})(\d{3,4})(\d{4})$/, '$1-$2 $3') : d.replace(/(\d{3,4})(?=\d)/g, '$1 ')}`; };
  const TAKEN = '123450000';
  V.ewPhone = () => { const f = S.ewPh || (S.ewPh = {cc:'+60', num:'', err:''}); const ok = phoneOk(f.cc, f.num);
    return `<div class="screen bz">${statusBar()}${topBar('Activate eWallet')}
    <div class="scroll"><div class="pad16 stack" style="gap:14px; padding-top:8px">
      <div><h1 class="t-title" style="margin:0 0 4px">What’s your phone number?</h1><p class="t-body muted" style="margin:0">We’ll text a 6-digit code to verify it. This number is linked to your eWallet.</p></div>
      <div class="field ${f.err ? 'err' : ''}"><label class="t-body" style="font-weight:600" for="ewNum">Phone number</label>
        <div class="ew-ph"><button class="ew-cc" data-act="ewCcOpen" aria-label="Country code ${esc(ccOf(f.cc)[0])} ${f.cc}">${f.cc}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg></button>
          <input id="ewNum" class="input" type="tel" inputmode="tel" autocomplete="tel-national" value="${esc(f.num)}" placeholder="${f.cc === '+60' ? '12-345 6789' : 'Phone number'}" aria-describedby="ewNumH" ${f.busy ? 'disabled' : ''}></div>
        <span class="helper ${f.err ? '' : 'neutral'}" id="ewNumH">${f.err ? esc(f.err) : 'Use a number that can receive SMS.'}</span></div>
      <p class="t-caption subtle" style="margin:0">Demo: ${TAKEN.replace(/^(\d{2})(\d{3})(\d{4})$/, '$1-$2 $3')} is already linked to another eWallet.</p>
    </div></div>
    <div class="w2foot">${btn(f.busy ? 'Sending code…' : 'Send code', 'ewSend', {disabled: !ok || f.busy, loading: f.busy})}</div></div>`; };
  SHEETS.ewCc = () => { const q = (S.ewCcQ || '').trim().toLowerCase(); const cur = (S.ewPh || {}).cc; const list = CC.filter(c => !q || (c[0] + ' ' + c[1]).toLowerCase().includes(q));
    return `<div class="grab"></div><h2 class="t-title" style="margin:0 0 10px; text-align:center">Country code</h2>
      <label class="search ew-ccs">${ic('search')}<input id="ewCcQ" value="${esc(S.ewCcQ || '')}" placeholder="Search country or code" aria-label="Search country or code"></label>
      <div class="ew-ccl" role="radiogroup" aria-label="Country code">${list.map(c => `<button class="radrow" role="radio" aria-checked="${cur === c[1]}" data-act="ewCcPick" data-c="${c[1]}"><span><b>${esc(c[0])}</b></span><span class="ew-ccr"><small>${c[1]}</small><i class="${cur === c[1] ? 'on' : ''}"></i></span></button>`).join('') || '<p class="t-body subtle" style="text-align:center; margin:16px 0">No country found.</p>'}</div>`; };
  V.ewOtp = () => { const f = S.ewPh; const v = f.otp || ''; const err = f.otpErr; const lock = f.tries >= 5; const t = f.t ?? 30;
    return `<div class="screen bz">${statusBar()}${topBar('Verify phone number')}
    <div class="scroll"><div class="pad16 stack" style="gap:14px; padding-top:8px; text-align:center">
      <div><h1 class="t-title" style="margin:0 0 4px">Enter the 6-digit code</h1><p class="t-body muted" style="margin:0">Sent by SMS to <b style="color:var(--a-ink)">${esc(fmtPh(f.cc, f.num))}</b></p>
        <button class="link" data-act="ewChangeNum" style="margin-top:4px">Change number</button></div>
      <label class="ew-otp"><span class="sr" style="position:absolute; left:-9999px">Verification code</span>
        <input id="ewOtpIn" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${esc(v)}" ${lock || f.busy ? 'disabled' : ''} aria-describedby="ewOtpH">
        <span class="otp-boxes ${err ? 'err' : ''}" aria-hidden="true">${[0,1,2,3,4,5].map(i => `<span class="${i === v.length && !err && !lock ? 'cur' : ''}">${v[i] || ''}</span>`).join('')}</span></label>
      <p class="ew-otph" id="ewOtpH">${lock ? '<span class="err-text">Too many wrong codes. Try again in 10 minutes or change the number.</span>'
        : err ? `<span class="err-text">That code isn’t right. ${5 - f.tries} ${5 - f.tries === 1 ? 'try' : 'tries'} left.</span>`
        : f.busy ? '<span class="t-caption subtle">Checking…</span>' : '<span class="t-caption subtle">Demo code: 123456</span>'}</p>
      ${lock ? '' : t > 0 ? `<p class="t-caption subtle" style="margin:0">Resend code in <b id="ewOtpT">0:${String(t).padStart(2, '0')}</b></p>` : `<button class="link" data-act="ewResend">Resend code</button>`}
    </div></div>
    <div class="w2foot">${btn(f.busy ? 'Verifying…' : 'Verify', 'ewVerify', {disabled: v.length < 6 || lock || f.busy, loading: f.busy})}</div></div>`; };
  let ewTimer = null;
  const ewTick = () => { clearInterval(ewTimer); ewTimer = setInterval(() => { const f = S.ewPh; if (S.screen !== 'ewOtp' || !f) { clearInterval(ewTimer); return; }
    f.t = Math.max(0, (f.t ?? 30) - 1); const el = document.getElementById('ewOtpT'); if (f.t === 0) { clearInterval(ewTimer); render(); } else if (el) el.textContent = '0:' + String(f.t).padStart(2, '0'); }, 1000); };
  const keepFocus = (id, pos) => { const el = document.getElementById(id); if (el) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch(_){} } };
  document.addEventListener('input', e => { const id = e.target.id, f = S.ewPh;
    if (id === 'ewNum' && f) { f.num = e.target.value.replace(/[^\d\s-]/g, ''); f.err = ''; const pos = e.target.selectionStart; render(); keepFocus('ewNum', pos); }
    if (id === 'ewCcQ') { S.ewCcQ = e.target.value; render(); keepFocus('ewCcQ', e.target.value.length); }
    if (id === 'ewOtpIn' && f) { f.otp = e.target.value.replace(/\D/g, '').slice(0, 6); f.otpErr = false; render(); keepFocus('ewOtpIn'); if (f.otp.length === 6) A.ewVerify(); } });

  /* ---------- activation ---------- */
  V.ewConfirm = () => { const b = bal(); const short = Math.max(0, FEE - b); const low = short > 0; const busy = S.ewBusy; const m = PM.some(x => x.k === S.ewTm && x.k !== 'wallet') ? S.ewTm : 'card'; const mName = m === 'card' ? 'your card' : PM.find(x => x.k === m).name.split(' ')[0];
    return `<div class="screen bz">${statusBar()}${topBar('Activate eWallet')}
    <div class="scroll" style="padding-bottom:16px"><div class="pad16 stack" style="gap:14px; padding-top:4px">
      <div class="ew-hero">${ART(184)}<b class="t-body-lg">Your ringgit eWallet</b><p>Opens instantly with the ID you already verified.</p></div>
      <ul class="ew-unlock" aria-label="What you can do with it">
        <li><span>${ic('xsDown')}</span><b>Receive ringgit</b></li>
        <li><span>${ic('bill')}</span><b>Pay bills</b></li>
        <li><span>${ic('mreload')}</span><b>Mobile reload</b></li>
      </ul>
      <div class="kvbox sp-box">
        ${S.ewPhoneOk ? `<div class="kv"><span>Phone number</span><b class="ew-okph">${esc(S.ewPhoneOk)} ${ic('check')}</b></div>` : ''}<div class="kv"><span>Account opening fee</span><b>${RM(FEE)}</b></div>
        <div class="kv"><span>Pay from</span><b>YouWallet · MYRT ${myrt(b)}</b></div>
        ${low ? `<div class="kv"><span>Top up first</span><b>${RM(short)}</b></div>` : ''}
        <div class="kv total"><span>Total</span><b>${RM(FEE)}</b></div></div>
      ${low ? `<div class="sp-short">${ic('alert')}<span><b>${RM(short)} short</b>Your MYRT covers ${RM(b)}. Choose how to top up the rest.</span></div>
        ${['Card','Stablecoins'].map(g => `<h3 class="sec" style="margin:4px 0 0; font-size:15px">${g === 'Card' ? 'Debit or Credit Card' : g}</h3><div class="pmlist" role="radiogroup" aria-label="Top up with: ${g === 'Card' ? 'debit or credit card' : 'stablecoins'}">${PM.filter(x => x.group === g).map(x => `<button class="pmrow pm2 ${m === x.k ? 'on' : ''}" role="radio" aria-checked="${m === x.k}" data-act="ewTm" data-k="${x.k}">${pmIcon(x)}<span><b>${x.name}</b><small>${x.sub}</small></span><i></i></button>`).join('')}</div>`).join('')}` : ''}
      <p class="t-caption subtle" style="margin:0">One-time fee. It isn’t added to your eWallet balance and shows as −${RM(FEE)} in your history.</p>
    </div></div>
    <div class="w2foot">${low && !busy ? `<p class="t-caption subtle" style="margin:0 0 8px; text-align:center">Uses MYRT ${myrt(b)} and tops up ${RM(short)} with ${mName}</p>` : ''}${btn(busy ? 'Opening your eWallet…' : low ? `Top up &amp; pay ${RM(FEE)}` : `Pay ${RM(FEE)} &amp; activate`, busy ? 'noop' : 'ewPay', {disabled:busy, loading:busy})}</div></div>`; };

  V.ewDone = () => { const n = NEXT[S.ewNext]; const r = S.ewRef || 'YA-EW-2611';
    return `<div class="screen bz">${statusBar()}${topBar('eWallet')}
    <div class="scroll"><div class="success" style="padding-top:4px">${cele()}<b class="bl-ok">eWallet activated</b><b class="sp-big">−${RM(FEE)}</b><span class="t-body subtle">Account opening fee</span></div>
    <div class="pad16 stack" style="padding-top:10px; gap:10px"><div class="kvbox sp-box">
      <div class="kv"><span>Account number</span><b>${ACCT} <button class="iconbtn sm" data-act="copy" data-v="${ACCT.replace(/ /g,'')}" aria-label="Copy account number">${ic('copy')}</button></b></div>
      ${S.ewPhoneOk ? `<div class="kv"><span>Phone number</span><b>${esc(S.ewPhoneOk)}</b></div>` : ''}<div class="kv"><span>Paid with</span><b>${S.ewPaidWith || 'YouWallet · MYRT'}</b></div>
      <div class="kv"><span>Reference</span><b>${r}</b></div>
      <div class="kv"><span>Date</span><b>${fmtD(S.ewAt || now())}</b></div></div></div></div>
    <div class="w2foot">${n ? btn(n[0], 'ewResume') + btn('Done', 'ewFinish', {kind:'btn-secondary'}) : btn('Done', 'ewFinish')}</div></div>`; };

  V.ewFail = () => `<div class="screen bz">${statusBar()}${topBar('eWallet')}<div class="scroll">${stateBlock('alert', 'We couldn’t open your eWallet', `If the ${RM(FEE)} opening fee was taken, it goes back to your YouWallet automatically within a few minutes.`, `<div class="stack" style="gap:10px; width:100%">${btn('Try again', 'ewRetry')}${btn('Not now', 'ewFinish', {kind:'btn-tertiary'})}</div>`)}</div></div>`;

  /* ---------- eWallet detail + Receive ---------- */
  V.ewDetail = () => { if (!on()) return V.wallets();
    const tx = ewTx();
    return `<div class="screen bz">${statusBar()}${topBar('eWallet')}
    <div class="scroll" style="padding-bottom:20px"><div class="pad16 stack" style="gap:14px; padding-top:4px">
      <div class="kvbox sp-box"><div class="kv"><span>Balance</span><b class="t-body-lg">${S.balHide ? '••••' : RM(ewBal())}</b></div>
        <div class="kv"><span>Account number</span><b>${ACCT} <button class="iconbtn sm" data-act="copy" data-v="${ACCT.replace(/ /g,'')}" aria-label="Copy account number">${ic('copy')}</button></b></div>
        <div class="kv"><span>Account name</span><b>${esc(XS_ME.n)}</b></div></div>
      <div class="ew-tools">${btn(ic('xsDown') + 'Receive', 'nav', {kind:'btn-secondary', data:'data-to="ewRecv"'})}${btn(ic('bill') + 'Pay bills', 'bills', {kind:'btn-secondary'})}</div>
      <section><h2 class="bl-cap">History</h2><div class="kvbox sp-box">${tx.length ? tx.map(x => `<div class="kv"><span>${esc(x.t)}<small class="subtle" style="display:block">${fmtD(x.at)}</small></span><b>${x.v < 0 ? '−' : '+'}${RM(Math.abs(x.v))}</b></div>`).join('') : '<p class="t-body subtle" style="margin:0">No activity yet.</p>'}</div></section>
      <p class="t-caption subtle" style="margin:0">Bills and reloads use your eWallet balance first, then convert MYRT 1:1.</p>
    </div></div></div>`; };

  V.ewRecv = () => { if (!on()) return V.wallets();
    return `<div class="screen bz">${statusBar()}${topBar('Receive to eWallet')}
    <div class="scroll"><div class="pad16 stack" style="gap:14px; padding-top:8px; padding-bottom:20px">
      <section class="xs-qr"><div class="xs-qrb">${qrSvg(523)}<span class="xs-qrav">${img('avatar','Elsa')}</span></div>
        <b>${esc(XS_ME.n)}</b><small>DuitNow QR · Scan with any banking or eWallet app</small></section>
      <div class="xs-addr"><small>eWallet account number</small><b class="mono">${ACCT}</b>
        <button data-act="copy" data-v="${ACCT.replace(/ /g,'')}">${ic('copy')}Copy number</button></div>
      <div class="xs-acc"><span><b>Ringgit only, by DuitNow</b><small>Money arrives in your eWallet balance. YouApp fee 0%.</small></span></div>
    </div></div>
    <div class="w2foot">${btn(ic('share') + 'Share QR', 'toast', {kind:'btn-secondary', data:'data-msg="Opens the share sheet with your DuitNow QR."'})}</div></div>`; };

  /* ---------- bills / reload: paid through the eWallet ---------- */
  const viaEw = h => h.replace('<div class="kv"><span>Pay from</span><b>YouWallet · MYRT', '<div class="kv"><span>Paid through</span><b>eWallet</b></div><div class="kv"><span>Funded from</span><b>YouWallet · MYRT')
    .replace('<b>YouWallet · MYRT</b></div>\n      <div class="kv total">', '<b>eWallet · from MYRT</b></div>\n      <div class="kv total">')
    .replace('Paid from your YouWallet.', 'Paid through your eWallet.');
  ['billConfirm', 'billReceipt', 'mreload'].forEach(k => { const o = V[k]; V[k] = () => viaEw(o()); });
  const _done = V.billDone;
  V.billDone = () => { const b = S.bill; if (b && !b.ewLogged) { b.ewLogged = true; const B = bl(b.id);
      ewTx().unshift({id:'ew-in-' + Date.now(), t:'Converted from MYRT', v:+b.amt, at:now()});
      ewTx().unshift({id:'ew-' + Date.now(), t:`${B.kind === 'phone' ? 'Mobile reload' : 'Bill payment'} · ${B.name}`, v:-(+b.amt), at:now()}); }
    return _done(); };

  /* history: the opening fee shows as −RM50 */
  const _hist = walletScanHistory;
  walletScanHistory = function(){ const list = _hist.apply(this, arguments);
    if (S.ewFeeAt) list.push({id:'ew-fee', m:S.ewFeeAt.toLocaleDateString('en-MY', {month:'short', year:'numeric'}), at:S.ewFeeAt,
      t:'eWallet account opening fee', d:fmtD(S.ewFeeAt), st:'Completed', v:-FEE, ic:'wallet2', kind:'ew'});
    return list.sort((a, b) => b.at - a.at); };
  window.__walletScanHistory = walletScanHistory;
  const _tx = A.walletReferenceTx;
  A.walletReferenceTx = el => { if ((el.dataset.id || '').startsWith('ew-')) { go(on() ? 'ewDetail' : 'wallets'); return; } return _tx ? _tx(el) : undefined; };

  Object.assign(A, {
    ewGate: el => { S.ewNext = el && el.dataset.n || null; S.sheet = 'ewGate'; render(); },
    ewStart: () => { S.sheet = null; S.ewBusy = false; S.ewPh = {cc:'+60', num:'', err:'', busy:false}; go('ewPhone'); },
    ewTm: el => { S.ewTm = el.dataset.k; render(); },
    ewCcOpen: () => { S.ewCcQ = ''; S.sheet = 'ewCc'; render(); },
    ewCcPick: el => { const f = S.ewPh; if (f.cc !== el.dataset.c) { f.cc = el.dataset.c; f.err = ''; } S.sheet = null; render(); setTimeout(() => keepFocus('ewNum'), 50); },
    ewSend: el => { const f = S.ewPh; if ((el && el.getAttribute && el.getAttribute('aria-disabled')) || f.busy) return;
      if (f.cc === '+60' && digits(f.num) === TAKEN) { f.err = 'This number is linked to another eWallet. Use a different number.'; render(); return; }
      f.busy = true; render(); setTimeout(() => { f.busy = false; f.otp = ''; f.otpErr = false; f.tries = 0; f.t = 30; go('ewOtp'); toast('Code sent to ' + fmtPh(f.cc, f.num) + '.'); ewTick(); }, 700); },
    ewChangeNum: () => { clearInterval(ewTimer); back(); setTimeout(() => keepFocus('ewNum'), 50); },
    ewResend: () => { const f = S.ewPh; f.otp = ''; f.otpErr = false; f.t = 30; render(); toast('New code sent.'); ewTick(); },
    ewVerify: el => { const f = S.ewPh; if ((el && el.getAttribute && el.getAttribute('aria-disabled')) || f.busy || (f.otp || '').length < 6 || f.tries >= 5) return;
      f.busy = true; render(); setTimeout(() => { f.busy = false;
        if (f.otp !== '123456') { f.tries = (f.tries || 0) + 1; f.otpErr = true; f.otp = ''; render(); keepFocus('ewOtpIn'); return; }
        clearInterval(ewTimer); S.ewPhoneOk = fmtPh(f.cc, f.num); const i = S.hist.lastIndexOf('ewPhone'); if (i >= 0) S.hist = S.hist.slice(0, i);
        go('ewConfirm', {replace:true}); toast('Phone number verified.'); }, 600); },
    ewPay: () => { if (S.ewBusy) return; const short = Math.max(0, FEE - bal()); S.ewBusy = true; render();
      setTimeout(() => { S.ewBusy = false;
        if (scen.ew === 'fail') { go('ewFail', {replace:true}); return; }
        const tm = PM.some(x => x.k === S.ewTm && x.k !== 'wallet') ? S.ewTm : 'card'; if (short > 0) S.ewPaidWith = `MYRT ${myrt(FEE - short)} + ${tm === 'card' ? 'Card' : PM.find(x => x.k === tm).name.split(' ')[0]} ${RM(short)}`;
        else { S.ewPaidWith = 'YouWallet · MYRT'; S.scanTopUpCents = (S.scanTopUpCents || 0) - FEE * 100; }
        if (short > 0) S.scanTopUpCents = (S.scanTopUpCents || 0) - Math.round((FEE - short) * 100);
        S.ewAt = S.ewFeeAt = now(); S.ewRef = 'YA-EW-' + String(Date.now()).slice(-6);
        ewTx().unshift({id:'ew-fee', t:'Account opening fee', v:-FEE, at:S.ewAt});
        scen.ew = 'on'; saveScen(); go('ewDone', {replace:true}); }, 1200); },
    ewRetry: () => { scen.ew = 'off'; saveScen(); go('ewConfirm', {replace:true}); },
    ewResume: () => { const n = S.ewNext; S.ewNext = null; const i = S.hist.lastIndexOf('ewConfirm'); if (i >= 0) S.hist = S.hist.slice(0, i);
      if (n === 'ewRecv') go('ewRecv', {replace:true}); else { S.screen = S.hist.pop() || 'home'; A[n](); } },
    ewFinish: () => { S.ewNext = null; const i = S.hist.lastIndexOf('ewConfirm'); if (i >= 0) S.hist = S.hist.slice(0, i); back(); },
    ewCryptoRecv: el => { S.wRecv = el.dataset.id; A.xsRecv(); },
  });

  /* panel state + META */
  const _st = window.__state;
  window.__state = () => Object.assign(_st ? _st() : {}, {ew: scen.ew === 'on' ? 'on' : scen.ew === 'fail' ? 'fail' : 'off', bal: scen.bal === 'low' ? 'low' : 'enough'});
  Object.assign(META, {
    ewPhone:{name:'eWallet · phone number', ph:1, rules:['Step 1 after Continue on the activation sheet. Verify the phone before paying, so a wrong code never costs money','Any country code (picker with search); +60 by default','Send code enabled once the number has the right length for that country','Number already linked to another eWallet: error under the field (demo 12-345 0000)']},
    ewOtp:{name:'eWallet · verify phone', ph:1, rules:['6-digit SMS code, auto-checks when 6 digits are in','Wrong code: error with tries left; 5 wrong codes lock for 10 minutes','Resend after 30 s; Change number goes back to step 1','Correct code: goes to the RM50 payment step with the number shown as verified; Back from there closes the flow']},
    ewConfirm:{name:'Activate eWallet', ph:1, rules:['Only needed for Receive (eWallet), Bill payment and Mobile reload. Scan to Pay does not need it','One-time RM50 account opening fee, not added to balance; shows as −RM50 in history','Paid from MYRT first; if short, top up the rest by debit or credit card or stablecoins (MYRT, USDT, USDC)','Existing KYC covers it, no extra screens','⚠️ Assumption: opening is instant (pending Kevon)']},
    ewDone:{name:'eWallet activated', ph:1, rules:['−RM50 account opening fee, account number, paid with, reference, date','Continue takes the user back into the flow they started (Bills, Reload or Receive)','⚠️ Assumption: account details are an account number + DuitNow QR']},
    ewFail:{name:'eWallet · opening failed', ph:1, rules:['Scenario eWallet › Fails next','⚠️ Assumption: a failed opening refunds the fee automatically']},
    ewDetail:{name:'eWallet', ph:1, rules:['Balance, account number and name, Receive and Pay bills, history incl. the opening fee','⚠️ Assumption: received MYR stays as eWallet balance and is used before MYRT']},
    ewRecv:{name:'Receive to eWallet', ph:1, rules:['DuitNow QR and account number with Copy and Share','Crypto wallets keep their own Receive (address QR) without the eWallet']},
  });
  if (META.home && META.home.rules) META.home.rules.push('Bill payment and Mobile reload tiles sit below Top up and Rewards. Both need the eWallet; if it is not active, the activation sheet opens first.');
  if (META.wallets && META.wallets.rules) META.wallets.rules.push('eWallet section under the currencies: Activate when off, balance when on (opens eWallet details).');
  try { render(); } catch(e) {}
})();
