/* Interactive wallet screens based on the 19 Nov design. */
(() => {
  const original = {...V};
  const templates = new Map();
  const $ = (root, selector) => root.querySelector(selector);
  const $$ = (root, selector) => [...root.querySelectorAll(selector)];
  const format = n => n.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const amount = n => S.balHide ? '••••' : format(n);
  const ringgit = n => S.balHide ? '••••' : RM(n);
  const assetLink = `https://youapp.ai/elsaa/${RF_ME.code}`;

  function reference(name) {
    if (!templates.has(name)) {
      const template = document.createElement('template');
      template.innerHTML = walletReferenceFrames[name];
      templates.set(name, template.content.firstElementChild);
    }
    return templates.get(name).cloneNode(true);
  }

  function screen(frame, footer = '') {
    return `<div class="screen wallet-reference">${walletReferenceSymbols}<div class="scroll">${frame.outerHTML}</div>${footer}</div>`;
  }

  function bind(el, act, data = {}, label = '') {
    if (!el) return;
    Object.assign(el.dataset, {act}, data);
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    if (label) el.setAttribute('aria-label', label);
  }

  const click = (root, selector, act, data, label) => bind($(root, selector), act, data, label);
  const nav = (root, selector, to, label) => click(root, selector, 'nav', {to}, label);
  const set = (root, selector, text) => { const el = $(root, selector); if (el) el.textContent = text; };
  const setHTML = (root, selector, html) => { const el = $(root, selector); if (el) el.innerHTML = html; };
  const backButton = frame => click(frame, '.top .tb:first-child', 'back', {}, 'Back');
  const naturalButton = (title, act, icon) => `<button type="button" data-act="${act}">${ic(icon)}${title}</button>`;
  const note = (message, className = 'wr-note') => `<p class="${className}">${message}</p>`;

  document.addEventListener('keydown', event => {
    const button = event.target.closest('.wallet-reference [role="button"]');
    if (button && ['Enter', ' '].includes(event.key) && !event.repeat) {
      event.preventDefault();
      button.click();
    }
  });

  const providers = [
    ['mm', 'MetaMask', 'MM', '#f6851b'], ['okx', 'OKX Wallet', 'OKX', '#121212'],
    ['imtoken', 'imToken', 'iT', '#11a8c9'], ['tp', 'TP Wallet', 'TP', '#2980fe'],
    ['wc', 'Other wallets', '+', '#5e35b8'],
  ];
  for (const [id, name, ini] of providers.slice(1)) {
    W_ALL[id] = {id, name, ini, ext:true, app:id === 'wc' ? 'WalletConnect' : name, hidden:0,
      addr:`0x00000000000000000000000000000000000000${(20 + providers.findIndex(p => p[0] === id)).toString(16)}`,
      tok:id === 'okx' ? {USDC:500} : {}};
  }

  const currencyData = {
    USD:['US dollar', 'US$', '#3c3b6e'], SGD:['Singapore dollar', 'S$', '#ef3340'],
    MYR:['Ringgit', 'RM', '#f5b82e'], EUR:['Euro', '€', '#637be5'],
    JPY:['Japanese yen', '¥', '#b00334'], GBP:['British pound', '£', '#692f96'],
  };
  const currencyFor = token => ({MYRT:'MYR', XSGD:'SGD', GYEN:'JPY', GBPT:'GBP', JPYC:'JPY', TGBP:'GBP',
    EURC:'EUR', EURS:'EUR', EURe:'EUR', EURA:'EUR'})[token] || (RATE[token] === RATE.USDC ? 'USD' : token);
  const currencyInfo = key => currencyData[key] || [TOKN[key] || key, `${key} `, '#957ad1'];

  function currencies(wallets) {
    const groups = {};
    for (const wallet of wallets) {
      for (const [token, value] of wToks(wallet)) {
        const key = currencyFor(token);
        const group = groups[key] ||= {key, units:0, rm:0, holdings:[]};
        group.units += value;
        group.rm += value * RATE[token];
        group.holdings.push({wallet, token, value});
      }
    }
    return Object.values(groups).sort((a, b) => b.rm - a.rm);
  }

  const referenceCurrency = reference('all');
  const flags = Object.fromEntries(['USD', 'SGD', 'MYR'].map((key, i) =>
    [key, $($$(referenceCurrency, '.cr')[i], 'svg').outerHTML]));
  const topUpFlags = $$(reference('topup'), '.cc svg');
  flags.JPY = topUpFlags[3].outerHTML;
  flags.GBP = topUpFlags[4].outerHTML;
  flags.EUR = '<svg width="38" height="38" viewBox="0 0 40 40" class="flag"><defs><clipPath id="flEUR"><circle cx="20" cy="20" r="20"></circle></clipPath></defs><g clip-path="url(#flEUR)"><rect width="40" height="40" fill="#003399"></rect><polygon points="20.00,6.80 20.53,8.27 22.09,8.32 20.86,9.28 21.29,10.78 20.00,9.90 18.71,10.78 19.14,9.28 17.91,8.32 19.47,8.27" fill="#FFCC00"/><polygon points="25.50,8.27 26.03,9.75 27.59,9.79 26.36,10.75 26.79,12.25 25.50,11.37 24.21,12.25 24.64,10.75 23.41,9.79 24.97,9.75" fill="#FFCC00"/><polygon points="29.53,12.30 30.06,13.77 31.62,13.82 30.38,14.78 30.82,16.28 29.53,15.40 28.23,16.28 28.67,14.78 27.43,13.82 29.00,13.77" fill="#FFCC00"/><polygon points="31.00,17.80 31.53,19.27 33.09,19.32 31.86,20.28 32.29,21.78 31.00,20.90 29.71,21.78 30.14,20.28 28.91,19.32 30.47,19.27" fill="#FFCC00"/><polygon points="29.53,23.30 30.06,24.77 31.62,24.82 30.38,25.78 30.82,27.28 29.53,26.40 28.23,27.28 28.67,25.78 27.43,24.82 29.00,24.77" fill="#FFCC00"/><polygon points="25.50,27.33 26.03,28.80 27.59,28.85 26.36,29.80 26.79,31.31 25.50,30.43 24.21,31.31 24.64,29.80 23.41,28.85 24.97,28.80" fill="#FFCC00"/><polygon points="20.00,28.80 20.53,30.27 22.09,30.32 20.86,31.28 21.29,32.78 20.00,31.90 18.71,32.78 19.14,31.28 17.91,30.32 19.47,30.27" fill="#FFCC00"/><polygon points="14.50,27.33 15.03,28.80 16.59,28.85 15.36,29.80 15.79,31.31 14.50,30.43 13.21,31.31 13.64,29.80 12.41,28.85 13.97,28.80" fill="#FFCC00"/><polygon points="10.47,23.30 11.00,24.77 12.57,24.82 11.33,25.78 11.77,27.28 10.47,26.40 9.18,27.28 9.62,25.78 8.38,24.82 9.94,24.77" fill="#FFCC00"/><polygon points="9.00,17.80 9.53,19.27 11.09,19.32 9.86,20.28 10.29,21.78 9.00,20.90 7.71,21.78 8.14,20.28 6.91,19.32 8.47,19.27" fill="#FFCC00"/><polygon points="10.47,12.30 11.00,13.77 12.57,13.82 11.33,14.78 11.77,16.28 10.47,15.40 9.18,16.28 9.62,14.78 8.38,13.82 9.94,13.77" fill="#FFCC00"/><polygon points="14.50,8.27 15.03,9.75 16.59,9.79 15.36,10.75 15.79,12.25 14.50,11.37 13.21,12.25 13.64,10.75 12.41,9.79 13.97,9.75" fill="#FFCC00"/></g></svg>';
  const flag = key => flags[key] || `<span class="wr-currency-icon">${esc(key)}</span>`;
  const walletLogo = $(reference('all'), '.wc:nth-child(2) .wt').innerHTML;

  function walletBadge(wallet, size = 24) {
    const provider = providers.find(([id]) => id === wallet.id);
    const isYouApp = wallet.id === 'ya';
    const art = isYouApp ? walletLogo : esc(provider?.[2] || wallet.ini);
    const color = isYouApp ? 'linear-gradient(135deg,#9a6bbf,#3d1c96)' : provider?.[3] || '#5e35b8';
    return `<span class="wt" style="width:${size}px;height:${size}px;background:${color};font-size:${Math.round(size * .34)}px">${art}</span>`;
  }

  const allBalance = () => wList().reduce((total, wallet) => total + wRM(wallet), 0);
  const moneyWalletName = wallet => wallet.id === 'ya' ? 'YouApp Wallet' : wallet.name;
  const dateOf = tx => tx.paidAt.toLocaleString('en-MY', {dateStyle:'medium', timeStyle:'short'});
  const archive = () => TXS.map(tx => ({id:tx.id, merchant:tx.t, status:tx.st, date:tx.d, value:tx.v, wallet:'ya', kind:tx.kind, icon:tx.ic}));
  const transactions = () => [
    ...walletScanHistory().map(tx => {
      const funding = S.scanPayments?.find(payment => payment.id === tx.id)?.funding;
      return {id:tx.id, merchant:tx.t, status:tx.st, date:tx.d, value:tx.v,
        wallet:funding?.wallet || 'ya', currency:funding?.key, kind:tx.kind, icon:tx.ic};
    }),
    ...archive(),
  ];

  function transactionRow(template, tx, showStatus = false) {
    const row = template.cloneNode(true);
    set(row, ':scope > div:not(.rt) b', tx.merchant);
    const wallet = W_ALL[tx.wallet];
    const source = tx.kind === 'pay' && tx.wallet === 'ya' ? currencyInfo(tx.currency || 'MYR')[0] : wallet ? moneyWalletName(wallet) : 'Ringgit';
    const date = tx.date.replace(/\s+(AM|PM)$/i, '\u00a0$1');
    set(row, ':scope > div:not(.rt) small', `${date} · ${source}`);
    set(row, '.rt b', S.balHide ? '••••' : (tx.value < 0 ? '−' : '+') + RM(Math.abs(tx.value)));
    const value = $(row, '.rt b');
    value.classList.add('wr-debit');
    value.classList.toggle('pos', tx.value > 0 && !S.balHide);
    if (tx.icon && tx.icon !== 'store') {
      const icon = $(row, '.sq');
      icon.classList.add('l', 'wr-transaction-icon');
      icon.innerHTML = ic(tx.icon);
    }
    const status = tx.status === 'Completed' && tx.kind === 'pay' ? 'Paid' : tx.status;
    const statusLine = $(row, '.rt small');
    if (showStatus && statusLine && status !== 'Paid') {
      statusLine.classList.remove('ok');
      statusLine.textContent = status;
    }
    if (!showStatus && tx.status !== 'Completed') {
      const detail = document.createElement('small');
      detail.textContent = tx.status;
      $(row, '.rt').append(detail);
    }
    bind(row, 'walletReferenceTx', {id:tx.id}, `${tx.merchant}, ${status}`);
    return row;
  }

  function referralState() {
    const friends = scen.refs === 'none' ? [] : RF_F;
    const history = friends.length ? rfVis() : [];
    const verified = friends.filter(friend => friend.v).length;
    const paying = friends.filter(friend => history.some(entry => entry.n === friend.n)).length;
    return {friends, history, verified, paying, earned:friends.length ? rfL1() : 0};
  }

  function statusTier(frame, selector = '.tier') {
    const badge = $(frame, selector);
    if (!badge) return;
    const crown = $(badge, 'svg')?.outerHTML || ic('crown');
    badge.innerHTML = `${crown} ${T().name}`;
    bind(badge, 'tierInfo', {}, `${T().name} plan benefits`);
  }

  function referralUpsell(row) {
    if (!row) return;
    if (T().key === 'svip') { row.remove(); return; }
    set(row, 'div b', T().key === 'free' ? 'Earn 2x on referrals' : 'Earn more on referrals');
    set(row, 'div small', `SVIP: ${TIERS.svip.ref}% instead of ${T().ref}%`);
    click(row, 'a', 'walletReferencePlan', {key:'svip'});
  }

  function walletProfile() {
    try {
      const app = window.parent.document.getElementById('a30')?.contentWindow;
      const profile = app?.__walletProfile?.();
      if (profile) return profile;
    } catch (error) { /* Use the demo account when opened outside the full flow. */ }
    return RF_ME;
  }

  function renderProfile(card, profile) {
    $(card, 'img').src = FG.elsa;
    const name = document.createElement('span');
    name.className = 'wr-profile-name';
    name.textContent = profile.name;
    $(card, 'b').firstChild.replaceWith(name);
    const verified = kycOk();
    if (!verified) $(card, 'b svg')?.remove();
    set(card, 'small', `${profile.handle} · ${verified ? 'ID\u00a0verified' : 'Verify your ID'}`);
  }

  function renderHomeActions(frame) {
    const row = $(frame, '.acts');
    const [topUpIcon, rewardsIcon] = $$(row, 'i').map(icon => icon.innerHTML);
    const rewardsBalance = ringgit(rfBal());
    const rewardsLabel = S.balHide ? 'Rewards balance hidden' : `Rewards balance ${rewardsBalance}`;
    row.className = 'wr-quick-actions';
    row.innerHTML = `
      <button type="button" class="wr-quick-action" data-act="walletReferenceTopUp">
        <span class="wr-quick-icon" aria-hidden="true">${topUpIcon}</span>
        <span class="wr-quick-copy"><b>Top up</b></span>
      </button>
      <button type="button" class="wr-quick-action" data-act="rewards" aria-label="${esc(rewardsLabel)}">
        <span class="wr-quick-icon" aria-hidden="true">${rewardsIcon}</span>
        <span class="wr-quick-copy"><b>Rewards</b><small class="wr-quick-value">${esc(rewardsBalance)}</small></span>
      </button>`;
  }

  V.home = () => {
    if (!kycOk()) return original.home();
    const frame = reference('youlong');
    backButton(frame);
    nav(frame, '.top .r', 'settings', 'Settings');
    click(frame, '.tabs div:nth-child(2)', 'hostTab');
    const balance = $(frame, '.bal');
    set(balance, '.lbl0', 'YouWallet Balance');
    statusTier(balance);
    set(balance, '.amt b', amount(allBalance()));
    const eye = $(balance, '.amt > svg');
    const toggle = document.createElement('span');
    eye.before(toggle);
    toggle.append(eye);
    if (S.balHide) toggle.innerHTML = ic('eyeoff');
    bind(toggle, 'balEye', {}, S.balHide ? 'Show balances' : 'Hide balances');
    const money = currencies(wList());
    setHTML(balance, '.st', money.slice(0, 3).map(group => `<i>${flag(group.key)}</i>`).join(''));
    set(balance, '.stl', `${money.length} ${money.length === 1 ? 'currency' : 'currencies'}`);
    click(balance, '.wr-currency-stack', 'walletMoneyOpen', {}, 'See all currencies');
    const carousel = document.createElement('div');
    carousel.className = 'wr-balance-carousel';
    carousel.setAttribute('role', 'group');
    carousel.setAttribute('aria-label', 'Wallet balances');
    const booking = balance.cloneNode(true);
    booking.classList.add('wr-booking');
    set(booking, '.lbl0', 'Booking Balance');
    set(booking, '.amt b', amount(0));
    $(booking, '.tier').remove();
    set(booking, '.stl', 'MYRT');
    $(booking, '.st').remove();
    set(booking, '.wr-currency-stack a', 'Details ›');
    click(booking, '.wr-currency-stack', 'walletBooking', {}, 'Open Booking Balance');
    click(booking, '.amt [role="button"]', 'walletBookingBalanceEye');
    balance.before(carousel);
    carousel.append(balance, booking);
    nav(frame, '.scanbtn', 'scan');
    renderHomeActions(frame);
    const refs = referralState();
    $(frame, '.invc').classList.add('wr-home-referral');
    set(frame, '.ih b', `Invite friends, earn ${T().ref}%`);
    set(frame, '.ih small', 'Earn when friends pay. They pay nothing extra.');
    nav(frame, '.ih', 'invite');
    $$(frame, '.ist b').forEach((el, index) => { el.textContent = [refs.friends.length, refs.verified, ringgit(refs.earned)][index]; });
    set(frame, '.ist > div:last-child small', 'Referral earnings');
    const tip = $(frame, '.itip');
    const waiting = refs.verified - refs.paying;
    if (waiting) {
      tip.lastChild.textContent = ` ${waiting} verified ${waiting === 1 ? 'friend hasn’t' : 'friends haven’t'} paid yet. Show them how.`;
      nav(frame, '.itip', 'invite');
    } else if (refs.paying) {
      tip.lastChild.textContent = ` ${refs.paying} ${refs.paying === 1 ? 'friend earns' : 'friends earn'} you rewards. View friends.`;
      nav(frame, '.itip', 'invite');
    } else tip.remove();
    $(frame, '.invc .b2').lastChild.textContent = ' Referral QR';
    $(frame, '.invc .b1 svg').setAttribute('stroke', 'currentColor');
    click(frame, '.invc .b2', 'walletReferenceReferralQr');
    click(frame, '.invc .b1', 'walletReferenceShare', {value:assetLink, title:'Invite friends to YouApp'});
    referralUpsell($(frame, '.adrow'));
    click(frame, '.sec a', 'walletScanHistory');
    const tx = transactions().find(row => row.kind === 'pay');
    $(frame, '.tx').replaceWith(transactionRow($(frame, '.tx'), tx, true));
    const profile = walletProfile();
    renderProfile($(frame, '.prof'), profile);
    click(frame, '.prof a', 'editProfile');
    if (profile.interests) setHTML(frame, '.pas', profile.interests.map(interest => `<span>${esc(interest)}</span>`).join(''));
    if (!$(frame, '.pas').children.length) $(frame, '.pas').remove();
    return screen(frame);
  };

  function chips(frame, container, wallets, selected, action, includeAll) {
    setHTML(frame, container, `${includeAll ? `<div class="wc all"><span><b>All</b>${ringgit(allBalance())}</span></div>` : ''}${wallets.map(wallet =>
      `<div class="wc">${walletBadge(wallet)}<span><b>${esc(moneyWalletName(wallet))}</b>${ringgit(wRM(wallet))}</span></div>`).join('')}`);
    const ids = [...(includeAll ? ['all'] : []), ...wallets.map(wallet => wallet.id)];
    $$(frame, `${container} .wc`).forEach((el, index) => {
      const id = ids[index];
      el.classList.toggle('on', id === selected);
      el.setAttribute('aria-pressed', id === selected);
      bind(el, action, {id});
    });
  }

  function currencyRow(group) {
    const [name, symbol] = currencyInfo(group.key);
    return `<div class="cr">${flag(group.key)}<div><b>${esc(name)}</b></div><div class="rt"><b>${S.balHide ? '••••' : symbol + format(group.units)}</b><small>${group.key === 'MYR' || S.balHide ? '' : '≈ ' + RM(group.rm)}</small></div>${ic('chev')}</div>`;
  }

  V.wallets = () => {
    const wallets = wList();
    const single = wallets.length === 1 && wHasYa();
    const selected = wallets.find(wallet => wallet.id === S.moneyWallet);
    const active = selected ? [selected] : wallets;
    const groups = currencies(active);
    const total = active.reduce((sum, wallet) => sum + wRM(wallet), 0);
    const frame = reference(single ? 'allone' : 'all');
    frame.classList.add('wr-money');
    backButton(frame);
    click(frame, '.hbtn', 'walletScanHistory', {}, 'Transactions');
    if (selected) set(frame, '.tot2 small', `${moneyWalletName(selected)} balance`);
    setHTML(frame, '.tot2 > div:first-of-type', `<span>RM</span>${amount(total)}`);
    const bar = $(frame, '.bar');
    bar.setAttribute('aria-hidden', 'true');
    bar.hidden = S.balHide || !total;
    bar.innerHTML = bar.hidden ? '' : groups.map(group => `<i style="width:${group.rm / total * 100}%;background:${currencyInfo(group.key)[2]}"></i>`).join('');
    if (single) nav(frame, '.cwal .cb', 'walletConnect');
    else {
      nav(frame, '.conn', 'walletConnect');
      const rail = $(frame, '.wx');
      rail.setAttribute('role', 'group');
      rail.setAttribute('aria-label', 'Filter by wallet');
      chips(frame, '.wcs', wallets, selected?.id || 'all', 'walletMoneyFilter', true);
      $(frame, '.wsec a')?.remove();
    }
    const list = $(frame, '.lst');
    list.innerHTML = `<div class="grp">${single ? 'In YouApp Wallet' : 'Currencies'} · ${groups.length}</div>${groups.map(currencyRow).join('') || note('No balance in this wallet yet.', 'wr-empty')}`;
    $$(list, '.cr').forEach((el, index) => bind(el, 'walletCurrencyOpen', {key:groups[index].key}));
    click(frame, '.sec a', 'walletScanHistory');
    const sample = $(frame, '.tx');
    const recent = transactions().filter(tx => active.some(wallet => wallet.id === tx.wallet)).slice(0, 4);
    $(frame, '.adrow')?.remove();
    if (recent.length) {
      sample.before(...recent.map(tx => transactionRow(sample, tx)));
    } else {
      sample.before(Object.assign(document.createElement('p'), {className:'wr-empty', textContent:'No transactions in this wallet yet.'}));
    }
    for (const row of $$(frame, '.tx:not([data-act])')) row.remove();
    set(frame, '.disc span', 'Your money stays in your own wallets. Totals in RM are estimates.');
    const topUpButton = $(frame, '.fix .b1');
    if (selected?.ext) topUpButton.lastChild.textContent = ' Top up YouApp Wallet';
    bind(topUpButton, 'walletReferenceTopUp');
    return screen(frame);
  };

  function walletDetailFrame(name, title) {
    const frame = reference('all');
    frame.className = 'wr-frame';
    frame.dataset.reference = name;
    frame.replaceChildren($(frame, '.sb'), $(frame, '.top'));
    $(frame, '.hbtn').remove();
    backButton(frame);
    set(frame, '.ttl', title);
    return frame;
  }

  function assetHoldingRow(token, value, name) {
    const logo = window.XS_TOKW?.[token];
    const tokenName = TOKN[token] || name || token;
    const estimate = !S.balHide && value > 0 && Number.isFinite(RATE[token]) ? `<small>≈ ${ringgit(value * RATE[token])}</small>` : '';
    const quantity = value.toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:value < 1 ? 6 : 2});
    return `<li><div class="wr-asset-row" data-token="${esc(token)}">
      <span class="wr-asset-icon" aria-hidden="true">${logo ? `<img src="${logo}" alt="">` : esc(token)}</span>
      <span class="wr-asset-name"><b>${esc(token)}</b>${tokenName !== token ? `<small>${esc(tokenName)}</small>` : ''}</span>
      <span class="wr-asset-value"><b>${S.balHide ? '••••' : `${quantity} ${esc(token)}`}</b>${estimate}</span>
    </div></li>`;
  }

  V.walletCurrency = () => {
    const selected = wList().find(wallet => wallet.id === S.moneyWallet);
    const key = S.moneyCurrency;
    const title = key ? currencyInfo(key)[0] : 'Currency';
    const group = currencies(selected ? [selected] : wList()).find(entry => entry.key === key);
    const frame = walletDetailFrame('currency', title);
    frame.classList.add('wr-currency-detail');
    if (!group) {
      frame.insertAdjacentHTML('beforeend', note('No balance in this currency yet.', 'wr-empty'));
      return screen(frame);
    }

    const holdingsByWallet = new Map();
    for (const holding of group.holdings) {
      const id = holding.wallet.id;
      if (!holdingsByWallet.has(id)) holdingsByWallet.set(id, []);
      holdingsByWallet.get(id).push(holding);
    }
    const currencyBalance = units => S.balHide ? '••••' : moneyIn(key, units);
    const walletCount = holdingsByWallet.size;
    const balanceLabel = selected ? 'Wallet balance' : 'Total balance';
    const estimate = key === 'MYR' || S.balHide ? '' : `<span class="wr-asset-estimate">≈ ${ringgit(group.rm)} <span>estimated</span></span>`;
    frame.insertAdjacentHTML('beforeend', `<section class="wr-asset-summary" aria-label="${balanceLabel}">
      <div class="wr-asset-summary-top"><small>${balanceLabel}</small><span>${walletCount} ${walletCount === 1 ? 'wallet' : 'wallets'}</span></div>
      <strong class="wr-asset-total">${esc(currencyBalance(group.units))}</strong>${estimate}
    </section>
    <div class="wr-asset-holdings">${[...holdingsByWallet.values()].map(holdings => {
      const {wallet} = holdings[0];
      const walletName = moneyWalletName(wallet);
      const subtotal = holdings.reduce((sum, holding) => sum + holding.value, 0);
      const subtotalBalance = currencyBalance(subtotal);
      return `<section class="wr-asset-wallet" aria-labelledby="wr-asset-wallet-${wallet.id}">
        <header>
          <span aria-hidden="true">${walletBadge(wallet, 28)}</span>
          <h2 id="wr-asset-wallet-${wallet.id}">${esc(walletName)}</h2>
          <button type="button" class="wr-asset-wallet-open" data-act="wOpen" data-id="${esc(wallet.id)}" aria-label="Open ${esc(walletName)} details, balance ${S.balHide ? 'hidden' : esc(subtotalBalance)}">
            <strong>${esc(subtotalBalance)}</strong>${ic('chev')}
          </button>
        </header>
        <ul>${holdings.map(({token, value}) => assetHoldingRow(token, value)).join('')}</ul>
      </section>`;
    }).join('')}</div>`);
    return screen(frame);
  };

  function alternateMainWallet(id) {
    const alternatives = wList().filter(wallet => wallet.id !== id);
    return alternatives.find(wallet => !wallet.ext) || alternatives[0];
  }

  const walletAssetsPerPage = 4;
  const assetCurrencyNames = new Intl.DisplayNames('en-MY', {type:'currency'});

  function walletAssets(wallet) {
    const holdings = wToks(wallet);
    const heldTokens = new Set(holdings.map(([token]) => token.toUpperCase()));
    const otherTokens = Object.entries(seraTokenCurrencies)
      .filter(([token]) => !heldTokens.has(token))
      .map(([token, currency]) => [token, 0, assetCurrencyNames.of(currency)]);
    const assets = [...holdings, ...otherTokens];
    const pageCount = Math.ceil(assets.length / walletAssetsPerPage);
    const page = Math.min(S.walletAssetPage || 1, pageCount);
    const start = (page - 1) * walletAssetsPerPage;
    const rows = assets.slice(start, start + walletAssetsPerPage);
    return `<section class="wr-asset-wallet" aria-labelledby="wr-wallet-assets">
      <header><h2 id="wr-wallet-assets">Assets</h2><small>${assets.length} tokens</small></header>
      <ul>${rows.map(([token, value, name]) => assetHoldingRow(token, value, name)).join('')}</ul>
      ${pageCount > 1 ? `<nav class="wr-asset-pages" aria-label="Asset pages">
        <button type="button" data-act="walletAssetPage" data-page="${page - 1}" aria-label="Previous asset page" aria-describedby="wr-asset-page"${page === 1 ? ' disabled' : ''}>${ic('chev')}</button>
        <span id="wr-asset-page" role="status">Page ${page} of ${pageCount}</span>
        <button type="button" data-act="walletAssetPage" data-page="${page + 1}" aria-label="Next asset page" aria-describedby="wr-asset-page"${page === pageCount ? ' disabled' : ''}>${ic('chev')}</button>
      </nav>` : ''}
    </section>`;
  }

  V.wDetail = () => {
    const wallet = wList().find(entry => entry.id === S.wSel) || wMain();
    if (!wallet) return V.wallets();
    const frame = walletDetailFrame(wallet.ext ? 'externalwallet' : 'youappwallet', moneyWalletName(wallet));
    frame.classList.add('wr-wallet-detail');
    const isMain = wMain().id === wallet.id;
    const onlyWallet = isMain && !alternateMainWallet(wallet.id);
    frame.insertAdjacentHTML('beforeend', `<section class="wr-asset-summary wr-wallet-summary" aria-label="Estimated balance">
      <div class="wr-asset-summary-top"><div class="wr-wallet-identity"><span aria-hidden="true">${walletBadge(wallet, 32)}</span><small>Estimated balance</small></div><span>Ethereum${!wallet.ext && isMain ? ' · Main' : ''}</span></div>
      <strong class="wr-asset-total">${ringgit(wRM(wallet))}</strong>
      <div class="wr-wallet-address">
        <span class="wr-asset-estimate">${esc(xsShort(wallet.addr))}</span>
        <button type="button" data-act="xsCopy" data-v="${esc(wallet.addr)}" aria-label="Copy wallet address">${ic('copy')}</button>
      </div>
    </section>
    <div class="wr-asset-holdings">
      <section class="wr-wallet-settings" aria-labelledby="wr-wallet-settings">
        <h2 id="wr-wallet-settings">Wallet settings</h2>
        <button type="button" class="wr-wallet-main" role="switch" aria-checked="${isMain}"${onlyWallet ? ' aria-disabled="true"' : ''} aria-labelledby="wr-wallet-main-label" aria-describedby="wr-wallet-main-help" data-act="walletMainToggle">
          <span><b id="wr-wallet-main-label">Set as main</b><small id="wr-wallet-main-help">${onlyWallet ? 'Connect another wallet to change your main wallet.' : 'Default wallet for Scan to Pay.'}</small></span><span class="wr-wallet-main-track" aria-hidden="true"></span>
        </button>
        ${wallet.ext ? '<button type="button" class="wr-ext-disconnect" data-act="walletDetailSheet" data-s="wDisc">Disconnect wallet</button>' : ''}
      </section>
      ${walletAssets(wallet)}
    </div>`);
    return screen(frame);
  };

  SHEETS.wDisc = () => {
    const wallet = W_ALL[S.wSel];
    const next = alternateMainWallet(wallet.id);
    const detail = !next ? 'Create a YouApp Wallet first so you still have a wallet to use.'
      : wMain().id === wallet.id ? `${moneyWalletName(next)} will become your main wallet.` : '';
    return `<div class="grab"></div><div class="stack wr-ext-disconnect-sheet"><h2 class="t-title">Disconnect ${esc(wallet.name)}?</h2>
      <p class="t-body">Your assets stay in ${esc(wallet.app)}. You can reconnect it anytime.</p>
      ${detail ? `<p class="t-body muted">${esc(detail)}</p>` : ''}
      ${next ? btn('Disconnect wallet', 'wDiscGo', {kind:'btn-secondary', cls:'wr-ext-danger-confirm'}) : btn('Create YouApp Wallet', 'wCreateYa')}
      ${btn('Cancel', 'walletSheetClose', {kind:'btn-tertiary'})}</div>`;
  };

  A.walletDetailSheet = el => openWalletSheet(el.dataset.s);

  A.walletAssetPage = el => {
    const previous = S.walletAssetPage || 1;
    const page = Number(el.dataset.page);
    const focused = document.activeElement === el;
    S.walletAssetPage = page;
    retainScroll();
    if (focused) {
      const nextPage = page + (page - previous);
      const next = document.querySelector(`.wr-asset-pages [data-page="${nextPage}"]:enabled`);
      (next || document.querySelector('.wr-asset-pages button:enabled'))?.focus({preventScroll:true});
    }
  };

  A.walletMainToggle = el => {
    const wallet = wList().find(entry => entry.id === S.wSel) || wMain();
    if (!wallet) return;
    const next = wMain().id === wallet.id ? alternateMainWallet(wallet.id) : wallet;
    if (!next) return;
    const focused = document.activeElement === el;
    scen.mainW = next.id;
    saveScen();
    retainScroll();
    if (focused) document.querySelector('.wr-wallet-main')?.focus({preventScroll:true});
    toast(`${moneyWalletName(next)} is now your main wallet.`);
  };

  A.wDiscGo = () => {
    const wallet = wList().find(entry => entry.id === S.wSel && entry.ext);
    if (!wallet || S.sheet !== 'wDisc') return;
    const next = alternateMainWallet(wallet.id);
    if (!next) return;
    if (wMain().id === wallet.id) scen.mainW = next.id;
    wSetWl(wIds().filter(id => id !== wallet.id));
    if (S.moneyWallet === wallet.id) S.moneyWallet = 'all';
    if (S.hist.at(-1) === 'walletCurrency' && S.hist.at(-2) === 'wallets') S.hist.pop();
    back();
    toast(`${wallet.name} disconnected.`);
  };

  V.walletConnect = () => {
    const frame = reference('connect');
    backButton(frame);
    const wallets = wList();
    const available = wallets.filter(wallet => wallet.ext).length < 5;
    const rows = $$(frame, '.wr');
    providers.forEach(([id], index) => {
      const wallet = wallets.find(entry => entry.id === id && entry.app === W_ALL[id].app);
      const row = rows[index];
      set(row, 'small', wallet ? `Ethereum · ${xsShort(wallet.addr)}` : id === 'wc' ? 'Any wallet that supports WalletConnect' : 'Opens the app to connect');
      const button = row.lastElementChild;
      if (wallet) {
        button.outerHTML = `<span class="ok2">${ic('check')} Connected</span>`;
        bind(row, 'wOpen', {id}, `Manage ${wallet.name}`);
      } else {
        button.outerHTML = `<a>${available ? 'Connect' : 'Limit reached'}</a>`;
        bind(row.lastElementChild, 'walletConnectProvider', {id}, `Connect ${W_ALL[id].name}`);
        if (!available) row.lastElementChild.setAttribute('aria-disabled', 'true');
      }
    });
    const unmatched = wallets.filter(wallet => wallet.ext && !providers.some(([id]) => wallet.id === id));
    for (const wallet of unmatched) {
      const row = rows[0].cloneNode(true);
      row.innerHTML = `${walletBadge(wallet, 40)}<div><b>${esc(wallet.name)}</b><small>Ethereum · ${xsShort(wallet.addr)}</small></div><span class="ok2">${ic('check')} Connected</span>`;
      bind(row, 'wOpen', {id:wallet.id});
      $(frame, '.wlist').append(row);
    }
    if (!wHasYa()) $(frame, '.wlist').insertAdjacentHTML('afterend', `<div class="wr-tools">${naturalButton('Create YouApp Wallet', 'wCreateYa', 'plus')}</div>`);
    return screen(frame);
  };

  const legacyConnectDone = A.wConnDone;
  const legacyProvider = A.wProvGo;
  A.wProvGo = el => { S.walletProviderId = null; legacyProvider(el); };
  Object.assign(A, {
    walletMoneyOpen: () => { S.moneyWallet = 'all'; go('wallets'); },
    walletBookingBalanceEye: () => {
      A.balEye();
      const carousel = document.querySelector('.wr-balance-carousel');
      if (carousel) carousel.scrollLeft = carousel.scrollWidth;
    },
    walletMoneyFilter: el => {
      const {id} = el.dataset;
      const restoreFocus = document.activeElement === el;
      S.moneyWallet = id;
      retainScroll();
      if (restoreFocus) document.querySelector(`.wx [data-id="${id}"]`)?.focus({preventScroll:true});
    },
    walletCurrencyOpen: el => { S.moneyCurrency = el.dataset.key; go('walletCurrency'); },
    walletReferenceTx: el => {
      S.txId = el.dataset.id;
      S.scanReceiptFrom = 'history';
      go(S.walletTopUps?.some(tx => tx.id === S.txId) ? 'walletTopUpReceipt' : walletScanRecord() ? 'scanReceipt' : 'scanArchiveReceipt');
    },
    walletConnectProvider: el => {
      const wallet = W_ALL[el.dataset.id];
      if (!wallet || wList().filter(entry => entry.ext).length >= 5 || wIds().includes(wallet.id)) return;
      S.walletProviderId = wallet.id;
      S.wCtx = 'add';
      S.wApp = wallet.app;
      if (wallet.id === 'wc') { S.sheet = 'wQR'; render(); return; }
      mwStart('connect', wallet.app, 'Connect wallet', 'connect');
    },
    wConnDone: () => {
      if (!S.walletProviderId || S.wCtx !== 'add') return legacyConnectDone();
      const wallet = W_ALL[S.walletProviderId];
      wSetWl([...new Set([...wIds(), wallet.id])]);
      if (S.wUseMain) { scen.mainW = wallet.id; saveScen(); }
      S.walletProviderId = null;
      S.hist = S.hist.filter(name => !['walletConnect', 'mwWait', 'wVerify', 'wConnected'].includes(name));
      go('walletConnect', {replace:true});
      toast(`${wallet.name} connected.`);
    },
  });

  function retainScroll(chipsSelector = '.wx') {
    const scroll = document.querySelector('.wallet-reference > .scroll');
    const chips = scroll?.querySelector(chipsSelector);
    const top = scroll?.scrollTop || 0;
    const left = chips?.scrollLeft || 0;
    render();
    const next = document.querySelector('.wallet-reference > .scroll');
    if (next) next.scrollTop = top;
    const nextChips = next?.querySelector(chipsSelector);
    if (nextChips) nextChips.scrollLeft = left;
  }

  V.scan = () => {
    if (!kycOk()) return original.scan();
    const frame = reference('scan');
    frame.classList.toggle('wr-flash', Boolean(S.scanFlash));
    backButton(frame);
    click(frame, '.top .r', 'scanFlash', {}, 'Toggle flash');
    $(frame, '.top .r').setAttribute('aria-pressed', Boolean(S.scanFlash));
    click(frame, '.frame', 'sheet', {s:'scanSim'}, 'Scan a sample DuitNow QR');
    click(frame, '.sbtm .sb1', 'sheet', {s:'gallery'});
    const stack = $(frame, '.sbtm .sb2');
    stack.lastChild.textContent = ringgit(allBalance());
    setHTML(stack, '.stk', currencies(wList()).slice(0, 3).map(group => `<i>${flag(group.key)}</i>`).join(''));
    bind(stack, 'walletMoneyOpen', {}, 'Open My money');
    return screen(frame);
  };

  const scanQr = A.scanQr;
  A.scanQr = el => {
    if (!MERCH[el.dataset.id] || !kycOk() || S.busy) return;
    S.walletQuote = null;
    scanQr(el);
  };

  function sourceInfo() {
    const wallet = wList().find(entry => entry.id === S.pay.source?.wallet) || (S.payYa && wHasYa() ? W_ALL.ya : wMain());
    const groups = currencies([wallet]);
    const group = groups.find(entry => entry.key === S.pay.source?.key)
      || (wallet.id === 'ya' ? groups.find(entry => entry.key === 'MYR') : groups[0]);
    const key = S.pay.source?.wallet === wallet.id ? S.pay.source.key : group?.key || 'MYR';
    const exact = groups.find(entry => entry.key === key);
    return {wallet, key, units:exact?.units || 0, rm:exact?.rm || 0, rate:exact ? exact.rm / exact.units : 1};
  }

  const sourceUnits = (total, rate) => Math.ceil(total / rate * 100 - 1e-8) / 100;
  const moneyIn = (key, value) => `${currencyInfo(key)[1]}${format(value)}`;

  function paymentFrame() {
    const merchant = MERCH[S.pay.id];
    const source = sourceInfo();
    const external = source.wallet.ext;
    const converted = source.key !== 'MYR';
    const frame = reference(converted ? 'payu' : 'pay');
    backButton(frame);
    set(frame, '.mer2 b', merchant.name);
    set(frame, '.mer2 small', SP_MERCH_SUB(merchant));
    const value = Number(S.pay.amt) || 0;
    const {fee, reb, total} = spFees(value);
    const low = total > source.rm + 1e-8 || sourceUnits(total, source.rate) > source.units + 1e-8;
    const invalid = !value || value > T().per || S.busy;
    const onYouAppRinggit = !external && !converted;
    const summary = $(frame, '.sum');
    const sourceChip = $(summary, '.pf2');
    sourceChip.firstElementChild.outerHTML = flag(source.key);
    set(sourceChip, '.pft b', `${currencyInfo(source.key)[0]} · ${S.balHide ? '••••' : moneyIn(source.key, source.units)}`);
    set(sourceChip, '.pft em', source.wallet.id === 'ya' ? 'YouApp Wallet' : source.wallet.name);
    bind(sourceChip, 'walletPaymentPick', {}, 'Change payment currency or wallet');
    if (S.busy) sourceChip.setAttribute('aria-disabled', 'true');
    const sums = $$(summary, ':scope > div');
    const tier = T();
    setHTML(frame, '.bigamt', `<span>RM</span>${esc(S.pay.amt || '0.00')}${merchant.fixed ? '' : '<i></i>'}`);
    set(sums[1], 'span', merchant.kind === 'personal' ? 'Recipient gets' : 'Shop gets');
    set(sums[1], 'b', RM(value));
    set(sums[2], 'b', RM(fee));
    set(sums[2], 'em', `${tier.name} plan · ${tier.fee}%${tier.floor ? `, min ${RM(tier.floor)}` : ''}`);
    if (reb) $(summary, '.tot').insertAdjacentHTML('beforebegin', `<div><span>Fee rebate</span><b>−${RM(reb)}</b></div>`);
    set(summary, '.tot b', RM(total));
    if (converted) {
      set(summary, '.cv span', `In ${currencyInfo(source.key)[0].toLowerCase()}`);
      const fx = $(summary, '.cv span');
      fx.insertAdjacentHTML('beforeend', `<em>${moneyIn(source.key, 1)} ≈ ${RM(source.rate)} · Demo rate</em>`);
      set(summary, '.cv b', moneyIn(source.key, sourceUnits(total, source.rate)));
    } else if (tier.key !== 'svip' && value) {
      set(summary, '.hint', `With SVIP, the fee here is ${RM(feeFor(value, TIERS.svip))} ›`);
      click(summary, '.hint', 'walletReferencePlan', {key:'svip'});
    } else $(summary, '.hint')?.remove();
    const button = $(frame, '.paybtn');
    button.textContent = S.busy ? 'Processing payment' : low && onYouAppRinggit ? `Top up & pay ${RM(total)}`
      : external ? `Pay ${moneyIn(source.key, sourceUnits(total, source.rate))} · approve in ${source.wallet.app}` : `Pay ${RM(total)}`;
    bind(button, 'walletPaymentGo');
    if (invalid || (low && !onYouAppRinggit)) button.setAttribute('aria-disabled', 'true');
    if (value > tier.per) button.insertAdjacentHTML('beforebegin', note(`Your ${tier.name} limit is ${RM(tier.per)} per payment.`));
    else if (low && value) button.insertAdjacentHTML('beforebegin', note(onYouAppRinggit ? `Top up ${RM(total - source.rm)} to cover the payment.` : 'Choose a currency with enough balance.'));
    if (merchant.kind === 'personal') button.insertAdjacentHTML('beforebegin', note('Check the recipient’s name before paying.'));
    if (merchant.fixed) $(frame, '.keys').remove();
    else bindKeypad(frame, 'kp', 'kpDel');
    return frame;
  }

  function bindKeypad(frame, keyAction, deleteAction) {
    $$(frame, '.keys > div').forEach((el, index) => {
      const key = ['1','2','3','4','5','6','7','8','9','.','0','del'][index];
      bind(el, key === 'del' ? deleteAction : keyAction, {k:key}, key === 'del' ? 'Delete digit' : `Enter ${key}`);
      if (S.busy) el.setAttribute('aria-disabled', 'true');
    });
  }

  V.confirm = () => S.pay?.id && kycOk() && wMain() ? screen(paymentFrame()) : original.confirm();

  V.walletPaymentSource = () => {
    const wallet = wList().find(entry => entry.id === S.moneyPayWallet) || sourceInfo().wallet;
    const isExternal = wallet.ext;
    const frame = reference(isExternal ? 'coinsmm' : 'coins');
    frame.classList.add('wr-sheet-screen');
    $(frame, '.dim').replaceChildren(...paymentFrame().childNodes);
    $(frame, '.dim').inert = true;
    click(frame, '.shade', 'back', {}, 'Close payment source picker');
    const sheet = $(frame, '.sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'Pay with');
    const walletList = $$(frame, '.wcs').at(-1);
    walletList.classList.add('wr-picker-wallets');
    chips(sheet, '.wcs', wList(), wallet.id, 'walletPaymentWallet', false);
    for (const row of $$(sheet, '.cr, .grp')) row.remove();
    const groups = currencies([wallet]);
    const display = !isExternal && !groups.some(group => group.key === 'MYR') ? [...groups, {key:'MYR', units:0, rm:0}] : groups;
    const label = `<div class="grp">In ${esc(moneyWalletName(wallet))}</div>`;
    walletList.insertAdjacentHTML('afterend', label + (display.map(currencyRow).join('') || note('No eligible balance in this wallet.')));
    $$(sheet, '.cr').forEach((el, index) => {
      const key = display[index].key;
      el.classList.toggle('on', sourceInfo().wallet.id === wallet.id && sourceInfo().key === key);
      bind(el, 'walletPaymentSelect', {id:wallet.id, key});
    });
    if (!isExternal) {
      const missing = Object.keys(topUpAssets).filter(key => !display.some(group => group.key === key));
      if (missing.length) {
        sheet.insertAdjacentHTML('beforeend', '<div class="grp">Top up to use</div>');
        for (const key of missing) {
          const [name] = currencyInfo(key);
          const row = document.createElement('div');
          row.className = 'cr z';
          row.innerHTML = `${flag(key)}<div><b>${esc(name)}</b></div><div class="rt"><b>${S.balHide ? '••••' : moneyIn(key, 0)}</b></div><a>Top up</a>`;
          bind(row, 'walletReferenceTopUp', {key}, `Top up ${name}`);
          sheet.append(row);
        }
      }
    }
    if (isExternal) {
      set(sheet, '.xn span', `You’ll approve the payment in ${wallet.app}.`);
      const cta = $(sheet, '.paybtn');
      if (groups.length === 1) {
        cta.textContent = `Use ${currencyInfo(groups[0].key)[0]} from ${wallet.name}`;
        bind(cta, 'walletPaymentSelect', {id:wallet.id, key:groups[0].key});
      } else cta.remove();
    }
    return screen(frame);
  };

  V.walletApprove = () => {
    const quote = S.walletQuote;
    if (!quote) return screen(paymentFrame());
    const frame = reference('approve');
    backButton(frame);
    const app = quote.app;
    set(frame, '.dt', `Approve in ${app}`);
    setHTML(frame, '.ds', 'Review the payment, then confirm it in your wallet.<br>This prototype simulates the approval.');
    $(frame, '.apx .wt:last-child').outerHTML = walletBadge(W_ALL[quote.wallet], 64);
    const rows = $$(frame, '.rcp > div');
    set(rows[0], 'b', moneyIn(quote.key, quote.units));
    set(rows[1], 'span', `${app} shows it as`);
    set(rows[1], 'b', quote.parts.map(part => `${format(part.units)} ${part.token}`).join(' + '));
    set(rows[2], 'b', `${RM(Number(S.pay.amt))} to ${MERCH[S.pay.id].name}`);
    set(rows[3], 'b', `Shown in ${app}`);
    set(rows[4], 'b', S.walletQuoteExpired ? 'Expired' : '30 seconds');
    set(frame, '.wait', S.walletQuoteExpired ? 'Get a new quote to continue.' : 'Ready to open your wallet');
    click(frame, '.fix .b2', 'back');
    set(frame, '.fix .b1', S.walletQuoteExpired ? 'Refresh quote' : `Open ${app}`);
    click(frame, '.fix .b1', S.walletQuoteExpired ? 'walletQuoteRefresh' : 'walletApprovalPrompt');
    return screen(frame);
  };

  const enterQuote = funding => {
    S.walletQuote = {...funding, expires:Date.now() + 30000};
    S.walletQuoteExpired = false;
  };

  function approvalActive() {
    if (S.walletQuote && Date.now() < S.walletQuote.expires) return true;
    S.sheet = null;
    S.walletQuoteExpired = true;
    render();
    return false;
  }

  SHEETS.walletApproval = () => {
    const quote = S.walletQuote;
    return `<div class="grab"></div><div class="stack" style="gap:12px"><h2 class="t-title">${esc(quote.app)}</h2><p>Simulate approving ${moneyIn(quote.key, quote.units)} for this DuitNow payment.</p>${btn('Confirm payment', 'walletApprovalConfirm')}${btn('Cancel', 'closeSheet', {kind:'btn-tertiary'})}</div>`;
  };

  Object.assign(A, {
    walletPaymentFunding: (source, total) => {
      const wallet = wList().find(entry => entry.id === source.wallet);
      const group = wallet && currencies([wallet]).find(entry => entry.key === source.key);
      if (!group || group.rm + 1e-8 < total) return null;
      const rate = group.rm / group.units;
      const units = sourceUnits(total, rate);
      let remaining = Math.round(units * 100);
      const parts = [];
      for (const {token, value} of group.holdings) {
        const use = Math.min(remaining, Math.floor(value * 100 + 1e-8));
        if (use) parts.push({token, units:use / 100});
        remaining -= use;
      }
      return remaining ? null : {wallet:wallet.id, name:wallet.name, app:wallet.ext ? wallet.app : '', key:source.key, units, rate, parts};
    },
    walletPaymentPick: () => { S.moneyPayWallet = sourceInfo().wallet.id; go('walletPaymentSource'); },
    walletPaymentWallet: el => { S.moneyPayWallet = el.dataset.id; retainScroll('.wr-picker-wallets'); },
    walletPaymentSelect: el => {
      const {id, key} = el.dataset;
      S.pay.source = id === 'ya' && key === 'MYR' ? null : {wallet:id, key};
      S.payYa = id === 'ya' && key === 'MYR';
      back();
    },
    walletPaymentGo: () => {
      if (S.busy || !(Number(S.pay.amt) > 0) || Number(S.pay.amt) > T().per) return;
      const source = sourceInfo();
      const total = spTotal();
      if (source.wallet.id === 'ya' && source.key === 'MYR') {
        S.pay.source = null;
        S.payYa = true;
        (total > bal() ? A.spTopUp : A.spPay)();
        return;
      }
      S.pay.source = {wallet:source.wallet.id, key:source.key};
      const funding = A.walletPaymentFunding(S.pay.source, total);
      if (!funding) { toast('Choose a currency with enough balance.', 'err'); return; }
      if (!funding.app) { A.spPay(); return; }
      if (scen.eth === 'low' || scen.extSess === 'off') { toast(`Reconnect ${funding.app} and check your network fee balance.`, 'err'); return; }
      enterQuote(funding);
      go('walletApprove');
    },
    walletQuoteRefresh: () => {
      const funding = A.walletPaymentFunding(S.pay.source, spTotal());
      if (!funding) { back(); return; }
      enterQuote(funding);
      render();
    },
    walletApprovalPrompt: () => { if (approvalActive()) { S.sheet = 'walletApproval'; render(); } },
    walletApprovalConfirm: () => {
      if (!approvalActive()) return;
      if (scen.extOk === 'cancel') { back(); toast('Wallet approval was cancelled.', 'err'); return; }
      S.walletQuote = null;
      S.sheet = null;
      S.screen = S.hist.pop() || 'confirm';
      spProceed();
    },
  });

  V.done = () => {
    const tx = walletScanRecord();
    if (!tx || tx.status !== 'Completed') return original.done();
    const frame = reference('celeb');
    setHTML(frame, '.camt', `<span>RM</span>${format(tx.amount)}`);
    set(frame, '.cto', `to ${tx.merchant}`);
    click(frame, '.cbtn', 'walletScanReceipt');
    return screen(frame);
  };

  V.scanReceipt = () => {
    const tx = walletScanRecord();
    if (!tx || tx.status !== 'Completed') return original.scanReceipt();
    const frame = reference('done');
    click(frame, '.top .tb:first-child', 'walletScanClose', {}, 'Back');
    setHTML(frame, '.ramt', `<span>RM</span>${format(tx.amount)}`);
    set(frame, '.rto', `to ${tx.merchant} · DuitNow QR`);
    const [payment, details] = $$(frame, '.rcp');
    const funding = tx.funding;
    const paidWith = funding ? `${moneyIn(funding.key, funding.units)} · ${funding.name}` : 'Ringgit · YouApp Wallet';
    const row = (label, value, cls = '') => `<div class="${cls}"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
    payment.innerHTML = row('Recipient gets', RM(tx.amount)) + row(`Payment fee · ${tx.tier}`, RM(tx.fee))
      + (tx.rebate ? row('Fee rebate', `−${RM(tx.rebate)}`) : '') + (funding?.app ? row('Network fee', `Paid in ${funding.app}`) : '')
      + row('Total', RM(tx.totalCents / 100), 'tt') + row('Paid with', paidWith)
      + (funding && funding.key !== 'MYR' ? row('Rate', `${moneyIn(funding.key, 1)} ≈ ${RM(funding.rate)}`) : '');
    details.innerHTML = row('Reference', tx.id.toUpperCase()) + row('Time', dateOf(tx))
      + (funding ? row('Sent as', funding.parts.map(part => `${format(part.units)} ${part.token}`).join(' + ')) : '')
      + (tx.cashback ? row('Cashback', RM(tx.cashback)) : '');
    click(details, 'div:first-child', 'walletScanCopy', {}, 'Copy reference');
    click(frame, '.fix > :first-child', 'walletReceiptDownload');
    click(frame, '.fix > :last-child', 'walletScanShare');
    const footer = $(frame, '.fix');
    footer.insertAdjacentHTML('afterend', `<div class="wr-tools">${naturalButton('Done', 'walletScanClose', 'check')}</div>`);
    return screen(frame);
  };

  A.walletReceiptDownload = () => {
    const tx = walletScanRecord();
    if (!tx || tx.status !== 'Completed') return;
    const content = ['YouApp · Payment Receipt', tx.merchant, `Recipient gets ${RM(tx.amount)}`, `Fee ${RM(tx.fee)}`,
      `Total ${RM(tx.totalCents / 100)}`, tx.id.toUpperCase(), dateOf(tx)].join('\n');
    const url = URL.createObjectURL(new Blob([content], {type:'text/plain'}));
    const anchor = Object.assign(document.createElement('a'), {href:url, download:`${tx.id}.txt`});
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const topUpAssets = {MYR:'MYRT', USD:'USDC', SGD:'XSGD', JPY:'JPYC', GBP:'TGBP'};
  const tokens = ['USDT', 'USDC', 'MYRT', 'XSGD', 'JPYC', 'TGBP'];
  Object.assign(RATE, {JPYC:RATE.GYEN, TGBP:RATE.GBPT});
  Object.assign(TOKN, {JPYC:'Japanese yen', TGBP:'British pound'});
  const topUpCurrency = token => Object.keys(topUpAssets).find(key => topUpAssets[key] === token) || currencyFor(token);
  const methods = [
    ['bank', 'DuitNow transfer', n => n > 0 ? .10 : 0, 'RM0.10'],
    ['card', 'Debit or credit card', n => n * .02, '2%'],
    ['ewallet', 'E-wallet', n => n * .025, '2.5%'],
    ['other', 'Other ways', n => n * .025, '2.5%'],
    ['stable', 'Stablecoins', () => 0, 'Free'],
  ];
  const topUp = () => S.walletTopUp ||= {currency:'MYR', method:'card', token:'MYRT', amount:'', card:'4242'};

  function topUpOptions(frame, choices, selected, action, label) {
    const group = $(frame, '.ccs');
    group.classList.add('wr-topup-options');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', label);
    $$(group, '.cc').forEach((chip, index) => {
      const key = choices[index];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = key === selected ? 'cc on' : 'cc';
      Object.assign(button.dataset, {act:action, key});
      button.setAttribute('aria-pressed', key === selected);
      button.append(...chip.childNodes);
      $(button, 'svg')?.setAttribute('aria-hidden', 'true');
      chip.replaceWith(button);
    });
  }

  function selectTopUpOption(button, field) {
    const {act, key} = button.dataset;
    const restoreFocus = document.activeElement === button;
    topUp()[field] = key;
    retainScroll('.wr-topup-options');
    if (restoreFocus) document.querySelector(`[data-act="${act}"][data-key="${key}"]`)?.focus({preventScroll:true});
  }

  V.walletTopUp = () => {
    if (!kycOk()) return `<div class="screen">${statusBar()}${topBar('Top up')}<div class="scroll">${stateBlock('lock', 'Activate your wallet', 'Top up opens when your YouApp Wallet is active.', btn('Continue', 'kycStart', {cls:'btn-sm'}))}</div></div>`;
    const frame = reference('topup');
    backButton(frame);
    const t = topUp();
    const currencyTitle = $(frame, '.tq').textContent.trim();
    topUpOptions(frame, Object.keys(topUpAssets), t.currency, 'walletTopUpCurrency', currencyTitle);
    $$(frame, '.mr').forEach((row, index) => {
      const method = methods[index][0];
      if (method === 'bank' || (t.currency !== 'MYR' && !['card', 'stable'].includes(method))) row.remove();
      else bind(row, 'walletTopUpMethod', {method});
    });
    const notice = $(frame, '.disc');
    notice.classList.replace('bt2', 'wr-topup-footer');
    if (wHasYa()) set(notice, 'span', `Funds go into your YouApp Wallet in ${t.currency}.`);
    else {
      set(notice, 'span', 'Create a YouApp Wallet to receive your top up.');
      $(frame, '.mlist').replaceWith(Object.assign(document.createElement('div'), {className:'wr-tools', innerHTML:naturalButton('Create YouApp Wallet', 'wCreateYa', 'plus')}));
    }
    notice.remove();
    return screen(frame, notice.outerHTML);
  };

  const topUpQuote = () => {
    const t = topUp();
    const method = methods.find(([key]) => key === t.method);
    const value = Number(t.amount) || 0;
    const subtotal = Math.round(value * RATE[topUpAssets[t.currency]] * 100) / 100;
    const fee = Math.round(method[2](subtotal) * 100) / 100;
    return {value, subtotal, fee, total:subtotal + fee, method};
  };

  V.walletTopUpAmount = () => {
    const t = topUp();
    const frame = reference('topcard');
    backButton(frame);
    const {value, subtotal, fee, total, method} = topUpQuote();
    const symbol = currencyInfo(t.currency)[1];
    set(frame, '.ttl', t.method === 'card' ? 'Top up with card' : `Top up · ${method[1]}`);
    setHTML(frame, '.bigamt', `<span>${symbol}</span>${esc(t.amount || '0.00')}<i></i>`);
    set(frame, '.tcs', `You get ${moneyIn(t.currency, value)} in ${currencyInfo(t.currency)[0].toLowerCase()}`);
    if (t.method === 'card') {
      set(frame, '.cardi', t.card === '4242' ? 'VISA' : 'MC');
      set(frame, '.sel b', `${t.card === '4242' ? 'Visa' : 'Mastercard'} •••• ${t.card}`);
      click(frame, '.sel', 'sheet', {s:'walletTopUpCard'});
    } else $(frame, '.sel').remove();
    const sums = $$(frame, '.sum > div');
    set(sums[0], 'b', RM(subtotal));
    setHTML(sums[1], 'span', `Fee <em>${esc(method[3])}</em>`);
    set(sums[1], 'b', RM(fee));
    set(sums[2], 'b', RM(total));
    set(frame, '.paybtn', `Pay ${RM(total)}`);
    click(frame, '.paybtn', 'sheet', {s:'walletTopUpConfirm'});
    if (!value || subtotal < 20) $(frame, '.paybtn').setAttribute('aria-disabled', 'true');
    $(frame, '.paybtn').insertAdjacentHTML('afterend', note('Minimum top up is RM20. This payment is simulated.', 'wr-empty'));
    bindKeypad(frame, 'walletTopUpKey', 'walletTopUpDelete');
    return screen(frame);
  };

  V.walletTopUpStable = () => {
    const t = topUp();
    const frame = reference('add');
    backButton(frame);
    topUpOptions(frame, tokens, t.token, 'walletTopUpToken', 'Stablecoin to deposit');
    const address = W_ALL.ya.addr;
    set(frame, '.qrc small', `Demo deposit · ${t.token} (${currencyInfo(topUpCurrency(t.token))[0]})`);
    set(frame, '.qrc .ad', address.replace(/(.{6})/g, '$1 '));
    click(frame, '.qrc .b1', 'copy', {v:address}, 'Copy demo wallet address');
    click(frame, '.qrc .b2', 'walletReferenceShare', {value:address, title:'Demo wallet address'});
    setHTML(frame, '.warn span', '<b>Ethereum only.</b> This address and QR are for the prototype. Do not send funds.');
    click(frame, '.alt', 'back');
    return screen(frame);
  };

  V.walletTopUpDone = () => {
    const latest = S.walletTopUps?.[0];
    if (!latest) return V.walletTopUp();
    return `<div class="screen">${statusBar()}${topBar('Top up complete')}<div class="scroll wp19-hero">${cele()}<h1 class="wp19-amount"><small>Added to YouApp Wallet</small>${moneyIn(latest.key, latest.units)}</h1><p>Demo payment · ${esc(latest.method)}</p></div><div class="w2foot">${btn('Done', 'walletReferenceTopUpDone')}</div></div>`;
  };

  SHEETS.walletTopUpCard = () => `<div class="grab"></div><h2 class="t-title">Choose a demo card</h2><div class="stack" style="gap:10px;margin-top:12px">${btn('Visa •••• 4242', 'walletTopUpCard', {data:'data-card="4242"'})}${btn('Mastercard •••• 4444', 'walletTopUpCard', {data:'data-card="4444"'})}${btn('Cancel', 'closeSheet', {kind:'btn-tertiary'})}</div>`;
  SHEETS.walletTopUpConfirm = () => {
    const quote = topUpQuote();
    return `<div class="grab"></div><h2 class="t-title">${esc(quote.method[1])}</h2><p class="t-body" style="margin:12px 0">Simulate paying ${RM(quote.total)} to top up your wallet.</p>${btn('Confirm top up', 'walletTopUpConfirm')}${btn('Cancel', 'closeSheet', {kind:'btn-tertiary'})}`;
  };

  Object.assign(A, {
    walletReferenceTopUp: el => {
      S.walletTopUp = null;
      const key = el?.dataset.key;
      if (Object.hasOwn(topUpAssets, key)) topUp().currency = key;
      go('walletTopUp');
    },
    walletTopUpCurrency: el => selectTopUpOption(el, 'currency'),
    walletTopUpMethod: el => {
      const t = topUp();
      t.method = el.dataset.method;
      t.amount = '';
      t.token = topUpAssets[t.currency];
      go(t.method === 'stable' ? 'walletTopUpStable' : 'walletTopUpAmount');
    },
    walletTopUpToken: el => selectTopUpOption(el, 'token'),
    walletTopUpCard: el => { topUp().card = el.dataset.card; S.sheet = null; render(); },
    walletTopUpKey: el => {
      const t = topUp();
      const key = el.dataset.k;
      const next = (key === '.' && !t.amount ? '0.' : t.amount + key).replace(/^0+(?=\d)/, '');
      if (/^\d{1,6}(?:\.\d{0,2})?$/.test(next)) { t.amount = next; retainScroll(); }
    },
    walletTopUpDelete: () => { topUp().amount = topUp().amount.slice(0, -1); retainScroll(); },
    walletTopUpConfirm: () => {
      if (S.sheet !== 'walletTopUpConfirm' || !wHasYa() || !kycOk()) return;
      const t = topUp();
      const quote = topUpQuote();
      if (quote.subtotal < 20 || !quote.value) return;
      const currency = t.currency;
      runTransactionPreview('Processing top up', () => {
        const token = topUpAssets[currency];
        if (token === 'MYRT') S.scanTopUpCents = (S.scanTopUpCents || 0) + Math.round(quote.value * 100);
        else { const credits = S.walletTopUpAssets ||= {}; credits[token] = (credits[token] || 0) + quote.value; }
        (S.walletTopUps ||= []).unshift({key:currency, units:quote.value, method:quote.method[1], at:new Date(), value:quote.subtotal,
          id:`scan-topup-${Date.now()}`});
        go('walletTopUpDone', {replace:true});
      });
    },
    walletReferenceTopUpDone: () => { if (S.hist.at(-1) === 'walletTopUp') S.hist.pop(); back(); },
  });

  const planFrames = {free:'plansfree', vip:'plansvip', svip:'plans'};
  const selectedPlan = () => S.sub.sel || (T().key === 'free' ? 'vip' : T().key);
  V.subscribe = () => {
    const key = selectedPlan();
    const frame = reference(planFrames[key]);
    backButton(frame);
    const current = T().key;
    $$(frame, '.seg2 > div').forEach((tab, index) => {
      const k = PLAN_ORDER[index];
      tab.innerHTML = `${TIERS[k].name}${current === k ? '<em>Current</em>' : ''}`;
      tab.setAttribute('aria-pressed', k === key);
      bind(tab, 'walletPlanSelect', {key:k});
    });
    const carousel = $(frame, '.car');
    carousel.classList.add('wr-plan-car');
    $$(carousel, '.pc').forEach(card => {
      const k = $(card, '.pn b').textContent.trim().toLowerCase();
      const tier = TIERS[k];
      if (!tier) return;
      const cta = $(card, '.pb');
      if (!cta) return;
      const badge = $(card, '.pn .tg');
      if (k === current) {
        badge.className = 'tg cur';
        badge.textContent = 'Current';
      } else if (k === 'free') badge.remove();
      const benefits = $$(card, 'li > span');
      const limit = benefits.find(el => /up to rm|higher limits/i.test(el.textContent));
      if (limit && k !== 'svip') limit.textContent = `Up to ${RM(tier.per, 0)} a payment`;
      if (k === 'vip') set(card, '.pm', 'or RM120 a year');
      if (k === 'svip') {
        set(card, '.pp b', SVIP_RM());
        if (scen.svipP === 'late') { $(card, '.pp s')?.remove(); set(card, '.pm', 'One-time membership'); }
      }
      if (key !== k) {
        bind(card, 'walletPlanSelect', {key:k}, `Compare ${tier.name}`);
        return;
      }
      if (k === current && current === 'vip') {
        cta.textContent = 'Renew VIP';
        bind(cta, 'sheet', {s:'walletVipPeriod'});
      } else if (PLAN_ORDER.indexOf(k) <= PLAN_ORDER.indexOf(current)) {
        cta.textContent = k === current ? 'Your current plan' : `Included in ${T().name}`;
        cta.classList.add('off');
        cta.setAttribute('aria-disabled', 'true');
      } else if (k === 'vip' || k === 'svip') {
        cta.textContent = k === 'vip' ? 'Get VIP' : `Get SVIP · ${SVIP_RM()}`;
        bind(cta, k === 'vip' ? 'sheet' : 'svipStart', k === 'vip' ? {s:'walletVipPeriod'} : {});
      }
    });
    const dots = $(frame, '.dots');
    dots.classList.add('wr-plan-dots');
    $$(dots, 'i').forEach((dot, index) => {
      const k = PLAN_ORDER[index];
      bind(dot, 'walletPlanSelect', {key:k}, `Compare ${TIERS[k].name}`);
      dot.setAttribute('aria-pressed', k === key);
    });
    if (!kycOk()) frame.insertAdjacentHTML('beforeend', note('Verify your identity before choosing a plan.'));
    return screen(frame);
  };

  SHEETS.walletVipPeriod = () => `<div class="grab"></div><h2 class="t-title">${T().key === 'vip' ? 'Renew VIP' : 'Get VIP'}</h2><div class="stack" style="gap:10px;margin-top:12px">${btn('Monthly · RM10', 'walletVipPeriod', {data:'data-period="m"'})}${btn('Yearly · RM120', 'walletVipPeriod', {data:'data-period="y"'})}${btn('Cancel', 'closeSheet', {kind:'btn-tertiary'})}</div>`;
  Object.assign(A, {
    walletReferencePlan: el => {
      if (P() < 3) { A.upgrade(); return; }
      S.sub.sel = el.dataset.key || 'svip';
      go('subscribe');
    },
    walletPlanSelect: el => {
      const {key} = el.dataset;
      if (key === selectedPlan()) return;
      const focusGroup = document.activeElement === el && (el.closest('.wr-plan-dots') ? '.wr-plan-dots' : '.seg2');
      S.sub.sel = key;
      retainScroll();
      if (focusGroup) document.querySelector(`${focusGroup} [data-key="${key}"]`)?.focus({preventScroll:true});
    },
    walletVipPeriod: el => {
      S.sub.plan = el.dataset.period;
      if (!kycOk()) { S.sheet = null; A.kycStart(); }
      else if (T().key === 'vip') A.renewVip();
      else A.subGo();
    },
  });

  let planSwipe;
  document.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || !event.target.closest('.wr-plan-car')) return;
    planSwipe = {pointerId:event.pointerId, x:event.clientX, y:event.clientY};
  });
  document.addEventListener('pointercancel', event => {
    if (planSwipe?.pointerId === event.pointerId) planSwipe = null;
  });
  document.addEventListener('pointerup', event => {
    if (planSwipe?.pointerId !== event.pointerId) return;
    const dx = event.clientX - planSwipe.x;
    const dy = event.clientY - planSwipe.y;
    planSwipe = null;
    if (S.screen !== 'subscribe') return;
    if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return;
    const index = PLAN_ORDER.indexOf(selectedPlan());
    const key = PLAN_ORDER[index + (dx < 0 ? 1 : -1)];
    if (key) A.walletPlanSelect({dataset:{key}});
  });

  V.walletTopUpReceipt = () => {
    const tx = S.walletTopUps?.find(row => row.id === S.txId);
    if (!tx) return V.scanHistory();
    return `<div class="screen">${statusBar()}${topBar('Top up receipt')}<div class="scroll wp19-content"><div class="wp19-hero">${cele()}<h1 class="wp19-amount"><small>Added to YouApp Wallet</small>${moneyIn(tx.key, tx.units)}</h1></div><div class="wp19-summary"><div class="kv"><span>Method</span><b>${esc(tx.method)}</b></div><div class="kv"><span>Reference</span><b>${esc(tx.id.toUpperCase())}</b></div><div class="kv"><span>Date</span><b>${dateOf({paidAt:tx.at})}</b></div></div></div></div>`;
  };

  const share = (value, title) => {
    const data = /^https?:/.test(value) ? {url:value, title} : {text:value, title};
    if (navigator.share && navigator.canShare?.(data)) navigator.share(data).catch(error => {
      if (error.name !== 'AbortError') A.copy({dataset:{v:value}});
    });
    else A.copy({dataset:{v:value}});
  };

  function referralButtons(frame) {
    click(frame, '.code .cpy', 'copy', {v:assetLink}, 'Copy invite link');
    click(frame, '.rbot .b2', 'walletReferenceReferralQr');
    click(frame, '.rbot .b1, .rbt .w', 'walletReferenceShare', {value:assetLink, title:'Invite friends to YouApp'});
  }

  V.rewards = () => {
    if (!kycOk() || shActive() || shPast()) return original.rewards();
    const referral = referralState();
    const cashback = (S.scanPayments || []).filter(tx => tx.status === 'Completed' && tx.cashback > 0);
    const frame = reference(referral.history.length || cashback.length || S.rfWd?.length ? 'rew1' : 'rew0');
    backButton(frame);
    statusTier(frame);
    const value = rfBal();
    set(frame, '.amt b', amount(value));
    const withdraw = $(frame, '.eq2');
    withdraw.textContent = value >= 100 ? 'Move to your wallet ›' : value > 0 ? `${RM(100 - value)} more to move it to your wallet.` : 'Move to your wallet from RM100.';
    if (value >= 100) bind(withdraw, 'sheet', {s:'wdSheet'});
    if (frame.dataset.reference === 'rew0') {
      set(frame, '.rh em', `${T().ref}%`);
      set(frame, '.eg b', `${RM(10000 * T().ref / 100)} a month`);
      set(frame, '.code b', assetLink.replace('https://', ''));
      referralButtons(frame);
    } else {
      set(frame, '.inv b', referral.paying ? `${referral.paying} ${referral.paying === 1 ? 'friend earns' : 'friends earn'} you rewards` : 'Earn when friends pay');
      set(frame, '.inv small', `Invite more. You get ${T().ref}% when they pay.`);
      nav(frame, '.inv a', 'invite', 'Invite friends');
      const filter = S.walletRewardFilter || 'all';
      $$(frame, '.chips > span').forEach((tab, index) => {
        const key = ['all', 'referrals', 'cashback'][index];
        tab.classList.toggle('on', filter === key);
        tab.setAttribute('aria-pressed', filter === key);
        bind(tab, 'walletRewardFilter', {key});
      });
      const rows = $$(frame, '.tx');
      const items = [
        ...(filter === 'referrals' ? [] : cashback.map(tx => ({id:tx.id, name:`Cashback · ${tx.merchant}`, detail:dateOf(tx), value:tx.cashback, action:'walletReferenceTx'}))),
        ...(filter === 'cashback' ? [] : referral.history.map(entry => ({id:entry.id, name:`Referral · ${Array.from(entry.n)[0]}•••`, detail:entry.d, value:rfAmt(entry), action:'rwOpen'}))),
        ...(filter === 'all' ? (S.rfWd || []).map(item => ({name:'Moved to YouApp Wallet', detail:item.d, value:-item.v})) : []),
      ];
      const anchor = rows[0];
      items.forEach(item => {
        const row = rows[item.action === 'rwOpen' ? 0 : 1].cloneNode(true);
        set(row, ':scope > div:not(.rt) b', item.name);
        set(row, ':scope > div:not(.rt) small', item.detail);
        set(row, '.rt b', S.balHide ? '••••' : `${item.value < 0 ? '−' : '+'}${RM(Math.abs(item.value))}`);
        if (item.action) bind(row, item.action, {id:item.id});
        anchor.before(row);
      });
      if (!items.length) anchor.insertAdjacentHTML('beforebegin', note('No rewards in this category yet.', 'wr-empty'));
      rows.forEach(row => row.remove());
    }
    referralUpsell($(frame, '.adrow'));
    return screen(frame);
  };

  V.invite = () => {
    if (!kycOk() || shActive() || shPast()) return original.invite();
    const frame = reference('refer');
    backButton(frame);
    const referral = referralState();
    const {friends, verified, paying, history, earned} = referral;
    set(frame, '.rfh em', `${T().ref}%`);
    setHTML(frame, '.qrw2', `<img src="${FG.qr}" alt="Referral QR code">`);
    const code = $(frame, '.cdp');
    code.firstChild.textContent = `${RF_ME.code} `;
    click(code, '.cpb', 'copy', {v:RF_ME.code}, 'Copy referral code');
    referralButtons(frame);
    click(frame, '.rbt .g', 'walletShareQr');
    referralUpsell($(frame, '.adrow'));
    $$(frame, '.rfs b').forEach((el, index) => { el.textContent = [friends.length, verified, paying, ringgit(earned)][index]; });
    click(frame, '.rfs .earn', 'rewards');
    const unpaid = verified - paying;
    if (unpaid) $(frame, '.rfn').lastChild.textContent = ` ${unpaid} verified ${unpaid === 1 ? 'friend hasn’t' : 'friends haven’t'} paid yet. Show them how and start earning.`;
    else $(frame, '.rfn').remove();
    set(frame, '.sec a', `See all ${friends.length}`);
    click(frame, '.sec a', 'walletReferralFilter', {key:'all'});
    const filters = [['all', 'All'], ['unverified', `Not verified · ${friends.length - verified}`], ['unpaid', `Not paying · ${unpaid}`], ['paying', `Paying · ${paying}`]];
    const filter = S.walletReferralFilter || 'all';
    $$(frame, '.fch > span').forEach((tab, index) => {
      const [key, label] = filters[index];
      tab.textContent = label;
      tab.classList.toggle('on', key === filter);
      tab.setAttribute('aria-pressed', key === filter);
      bind(tab, 'walletReferralFilter', {key});
    });
    const rows = $$(frame, '.frw');
    const visible = friends.map(friend => ({...friend, payments:history.filter(tx => tx.n === friend.n)}));
    const shown = visible.filter(friend => filter === 'all' || (filter === 'unverified' ? !friend.v : filter === 'unpaid' ? friend.v && !friend.payments.length : friend.payments.length));
    for (const friend of shown) {
      const kind = friend.payments.length ? 0 : friend.v ? 1 : 2;
      const row = rows[kind].cloneNode(true);
      set(row, 'b', friend.n);
      set(row, '.av', friend.n.split(' ').slice(0, 2).map(part => part[0]).join(''));
      if (!kind) set(row, 'small', `Paying · you earned ${ringgit(friend.payments.reduce((sum, tx) => sum + rfAmt(tx), 0))}`);
      else click(row, '.fx', 'rfChat', {n:friend.n});
      rows[0].before(row);
    }
    if (!shown.length) rows[0].insertAdjacentHTML('beforebegin', note('No friends in this category yet.', 'wr-empty'));
    rows.forEach(row => row.remove());
    return screen(frame);
  };

  Object.assign(A, {
    walletRewardFilter: el => { S.walletRewardFilter = el.dataset.key; retainScroll(); },
    walletReferralFilter: el => { S.walletReferralFilter = el.dataset.key; retainScroll('.fch'); },
    walletReferenceShare: el => share(el.dataset.value, el.dataset.title),
    walletReferenceReferralQr: () => {
      if (S.screen !== 'invite') go('invite');
      requestAnimationFrame(() => document.querySelector('.wallet-reference .rfq2, .rf-qr')?.scrollIntoView({block:'center'}));
    },
    walletShareQr: async () => {
      const blob = await (await fetch(FG.qr)).blob();
      const file = new File([blob], 'youapp-referral-qr.png', {type:blob.type});
      if (navigator.canShare?.({files:[file]})) {
        try { await navigator.share({files:[file], title:'YouApp referral QR'}); return; }
        catch (error) { if (error.name === 'AbortError') return; }
      }
      Object.assign(document.createElement('a'), {href:FG.qr, download:file.name}).click();
    },
  });

  const preferences = {
    language:{title:'Language', values:['English', 'Bahasa Melayu', '中文'], initial:'English'},
    home:{title:'Home country', values:['Malaysia', 'Singapore', 'Indonesia'], initial:'Malaysia'},
    current:{title:'Using YouApp in', values:['Malaysia', 'Singapore', 'Indonesia'], initial:'Malaysia'},
  };
  const preference = key => S.walletPreferences?.[key] || preferences[key].initial;

  V.settings = () => {
    const frame = reference('settingslong');
    backButton(frame);
    renderProfile($(frame, '.spf'), walletProfile());
    const plan = $(frame, '.spf .pl');
    plan.lastChild.textContent = ` ${T().name} plan`;
    click(frame, '.spf', 'editProfile');
    const groups = $$(frame, '.sg');
    const group = index => $$(groups[index], '.sr');
    const [history, connection, address, withdraw, travel] = group(0);
    bind(history, 'walletScanHistory');
    set(history, 'small', 'Payments, top ups and bookings');
    const connected = wList().filter(wallet => wallet.ext);
    set(connection, '.sv', connected.length > 2 ? `${connected.length} connected` : connected.map(wallet => wallet.name).join(', ') || 'None');
    bind(connection, 'nav', {to:'walletConnect'});
    set(address, 'small', wHasYa() ? `${xsShort(W_ALL.ya.addr)} · Ethereum` : 'Create a YouApp Wallet first');
    click(address, '.sc', wHasYa() ? 'copy' : 'wCreateYa', {v:W_ALL.ya.addr}, wHasYa() ? 'Copy wallet address' : 'Create YouApp Wallet');
    if (!wHasYa()) set(address, '.sc', 'Create');
    bind(withdraw, 'walletSettingInfo', {key:'withdraw'});
    bind(travel, 'walletSettingInfo', {key:'travel'});
    if (S.walletTravelWaitlist) set(travel, '.pl', 'On waitlist');
    const [pin, ask, limits, auth, backup] = group(1);
    bind(pin, 'pinStart');
    set(ask, '.sv', `From ${RM(100)}`);
    bind(ask, 'walletSettingInfo', {key:'pin'});
    set(limits, 'small', `${RM(T().per)} a payment · ${RM(T().mon)} a month`);
    bind(limits, 'nav', {to:'limits'});
    bind(auth, 'walletSettingInfo', {key:'auth'});
    bind(backup, 'walletSettingInfo', {key:'backup'});
    const [invite, referrer, coupons] = group(2);
    set(invite, 'small', `Earn ${T().ref}% when they pay`);
    bind(invite, 'nav', {to:'invite'});
    set(referrer, '.sv', rfRefBy()?.n || (scen.paid === 'yes' ? 'Unavailable' : 'Add code'));
    bind(referrer, 'nav', {to:'refCode'});
    bind(coupons, 'coupons');
    const [language, permissions, home, current] = group(3);
    for (const [key, row] of Object.entries({language, home, current})) {
      set(row, '.sv', preference(key));
      bind(row, 'walletPreference', {key});
    }
    bind(permissions, 'walletSettingInfo', {key:'permissions'});
    const [help, report, blocked, terms] = group(4);
    for (const [key, row] of Object.entries({help, report, blocked, terms})) bind(row, 'walletSettingInfo', {key});
    click(frame, '.lo', 'walletSettingInfo', {key:'logout'});
    return screen(frame);
  };

  const info = {
    withdraw:['Withdraw to bank', 'Bank withdrawals require an eligible destination and a confirmed quote. This prototype shows the entry point.'],
    travel:['Travel card', 'Join the waitlist for the YouApp travel card.'],
    pin:['Ask for PIN', 'YouApp Wallet payments of RM100 or more ask for your 6-digit PIN.'],
    auth:['Sign-in', 'This demo account is signed in with Google.'],
    backup:['Back up wallet', 'The live wallet asks for your PIN before showing a private key. The prototype uses a demo wallet.'],
    permissions:['Permissions', 'Manage camera, notifications, photos and microphone permissions in your device settings.'],
    help:['Help centre', 'Need help with a payment? Include the reference from Transactions.'],
    report:['Report a problem', 'Open the affected transaction and copy its reference for the support team.'],
    blocked:['Blocked users', 'You haven’t blocked anyone.'],
    terms:['Terms, privacy and licences', 'YouApp Pte Ltd'],
    logout:['Log out', 'You’ll return to the Welcome screen.'],
  };

  SHEETS.walletSettingInfo = () => {
    const key = S.walletSetting;
    const [title, description] = info[key];
    const actions = {
      travel:S.walletTravelWaitlist ? '' : btn('Join waitlist', 'walletTravelWaitlist'),
      help:btn('Open transactions', 'walletScanHistory'),
      report:btn('Open transactions', 'walletScanHistory'),
      logout:btn('Log out', 'walletLogOut'),
    };
    return `<div class="grab"></div><h2 class="t-title">${title}</h2><p class="t-body" style="margin:12px 0">${description}</p>${actions[key] || ''}${btn('Close', 'walletSheetClose', {kind:'btn-tertiary'})}`;
  };

  SHEETS.walletPreference = () => {
    const key = S.walletSetting;
    const item = preferences[key];
    return `<div class="grab"></div><h2 class="t-title">${item.title}</h2><div class="stack" style="gap:8px;margin-top:12px">${item.values.map(value => btn(value, 'walletPreferenceSet', {kind:value === preference(key) ? 'btn-primary' : 'btn-secondary', data:`data-value="${esc(value)}"`})).join('')}${btn('Cancel', 'walletSheetClose', {kind:'btn-tertiary'})}</div>`;
  };

  Object.assign(A, {
    walletSettingInfo: el => { S.walletSetting = el.dataset.key; openWalletSheet('walletSettingInfo'); },
    walletPreference: el => { S.walletSetting = el.dataset.key; openWalletSheet('walletPreference'); },
    walletSheetClose: () => { S.sheet = null; retainScroll(); },
    walletTravelWaitlist: () => { S.walletTravelWaitlist = true; A.walletSheetClose(); toast('You joined the travel card waitlist.'); },
    walletPreferenceSet: el => {
      const key = S.walletSetting;
      const value = el.dataset.value;
      if (!preferences[key]?.values.includes(value)) return;
      (S.walletPreferences ||= {})[key] = value;
      A.walletSheetClose();
    },
    walletLogOut: () => {
      S.sheet = null;
      if (window.parent !== window && window.parent.__bridge) window.parent.__bridge('w2', 'restart');
      else go('splash');
    },
  });

  function openWalletSheet(name) {
    S.sheet = name;
    retainScroll();
  }

  const oldTxOpen = A.txOpen;
  A.txOpen = el => S.walletTopUps?.some(tx => tx.id === el.dataset.id) ? A.walletReferenceTx(el) : oldTxOpen(el);
  walletEntryRoutes.walletTopUp = () => {
    S.walletTopUp = null;
  };
  walletEntryRoutes.scanReceipt = ({txId}) => {
    if (!S.walletTopUps?.some(tx => tx.id === txId)) return;
    S.txId = txId;
    return 'walletTopUpReceipt';
  };

  Object.assign(META, {
    wallets:{name:'My money', ph:1, rules:['Combined estimated balance, currencies grouped by wallet, recent activity and Connect a wallet.']},
    walletConnect:{name:'Connect a wallet', ph:1, rules:['Providers are simulated. A wallet becomes connected after ownership verification.']},
    walletPaymentSource:{name:'Pay with', ph:1, rules:['Choose a wallet and a currency. An external payment needs approval in the connected wallet.']},
    walletApprove:{name:'Approve in your wallet', ph:1, rules:['External approval and the exchange quote are simulated.']},
    walletTopUp:{name:'Top up', ph:1, rules:['Select a currency and a payment method. Top ups here use demo balances.']},
  });
  render();
})();
