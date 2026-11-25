/* ===== YouPage transaction status banner · 25 Nov 2026 =====
   After Scan to Pay, Top up or a membership payment, "Back to Wallet" lands on YouPage with a banner
   right under the balance card (above Scan to pay):
   - processing: stays until it finishes; View status
   - completed:  green tick, View details; goes away after it is opened or after a day (no close button, like the live app)
   - failed:     red, Try again; stays until retried or dismissed
   - several:    one banner, "2 transactions in progress", View all
   Scenario panel: "YouPage transaction banner" (None / Processing / Completed / Failed / 2 in progress). */
(function(){
  const RMx = v => 'RM' + Math.abs(+v).toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2});
  const DEMO = {
    processing:{status:'processing', kind:'topup', title:'Top up processing', sub:'+100.00 MYRT to YouWallet'},
    done:{status:'done', kind:'topup', title:'Top up complete', sub:'+100.00 MYRT added to YouWallet'},
    failed:{status:'failed', kind:'pay', title:'Payment failed', sub:'RM45.90 · Mydin Mart'},
    multi:{status:'multi', kind:'multi', title:'2 transactions in progress', sub:'Top up +RM100.00 · Payment −RM12.50'},
  };
  const current = () => { const sc = scen.txb || 'none'; if (sc !== 'none') return S.txbHidden === sc ? null : DEMO[sc]; return S.txb && !S.txb.hidden ? S.txb : null; };
  /* Same component as the live app: kind icon, title, short subtitle, status line (icon + action), chevron. Whole card is one tap. */
  const STATUS_IC = {processing:'clock', done:'check', failed:'alert', multi:'clock'};
  const KIND_IC = {topup:'plus', pay:'scan', sub:'crown', multi:'clock'};
  const banner = b => { const failed = b.status === 'failed', done = b.status === 'done';
    const act = failed ? ['Try again', 'txbRetry'] : done ? ['View details', 'txbView'] : b.status === 'multi' ? ['View all', 'txbView'] : ['View status', 'txbView'];
    return `<div class="txb ${b.status}" role="status">
      <button class="txb-main" data-act="${act[1]}" aria-label="${esc(b.title)}. ${esc(b.sub)}. ${act[0]}"><span class="txb-ic" aria-hidden="true">${ic(KIND_IC[b.kind] || 'clock')}</span>
        <span class="txb-tx"><b>${esc(b.title)}</b><small>${esc(b.sub)}</small><em>${ic(STATUS_IC[b.status])}${act[0]}</em></span>
        <span class="txb-chev" aria-hidden="true">${ic('chev')}</span></button></div>`; };

  const _home = V.home;
  V.home = () => { const h = _home(); const b = current(); if (!b) return h;
    const t = document.createElement('template'); t.innerHTML = h; const scan = t.content.querySelector('.scanbtn');
    if (!scan) return h; scan.insertAdjacentHTML('beforebegin', banner(b)); return t.innerHTML; };

  /* record real flows when their result screen opens */
  let seen = '';
  const record = () => { const to = S.screen; const key = to + ':' + (S.walletTopUps?.[0]?.id || '') + ':' + (S.ck?.result || '') + ':' + (S.pay?.id || '');
    if (key === seen) return; seen = key;
    try {
      if (to === 'walletTopUpDone' && S.walletTopUps && S.walletTopUps[0]) { const x = S.walletTopUps[0];
        S.txb = {status:'done', kind:'topup', title:'Top up complete', sub:`+${x.units.toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2})} ${x.key === 'MYR' ? 'MYRT' : x.key} added to YouWallet`, receipt:'walletTopUpReceipt', id:x.id, at:Date.now()}; }
      if (to === 'done' && typeof walletScanRecord === 'function') { const x = walletScanRecord();
        if (x) S.txb = x.status === 'Failed' ? {status:'failed', kind:'pay', title:'Payment failed', sub:`${RMx(x.amount)} · ${x.merchant}`, at:Date.now()}
          : x.status === 'Pending' ? {status:'processing', kind:'pay', title:'Payment processing', sub:`${RMx(x.amount)} to ${x.merchant}`, receipt:'scanReceipt', id:x.id, at:Date.now()}
          : {status:'done', kind:'pay', title:`Paid ${x.merchant}`, sub:`−${RMx(x.amount)}${x.cashback ? ` · +${RMx(x.cashback)} cashback` : ''}`, receipt:'scanReceipt', id:x.id, at:Date.now()}; }
      if (to === 'ckResult' && S.ck) { const plan = (typeof TIERS !== 'undefined' && TIERS[S.ck.plan] && TIERS[S.ck.plan].name) || 'Membership';
        S.txb = S.ck.result === 'ok' ? {status:'done', kind:'sub', title:`${plan} membership active`, sub:'Payment complete', at:Date.now()}
          : {status:'failed', kind:'sub', title:`${plan} payment failed`, sub:'You weren’t charged', retry:'checkout', at:Date.now()}; }
      if (S.txb && S.txb.status === 'done' && Date.now() - (S.txb.at || 0) > 864e5) S.txb.hidden = true;
    } catch (e) {} };
  const _render = render; render = function(){ record(); return _render.apply(this, arguments); };

  Object.assign(A, {
    txbView: () => { const b = current(); if (!b) return;
      if (b.status === 'done') { if ((scen.txb || 'none') !== 'none') S.txbHidden = scen.txb; else S.txb.hidden = true; }
      if (b.receipt && b.id) { S.txId = b.id; S.scanReceiptFrom = 'history'; go(b.receipt); return; }
      A.walletScanHistory ? A.walletScanHistory() : toast('Opens your transaction history.'); },
    txbHide: () => { if ((scen.txb || 'none') !== 'none') S.txbHidden = scen.txb; else if (S.txb) S.txb.hidden = true; render(); },
    txbRetry: () => { const b = current(); if ((scen.txb || 'none') !== 'none') S.txbHidden = scen.txb; else if (S.txb) S.txb.hidden = true;
      if (b && b.retry) { go(b.retry); return; } if (A.nav) A.nav({dataset:{to:'scan'}}); else render(); },
  });

  /* scenario panel: show it on YouPage */
  const _set = window.__set; window.__set = (k, v) => { if (k === 'txb') { scen.txb = v; S.txbHidden = null; try { saveScen(); } catch (e) {} S.sheet = null; S.hist = []; S.screen = 'home'; render(); return; } return _set ? _set(k, v) : undefined; };

  document.head.insertAdjacentHTML('beforeend', `<style id="txb-css">
  .wallet-reference .txb, .txb{margin:12px 16px 0; border:1px solid #ECE7F7; border-radius:16px; background:#fff; box-shadow:0 1px 2px rgba(30,16,80,.04)}
  .txb-main{width:100%; display:flex; align-items:center; gap:12px; min-height:72px; padding:12px 8px 12px 12px; border:0; border-radius:16px; background:none; text-align:left; font:inherit; color:inherit; cursor:pointer}
  .txb-main:active{background:#FAF8FE}
  .txb-ic{flex:none; display:grid; place-items:center; width:44px; height:44px; border-radius:50%; background:#F4EFFF; color:#4B2A9E} .txb-ic .ico, .txb-ic svg{width:22px; height:22px}
  .txb-tx{flex:1; display:grid; gap:2px; min-width:0} .txb-tx b{font:700 15px/20px Inter, sans-serif; color:#1a181b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
  .txb-tx small{font:500 12px/16px Inter, sans-serif; color:#6E6688; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
  .txb-tx em{display:inline-flex; align-items:center; gap:4px; margin-top:2px; font:700 12px/16px Inter, sans-serif; font-style:normal; color:#A26C00} .txb-tx em .ico, .txb-tx em svg{width:14px; height:14px; flex:none}
  .txb.done .txb-tx em{color:#0B6B4B} .txb.failed .txb-tx em{color:#B42318}
  .txb-chev{flex:none; display:grid; place-items:center; width:24px; color:#9A92B0} .txb-chev .ico, .txb-chev svg{width:18px; height:18px}
  .txb-main:focus-visible{outline:2px solid #5E35B8; outline-offset:-2px}
  .txb + .scanbtn{margin-top:12px}
  </style>`);

  if (META.home && META.home.rules) META.home.rules.push('Transaction banner (25 Nov) under the balance card after Scan to Pay, Top up or a membership payment: processing (View status), completed (View details, gone once opened or after a day), failed (Try again), several (View all). Same card as the live app: kind icon, title, subtitle, status line, chevron; no close button. Scenario: YouPage transaction banner');
})();
