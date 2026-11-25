/* ===== Multi-wallet: YouApp wallet (Privy embedded) + external wallets (Privy connectors), all stablecoins (9 Nov 2026) =====
   Activate wallet: create a YouApp wallet or connect MetaMask / Coinbase Wallet / Rainbow / Phantom / WalletConnect.
   Many wallets, one Main (transfers and Scan to Pay). Send / Receive any verified ERC-20 stablecoin on Ethereum.
   Assumptions from the brainstorm: external wallets pay gas in ETH; allowlist of verified stablecoins; up to 5 external wallets. */
const RATE = {'MYRT':1, 'USDT':4.21, 'USDC':4.21, 'XSGD':3.3, 'DAI':4.21, 'PYUSD':4.21, 'FDUSD':4.21, 'TUSD':4.21, 'USDP':4.21, 'GUSD':4.21, 'LUSD':4.21, 'FRAX':4.21, 'USDe':4.21, 'crvUSD':4.21, 'GHO':4.21, 'USDS':4.21, 'RLUSD':4.21, 'USD0':4.21, 'USDM':4.21, 'EURC':4.88, 'EURS':4.88, 'EURe':4.88, 'EURA':4.88, 'XIDR':0.00027, 'GYEN':0.028, 'ZCHF':5.25, 'BRZ':0.75, 'MXNT':0.23, 'CADC':3.05, 'TRYB':0.12, 'NZDS':2.5, 'AUDD':2.75, 'GBPT':5.6, 'HKDR':0.54, 'THBX':0.13, 'PHPC':0.073, 'KRWB':0.0031, 'CNHT':0.58, 'XAUT':11400, 'PAXG':11450};
const TOKN = {'MYRT':'Malaysian Ringgit', 'USDT':'Tether USD', 'USDC':'USD Coin', 'XSGD':'StraitsX SGD', 'DAI':'Dai', 'PYUSD':'PayPal USD', 'FDUSD':'First Digital USD', 'TUSD':'TrueUSD', 'USDP':'Pax Dollar', 'GUSD':'Gemini Dollar', 'LUSD':'Liquity USD', 'FRAX':'Frax', 'USDe':'Ethena USDe', 'crvUSD':'Curve USD', 'GHO':'Aave GHO', 'USDS':'Sky Dollar', 'RLUSD':'Ripple USD', 'USD0':'Usual USD', 'USDM':'Mountain USD', 'EURC':'Euro Coin', 'EURS':'STASIS Euro', 'EURe':'Monerium EUR', 'EURA':'Angle Euro', 'XIDR':'StraitsX IDR', 'GYEN':'GMO JPY', 'ZCHF':'Frankencoin', 'BRZ':'Brazilian Digital Token', 'MXNT':'Tether MXN', 'CADC':'CAD Coin', 'TRYB':'BiLira', 'NZDS':'NZD Stablecoin', 'AUDD':'Australian Digital Dollar', 'GBPT':'Poundtoken', 'HKDR':'HKD Stablecoin', 'THBX':'Thai Baht Token', 'PHPC':'Philippine Peso Coin', 'KRWB':'KRW Stablecoin', 'CNHT':'Tether CNH', 'XAUT':'Tether Gold', 'PAXG':'Pax Gold'};
const W_ALL = {
  ya:{id:'ya', name:'YouApp wallet', ext:false, app:'YouApp', ini:'Y', addr:XS_ME.addr, get tok(){
    const tokens = {MYRT:bal(), USDT:57, DAI:25, EURC:12.40, XSGD:30};
    for (const [key, value] of Object.entries(S.walletTopUpAssets || {})) tokens[key] = (tokens[key] || 0) + value;
    return tokens;
  }, hidden:0},
  mm:{id:'mm', name:'MetaMask', ext:true, app:'MetaMask', ini:'M', addr:'0x7B21aE90c4F35d8812Ab6f0C9e3D47a5B6c1D2e3', tok:{USDC:410, USDT:100, MYRT:42.90, PYUSD:18}, hidden:2},
  cb:{id:'cb', name:'Coinbase Wallet', ext:true, app:'Coinbase Wallet', ini:'C', addr:'0x5D3c9A71e8B24f60C1d2E3f4A5b6C7d8E9f0A1b2', tok:{USDC:12.25}, hidden:0}};
