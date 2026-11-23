/* Wallet 19 Nov · You Page, Scan to Pay, and the YouApp Wallet receipt. */
(function () {
  const previousHome = V.home;
  const previousScan = V.scan;
  const previousConfirm = V.confirm;
  const previousDone = V.done;
  const goWalletHome = () => A.nav({dataset:{to:'home'}});
  const action = (label, act, icon, detail = '') =>
    `<button type="button" data-act="${act}">${ic(icon)}<span>${label}</span>${detail}</button>`;
  const statusLabel = tx => tx.status === 'Completed' ? 'Paid' : tx.status;
  const dateLabel = tx => tx.paidAt.toLocaleString('en-MY', {dateStyle:'medium', timeStyle:'short'});
  const details = tx => [
    ['Recipient Receives', RM(tx.amount)],
    ['Payment Fee', RM(tx.fee)],
    ...(tx.rebate ? [['Fee Rebate', '−' + RM(tx.rebate)]] : []),
    [tx.status === 'Completed' ? 'Total Debited' : 'Payment Total', RM(tx.totalCents / 100)],
  ];
  const rows = (pairs) => pairs.map(([label, value]) =>
    `<div class="kv"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('');

  V.home = () => {
    if (!kycOk()) return previousHome();
    const tier = T();
    const mainWallet = wMain();
    const hasYouApp = wHasYa();
    const shownBalance = hasYouApp ? RM(bal()) : RM(wRM(mainWallet));
    const last = S.scanPayments?.[0];
    const latest = last
      ? `<button class="wp19-row" data-act="txOpen" data-id="${last.id}">${ic('receipt')}<span><b>${esc(last.merchant)}</b><small>${dateLabel(last)} · ${statusLabel(last)}</small></span><em>${S.balHide ? '••••' : RM(last.totalCents / 100)}</em>${ic('chev')}</button>`
      : '<p class="wp19-muted" style="margin:0">Your latest Scan to Pay payment will appear here.</p>';
    return `<div class="screen">${statusBar()}${youTabs('you')}
      <div class="scroll wp19-content">
        <section class="wp19-balance" aria-label="Wallet balance">
          <span class="yb-leaf" aria-hidden="true">${LEAF}</span>
          <div class="row-between">
            <b>${hasYouApp ? 'YouApp Wallet Balance' : esc(mainWallet.name) + ' · Estimated Balance'}</b>
            <button class="yb-badge" data-act="tierInfo" aria-label="${tier.name} tier benefits">${ic('crown')}${tier.name}</button>
          </div>
          <div class="row-between"><strong>${S.balHide ? '••••' : shownBalance}</strong>
            <button class="yb-eye" data-act="balEye" aria-label="${S.balHide ? 'Show' : 'Hide'} balance">${ic(S.balHide ? 'eyeoff' : 'eye')}</button>
          </div>
          <button class="wp19-view" data-act="nav" data-to="wallets">View Wallets ${ic('chev')}</button>
        </section>
        ${btn(ic('scan') + 'Scan to Pay', 'nav', {cls:'wp19-primary', data:'data-to="scan"'})}
        <div class="wp19-home-actions">${action('Top Up', 'topUpOpen', 'plus')}
          ${P() >= 2 ? `<button data-act="rewards" data-tab="all">${ic('gift')}<span>Rewards</span><small>${S.balHide ? '••••' : RM(rewardsTotal())}</small></button>` : ''}
        </div>
        <button class="wp19-row wp19-invite" data-act="nav" data-to="invite">${ic('userplus')}<span><b>Invite Friends</b><small>Earn ${tier.ref}% when referred friends pay</small></span>${ic('chev')}</button>
        ${ybStrip(tier, true)}
        <section aria-label="Last payment">
          <h2 class="wp19-label">Last Payment <button class="link" data-act="walletScanHistory">History</button></h2>
          ${latest}
        </section>
        <section aria-labelledby="wallet-tools">
          <h2 class="wp19-label" id="wallet-tools" style="margin-bottom:8px">Wallet and Activities</h2>
          <div class="wp19-tools">
            ${action('Send', 'xsOpen', 'xsUp')}${action('Receive', 'xsRecv', 'xsDown')}
            ${action('Pay Bills', 'bills', 'bill')}${action('Booking Balance', 'walletBooking', 'cal')}
            ${action('My Activities', 'actMineW', 'cal')}
          </div>
        </section>
        <button class="wp19-row wp19-profile" data-act="editProfile"><img src="${FG.elsa}" alt=""><span><b>Your Profile</b><small>Elsa Japasal · ID verified</small></span>${ic('chev')}</button>
      </div></div>`;
  };

  V.walletBooking = () => `<div class="screen">${statusBar()}${topBar('Booking Balance')}
    <div class="scroll wp19-content"><section class="wp19-balance"><strong>${S.balHide ? '••••' : '0.00 MYRT'}</strong></section>
    <p class="wp19-muted">Booking Balance holds what you pay for bookings until the session is done. It isn’t used for Scan to Pay.</p></div></div>`;

  V.scan = () => {
    if (!kycOk()) return previousScan();
    return `<div class="screen wp19-scan">${statusBar()}
      <div class="topbar"><button class="iconbtn" data-act="back" aria-label="Close scanner">${ic('close')}</button>
        <span class="t-headline" style="flex:1;text-align:center">Scan to Pay</span>
        <button class="iconbtn" data-act="scanFlash" aria-label="Flash" aria-pressed="${Boolean(S.scanFlash)}">${ic('flash')}</button></div>
      <div class="scroll"><div class="wp19-scan-content">
        <button class="wp19-scan-camera" data-act="sheet" data-s="scanSim" aria-label="Simulate scanning a QR code"><img src="${SCAN_IMG.cam}" alt=""></button>
        <b class="t-headline">Point at a DuitNow QR</b>
        <p>Use a shop’s or a friend’s payment QR.</p>
        ${btn('Upload From Photos', 'sheet', {kind:'btn-secondary', cls:'wp19-scan-btn', data:'data-s="gallery"'})}
        <div class="wp19-tools">${action('Receive QR', 'myQr', 'qr')}${action('Enter Wallet Address', 'xsAddr', 'xsWallet')}</div>
      </div></div></div>`;
  };

  V.confirm = () => {
    if (wMain().ext && !S.payYa) return previousConfirm();
    const merchant = MERCH[S.pay.id];
    const amount = Number(S.pay.amt) || 0;
    const tier = T();
    const {fee, reb, total} = spFees(amount);
    const low = total > bal();
    const overLimit = amount > tier.per;
    const unavailable = !kycOk() || !wHasYa();
    const disabled = !amount || overLimit || unavailable || S.busy;
    const keypad = !merchant.fixed ? `<div class="wp19-keys" role="group" aria-label="Amount keypad">${['1','2','3','4','5','6','7','8','9','.','0','del'].map(key => {
      const del = key === 'del';
      return `<button type="button" data-act="${del ? 'kpDel' : 'kp'}" data-k="${key}" aria-label="${del ? 'Delete digit' : key === '.' ? 'Decimal point' : key}" ${S.busy ? 'disabled' : ''}>${del ? ic('del') : key}</button>`;
    }).join('')}</div>` : '';
    return `<div class="screen wp19-pay">${statusBar()}${topBar('Pay')}
      <div class="scroll wp19-content">
        <div class="wp19-pay-merchant">${img(merchant.img, '')}<b>${esc(merchant.name)}</b><small class="wp19-muted">${SP_MERCH_SUB(merchant)}</small></div>
        <h1 class="wp19-amount"><small>${merchant.fixed ? 'Fixed Amount' : 'Payment Amount'}</small>RM ${esc(S.pay.amt || '0.00')}</h1>
        <div class="wp19-summary">
          ${rows([['Pay From', 'YouApp Wallet · ' + RM(bal())], ['Recipient Receives', RM(amount)], ['Payment Fee · ' + tier.name, RM(fee)]])}
          ${tier.floor ? `<p class="wp19-muted" style="margin:0 0 7px">${tier.fee.toFixed(2)}% · minimum ${RM(tier.floor)}</p>` : ''}
          ${rebRow(reb)}
          <div class="kv wp19-total"><b>You Pay</b><b>${RM(total)}</b></div>
        </div>
        ${unavailable ? '<p class="sp-err">An active YouApp Wallet is required to pay from this balance.</p>' : ''}
        ${overLimit ? `<p class="sp-err">Your ${tier.name} per-payment limit is ${RM(tier.per)}.</p>` : ''}
        ${overLimit && NEXT[tier.key] ? '<button class="link" data-act="upgrade">See Plans</button>' : ''}
        ${low && !overLimit && !unavailable ? `<p class="sp-short">${ic('alert')} Top up at least ${RM(total - bal())} to cover this payment.</p>` : ''}
        ${merchant.kind === 'personal' ? '<p class="wp19-muted">Check the recipient’s name. Personal DuitNow payments can’t be reversed.</p>' : ''}
        ${keypad}
      </div>
      <div class="w2foot">${btn(S.busy ? 'Processing Payment' : low && !overLimit ? 'Top Up &amp; Pay' : 'Pay ' + RM(total),
        low ? 'spTopUp' : 'spPay', {disabled, loading:S.busy})}</div></div>`;
  };

  V.done = () => {
    const tx = walletScanRecord();
    if (!tx || tx.status !== 'Completed') return previousDone();
    return `<div class="screen">${statusBar()}${topBar('Payment Complete')}
      <div class="scroll wp19-hero">${cele()}<span class="wp19-status paid">${ic('check')} Paid</span>
        <h1 class="wp19-amount"><small>Recipient Receives</small>${RM(tx.amount)}</h1><p>To ${esc(tx.merchant)} via DuitNow QR</p></div>
      <div class="w2foot">${btn('See Receipt', 'walletScanReceipt')}</div></div>`;
  };

  V.scanReceipt = () => {
    const tx = walletScanRecord();
    if (!tx) return `<div class="screen">${statusBar()}${topBar('Payment Details')}<div class="scroll wp19-hero"><p>Payment details are unavailable.</p></div></div>`;
    const paid = tx.status === 'Completed';
    const pending = tx.status === 'Pending';
    return `<div class="screen">${statusBar()}${topBar(paid ? 'Receipt' : 'Payment Details')}
      <div class="scroll wp19-content">
        <div class="wp19-hero"><span class="wp19-status ${statusLabel(tx).toLowerCase()}" role="status">${ic(paid ? 'check' : pending ? 'clock' : 'alert')} ${statusLabel(tx)}</span>
          <h1 class="wp19-amount"><small>${paid ? 'Recipient Receives' : 'Requested Amount'}</small>${RM(tx.amount)}</h1>
          <p>${esc(tx.merchant)} · DuitNow QR</p>
          ${pending ? '<p class="wp19-muted">Your payment is still processing. Check its status before paying again.</p>' : paid ? '' : '<p class="wp19-muted">The payment did not go through. The payment amount and fee were not debited.</p>'}</div>
        <section class="wp19-summary" aria-label="Payment breakdown">${rows(details(tx).map(([label, value], i) =>
          i === 0 && !paid ? ['Requested Amount', value] : [label, value]))}</section>
        <section class="wp19-summary" aria-label="Transaction details">${rows([
          ['Paid From', tx.funding ? `${tx.funding.name} · ${tx.funding.key}` : 'YouApp Wallet · MYRT'], ['Plan', tx.tier], ['Reference', tx.id.toUpperCase()], ['Date', dateLabel(tx)],
          ...(paid && tx.cashback ? [['Cashback', RM(tx.cashback)]] : []),
        ])}</section>
      </div><div class="w2foot">
        ${pending ? btn('Check Payment Status', 'walletScanCheck') : paid ? btn('Done', 'walletScanClose') : btn('Try Again', 'walletScanRetry')}
        ${paid ? `<div class="wp19-tools">${action('Copy Reference', 'walletScanCopy', 'copy')}${action('Share', 'walletScanShare', 'share')}</div>` : btn('Back to Wallet', 'walletScanHome', {kind:'btn-tertiary'})}
      </div></div>`;
  };

  Object.assign(A, {
    walletBooking: () => go('walletBooking'),
    walletScanHistory: () => { S.txF = 'all'; S.txTab = 'tx'; go('scanHistory'); },
    walletScanHome: goWalletHome,
    scanFlash: () => { S.scanFlash = !S.scanFlash; render(); toast(S.scanFlash ? 'Flash on.' : 'Flash off.'); },
    walletScanReceipt: () => go('scanReceipt', {replace:true}),
    walletScanClose: () => S.scanReceiptFrom === 'history' && S.hist.length ? back() : goWalletHome(),
    walletScanCopy: () => {
      const tx = walletScanRecord();
      if (tx) A.copy({dataset:{v:tx.id.toUpperCase()}});
    },
    walletScanShare: () => {
      const tx = walletScanRecord();
      if (tx?.status !== 'Completed') return;
      SHR.open({
        title:'Paid', amount:RM(tx.amount), sub:`to ${tx.merchant} · DuitNow QR`,
        ref:tx.id.toUpperCase(), caption:SHR.caption('pay'),
        tx:[['Reference', tx.id.toUpperCase()], ['Transaction Type', 'DuitNow QR'], ['Timestamp', dateLabel(tx)]],
        pay:details(tx).slice(0, -1), total:details(tx).at(-1),
      });
    },
    walletScanCheck: () => {
      const tx = walletScanRecord();
      if (tx?.status !== 'Pending') return;
      settleWalletScan(tx);
      render();
    },
    walletScanRetry: () => {
      const tx = walletScanRecord();
      if (tx?.status !== 'Failed') return;
      S.pay = {id:tx.merchantId, amt:tx.amount.toFixed(2), source:tx.funding ? {wallet:tx.funding.wallet, key:tx.funding.key} : null};
      S.payYa = !tx.funding;
      S.txId = null;
      go('confirm', {replace:true});
    },
  });
  for (const act of ['kp', 'kpDel']) {
    const keypadAction = A[act];
    A[act] = el => {
      const scroll = document.querySelector('.wp19-pay .scroll, .wallet-reference > .scroll');
      const top = scroll?.scrollTop;
      const hadFocus = document.activeElement === el;
      keypadAction(el);
      const next = document.querySelector('.wp19-pay .scroll, .wallet-reference > .scroll');
      if (next && top !== undefined) {
        next.scrollTop = top;
        if (hadFocus) next.querySelector(`[data-act="${act}"][data-k="${el.dataset.k}"]`)?.focus({preventScroll:true});
      }
    };
  }

  META.home.rules.push('19 Nov · Scan to Pay is primary. Top Up, Rewards, Wallets and existing Send, Receive, Bills, Booking Balance and Activities stay accessible.');
  META.confirm.rules.push('19 Nov · The payment summary separates the recipient amount, fee and total debit.');
  META.done.rules.push('19 Nov · See Receipt opens the same payment record used by Transaction History.');
  V.scanHistory = V.txHist;
  V.scanArchiveReceipt = V.txReceipt;
  META.scanHistory = META.txHist;
  META.scanArchiveReceipt = META.txReceipt;
  META.walletBooking = {name:'Booking Balance', ph:1, rules:['Booking Balance is separate from the balance used for Scan to Pay.']};
  META.scanReceipt = {name:'Scan Payment Receipt', ph:1, rules:[
    'Payment, fee and total come from the same prototype transaction.',
    'Pending payments reserve the amount. Check Payment Status resolves the simulation.',
    'Failed payments are not debited. Try Again returns to the payment review.',
  ]};
  render();
})();

function walletScanRecord() {
  return (S.scanPayments || []).find(tx => tx.id === S.txId);
}

function walletScanHistory() {
  const month = date => date.toLocaleDateString('en-MY', {month:'short', year:'numeric'});
  const formatDate = tx => tx.paidAt.toLocaleString('en-MY', {dateStyle:'medium', timeStyle:'short'});
  const payments = (S.scanPayments || []).map(tx => ({id:tx.id, m:month(tx.paidAt), at:tx.paidAt,
    t:tx.merchant, d:formatDate(tx), st:tx.status, v:-tx.totalCents / 100, ic:'store', kind:'pay'}));
  const topUps = (S.walletTopUps || []).map(tx => ({id:tx.id, m:month(tx.at), at:tx.at,
    t:`Top up · ${tx.method}`, d:formatDate({paidAt:tx.at}), st:'Completed', v:tx.value, ic:'plus', kind:'top'}));
  return [...payments, ...topUps].sort((a,b) => b.at - a.at);
}

window.__walletScanHistory = walletScanHistory;

/* ===== Activity V3 · PRD 6.9.3: "Experience" reads "Activity" in menus, buttons and statuses ===== */
(function(){
  /* brand copy and category names keep their wording */
  const KEEP = /Experience life like a local|Years of Experience|Local Experiences|Culinary Experiences/;
  const swap = t => t.replace(/^(\s*)Experience\s*:\s*/, '$1Activity: ')
    .replace(/\bExperiences\b/g, 'Activities').replace(/\bExperience\b/g, 'Activity')
    .replace(/\bexperiences\b/g, 'activities').replace(/\bexperience\b/g, 'activity');
  const pass = () => { const ph = document.getElementById('phone'); if (!ph) return;
    const w = document.createTreeWalker(ph, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const v = n.nodeValue; if (/xperience/.test(v) && !KEEP.test(v) && !(n.parentElement && n.parentElement.closest('script,style'))) n.nodeValue = swap(v); }
    ph.querySelectorAll('[aria-label*="xperience"],[placeholder*="xperience"]').forEach(el => ['aria-label','placeholder'].forEach(a => { const v = el.getAttribute(a); if (v && !KEEP.test(v)) el.setAttribute(a, swap(v)); })); };
  const _r = render;
  render = function(){ const out = _r.apply(this, arguments); pass(); return out; };
  if (typeof toast === 'function') { const _t = toast; toast = function(m, ...r){ return _t(typeof m === 'string' && !KEEP.test(m) ? swap(m) : m, ...r); }; }
  try { render(); } catch(e) {}
})();
