/* ===== YouPage transaction status banner · 25 Nov 2026 =====
   After Scan to Pay, Top up or a membership payment, "Back to Wallet" lands on YouPage with a banner
   right under the balance card (above Scan to pay):
   - processing: stays until it finishes; View status
   - completed:  green tick, View details; goes away after it is opened, dismissed (x) or after a day
   - failed:     red, Try again; stays until retried or dismissed
   - several:    one banner, "2 transactions in progress", View all
   Scenario panel: "YouPage transaction banner" (None / Processing / Completed / Failed / 2 in progress). */
(function(){
  const RMx = v => 'RM' + Math.abs(+v).toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2});
  const DEMO = {
    processing:{status:'processing', kind:'topup', title:'Top up processing', sub:'+RM100.00 MYRT · usually under 2 minutes'},
    done:{status:'done', kind:'topup', title:'Top up complete', sub:'+RM100.00 added to YouWallet'},
    failed:{status:'failed', kind:'pay', title:'Payment failed', sub:'RM45.90 to Mydin Mart · you weren’t charged'},
    multi:{status:'multi', kind:'multi', title:'2 transactions in progress', sub:'Top up +RM100.00 · Payment −RM12.50'},
  };
  const current = () => { const sc = scen.txb || 'none'; if (sc !== 'none') return S.txbHidden === sc ? null : DEMO[sc]; return S.txb && !S.txb.hidden ? S.txb : null; };
  const ICON = {processing:'clock', done:'check', failed:'alert', multi:'clock'};
  const banner = b => { const failed = b.status === 'failed', done = b.status === 'done';
    const act = failed ? ['Try again', 'txbRetry'] : done ? ['View details', 'txbView'] : b.status === 'multi' ? ['View all', 'txbView'] : ['View status', 'txbView'];
    return `<div class="txb ${b.status}" role="status">
      <button class="txb-main" data-act="txbView" aria-label="${esc(b.title)}. ${esc(b.sub)}. ${act[0]}"><span class="txb-ic" aria-hidden="true">${ic(ICON[b.status])}</span>
        <span class="txb-tx"><b>${esc(b.title)}</b><small>${esc(b.sub)}</small><em data-act="${act[1]}">${act[0]}</em></span></button>
      ${done || failed ? `<button class="txb-x" data-act="txbHide" aria-label="Dismiss">${ic('close')}</button>` : `<span class="txb-chev" aria-hidden="true">${ic('chev')}</span>`}</div>`; };

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
        if (x) S.txb = x.status === 'Failed' ? {status:'failed', kind:'pay', title:'Payment failed', sub:`${RMx(x.amount)} to ${x.merchant} · you weren’t charged`, at:Date.now()}
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
  .wallet-reference .txb, .txb{display:flex; align-items:center; gap:4px; margin:12px 16px 0; padding:0 4px 0 0; border:1px solid #eae3f8; border-radius:16px; background:#fff}
  .txb.processing, .txb.multi{border-color:#F6E3B4; background:#FFFBF0} .txb.done{border-color:#CDEBDB; background:#F3FBF6} .txb.failed{border-color:#F6CACA; background:#FFF6F6}
  .txb-main{flex:1; min-width:0; display:flex; align-items:center; gap:12px; padding:12px 6px 12px 12px; border:0; background:none; text-align:left; font:inherit; color:inherit; cursor:pointer}
  .txb-ic{flex:none; display:grid; place-items:center; width:40px; height:40px; border-radius:50%; background:#fff} .txb-ic .ico, .txb-ic svg{width:20px; height:20px}
  .txb.processing .txb-ic, .txb.multi .txb-ic{color:#A26C00; box-shadow:0 0 0 1px #F6E3B4} .txb.done .txb-ic{color:#fff; background:#2FA36B} .txb.failed .txb-ic{color:#fff; background:#D93B3B}
  .txb-tx{display:grid; gap:2px; min-width:0} .txb-tx b{font:700 14px/20px Inter, sans-serif; color:#1a181b}
  .txb-tx small{font:500 12px/16px Inter, sans-serif; color:#5d4c79; overflow-wrap:anywhere} .txb-tx em{font:700 13px/18px Inter, sans-serif; font-style:normal; color:#5E35B8; margin-top:2px}
  .txb.failed .txb-tx em{color:#B42318}
  .txb-x{flex:none; display:grid; place-items:center; width:40px; height:40px; border:0; border-radius:50%; background:none; color:#6E6688; cursor:pointer} .txb-x .ico, .txb-x svg{width:18px; height:18px}
  .txb-chev{flex:none; display:grid; place-items:center; width:32px; color:#9A92B0} .txb-chev .ico, .txb-chev svg{width:18px; height:18px}
  .txb-main:focus-visible, .txb-x:focus-visible{outline:2px solid #5E35B8; outline-offset:-2px; border-radius:14px}
  .txb + .scanbtn{margin-top:12px}
  </style>`);

  if (META.home && META.home.rules) META.home.rules.push('Transaction banner (25 Nov) under the balance card after Scan to Pay, Top up or a membership payment: processing (View status), completed (View details, x, gone after a day), failed (Try again, x), several (View all). Scenario: YouPage transaction banner');
})();