const wIds = () => String(scen.wl||'ya').split(',').filter(k=>W_ALL[k]);
const wList = () => wIds().map(k=>W_ALL[k]);
const wMain = () => { const l = wList(); return l.find(w=>w.id===scen.mainW) || l[0]; };
const wHasYa = () => wIds().includes('ya');
const wRM = w => wToks(w).reduce((t,[k,v])=>t+v*(RATE[k]||1),0);
const wToks = w => Object.entries(w.tok).map(([key, value]) => {
  const reserved = (S.scanPayments || []).reduce((sum, tx) => {
    if (tx.status === 'Failed' || tx.funding?.wallet !== w.id) return sum;
    return sum + (tx.funding.parts.find(part => part.token === key)?.units || 0);
  }, 0);
  return [key, Math.max(0, value - reserved)];
}).filter(([,value])=>value>0).sort((a,b)=>b[1]*(RATE[b[0]]||1)-a[1]*(RATE[a[0]]||1));
const wTokLine = w => wToks(w).slice(0,2).map(([k,v])=>`${k} ${v.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2})}`).join(' · ');
const wBadge = (w, cls='') => `<span class="mw-bd ${w.ext?'ext':''} ${cls}">${w.ini}</span>`;
const wMainTag = '<span class="tag mw-main">Main</span>';
const tokAmt = (k,v) => `${k} ${(+v).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
/* send helpers used by the in-place edits */
function xsFromW(){ const x = S.xs||{}; const l = wList(); return l.find(w=>w.id===x.from) || wMain(); }
function xsFromExt(){ return !!xsFromW().ext; }
function xsTokSym(){ const x = S.xs||{}; const w = xsFromW(); if (x.tok && w.tok[x.tok]>0) return x.tok; return (wToks(w)[0]||['MYRT'])[0]; }
function xsFromBal(){ return wToks(xsFromW()).find(([symbol]) => symbol === xsTokSym())?.[1] || 0; }
const SEND_TOKEN_LOGOS = new Set(['DAI', 'EURC', 'JPYC', 'PYUSD', 'TGBP', 'USDC', 'USDT']);
function sendTokenIcon(symbol){
  const source = window.XS_TOKW?.[symbol] || (SEND_TOKEN_LOGOS.has(symbol) ? `token-icons/${symbol}.svg` : '');
  return `<span class="xs-token-icon" aria-hidden="true">${source ? `<img src="${source}" alt="">` : ic('wallet2')}</span>`;
}
function mwSendRows(){
  const wallet = xsFromW();
  const token = xsTokSym();
  return `<div class="xs-source" role="group" aria-label="Wallet and token">
    <button type="button" class="xs-source-row" data-act="sheet" data-s="mwFrom" aria-haspopup="dialog">
      ${wBadge(wallet, 'sm')}
      <span class="xs-source-copy"><small>From</small><strong>${esc(wallet.name)}</strong></span>
      ${ic('chevdown')}
    </button>
    <button type="button" class="xs-source-row" data-act="mwTokOpen">
      ${sendTokenIcon(token)}
      <span class="xs-source-copy"><small>Token · Ethereum</small><strong>${token}</strong></span>
      ${ic('chevdown')}
    </button>
  </div>
  ${wallet.ext ? `<div class="xs-note">${ic('info')}<span>Confirm in ${esc(wallet.app)} and pay the network fee in ETH.</span></div>` : ''}`;
}
SHEETS.mwFrom = () => { const cur = xsFromW().id;
  return `<div class="grab"></div><h2 class="t-title" style="margin:0 0 12px">Send from</h2><div class="mw-list">${wList().map(w=>`<button class="mw-row ${cur===w.id?'on':''}" data-act="mwFromPick" data-id="${w.id}">${wBadge(w)}<span class="m"><b>${esc(w.name)}</b><small>${RM(wRM(w))} · ${w.ext?'confirm in '+esc(w.app):'confirm with PIN'}</small></span>${w.id===wMain().id?wMainTag:''}</button>`).join('')}</div>`; };
V.mwTok = () => {
  const wallet = xsFromW();
  const selected = xsTokSym();
  const tokens = wToks(wallet);
  const rows = tokens.map(([symbol, balance]) => `<li>
    <button type="button" class="xs-token-option" data-act="mwTokPick" data-k="${symbol}"
      data-query="${esc(`${symbol} ${TOKN[symbol] || ''}`.toLowerCase())}" aria-pressed="${selected === symbol}">
      ${sendTokenIcon(symbol)}
      <span class="xs-token-name"><strong>${symbol}</strong><small>${esc(TOKN[symbol] || symbol)}</small></span>
      <span class="xs-token-balance"><strong>${tokAmt('', balance).trim()}</strong><small>≈ ${RM(balance * RATE[symbol])}</small></span>
      <span class="xs-token-tick" aria-hidden="true">${selected === symbol ? ic('check') : ''}</span>
    </button>
  </li>`).join('');
  return `<div class="screen bz xs-token-picker">${statusBar()}${topBar('Choose a token')}
    <div class="xs-token-search">
      <p>In ${esc(wallet.name)} · Ethereum</p>
      <label class="mw-search">${ic('search')}<input id="mwTokQ" type="search" placeholder="Search tokens" aria-label="Search by token name or symbol" autocomplete="off"></label>
    </div>
    <div class="scroll xs-token-scroll">
      ${tokens.length ? `<ul aria-label="Tokens available to send">${rows}</ul>
        <p class="xs-token-empty" role="status" hidden>No tokens match your search.</p>`
        : '<p class="xs-token-empty" role="status">This wallet has no tokens available to send.</p>'}
    </div>
  </div>`;
};
META.mwTok = {name:'Choose a token', ph:1, rules:['Full-screen picker for Ethereum tokens with an available balance. Search by name or symbol. Back keeps the send draft.']};

document.addEventListener('input', event => {
  if (event.target.id !== 'mwTokQ') return;
  const view = event.target.closest('.xs-token-picker');
  const query = event.target.value.trim().toLowerCase();
  let matches = 0;
  for (const option of view.querySelectorAll('.xs-token-option')) {
    const match = option.dataset.query.includes(query);
    option.closest('li').hidden = !match;
    matches += Number(match);
  }
  const empty = view.querySelector('.xs-token-empty');
  if (view.querySelector('ul')) empty.hidden = matches > 0;
  view.querySelector('.xs-token-scroll').scrollTop = 0;
});

/* waiting for the external wallet app (send, pay, top up, connect, sign) */
V.mwWait = () => { const k = S.mwWait||{}; const app = k.app||'MetaMask';
  const t = {send:'Approve the transfer', pay:'Approve the payment', topup:'Approve the top up', connect:'Approve the connection', reconnect:'Approve the reconnection', sign:'Sign the message'}[k.kind]||'Approve';
  return `<div class="screen bz">${statusBar()}${topBar(k.title||'Confirm')}
  <div class="scroll"><div class="pad16 stack" style="gap:14px; align-items:center; text-align:center; padding-top:56px">
    <span class="mw-bd ext xl">${app[0]}</span><h1 class="t-title" style="margin:0">Waiting for ${esc(app)}…</h1>
    <p class="t-body muted" style="margin:0">${t} in ${esc(app)}, then come back here.</p>
    ${k.kind==='sign'||k.kind==='connect'?'<span class="tag act">No gas fee</span>':''}</div></div>
  <div class="w2foot">${btn(`Open ${esc(app)}`,'mwApprove')}${btn('Cancel','mwCancel',{kind:'btn-tertiary'})}<template data-demo-input>Open ${esc(app)} to play the result selected under “Approval in wallet app”.</template></div></div>`; };
V.mwCancelled = () => { const k = S.mwWait||{}; const app = k.app||'MetaMask';
  const msg = k.kind==='reconnect' ? 'Wallet reconnection cancelled' : k.kind==='pay' ? 'Payment cancelled in '+app : k.kind==='sign'||k.kind==='connect' ? 'Signature cancelled' : 'Cancelled in '+app;
  return `<div class="screen bz">${statusBar()}${topBar(k.title||'Confirm')}
  <div class="scroll"><div class="pad16 stack" style="gap:12px; padding-top:40px; text-align:center; align-items:center"><span class="big warn">${ic('xcircle')}</span><h1 class="t-title" style="margin:0">${esc(msg)}</h1>
  <p class="t-body muted" style="margin:0">${k.kind==='reconnect'?'Try again to restore access to this wallet.':k.kind==='sign'||k.kind==='connect'?'The wallet wasn’t linked. Try again when you’re ready.':'Nothing was charged.'}</p></div></div>
  <div class="w2foot">${btn('Try again','mwRetry')}${k.kind==='pay'&&wHasYa()?btn('Pay with YouApp wallet','mwPayYa',{kind:'btn-secondary'}):btn('Close','mwClose',{kind:'btn-tertiary'})}</div></div>`; };

/* Activate wallet: choose */
V.wChoose = () => { const p = S.wPick||'ya';
  const card = (k, t, d, chips, rec) => `<button class="mw-card ${p===k?'on':''}" data-act="wPick" data-k="${k}" aria-pressed="${p===k}"><span class="row-between"><b>${t}</b>${rec?'<span class="tag act">Recommended</span>':''}</span><small>${d}</small><span class="mw-chips">${chips.map(c=>`<em>${c}</em>`).join('')}</span><i class="rd"></i></button>`;
  return `<div class="screen bz">${statusBar()}${topBar('Activate wallet')}
  <div class="scroll"><div class="pad16 stack" style="gap:12px; padding-top:6px">
    <h1 class="t-title" style="margin:0">How do you want to hold your money?</h1><p class="t-body muted" style="margin:0">You can add more wallets later and pick one as Main.</p>
    ${card('ya','Create YouApp wallet','Ready in seconds. No other app needed. Confirm payments with your PIN.',['No setup','PIN','Backed up for you'],true)}
    ${card('ext','Connect my wallet','Use a wallet you already have.',['MetaMask','Coinbase Wallet','Rainbow','Phantom','WalletConnect'],false)}
    <p class="t-caption subtle" style="margin:0">Ethereum network · stablecoins only</p></div></div>
  <div class="w2foot">${btn('Continue','wChooseGo')}</div></div>`; };
SHEETS.wProv = () => { const row = (k, ini, t, d) => `<button class="mw-row" data-act="wProvGo" data-k="${k}"><span class="mw-bd ext">${ini}</span><span class="m"><b>${t}</b><small>${d}</small></span>${ic('chev')}</button>`;
  return `<div class="grab"></div><h2 class="t-title" style="margin:0 0 4px">Connect a wallet</h2><p class="t-caption subtle" style="margin:0 0 12px">Choose the wallet app you already use.</p>
  <div class="mw-list">${row('MetaMask','M','MetaMask','The most popular wallet app')}${row('Coinbase Wallet','C','Coinbase Wallet','Self-custody wallet by Coinbase')}${row('Rainbow','R','Rainbow','Simple, friendly wallet app')}${row('Phantom','P','Phantom','Wallet app for mobile and browser')}${row('WalletConnect','W','WalletConnect','Link any other wallet with a QR code')}</div>
  <p class="t-caption subtle" style="margin:12px 0 0">YouApp never sees your recovery phrase.</p>`; };
SHEETS.wQR = () => `<div class="grab"></div><div class="stack" style="gap:12px; align-items:center; text-align:center"><h2 class="t-title" style="margin:0">Scan with your wallet</h2><div class="mw-qr">${typeof qrSvg==='function'?qrSvg(200):''}</div><p class="t-caption subtle" style="margin:0">Open your wallet app on another phone and scan this code, or copy the link.</p>${btn('Copy link','toast',{kind:'btn-secondary', data:'data-msg="WalletConnect link copied."'})}${btn('I’ve scanned it (demo)','wQrDone')}</div>`;
V.wVerify = () => { const app = S.wApp||'MetaMask'; const w = W_ALL[S.walletProviderId] || (S.wApp==='Coinbase Wallet' ? W_ALL.cb : W_ALL.mm);
  return `<div class="screen bz">${statusBar()}${topBar('Verify your wallet')}
  <div class="scroll"><div class="pad16 stack" style="gap:12px; padding-top:6px">
    <p class="t-body muted" style="margin:0">Sign a message to prove this wallet is yours. It’s free and doesn’t move any money.</p>
    <div class="kvbox sp-box"><div class="kv"><span>Wallet</span><b>${esc(app)} · ${xsShort(w.addr)}</b></div><div class="kv"><span>Message</span><b style="text-align:right">YouApp: link this wallet to ${esc(XS_ME.h)} · nonce 48213</b></div></div></div></div>
  <div class="w2foot">${btn('Sign in '+esc(app),'wSign')}</div></div>`; };
V.wConnected = () => { const app = S.wApp||'MetaMask'; const w = W_ALL[S.walletProviderId] || (app==='Coinbase Wallet' ? W_ALL.cb : W_ALL.mm); const first = S.wCtx==='activate'; const on = S.wUseMain!==undefined ? S.wUseMain : first;
  return `<div class="screen bz">${statusBar()}${topBar('Wallet connected')}
  <div class="scroll"><div class="success" style="padding-top:8px">${cele()}<b class="t-headline">${esc(app)} connected</b><span class="t-body subtle mono">${xsShort(w.addr)}</span></div>
  <div class="pad16 stack" style="gap:10px"><button class="mw-tg" data-act="wUseMain" role="switch" aria-checked="${on}" ${first?'aria-disabled="true"':''}><span><b>Use as Main wallet</b><small>${first?'Your first wallet is Main.':'Main is used for transfers and Scan to Pay.'}</small></span><i class="${on?'on':''}"></i></button></div></div>
  <div class="w2foot">${btn('Done','wConnDone')}</div></div>`; };

/* Entry from the 3.0 Activate Wallet screen (Connect my wallet) */
V.wActConnect = () => { S.wCtx = 'activate'; scen.kyc = 'passed';
  const row = (k, ini, t, d) => `<button class="mw-row" data-act="wProvGo" data-k="${k}"><span class="mw-bd ext">${ini}</span><span class="m"><b>${t}</b><small>${d}</small></span>${ic('chev')}</button>`;
  return `<div class="screen bz">${statusBar()}${topBar('Connect a wallet')}
  <div class="scroll"><div class="pad16 stack" style="gap:12px; padding-top:6px"><p class="t-body muted" style="margin:0">Choose the wallet app you already use.</p>
  <div class="mw-list">${row('MetaMask','M','MetaMask','The most popular wallet app')}${row('Coinbase Wallet','C','Coinbase Wallet','Self-custody wallet by Coinbase')}${row('Rainbow','R','Rainbow','Simple, friendly wallet app')}${row('Phantom','P','Phantom','Wallet app for mobile and browser')}${row('WalletConnect','W','WalletConnect','Link any other wallet with a QR code')}</div>
  <p class="t-caption subtle" style="margin:0">YouApp never sees your recovery phrase.</p></div></div></div>`; };
META.wActConnect = {name:'Connect a wallet (from Activate Wallet)', ph:1, rules:['Opened from the 3.0 Activate Wallet screen when the user picks Connect my wallet.','After signing, the wallet is active and Main; the 3.0 app is told the wallet is active.']};

/* My wallets and wallet detail */
V.wallets = () => { const l = wList(); const m = wMain(); const nExt = l.filter(w=>w.ext).length;
  return `<div class="screen bz">${statusBar()}${topBar('My wallets')}
  <div class="scroll"><div class="pad16 stack" style="gap:12px; padding-top:6px">
    <div class="mw-tot"><small>Total in ${l.length} wallet${l.length>1?'s':''}</small><b>${RM(l.reduce((t,w)=>t+wRM(w),0))}</b></div>
    <p class="t-caption subtle" style="margin:0">Main is used for transfers and Scan to Pay.</p>
    <div class="mw-list">${l.map(w=>`<button class="mw-row" data-act="wOpen" data-id="${w.id}">${wBadge(w)}<span class="m"><b>${esc(w.name)}</b><small class="mono">${xsShort(w.addr)} · ${RM(wRM(w))}</small></span>${w.id===m.id?wMainTag:ic('chev')}</button>`).join('')}</div>
    ${!wHasYa() ? `<div class="mw-nudge"><b>Create a YouApp wallet</b><small>Pay with your PIN, no other app needed. Needed for Top Up.</small>${btn('Create','wCreateYa',{kind:'btn-secondary', cls:'btn-sm'})}</div>` : ''}
    ${btn('+ Add wallet', nExt<5?'wAdd':'noop', {kind:'btn-secondary', disabled:nExt>=5})}<p class="t-caption subtle" style="margin:0; text-align:center">Up to 5 connected wallets.</p></div></div></div>`; };
V.wDetail = () => { const w = W_ALL[S.wSel] || wMain(); const isMain = w.id===wMain().id;
  return `<div class="screen bz">${statusBar()}${topBar(w.name)}
  <div class="scroll"><div class="pad16 stack" style="gap:12px; padding-top:6px">
    <div class="mw-hd">${wBadge(w,'lg')}<span><small class="mono">${xsShort(w.addr)} · Ethereum</small><b>${RM(wRM(w))}</b></span>${isMain?wMainTag:''}</div>
    <div class="mw-list">${wToks(w).map(([k,v])=>`<div class="mw-row"><span class="mw-tk lg">${k[0]}</span><span class="m"><b>${k}</b><small>${TOKN[k]}</small></span><span class="r"><b>${tokAmt('',v).trim()}</b><small>${RM(v*RATE[k])}</small></span></div>`).join('')}</div>
    ${btn('Copy Address','xsCopy',{kind:'btn-secondary', cls:'btn-sm', data:`data-v="${esc(w.addr)}"`})}
    ${isMain?'':btn('Set as Main','wSetMain',{kind:'btn-secondary', cls:'btn-sm'})}
    ${w.ext?`<button class="link mw-disc" data-act="sheet" data-s="wDisc">Disconnect wallet</button>`:'<p class="t-caption subtle" style="margin:0">The YouApp wallet can’t be removed.</p>'}</div></div></div>`; };
SHEETS.wDisc = () => { const w = W_ALL[S.wSel]; const isMain = w.id===wMain().id; const alt = wList().find(x=>x.id!==w.id);
  return `<div class="grab"></div><div class="stack" style="gap:12px"><h2 class="t-title" style="margin:0">Disconnect ${esc(w.name)}?</h2><p class="t-body muted" style="margin:0">Your money stays in ${esc(w.app)}. You can connect it again anytime.</p>
  ${isMain&&alt?`<div class="hint">${ic('info')}<span>This is your Main wallet. ${esc(alt.name)} becomes Main.</span></div>`:''}
  ${isMain&&!alt?`<div class="hint warn">${ic('alert')}<span>You need at least one wallet. Create a YouApp wallet first.</span></div>`:btn('Disconnect','wDiscGo')}${btn('Cancel','closeSheet',{kind:'btn-tertiary'})}</div>`; };

/* Top up from a connected wallet */
const _tuPick = SHEETS.tuPick;
SHEETS.tuPick = () => { const ex = wList().filter(w=>w.ext);
  const g = `<div class="pm-g"><small>From my connected wallet</small>${ex.length ? ex.map(w=>`<button class="pmrow" data-act="tuExtGo" data-id="${w.id}">${wBadge(w)}<span><b>${esc(w.name)}</b><small>${wTokLine(w)} · confirm in ${esc(w.app)}</small></span>${ic('chev')}</button>`).join('') : `<button class="pmrow" data-act="wAdd"><span class="mw-bd ext">+</span><span><b>Connect a wallet</b><small>MetaMask, Coinbase Wallet, Rainbow, Phantom, WalletConnect</small></span>${ic('chev')}</button>`}</div>`;
  return _tuPick().replace('<div class="pm-g">', g+'<div class="pm-g">'); };
V.tuExt = () => { const t = S.tuX || (S.tuX = {from:'mm', tok:null, amt:100}); const w = W_ALL[t.from]; const tk = t.tok && w.tok[t.tok] ? t.tok : (wToks(w)[0]||['USDC'])[0]; t.tok = tk; const max = w.tok[tk]||0; const over = t.amt>max;
  if (!wHasYa()) return `<div class="screen bz">${statusBar()}${topBar('Top Up')}<div class="scroll"><div class="pad16 stack" style="gap:12px; padding-top:40px; text-align:center; align-items:center"><span class="mw-bd xl">Y</span><h1 class="t-title" style="margin:0">Create a YouApp wallet first</h1><p class="t-body muted" style="margin:0">Top Up moves money from ${esc(w.app)} into your YouApp wallet.</p></div></div><div class="w2foot">${btn('Create YouApp wallet','wCreateYa')}</div></div>`;
  return `<div class="screen bz">${statusBar()}${topBar('Top Up')}
  <div class="scroll"><div class="pad16 stack" style="gap:12px; padding-top:6px">
    <div class="kvbox sp-box"><div class="kv"><span>From</span><b>${esc(w.name)}</b></div><div class="kv"><span>To</span><b>YouApp wallet</b></div></div>
    <div class="mw-chips big">${wToks(w).map(([k])=>`<button class="${k===tk?'on':''}" data-act="tuXTok" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="tu-amt"><span class="tu-cur">${tk}</span><b>${t.amt.toFixed(2)}</b></div>
    <div class="mw-chips big">${[50,100,200].map(v=>`<button class="${t.amt===v?'on':''}" data-act="tuXAmt" data-v="${v}">${v}</button>`).join('')}<button data-act="tuXAmt" data-v="${Math.floor(max)}">Max</button></div>
    <small class="tu-help">${over?`<span style="color:var(--a-error)">${esc(w.app)} has ${tokAmt(tk,max)}.</span>`:`≈ ${RM(t.amt*RATE[tk])} · ${esc(w.app)} has ${tokAmt(tk,max)}`}</small>
    <div class="kvbox sp-box"><div class="kv"><span>Network fee</span><b>≈ 0.0006 ETH, paid in ${esc(w.app)}</b></div><div class="kv tot"><span>You receive</span><b>${tokAmt(tk,t.amt)}</b></div></div></div></div>
  <div class="w2foot">${btn('Confirm in '+esc(w.app), over?'noop':'tuXGo', {disabled:over})}</div></div>`; };
V.tuExtDone = () => { const t = S.tuX; const w = W_ALL[t.from];
  return `<div class="screen bz">${statusBar()}${topBar('Top Up')}<div class="scroll"><div class="success" style="padding-top:8px">${cele()}<b class="t-headline">${tokAmt(t.tok,t.amt)} added</b><span class="t-body subtle">From ${esc(w.name)} to your YouApp wallet</span></div>
  <div class="pad16"><div class="kvbox sp-box"><div class="kv"><span>Tx hash</span><b><button class="xs-lnk" data-act="xsScanTx">0x9a1f…c33e${ic('xsExt')}</button></b></div><div class="kv"><span>Confirmations</span><b>12 of 12</b></div><div class="kv"><span>Network</span><b>Ethereum · ERC-20</b></div></div></div></div>
  <div class="w2foot">${btn('Done','home')}</div></div>`; };

/* Receive: pick a wallet, any verified stablecoin */
const _xsRecv = V.xsRecv;
V.xsRecv = () => { const w = W_ALL[S.wRecv] && wIds().includes(S.wRecv) ? W_ALL[S.wRecv] : wMain(); let h = _xsRecv();
  h = h.split(xsChunk(XS_ME.addr)).join(xsChunk(w.addr)).split(XS_ME.addr).join(w.addr);
  h = h.replace('<b>Accepts MYRT, XSGD, USDT and USDC</b><small>Ethereum (ERC-20) only. XSGD, USDT and USDC convert to MYRT on arrival. YouApp fee 0%.</small>', '<b>Send stablecoins on Ethereum only</b><small>Accepts MYRT, USDT, USDC, XSGD and other verified stablecoins (ERC-20). Other networks or tokens may be lost.</small>');
  h = h.replace('<small>Your wallet address · Ethereum</small>', `<small>${esc(w.name)} · Ethereum</small>`).replace(">Send MYRT<", ">Send<");
  return h.replace('<section class="xs-qr">', `${wList().length>1?`<button class="mw-pick1" data-act="sheet" data-s="wRecvPick"><small>Wallet</small><b>${wBadge(w,'sm')}${esc(w.name)}${w.id===wMain().id?' <em>Main</em>':''}</b>${ic('chevdown')}</button>`:''}<section class="xs-qr">`); };
SHEETS.wRecvPick = () => `<div class="grab"></div><h2 class="t-title" style="margin:0 0 12px">Receive to</h2><div class="mw-list">${wList().map(w=>`<button class="mw-row" data-act="wRecvSet" data-id="${w.id}">${wBadge(w)}<span class="m"><b>${esc(w.name)}</b><small class="mono">${xsShort(w.addr)}</small></span>${w.id===wMain().id?wMainTag:''}</button>`).join('')}</div>`;

/* YouPage: Main wallet card and My wallets */
const _home = V.home;
V.home = () => { let h = _home(); if (!kycOk()) return h; const m = wMain(); const l = wList();
  const fmt = v => v.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
  if (!S.balHide) h = h.replace(/(<div class="yb-amt"><b>)[\d,]+\.\d{2}(<\/b>)/, `$1${fmt(wRM(m))}$2`);
  const row = `<button class="mw-hrow" data-act="nav" data-to="wallets"><span class="mw-hic">${ic('wallet2')}</span><span class="mw-ht"><b>My wallets (${l.length})</b><small>${RM(l.reduce((t,w)=>t+wRM(w),0))} in total</small></span><em>Manage</em>${ic('chev')}</button>`;
  return h.replace('<!--yp-wl-->', row.replace('class="mw-hrow"','class="mw-hrow yp-wl"')); };

/* Scan to Pay with an external Main wallet */
const _confirm = V.confirm, _done = V.done;
V.confirm = () => { let h = _confirm(); const m = wMain(); if (!m.ext || S.payYa) return h;
  const p = S.pay; const amt = +p.amt||0; const {total} = spFees(amt); const tk = (wToks(m)[0]||['USDC'])[0]; const need = Math.round(total/RATE[tk]*100)/100;
  h = h.replace(`<div class="kv"><span>Pay from</span><b>YouWallet · MYRT ${myrt(bal())}</b></div>`, `<div class="kv"><span>Pay from</span><b>${esc(m.name)} (Main) · ${tk}</b></div>${tk!=='MYRT'?`<div class="kv"><span>${tk} to pay</span><b>${need.toFixed(2)} · 1 ${tk} = RM ${RATE[tk]}</b></div>`:''}<div class="kv"><span>Network fee</span><b>≈ 0.0006 ETH</b></div>`);
  if (scen.extSess==='off') return h.replace(/<div class="w2foot sp-foot">[\s\S]*?<\/div>/, `<div class="w2foot sp-foot"><div class="hint warn">${ic('alert')}<span><b>${esc(m.app)} isn’t connected.</b> Reconnect to pay${wHasYa()?', or pay from your YouApp wallet':''}.</span></div>${btn('Reconnect '+esc(m.app),'mwReconnect')}${wHasYa()?btn('Pay with YouApp wallet','mwPayYa',{kind:'btn-secondary'}):''}</div>`);
  return h.replace(/data-act="(spPay|spTopUp)"/, 'data-act="mwPayExt"').replace(/>(Pay Now|Top Up &amp; Pay RM\d+)</, `>Pay with ${esc(m.app)}<`); };
V.done = () => { let h = _done(); const m = wMain(); if (!m.ext || S.payYa) return h; const p = S.pay; const {total} = spFees(+p.amt); const tk = (wToks(m)[0]||['USDC'])[0];
  return h.replace(/<div class="kv"><span>Updated Balance<\/span><b>[^<]*<\/b><\/div>/, `<div class="kv"><span>Paid from</span><b>${esc(m.name)} · ${tokAmt(tk, total/RATE[tk])}</b></div>`); };

/* Settings › Wallets */
const _settings = V.settings;
V.settings = () => _settings().replace(/<button class="st-row" data-act="copy"[^>]*data-v="0x7a3F[^"]*"[^>]*>[\s\S]*?<\/button>/, `<button class="st-row" data-act="nav" data-to="wallets">${ic('wallet2')}<span><b>My wallets</b><small>${wList().length} wallet${wList().length>1?'s':''} · Main: ${esc(wMain().name)}</small></span>${ic('chev')}</button>`);

const wSetWl = ids => { scen.wl = ids.join(','); if (!ids.includes(scen.mainW)) scen.mainW = ids[0]; saveScen(); };
const mwStart = (kind, app, title, next) => { S.sheet = null; S.mwWait = {kind, app, title, next}; go('mwWait'); };
window.__mainWalletForReconnect = () => {
  const wallet = wMain();
  return wallet ? {name:wallet.ext ? wallet.name : 'YouApp Wallet', ext:wallet.ext,
    app:wallet.app, address:xsShort(wallet.addr)} : null;
};
walletEntryRoutes.walletReconnect = () => {
  const wallet = wMain();
  if (!wallet?.ext) return 'home';
  S.mwWait = {kind:'reconnect', app:wallet.app, title:'Reconnect Wallet', next:'reconnect'};
  return 'mwWait';
};
Object.assign(A, {
  mwFromPick: el => { const x = xsInit(); x.from = el.dataset.id; x.tok = null; x.amt=''; S.sheet = null; render(); },
  mwTokOpen: () => go('mwTok'),
  mwTokPick: el => {
    const token = el.dataset.k;
    if (S.screen !== 'mwTok' || !wToks(xsFromW()).some(([symbol]) => symbol === token)) return;
    if (token !== xsTokSym()) {
      const draft = xsInit();
      draft.tok = token;
      draft.amt = '';
    }
    back();
  },
  mwUseYa: () => { const x = xsInit(); x.from = 'ya'; x.tok = null; S.sheet = null; render(); toast('Switched to your YouApp wallet. Check the amount again.'); },
  mwSendExt: () => { if (!xsReviewReady()) return; const w = xsFromW(); mwStart('send', w.app, 'Send', 'send'); },
  mwPayExt: () => { const m = wMain(); S.payYa = false; mwStart('pay', m.app, 'Scan and Pay', 'pay'); },
  mwPayYa: () => { S.payYa = true; S.mwWait = null; S.hist = S.hist.filter(k=>k!=='mwWait' && k!=='mwCancelled' && k!=='confirm'); go('confirm'); toast('Paying from your YouApp wallet.'); },
  mwReconnect: () => { scen.extSess = 'on'; saveScen(); render(); toast(`${wMain().app} reconnected.`); },
  mwApprove: () => { const k = S.mwWait||{}; if (scen.extOk==='cancel') { go('mwCancelled',{replace:true}); return; }
    if (k.next==='send') { const x = xsInit(); x.fail=false; x.bgDone=false; go('xsProc',{replace:true}); xsRun(); }
    else if (k.next==='pay') go('done',{replace:true});
    else if (k.next==='topup') go('tuExtDone',{replace:true});
    else if (k.next==='reconnect') {
      scen.extSess = 'on'; saveScen(); S.mwWait = null;
      window.parent.__bridge('w2', 'walletReconnected');
    }
    else if (k.next==='connect') go('wVerify',{replace:true});
    else if (k.next==='sign') { S.wUseMain = undefined; go('wConnected',{replace:true}); } },
  mwCancel: () => { go('mwCancelled',{replace:true}); },
  mwRetry: () => { const k = S.mwWait||{}; go('mwWait',{replace:true}); },
  mwClose: () => { if (S.mwWait?.kind === 'reconnect') { S.mwWait = null; back(); return; } S.hist = S.hist.filter(k=>!/^(mw|w[A-Z])/.test(k)); S.screen = S.hist.pop() || 'home'; render(); },
  wPick: el => { S.wPick = el.dataset.k; render(); },
  wChooseGo: () => { if ((S.wPick||'ya')==='ya') { wSetWl(['ya']); scen.mainW='ya'; saveScen(); go('kycActive',{replace:true}); } else { S.sheet = 'wProv'; render(); } },
  wAdd: () => { S.wCtx = 'add'; S.sheet = 'wProv'; render(); },
  wProvGo: el => { const k = el.dataset.k; S.wApp = k==='WalletConnect' ? 'MetaMask' : k; if (k==='WalletConnect') { S.sheet='wQR'; render(); return; } mwStart('connect', S.wApp, 'Connect wallet', 'connect'); },
  wQrDone: () => { S.sheet = null; go('wVerify'); },
  wSign: () => mwStart('sign', S.wApp||'MetaMask', 'Verify your wallet', 'sign'),
  wUseMain: () => { if (S.wCtx==='activate') return; S.wUseMain = !(S.wUseMain); render(); },
  wConnDone: () => { const id = S.wApp==='Coinbase Wallet' ? 'cb' : 'mm'; if (id==='mm') { const a = S.wApp||'MetaMask'; Object.assign(W_ALL.mm, {name:a, app:a, ini:a[0]}); }
    if (S.wCtx==='activate') { wSetWl([id]); scen.mainW = id; scen.kyc = 'passed'; saveScen(); S.wCtx = null;
      let resumedRedPacket = false;
      try {
        const a = window.parent.document.getElementById('a30').contentWindow;
        a.__set?.('wallet','active');
        resumedRedPacket = a.__resumeRedPacketAfterWallet?.();
      } catch(e) {}
      S.hist = ['discover']; S.screen = 'home'; render();
      if (resumedRedPacket) window.parent.__bridge('w2', '__back');
      else toast(`${W_ALL[id].name} is your Main wallet.`);
      return; }
    let ids = wIds(); if (!ids.includes(id)) ids.push(id); else if (!ids.includes('cb')) { ids.push('cb'); } wSetWl(ids); if (S.wUseMain) { scen.mainW = id; saveScen(); }
    S.hist = S.hist.filter(k=>!/^(mw|w[A-Z])/.test(k)); go('wallets',{replace:true}); toast(`${W_ALL[id].name} added.`); },
  wOpen: el => { S.wSel = el.dataset.id; S.walletAssetPage = 1; go('wDetail'); },
  wSetMain: () => { scen.mainW = S.wSel; saveScen(); render(); toast(`${W_ALL[S.wSel].name} is now your Main wallet.`); },
  wRecvOf: () => { S.wRecv = S.wSel; go('xsRecv'); },
  wRecvSet: el => { S.wRecv = el.dataset.id; S.sheet = null; render(); },
  wDiscGo: () => { const id = S.wSel; wSetWl(wIds().filter(k=>k!==id)); S.sheet = null; S.hist = S.hist.filter(k=>k!=='wDetail'); go('wallets',{replace:true}); toast(`${W_ALL[id].name} disconnected. Your money stays there.`); },
  wCreateYa: () => { const ids = wIds(); if (!ids.includes('ya')) ids.unshift('ya'); wSetWl(ids); render(); toast('YouApp wallet created.'); },
  tuExtGo: el => { S.sheet = null; S.tuX = {from:el.dataset.id, tok:null, amt:100}; go('tuExt'); },
  tuXTok: el => { S.tuX.tok = el.dataset.k; render(); },
  tuXAmt: el => { S.tuX.amt = +el.dataset.v; render(); },
  tuXGo: () => { const w = W_ALL[S.tuX.from]; mwStart('topup', w.app, 'Top Up', 'topup'); },
});
Object.assign(META, {
  wChoose:{name:'Activate wallet · choose', ph:1, rules:['After KYC: Create YouApp wallet (Privy embedded, recommended) or Connect my wallet.','The first wallet becomes Main.']},
  wVerify:{name:'Verify wallet ownership', ph:1, rules:['Sign a free message in the wallet app to link it. Rejected or risky (AML) addresses aren’t linked.']},
  wConnected:{name:'Wallet connected', ph:1, rules:['Use as Main toggle (locked on for the first wallet).']},
  wallets:{name:'My wallets', ph:1, rules:['One YouApp wallet and up to 5 external wallets. Main tag on one. Total in RM.','Users without a YouApp wallet see a nudge to create one (needed for Top Up).']},
  wDetail:{name:'Wallet detail', ph:1, rules:['The balance card shows a shortened address and copies the full address.','Each wallet has a Set as Main switch. Disconnect is available for connected wallets. Assets list current holdings first, then the Sera token registry, four per page.']},
  mwWait:{name:'Waiting for the wallet app', ph:1, rules:['External wallets confirm in their own app (deep link or WalletConnect). Open again or cancel.']},
  mwCancelled:{name:'Cancelled in the wallet app', ph:1, rules:['Nothing charged. Try again, or pay with the YouApp wallet.']},
  tuExt:{name:'Top up from a connected wallet', ph:1, rules:['From an external wallet into the YouApp wallet, same token, no conversion. Network fee in ETH paid in the external wallet.']},
  tuExtDone:{name:'Top up · landed', ph:1, rules:['Tx hash and confirmations.']},
});
if (META.xsAmt) META.xsAmt.rules = ['Multi-wallet: From (default Main) and Token rows. Any verified stablecoin the wallet holds.','External wallet: confirm in the wallet app; network fee in ETH. YouApp wallet: PIN as before.', ...(META.xsAmt.rules||[])];
try { render(); } catch(e) {}

/* ===== V2 · Badge Verification gate before Become Elite / Become Merchant =====
   Registration forms need a verified identity. Unverified users get a sheet that sends them to
   Badge Verification (3.0 KYC: ID, selfie, phone). Runs in the capture phase on window, so it fires
   before the shell's webview-form hook. */
const kgA30 = () => { try { return JSON.parse(localStorage.getItem('ya-proto-scen') || '{}'); } catch(e){ return {}; } };
const kgState = () => { const a = kgA30().kyc;
  if (scen.kyc==='passed' || a==='approved') return 'ok';
  if (scen.kyc==='review') return 'review';
  if (scen.kyc==='rejected' || a==='rejected') return 'rejected';
  return 'none'; };
const KG_EL = /^(become (an )?elite|apply to become (an )?elite|apply as (an )?elite|contact support to become (an )?elite|apply now)$/;
const KG_MC = /^(become (a )?merchant|(let.?s )?add (a|another) merchant)$/;
const kgFor = b => { const act = b.dataset.act || ''; const t = (b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  if (/view my request/.test(t)) return null;
  if (act==='elApplyOpen' || act==='shJoinGo' || (act==='contactAdmin' && b.dataset.k==='Elite') || KG_EL.test(t)) return 'elite';
  if (act==='mcApplyOpen' || (act==='contactAdmin' && b.dataset.k==='Merchant') || KG_MC.test(t)) return 'merchant';
  return null; };
window.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('button,a,[data-act]'); if (!b || b.closest('#panel')) return;
  const k = kgFor(b); if (!k || kgState()==='ok') return;
  if (S.sheet==='kycGate') return;
  e.preventDefault(); e.stopImmediatePropagation();
  S.kgFor = k; S.sheet = 'kycGate'; render();
}, true);
SHEETS.kycGate = () => { const st = kgState(); const what = S.kgFor==='merchant' ? 'register as a Merchant' : 'become an Elite';
  const head = st==='review' ? 'Verification in review' : st==='rejected' ? 'Verify your identity again' : 'Verify your identity first';
  const body = st==='review' ? `We’re checking your Badge Verification. You can ${what} once it’s approved, usually within 24 hours.`
    : st==='rejected' ? `Your last Badge Verification didn’t go through. Please try again to ${what}.`
    : `To ${what}, you need a verified badge first. It takes about 2 minutes.`;
  const steps = st==='review' ? '' : `<div class="kg-steps">${[['card','Photo of your ID (MyKad or passport)'],['face','A quick selfie'],['phone','Your mobile number']].map(([i,t])=>`<div class="kg-step">${ic(i)}<span>${t}</span></div>`).join('')}</div>`;
  const cta = st==='review' ? btn('OK, got it','closeSheet') : btn(st==='rejected'?'Try again':'Start Badge Verification','kgStart');
  return `<div class="grab"></div><div class="stack kg" style="gap:14px"><div class="kg-badge">${ic(st==='review'?'hourglass':'verify')}</div>
    <h2 class="t-title" style="margin:0;text-align:center">${head}</h2><p class="t-body muted" style="margin:0;text-align:center">${body}</p>${steps}
    ${cta}${st==='review'?'':btn('Not now','closeSheet',{kind:'btn-tertiary'})}</div>`; };
