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
  const fmtD = d => d.toLocaleString('en-MY', {dateStyle:'medium', timeStyle:'short'});

  /* ---------- styles (reuse wallet tokens; only layout for the new pieces) ---------- */
  const css = document.createElement('style');
  css.textContent = `
  .ew-ic{display:grid; place-items:center; color:#4B2A9E; background:#F4EFFF}
  .ew-ic svg{width:20px; height:20px}
  .cr.ew-row .rt a{font-weight:700; color:#5E35B8; text-decoration:none}
  .cr.ew-row small.ew-sub{display:block; font-weight:500; color:#6E6688; margin-top:2px}
  .ew-unlock{display:grid; gap:10px; margin:0; padding:0; list-style:none}
  .ew-unlock li{display:flex; gap:12px; align-items:center}
  .ew-unlock li > span{display:grid; place-items:center; width:36px; height:36px; flex:none; border-radius:12px; background:#F4EFFF; color:#4B2A9E}
  .ew-unlock li > span svg{width:20px; height:20px}
  .ew-unlock b{display:block} .ew-unlock small{color:#6E6688}
  .ew-hero{display:grid; justify-items:center; gap:6px; text-align:center; padding:8px 0 4px}
  .ew-hero .ew-ic{width:56px; height:56px; border-radius:18px} .ew-hero .ew-ic svg{width:28px; height:28px}
  .ew-hero p{margin:0; color:#6E6688}
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
      <div><h2 class="t-title" style="margin:0">${n ? `Activate your eWallet to ${n[0].toLowerCase()}` : 'Activate your eWallet'}</h2>
        <p class="t-body muted" style="margin:4px 0 0">Bill payment, mobile reload and receiving ringgit run on your eWallet. Scan to Pay works without it.</p></div>
      <div class="kvbox sp-box"><div class="kv"><span>Account opening fee</span><b>${RM(FEE)}</b></div><div class="kv"><span>Charged</span><b>Once</b></div><div class="kv"><span>Identity check</span><b>Already done</b></div></div>
      ${btn('Continue', 'ewStart')}${btn('Not now', 'closeSheet', {kind:'btn-tertiary'})}</div>`; };

  /* ---------- activation ---------- */
  V.ewConfirm = () => { const b = bal(); const short = Math.max(0, FEE - b); const low = short > 0; const busy = S.ewBusy;
    const m = S.ewTm || 'duitnow';
    return `<div class="screen bz">${statusBar()}${topBar('Activate eWallet')}
    <div class="scroll" style="padding-bottom:16px"><div class="pad16 stack" style="gap:14px; padding-top:4px">
      <div class="ew-hero">${ewIc()}<b class="t-body-lg">Your ringgit eWallet</b><p>Opens instantly with the ID you already verified.</p></div>
      <ul class="ew-unlock">
        <li><span>${ic('xsDown')}</span><div><b>Receive ringgit</b><small>Get paid by DuitNow from any bank or eWallet</small></div></li>
        <li><span>${ic('bill')}</span><div><b>Pay bills</b><small>TNB, Air Selangor, Unifi and more</small></div></li>
        <li><span>${ic('mreload')}</span><div><b>Mobile reload</b><small>Maxis, CelcomDigi, U Mobile and more</small></div></li>
      </ul>
      <div class="kvbox sp-box">
        <div class="kv"><span>Account opening fee</span><b>${RM(FEE)}</b></div>
        <div class="kv"><span>Pay from</span><b>YouWallet · MYRT ${myrt(b)}</b></div>
        ${low ? `<div class="kv"><span>Top up first</span><b>${RM(short)}</b></div>` : ''}
        <div class="kv total"><span>Total</span><b>${RM(FEE)}</b></div></div>
      ${low ? `<div class="sp-short">${ic('alert')}<span><b>${RM(short)} short</b>Choose how to add the rest. We use your MYRT first.</span></div>
        <div class="bl-pm" role="radiogroup" aria-label="Top up with">${[['applepay','Apple Pay','Pay with Face ID'],['duitnow','DuitNow Transfer','Ringgit · from your bank'],['card','Debit or Credit Card','Visa, Mastercard']].map(([k,n,s]) => { const p = PM.find(x => x.k === k) || {k}; return `<button role="radio" aria-checked="${m===k}" class="${m===k?'on':''}" data-act="ewTm" data-k="${k}">${pmIcon(p)}<span><b>${n}</b><small>${s}</small></span><i class="rd"></i></button>`; }).join('')}</div>` : ''}
      <p class="t-caption subtle" style="margin:0">The ${RM(FEE)} is a one-time account opening fee. It is not added to your eWallet balance. It shows as −${RM(FEE)} in your history.</p>
    </div></div>
    <div class="w2foot">${btn(busy ? 'Opening your eWallet…' : low ? `Top up ${RM(short)} &amp; activate` : `Pay ${RM(FEE)} &amp; activate`, busy ? 'noop' : 'ewPay', {disabled:busy, loading:busy})}</div></div>`; };

  V.ewDone = () => { const n = NEXT[S.ewNext]; const r = S.ewRef || 'YA-EW-2611';
    return `<div class="screen bz">${statusBar()}${topBar('eWallet')}
    <div class="scroll"><div class="success" style="padding-top:4px">${cele()}<b class="bl-ok">eWallet activated</b><b class="sp-big">−${RM(FEE)}</b><span class="t-body subtle">Account opening fee</span></div>
    <div class="pad16 stack" style="padding-top:10px; gap:10px"><div class="kvbox sp-box">
      <div class="kv"><span>Account number</span><b>${ACCT} <button class="iconbtn sm" data-act="copy" data-v="${ACCT.replace(/ /g,'')}" aria-label="Copy account number">${ic('copy')}</button></b></div>
      <div class="kv"><span>Paid with</span><b>${S.ewPaidWith || 'YouWallet · MYRT'}</b></div>
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
    ewStart: () => { S.sheet = null; S.ewBusy = false; go('ewConfirm'); },
    ewTm: el => { S.ewTm = el.dataset.k; render(); },
    ewPay: () => { if (S.ewBusy) return; const short = Math.max(0, FEE - bal()); S.ewBusy = true; render();
      setTimeout(() => { S.ewBusy = false;
        if (scen.ew === 'fail') { go('ewFail', {replace:true}); return; }
        const names = {applepay:'Apple Pay', duitnow:'DuitNow', card:'Card'};
        if (short > 0) S.ewPaidWith = `MYRT ${myrt(FEE - short)} + ${names[S.ewTm || 'duitnow']} ${RM(short)}`;
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
  window.__state = () => Object.assign(_st ? _st() : {}, {ew: scen.ew === 'on' ? 'on' : scen.ew === 'fail' ? 'fail' : 'off'});
  Object.assign(META, {
    ewConfirm:{name:'Activate eWallet', ph:1, rules:['Only needed for Receive (eWallet), Bill payment and Mobile reload. Scan to Pay does not need it','One-time RM50 account opening fee, not added to balance; shows as −RM50 in history','Paid from MYRT first; if short, top up the rest (Apple Pay, DuitNow, card)','Existing KYC covers it, no extra screens','⚠️ Assumption: opening is instant (pending Kevon)']},
    ewDone:{name:'eWallet activated', ph:1, rules:['−RM50 account opening fee, account number, paid with, reference, date','Continue takes the user back into the flow they started (Bills, Reload or Receive)','⚠️ Assumption: account details are an account number + DuitNow QR']},
    ewFail:{name:'eWallet · opening failed', ph:1, rules:['Scenario eWallet › Fails next','⚠️ Assumption: a failed opening refunds the fee automatically']},
    ewDetail:{name:'eWallet', ph:1, rules:['Balance, account number and name, Receive and Pay bills, history incl. the opening fee','⚠️ Assumption: received MYR stays as eWallet balance and is used before MYRT']},
    ewRecv:{name:'Receive to eWallet', ph:1, rules:['DuitNow QR and account number with Copy and Share','Crypto wallets keep their own Receive (address QR) without the eWallet']},
  });
  if (META.home && META.home.rules) META.home.rules.push('Bill payment and Mobile reload tiles sit below Top up and Rewards. Both need the eWallet; if it is not active, the activation sheet opens first.');
  if (META.wallets && META.wallets.rules) META.wallets.rules.push('eWallet section under the currencies: Activate when off, balance when on (opens eWallet details).');
  try { render(); } catch(e) {}
})();