A.kgStart = () => { S.sheet = null; S.kgBack = S.kgFor; A.kycStart(); };
META.kycGate = META.kycGate || {name:'Badge Verification gate', rules:['Become an Elite and Become Merchant need Badge Verification first. Not verified → this sheet → Badge Verification (KYC). In review → wait message. Rejected → Try again.']};
try { render(); } catch(e) {}

/* YouPage (Figma 3.1 · 89:3594 / 184:4224): swiping to Booking Balance hides the VIP banner and My wallets */
document.addEventListener('scroll', e => { const c = e.target; if (!c.classList || !c.classList.contains('yb-car')) return;
  const book = c.scrollLeft > c.clientWidth/2; if (S.ybBook === book) return; S.ybBook = book;
  const sc = c.closest('.screen'); if (sc) sc.classList.toggle('yp-book', book); }, true);
const _homeYP = V.home;
V.home = () => { const h = _homeYP(); return S.ybBook ? h.replace('<div class="screen">', '<div class="screen yp-book">') : h; };
const _renderYP = render;
render = function(){ const r = _renderYP.apply(this, arguments); if (S.screen==='home' && S.ybBook) { const c = document.querySelector('.yb-car'); if (c) c.scrollLeft = c.scrollWidth; } return r; };

/* Elite ended → Reapply as Elite → contact the admin team (WhatsApp) */
SHEETS.elReWa = () => { const msg = `Hi YouApp Admin, my Elite ended on ${SH_END}. I'd like to reapply as an Elite. My account: ${RF_ME.handle}.`;
  return `<div class="grab"></div><div class="stack" style="gap:14px">
    <div><h2 class="t-title" style="margin:0 0 4px">Contact Admin to reapply</h2><p class="t-body muted" style="margin:0">We’ll open WhatsApp with this message ready. The admin team checks your account and replies within 48 hours.</p></div>
    <div class="sh-wa-msg"><small>Message</small><p>${esc(msg)}</p></div>
    <button class="btn btn-primary sh-wa-btn" data-act="elReWaGo">${WA_IC}Contact Admin</button>${btn('Cancel','closeSheet',{kind:'btn-tertiary'})}</div>`; };
A.elReWaGo = () => { S.sheet = null; render(); toast('Opening WhatsApp with your message to the YouApp admin team.'); };

/* V2 · Red Packet tile on YouPage → create form (lives in the 3.0 app frame) */
SVG.apGift = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M4 8.5c2.6 2.2 5.2 3.3 8 3.3s5.4-1.1 8-3.3"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>';
A.apOpen = () => { try { window.parent.__bridge('w2', 'apNew', {kyc:scen.kyc}); } catch(e) { toast('Red Packet opens in the full flow.'); } };
/* Base balance excludes Red Packet movements, which are applied by bal(). */
window.__apBal = () => wHasYa() ? walletCashBaseCents() : 0;
window.__apConnectedNames = () => wList().filter(wallet => wallet.ext).map(wallet => wallet.name);
try { render(); } catch(e) {}

/* V2 · Activity V3: My Activities on the You page, Create Service on the Host tab */
A.actMineW = () => { try { window.parent.__bridge('w2', 'actMine', {kyc:scen.kyc}); } catch(e) { toast('My Activities opens in the full flow.'); } };
A.createSvcW = () => { try { window.parent.__bridge('w2', 'actNewSvc', {kyc:scen.kyc}); } catch(e) { toast('Create Service opens in the full flow.'); } };
const _homeAct = V.home;
V.home = () => { let h = _homeAct(); const ref = '<h2 class="sec pad16" style="margin-bottom:10px">Referral</h2>';
  const row = `<div class="pad16" style="margin:4px 0 14px"><button class="mw-hrow" data-act="actMineW"><span class="mw-hic">${ic('cal')}</span><span class="mw-ht"><b>My Activities</b><small>Your activities and join requests</small></span><em>Open</em>${ic('chev')}</button></div>`;
  return kycOk() ? h.replace(ref, row + ref) : h; };
try { render(); } catch(e) {}
