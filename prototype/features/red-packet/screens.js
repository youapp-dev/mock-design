/* ===== V2 · Red Packet (MYRT red packet: escrow on create, claim by card / link / QR) ===== */
(function(){
SVG.apGift = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M4 8.5c2.6 2.2 5.2 3.3 8 3.3s5.4-1.1 8-3.3"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>';
SVG.apList = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v5l3 2"/><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/></svg>';
SVG.apFlag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4h11l-1.5 4L16 12H5"/></svg>';

const C = n => fmt2(n/100);                       /* cents → "12.34" */
const MY_ = n => `RM${C(n)}`;   /* 26 Nov: red packet amounts show in RM */
const NOW = () => Date.now();
const AP_TYPES = {lucky:'Lucky draw', random:'Random', equal:'Equal split'};
const AP_CREATE_TITLE = 'Create packet';
const AP_MESSAGES = ['Best wishes!', '恭喜发财', 'Selamat Hari Raya', 'Happy birthday!', 'Thank you!'];
const AP_MESSAGE_LIMIT = 50;
const apPeople = n => `${n} ${n === 1 ? 'person' : 'people'}`;
const apTypeDetails = a => `${AP_TYPES[a.type]} · ${isLucky(a) ? 'No people limit' : apPeople(a.count)}`;
const ME_AV = () => (HOSTS.elsa && HOSTS.elsa.av) || 'avatar';
const who = k => k==='me' ? {n:'You', av:ME_AV()} : (GP(k) || {n:k, av:'avatar'});

/* ---- tier, fee, limits (fee numbers are placeholders) ---- */
const w2s = () => { try { return JSON.parse(localStorage.getItem('w2scen') || '{}'); } catch(e) { return {}; } };
const apTier = () => { const s = w2s(); return s.sh === 'active' ? 'svip' : (s.tier || 'free'); };
const FEE = {free:{pct:0, min:0, name:'Free'}, vip:{pct:0, min:0, name:'VIP'}, svip:{pct:0, min:0, name:'SVIP'}};  /* red packet has no fee */
const LIM = {free:{per:250000, mon:2000000}, vip:{per:500000, mon:15000000}, svip:{per:5000000, mon:200000000}};
const feeOf = total => { const f = FEE[apTier()]; return f.pct === 0 || total <= 0 ? 0 : Math.max(Math.round(total * f.pct / 100), f.min); };
const monLeft = () => { const l = LIM[apTier()].mon; return scen.apLim === 'near' ? 3000 : l - 124000; };

/* Bridge to the prototype wallet and its transaction history. */
const redPackets = createRedPacketStore({
  rates: YouAppLuckyDraw,
  onMovement({kind, packet, cents, reason}) {
    if (kind === 'refund') apTx('angpaoRefund', packet, cents, 'Red Packet refund · ' + reason);
    else if (kind === 'claim') apTx('angpao', packet, cents, 'Red Packet from ' + who(packet.creator).n, true);
    else apTx('angpao', packet, cents, 'Red Packet sent' + (packet.msg ? ' · ' + packet.msg : ''));
  },
  onExpiry(left) {
    push('Red Packet expired', MY_(left) + ' from your unclaimed red packet is back in your wallet.');
  },
  onScheduledExpiry() {
    window.parent.YouAppPrototypeWallet?.refreshBalance();
  },
});
window.__apWalletDelta = redPackets.balanceDelta;
/* Red packet money movements for the Wallet 2.0 Transaction History (rows use its format):
   received (claim), sent (send), and money back when a packet is cancelled, expires or has an unclaimed balance (refund). */
const AP_REFUND_LABEL = {cancelled:'Cancelled', expired:'Expired', 'unused budget':'Unclaimed balance'};
const AP_HISTORY_KIND = {claim:'c', send:'s', refund:'r'};
const apHistoryTitle = m => m.kind === 'claim' ? `Red Packet from ${who(m.packet.creator).n}`
  : m.kind === 'send' ? 'Red Packet sent' : `Red Packet refund · ${AP_REFUND_LABEL[m.reason] || 'Refunded'}`;
/* The sample red packets in Red Packet history get matching past rows, one day apart, so the wallet history matches it. */
const apSampleMovements = () => { apSeed(); const day = 864e5, out = [];
  [...apHistorySamples].filter(tok => !tok.startsWith(PACKET_TEST_TOKEN_PREFIX)).map(apGet).filter(Boolean).forEach((a, i) => {
    const at = new Date(Date.now() - (i + 1) * day); at.setHours(9 + (i * 3) % 10, (i * 17) % 60, 0, 0);
    if (a.creator === 'me') {
      out.push({kind:'send', packet:a, cents:-(a.total + a.fee), at});
      if (a.refunded && a.status !== 'ACTIVE' && !redPackets.movements.some(m => m.kind === 'refund' && m.packet === a)) out.push({kind:'refund', packet:a, cents:a.refunded, at:new Date(at.getTime() + (a.status === 'EXPIRED' ? 6 : 2) * 3600e3),
        reason:{EXPIRED:'expired', CANCELLED:'cancelled', FULLY_CLAIMED:'unused budget'}[a.status]});
    } else { const mine = a.slots.find(slot => slot.by === 'me'); if (mine?.amt) out.push({kind:'claim', packet:a, cents:mine.amt, at}); }
  });
  return out; };
window.__apHistory = () => [...redPackets.movements, ...apSampleMovements()].filter(m => AP_HISTORY_KIND[m.kind] && m.cents).reverse().map(m => ({
  id:`ap-${AP_HISTORY_KIND[m.kind]}-${m.packet.token}`, apTok:m.packet.token, at:m.at,
  m:m.at.toLocaleDateString('en-MY', {month:'short', year:'numeric'}),
  d:m.at.toLocaleString('en-MY', {dateStyle:'medium', timeStyle:'short'}).replace(/\b(am|pm)$/, x => x.toUpperCase()),
  t:apHistoryTitle(m), st:'Completed', v:m.cents / 100, ic:m.kind === 'refund' ? 'refresh' : 'apGift', kind:'ap',
  /* receipt details (Wallet 2.0 red packet receipt) */
  ap:{k:AP_HISTORY_KIND[m.kind], from:who(m.packet.creator).n, type:AP_TYPES[m.packet.type], people:isLucky(m.packet) ? 'No people limit' : apPeople(m.packet.count),
    msg:m.packet.msg, total:m.packet.total / 100, fee:(m.packet.fee || 0) / 100, expiry:m.packet.expLbl, reason:AP_REFUND_LABEL[m.reason] || ''}}));
function apBal() {
  const fallback = w2s().bal === 'low' ? 1240 : 124050;
  const base = window.parent.YouAppPrototypeWallet?.baseCents() ?? fallback;
  return Math.max(0, base + redPackets.balanceDelta());
}
const apGet = token => { apSeed(); return redPackets.packets.find(packet => packet.token === token); };
const apLeft = a => a.slots.filter(s => !s.by).length;
const apOpenedLabel = a => isLucky(a) ? `${a.slots.length} opened` : `${a.count - apLeft(a)} of ${a.count} opened`;
const apAvailability = a => isLucky(a) ? `${MY_(redPacketAmountLeft(a))} left` : `${apLeft(a)} of ${a.count} left`;
const apMine = () => redPackets.packets.filter(a => a.creator === 'me');

/* sample red packet from other people (chat cards) */
let apHistorySamples;
const PACKET_TEST_GROUP = 'g-packet-testing';
const PACKET_TEST_TOKEN_PREFIX = 'packet-test-';
const apMissingTestCards = new Map();
const apTestGates = new Map();

function apTestingGroup() {
  const who = 'lara';
  const msgs = [];
  const cases = [
    {label:'Lucky draw · claim', type:'lucky', total:10000},
    {label:'Random · claim', type:'random', total:800, count:3},
    {label:'Equal split · last slot', count:1},
    {label:'Lucky draw · small remainder', type:'lucky', total:120},
    {label:'Already opened', claimed:['me']},
    {label:'Fully claimed', count:2, claimed:['catherine','daniel']},
    {label:'Expired', expiresAt:NOW() - 1000, expLbl:'1 hour'},
    {label:'Cancelled', close:'CANCELLED'},
    {label:'Invalid link', missing:true},
    {label:'Sign-in required', gate:'guest'},
    {label:'Verification required', gate:'kyc'},
    {label:'Sent by you', creator:'me'},
  ];
  for (const [theme, {name}] of Object.entries(redPacketThemes)) {
    cases.forEach(({label, close, missing, gate, ...options}, index) => {
      const tok = `${PACKET_TEST_TOKEN_PREFIX}${theme}-${index}`;
      const msg = `${name} · ${label}`;
      if (missing) apMissingTestCards.set(tok, {theme, msg});
      else {
        const packet = redPackets.packets.find(item => item.token === tok) || redPackets.create({
          type:'equal', per:200, count:3, creator:who, historical:true,
          luckyRates:YouAppLuckyDraw.baseline, ...options, theme, msg, token:tok,
        });
        if (close) redPackets.close(packet, close);
        else redPackets.settle(packet);
        if (options.creator === 'me' || options.claimed?.includes('me')) apHistorySamples.add(tok);
      }
      if (gate) apTestGates.set(tok, gate);
      msgs.push({id:tok, t:'angpao', tok, who, text:msg, me:options.creator === 'me', at:'Today'});
    });
  }
  return {
    id:PACKET_TEST_GROUP, group:true, name:'Packet Testing', letter:'PT', unread:0, at:'Today',
    bio:'Claim scenarios for all five Red Packet themes. Reload the prototype to replay a fresh claim.',
    myRole:'member', perm:GPERM0(), msgs,
    mem:[{k:'me', role:'member'}, {k:who, role:'owner'}, {k:'catherine', role:'member'}, {k:'daniel', role:'member'}],
  };
}

function apSeed(){
  if (apHistorySamples) return;
  const first = redPackets.packets.length;
  redPackets.create({token:'apCatherine', creator:'catherine', type:'random', total:5000, count:5, msg:'Thanks for the photo walk!', claimed:['fionna','daniel']});
  redPackets.create({token:'apSeraWelcome', creator:'maulguy', type:'equal', per:500, count:6, msg:'Welcome to Sera.cx', claimed:['maulaura','ismaul','maulbucin','maulana','kwang','juan']});
  const ex = redPackets.create({token:'apSeraKopi', creator:'ismaul', type:'random', total:3000, count:6, msg:'Kopi money', claimed:['maulaura','maulana'], expiresAt:NOW()-3600e3, expLbl:'24 hours'}); redPackets.settle(ex);
  redPackets.create({token:'apSeraFriday', creator:'maulaura', type:'random', total:8800, count:8, msg:'Happy Friday!', claimed:['me','maulguy','ismaul','kwang']});
  redPackets.create({token:'apSeraGong', creator:'maulana', type:'random', total:2000, count:5, msg:'Gong Xi Fa Cai', claimed:['juan']});
  redPackets.create({token:'apLaraReady', creator:'lara', type:'random', total:5000, count:5, msg:'For our next adventure!'});
  redPackets.create({token:'apLaraLucky', creator:'lara', type:'lucky', total:10000, msg:'Try your luck!', luckyRates:YouAppLuckyDraw.baseline});
  redPackets.create({token:'apLaraOpened', theme:'raya', creator:'lara', type:'equal', per:500, count:4, msg:'Coffee is on me ☕', claimed:['me']});
  redPackets.create({token:'apLaraFull', theme:'deepavali', creator:'lara', type:'equal', per:300, count:3, msg:'All claimed!', claimed:['catherine','daniel','fionna']});
  const laraExpired = redPackets.create({token:'apLaraExpired', theme:'birthday', creator:'lara', type:'random', total:2400, count:4, msg:'Weekend treat', expiresAt:NOW()-3600e3, expLbl:'24 hours'}); redPackets.settle(laraExpired);
  const laraCancelled = redPackets.create({token:'apLaraCancelled', theme:'youapp', creator:'lara', type:'random', total:1800, count:3, msg:'Plans changed'}); redPackets.close(laraCancelled, 'CANCELLED');
  redPackets.create({token:'apHistoryDeepavali', theme:'deepavali', creator:'catherine', type:'equal', per:600, count:1, msg:'Happy Deepavali!', claimed:['me'], historical:true});
  redPackets.create({token:'apHistoryBirthday', theme:'birthday', creator:'lara', type:'equal', per:800, count:1, msg:'Happy birthday!', claimed:['me'], historical:true});
  redPackets.create({token:'apHistoryYouApp', theme:'youapp', creator:'maulaura', type:'equal', per:300, count:1, msg:'Thanks for joining us!', claimed:['me'], historical:true});
  redPackets.create({token:'apMineActive', theme:'raya', creator:'me', type:'random', total:4000, count:4, msg:'Best wishes!', claimed:['lara']});
  redPackets.create({token:'apMineRandomFull', creator:'me', type:'random', total:8800, count:4, msg:'Happy New Year!', theme:'red', claimed:['lara','catherine','daniel','fionna'], historical:true});
  redPackets.create({token:'apMineFull', theme:'deepavali', creator:'me', type:'equal', per:500, count:3, msg:'Enjoy!', claimed:['lara','catherine','daniel']});
  const mineExpired = redPackets.create({token:'apMineExpired', theme:'birthday', creator:'me', type:'random', total:2100, count:3, msg:'Yesterday’s treat', expiresAt:NOW()-3600e3, expLbl:'6 hours', historical:true}); redPackets.settle(mineExpired);
  const mineCancelled = redPackets.create({token:'apMineCancelled', theme:'youapp', creator:'me', type:'random', total:1600, count:2, msg:'Cancelled packet', historical:true}); redPackets.close(mineCancelled, 'CANCELLED');
  apHistorySamples = new Set(redPackets.packets.slice(first).filter(a => a.creator === 'me' || a.slots.some(slot => slot.by === 'me')).map(a => a.token));
}
const _C6ap = C6;
C6 = function(){ const c = _C6ap(); apSeed();
  if (!c.apTestingGroupSeeded) {
    c.apTestingGroupSeeded = true;
    c.convs.unshift(apTestingGroup());
  }
  c.convs.forEach(v => { if (v.apSeed) return;
    if (v.id === 'c-cat') { v.apSeed = true; v.msgs.push({id:'apm-c1', t:'angpao', tok:'apCatherine', at:'15:02'}); }
    if (v.id === 'c-lara' && !v.apShowcaseV1) { v.apSeed = true; v.apShowcaseV1 = true; v.draft = ''; v.at = 'Now'; v.msgs.push(
      {id:'aps-label-in', t:'text', text:'Received from Lara', at:'16:00'},
      {id:'aps-r1', t:'angpao', tok:'apLaraReady', at:'16:01'},
      {id:'aps-r2', t:'angpao', tok:'apLaraOpened', at:'16:02'},
      {id:'aps-r3', t:'angpao', tok:'apLaraFull', at:'16:03'},
      {id:'aps-r4', t:'angpao', tok:'apLaraExpired', at:'16:04'},
      {id:'aps-r5', t:'angpao', tok:'apLaraCancelled', at:'16:05'},
      {id:'aps-r6', t:'angpao', tok:'apMissingDemo', at:'16:06'},
      {id:'aps-lucky', t:'angpao', tok:'apLaraLucky', at:'16:06'},
      {id:'aps-label-out', me:true, t:'text', text:'Sent by you', at:'16:07'},
      {id:'aps-s1', me:true, t:'angpao', tok:'apMineActive', at:'16:08', st:'sent'},
      {id:'aps-s2', me:true, t:'angpao', tok:'apMineFull', at:'16:09', st:'sent'},
      {id:'aps-s3', me:true, t:'angpao', tok:'apMineExpired', at:'16:10', st:'sent'},
      {id:'aps-s4', me:true, t:'angpao', tok:'apMineCancelled', at:'16:11', st:'sent'}
    ); }
    if (v.id === 'g-sera') { v.apSeed = true; v.msgs.push({id:'apm-g1', t:'angpao', tok:'apSeraWelcome', who:'maulguy', at:'15:05'}, {id:'apm-g2', t:'angpao', tok:'apSeraKopi', who:'ismaul', at:'15:08'}, {id:'apm-g3', t:'angpao', tok:'apSeraFriday', who:'maulaura', at:'15:10'}, {id:'apm-g4', t:'angpao', tok:'apSeraGong', who:'maulana', at:'15:12'}); }
  }); return c; };

/* ---- eligibility (section 2 gate, section 6 checks 1-2) ---- */
const apReady = () => S.session === 'user' && kyc() === 'approved' && scen.wallet === 'active';
const isRedPacketEntry = screen => screen === 'apform' || screen === 'aprecv';
const renderBeforeRedPacketActivation = render;
render = function() {
  if (isRedPacketEntry(S.screen) && S.session === 'user' && !S.apSim && kyc() === 'approved' && scen.wallet !== 'active') {
    S.apResume = S.screen;
    S.actFrom = 'angpao';
    S.screen = 'activate';
    S.sheet = null;
    S.dialog = null;
    S.menu = false;
  }
  return renderBeforeRedPacketActivation.apply(this, arguments);
};
const gateHTML = (title, why) => {
  const notIn = S.session !== 'user' || S.apSim === 'guest';
  const head = notIn ? 'Sign in to continue' : 'Verify your identity first';
  const body = notIn ? `Sign in or sign up to ${why}. We’ll bring you back here after.` : `Badge Verification and an active wallet are needed to ${why}. New members can claim too once both are done.`;
  const cta = notIn ? 'Sign in or sign up' : 'Start Badge Verification';
  return `<div class="screen">${statusBar()}${topBar(title)}<div class="scroll"><div class="apgate"><span class="apgate-ic">${ic('apGift')}</span><h2>${head}</h2><p>${body}</p></div></div>
    <div class="pad16" style="padding-bottom:24px">${btn(cta, 'apGateGo', {cls:'btn-block'})}</div></div>`;
};

/* ---- section 3: create form ---- */
const DURS = [['1h','1 hour',1],['6h','6 hours',6],['24h','24 hours',24],['3d','3 days',72],['7d','7 days',168],['custom','Custom',0]];
const apfNew = () => ({type:'lucky', amt:'', count:null, msg:'', theme:'red', expiryOpen:false, forever:true, dur:'24h', days:'', expUnit:'days', touched:{}});
function apCalc(chat = apConversation(S.apCtx)){
  const f = S.apf;
  const groupPeople = chat?.group ? chat.mem.filter(member => member.k !== 'me').length : null;
  const maxPeople = Math.min(100, groupPeople ?? 100);
  const count = f.count ?? (groupPeople === null ? '' : String(maxPeople));
  const a = Math.round((parseFloat(f.amt) || 0) * 100), n = isLucky(f) ? 0 : parseInt(count, 10) || 0;
  const total = f.type === 'equal' ? a * n : a, fee = feeOf(total), ded = total + fee;
  const e = {};
  if (f.amt !== '' && a < 100) e.amt = f.type === 'equal' ? 'Minimum RM1.00 per person.' : 'Enter at least RM1.00.';
  if (!isLucky(f) && count !== '') {
    if (maxPeople === 0) e.count = 'There’s no one else in this group yet.';
    else if (n < 1) e.count = 'Enter at least 1 person.';
    else if (n > maxPeople) e.count = maxPeople === 100 ? 'Maximum 100 people.' : `Choose up to ${apPeople(maxPeople)} for this group.`;
    else if (f.type === 'random' && a >= 100 && n > Math.floor(a / 100)) e.count = `With RM${C(a)}, you can send to up to ${Math.floor(a / 100)} ${Math.floor(a/100)===1?'person':'people'} (min RM1 each).`;
  }
  const customExp = parseInt(f.days, 10), expUnit = f.expUnit || 'days', expMax = expUnit === 'hours' ? 168 : 365;
  if (!f.forever && f.dur === 'custom' && f.days !== '' && !(String(customExp) === f.days.trim() && customExp >= 1 && customExp <= expMax)) e.days = `Enter whole ${expUnit} from 1 to ${expMax}.`;
  const filled = a > 0 && (isLucky(f) || n > 0) && (f.forever || f.dur !== 'custom' || f.days !== '');
  const bal = apBal(); const lim = LIM[apTier()];
  if (filled && !e.amt && !e.count && ded > bal) e.bal = true;
  if (filled && !e.amt && !e.count && (ded > lim.per || ded > monLeft())) e.lim = ded > lim.per ? `This is above your ${FEE[apTier()].name} limit of ${MY_(lim.per)} per transaction.` : `This is above what’s left of your monthly limit (${MY_(Math.max(0, monLeft()))}).`;
  const ok = filled && !Object.keys(e).length;
  return {a, n, count, groupPeople, maxPeople, total, fee, ded, e, ok, bal};
}
const expOf = () => { const f = S.apf; if (f.forever) return {at:null, lbl:'Never expires'};
  if (f.dur === 'custom') { const n = parseInt(f.days, 10), unit = f.expUnit || 'days', ms = unit === 'hours' ? 3600e3 : 864e5; return {at:NOW() + n*ms, lbl:`${n} ${unit === 'hours' ? 'hour' : 'day'}${n===1?'':'s'}`}; }
  const x = DURS.find(d => d[0] === f.dur); return {at:NOW() + x[2]*3600e3, lbl:x[1]}; };
const fld = (id, key, label, val, o={}) => `<label class="apfld ${o.err?'err':''}" for="${id}"><span class="apfld-l">${label}</span><span class="apfld-box"><input id="${id}" data-apf="${key}" value="${esc(val)}" inputmode="${o.mode||'text'}" placeholder="${o.ph||''}" ${o.max?`maxlength="${o.max}"`:''} autocomplete="off">${o.suf?`<em>${o.suf}</em>`:''}</span>${o.err?`<small class="apfld-e">${o.err}</small>`:o.help?`<small>${o.help}</small>`:''}</label>`;
V.apconf = () => { const f = S.apf, r = apCalc(), x = expOf();
  const rows = [['Type', AP_TYPES[f.type]], ['Recipients', isLucky(f) ? 'No people limit' : apPeople(r.n)], ...(f.type==='equal'?[['Per person', MY_(r.a)]]:[]), [isLucky(f) ? 'Budget' : 'Total', MY_(r.total)], ['Validity', x.lbl], ...(f.msg?[['Message', esc(f.msg)]]:[])];
  return `<div class="screen">${statusBar()}${topBar('Confirm Red Packet')}<div class="scroll"><div class="pad16">
    <div class="apcf-top"><span class="apgate-ic">${ic('apGift')}</span><small>You pay</small><b><span style="margin-right:4px">RM</span>${C(r.ded)}</b></div>
    <div class="boxcard apkv">${rows.map(([k,v])=>`<div class="kv">${k}<b>${v}</b></div>`).join('')}</div>
    <p class="apnote" style="text-align:left">Your money is locked when you pay and paid out as people open it.${x.at?' Anything unclaimed comes back to you when it expires.':''}</p></div></div>
    <div class="pad16 apfoot">${btn(`Pay ${MY_(r.ded)}`,'apPay',{cls:'btn-block', loading:S.apBusy, disabled:S.apBusy})}</div></div>`; };

/* ---- section 5: success + share ---- */
const qrSVG = tok => { let h = 0; const cells = []; const N = 25;
  for (let i = 0; i < tok.length; i++) h = (h * 31 + tok.charCodeAt(i)) >>> 0;
  const fp = (x, y) => (x < 7 && y < 7) || (x >= N-7 && y < 7) || (x < 7 && y >= N-7);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (fp(x, y)) continue; h = (h * 1103515245 + 12345) >>> 0; if ((h >>> 16) & 1) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`); }
  const eye = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x+1}" y="${y+1}" width="5" height="5" fill="#fff"/><rect x="${x+2}" y="${y+2}" width="3" height="3"/>`;
  return `<svg viewBox="-1 -1 27 27" class="apqr" role="img" aria-label="Red Packet QR code"><rect x="-1" y="-1" width="27" height="27" fill="#fff"/><g fill="#1a181b">${cells.join('')}${eye(0,0)}${eye(N-7,0)}${eye(0,N-7)}</g></svg>`; };
const link = a => `youapp.ai/angpao/${a.token}`;
const cardHTML = (a, qr) => { const c = who(a.creator);
  return `<div class="apcard"><div class="apcard-h">${img(c.av, c.n, 'apcard-av')}<span><b>${a.creator==='me'?'Your':esc(c.n)+'’s'} red packet</b><small>${apTypeDetails(a)}</small></span></div>
    <p class="apcard-m">${esc(a.msg || 'Best wishes!')}</p>${qr?`<div class="apcard-q">${qrSVG(a.token)}<small>${link(a)}</small></div>`:''}</div>`; };
const shareBtns = a => { const cx = apConversation(a.sentChatId);
  return `${cx ? `<button class="rp20-primary" type="button" data-act="apSendCtx" data-id="${esc(cx.id)}">Send to ${esc(cx.name)}</button>` : ''}
    <div class="apshare">${[['chat','Send to chat','apPickChat'],['users','Send to group','apPickGroup'],['link','Copy link','apCopy']].map(([i,t,act])=>`<button type="button" data-act="${act}"><span>${ic(i==='users'?'chat':i)}</span>${t}</button>`).join('')}</div>`; };
V.apdone = () => { const a = apGet(S.apTok); const cx = S.apCtx && C6().convs.find(v => v.id === S.apCtx);
  const sub = `${apTypeDetails(a)} · ${a.expLbl}`;
  return `<div class="screen rp20-share" style="${redPacketThemeStyle(a.theme)}">${statusBar()}<div class="topbar"><span style="width:32px"></span><span class="t-headline" style="flex:1; text-align:center">Red Packet ready</span><button class="iconbtn" data-act="apDoneX" aria-label="Close">${ic('close')}</button></div>
    <div class="scroll"><div class="apd">
      <div class="apd-top"><span class="apd-badge">${ic('check')}Paid</span><div class="apd-amt"><span style="margin-right:4px">RM</span>${C(a.total + a.fee)}</div><p>Locked for ${sub}</p></div>
      <div class="apd-qrc">
        <div class="apd-h">${img(ME_AV(), 'You', 'apd-av')}<span><b>${esc(a.msg || 'Best wishes!')}</b><small>Your red packet · ${MY_(a.total)} inside</small></span><span class="apd-env">${redPacketArt(a.theme, 'packet', 'rp20-detail-thumb')}</span></div>
        <div class="apd-qr">${qrSVG(a.token)}</div>
        <small class="apd-cap">Scan to open this red packet</small>
        <div class="apd-ad"><span>${link(a)}</span><button data-act="apCopy" aria-label="Copy link">${ic('copy')}</button></div>
      </div>
      ${cx ? `<button class="apd-b apd-b1 full" data-act="apSendCtx">${ic('send')}Send to ${esc(cx.name)}</button>` : ''}
      <div class="apd-two"><button class="apd-b ${cx?'apd-b2':'apd-b1'}" data-act="apPickChat">${ic('chat')}Send to chat</button><button class="apd-b apd-b2" data-act="apPickGroup">${ic('chat')}Send to group</button></div>
      <p class="apd-note">${a.sentTo.length ? `Sent to ${a.sentTo.map(esc).join(', ')}. You can send the same red packet to more chats.` : isLucky(a) ? 'Everyone uses the same budget. Each person gets one draw while funds last.' : 'Share as many times as you like. It’s the same red packet, first come first served.'}</p>
      <button class="apd-det" data-act="apDetail" data-tok="${a.token}">View details${ic('chev')}</button>
    </div></div></div>`; };

/* ---- section 6: receive ---- */
function apState(a){
  if (S.apSim === 'guest' || S.session !== 'user') return 'guest';
  if (S.apSim === 'kyc' || !apReady()) return 'kyc';
  return redPackets.receiveState(a, 'me');
}
/* Transaction History (Wallet › Transaction): one row per ledger entry, opens the red packet */
function apTx(type, a, cents, title, recv){ try { W().myrt = Math.round((W().myrt + cents/100) * 100) / 100;
  addTxn({type, title, sub:'YouApp Red Packet', amt:cents/100, status:'Completed', apTok:a.token, apRecv:!!recv}); } catch(e) {} }
TXIC7.angpao = 'apGift'; TXIC7.angpaoRefund = 'refresh';
A.openRcpt = (orig => el => { const t = W().txns.find(x => x.id === el.dataset.id);
  if (el.dataset.id?.startsWith('scan-') && typeof window.parent.__bridge === 'function') {
    window.parent.__bridge('a30', 'scanReceipt', {txId:el.dataset.id});
    return;
  }
  if (t && t.apTok) { S.apTok = t.apTok; S.apJust = false; S.apSim = null; go(t.apRecv ? 'aprecv' : 'apdet'); return; } orig(el); })(A.openRcpt);

/* Random packets highlight only the highest allocation. Opening speed is irrelevant. */
const PDI = {
  luck:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3zm-1 4v1a2 2 0 0 0 1.2 1.8A6 6 0 0 1 7 8.5V7zm12 0v1.5a6 6 0 0 1-.2 1.3A2 2 0 0 0 19 8V7z"/></svg>',
};
const PDL = {luck:'Luckiest'};
function apTitles(a){ const got = a.slots.filter(s => s.by).sort((x, y) => (x.ord||0) - (y.ord||0)); const t = {};
  if (!got.length) return {t, got};
  if (a.type !== 'equal') t.luck = got.reduce((m, x) => x.amt > (m?.amt || 0) ? x : m, null);
  return {t, got}; }
const claimList = (a, opt={}) => { const {t, got} = apTitles(a);
  const active = a.status === 'ACTIVE';
  const left = active ? redPacketAmountLeft(a) : 0;
  const pct = a.total ? Math.round(left / a.total * 100) : 0;
  const closedSender = opt.sender && !active;
  const balance = closedSender ? a.total - redPacketAmountLeft(a) : left;
  const balanceLabel = closedSender ? 'Claimed' : opt.sender ? 'Available' : 'Left';
  const stats = `
    <div class="apstat"><div><span class="apstat-i">${ic('chat')}</span><span><small>Total opened</small><b>${got.length}${isLucky(a) ? '' : `/${a.count}`}</b></span></div><div><span class="apstat-i g">${ic('apGift')}</span><span><small>${balanceLabel}</small><b>${MY_(balance)}${opt.sender ? '' : ` <em>(${pct}%)</em>`}</b></span></div></div>`;
  const rows = got.length ? got.map((x, i) => { const p = who(x.by); const tags = t.luck === x ? ['luck'] : [];
      return `<div class="apw ${tags.includes('luck')?'top':''} ${x.by==='me'?'me':''}">${tags.length?`<span class="apw-tag">${tags.map(k=>PDI[k]).join('')}${tags.map(k=>PDL[k]).join(' & ')}</span>`:''}<span class="apw-n">${i+1}</span>${img(p.av, p.n, 'apw-av')}<span class="apw-t"><b>${esc(p.n)}</b><small>Today · ${x.at}</small></span><b class="apw-a">${MY_(x.amt)}</b></div>`; }).join('')
    : opt.sender ? `<p class="apdetail-no-openers">${active ? 'No one has opened it yet.' : 'No one opened this packet.'}</p>`
    : '<p class="apnote" style="text-align:left; margin:12px 0 0">No one has opened it yet.</p>';
  if (opt.sender) {
    const progress = isLucky(a) ? 100 - pct : Math.round(got.length / a.count * 100);
    const meter = active ? `<div class="apdetail-meter" aria-hidden="true"><span style="width:${progress}%"></span></div>` : '';
    return `<section class="apboard apdetail-activity"><h2>Recipients</h2>${stats}${meter}<div class="apw-list">${rows}</div></section>`;
  }
  const exp = active ? (a.expiresAt ? `Runs until ${new Date(a.expiresAt).toLocaleString('en-MY',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}` : '')
    : a.status==='FULLY_CLAIMED' ? (isLucky(a) ? 'All available prizes drawn' : 'All packets opened') : a.status==='EXPIRED' ? 'Expired' : 'Cancelled by the sender';
  return `<div class="apboard">${stats}<div class="apw-list">${rows}</div>${exp ? `<p class="apw-exp">${exp}</p>` : ''}</div>`; };
const apBurst = [
  ['coin', -104, -50, -27, 46, 1.02], ['coin', -38, -99, 19, 0, 1.14], ['coin', 47, -96, -21, 80, 1.02],
  ['coin', 103, -52, 38, 152, .86], ['coin', -23, -43, 19, 104, .72], ['coin', 23, -57, -28, 196, .78],
  ['note', -77, -77, -28, 30, 1.14], ['note', 77, -72, 27, 67, 1.16], ['note', 108, -22, 37, 145, .91],
  ['note', -108, -27, -30, 238, .87], ['note', 11, -82, -14, 170, .83],
  ['star', -130, -58, 19, 125, 1], ['star', 19, -107, 20, 143, 1], ['star', 130, -74, -20, 232, 1],
  ['ribbon', -111, -95, -32, 125, 1], ['ribbon', 95, -100, 46, 229, 1],
  ['coin', -67, -65, -36, 425, .87], ['coin', 65, -62, 31, 514, .85], ['coin', 5, -91, 18, 474, .93],
  ['note', -117, -59, -32, 440, .96], ['note', 116, -69, 36, 553, .98],
  ['star', 120, -23, 20, 548, 1], ['ribbon', -129, -18, 49, 565, 1],
];
function apConversation(id) {
  return id ? C6().convs.find(c => c.id === id && !c.gone && (!c.group || myRole(c) !== 'member' || c.perm?.send)) : null;
}

function apPersonChat(key) {
  const name = who(key).n;
  return C6().convs.find(c => !c.group && (c.id === 'c-' + key || c.name === name));
}

function apOpenResult(a, claim, sender) {
  const {got} = apTitles(a);
  const source = apConversation(S.apSource) || apPersonChat(a.creator);
  const target = apPersonChat(a.creator);
  const progress = isLucky(a) ? apOpenedLabel(a) : `${got.length} of ${a.count} opened`;
  return `<section class="rp20-result${S.apJust ? ' is-new' : ''}">
    <header class="rp20-sender-chip">${img(sender.av, '')}<span>${esc(sender.n)} · “${esc(a.msg || 'Best wishes!')}”</span></header>
    <div class="apreceive-result" role="status" aria-label="You got ${MY_(claim.amt)}. Added to YouWallet." tabindex="-1">
      <small>You got</small><strong aria-hidden="true"><span class="rp20-cur">RM</span><span data-ap-payout="${claim.amt}">${C(claim.amt)}</span></strong>
      <span>✓ Added to YouWallet</span>
    </div>
    <div class="rp20-result-actions">${source ? '<button type="button" class="rp20-secondary" data-act="apThanks">Say thanks</button>' : ''}${target ? '<button type="button" class="rp20-primary" data-act="apReturnGift">Send one back</button>' : ''}</div>
    <div class="rp20-result-progress"><span class="rp20-openers" aria-hidden="true">${got.slice(-5).map(slot => img(who(slot.by).av, '')).join('')}</span>
      <span>${progress}</span><button type="button" class="rp20-secondary" data-act="apToggleOpeners" aria-expanded="${Boolean(S.apShowOpeners)}">View openers</button></div>
    ${S.apShowOpeners ? claimList(a) : ''}
    <img class="rp20-confetti" src="../features/red-packet/art/result-confetti.svg" alt="" aria-hidden="true">
    ${redPacketArt(a.theme, 'strip', 'rp20-strip')}
  </section>`;
}

function apReceivePanel(a, claim) {
  const sender = who(a.creator);
  const opening = S.apOpening?.has(a.token);
  const celebrate = Boolean(claim && S.apJust);
  const burst = celebrate ? apBurst.map(([type, x, y, turn, delay, size]) => `<span class="ap-burst-piece ap-burst-${type}" style="--x:${x}px;--y:${y}px;--turn:${turn}deg;--delay:${delay}ms;--size:${size}"></span>`).join('') : '';
  const expires = a.expiresAt ? new Date(a.expiresAt) : null;
  const stage = `<div class="rp20-scene-stage ${claim ? (celebrate ? 'is-celebrating' : 'is-open') : opening ? 'is-opening' : 'is-ready'}">
    ${redPacketArt(a.theme, claim ? 'opened' : opening ? 'opening' : 'packet', claim || opening ? 'rp20-opened' : 'rp20-closed')}
    ${burst ? `<div class="rp20-burst" aria-hidden="true">${burst}</div>` : ''}
    ${claim ? '' : `<button type="button" class="rp20-open" data-act="apOpenIt"${opening ? ' disabled aria-busy="true"' : ''}>${opening ? 'Opening…' : a.theme === 'youapp' ? '<span class="rp20-open-brand"><img src="../../design-system/assets/Logos/youapp-mark.svg" alt="">Open</span>' : 'Open'}</button>`}
  </div>`;
  if (claim) return stage + apOpenResult(a, claim, sender);
  return `<header class="rp20-sender">${img(sender.av, '')}<h1>${esc(sender.n)} sent you a red packet</h1>
    <p>${apTypeDetails(a)}</p></header>${stage}
    <p class="rp20-progress">${isLucky(a) ? apAvailability(a) : `${a.count - apLeft(a)} of ${a.count} opened`}
      ${expires ? `<time datetime="${expires.toISOString()}">Expires ${expires.toLocaleString('en-MY', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</time>` : ''}</p>`;
}

V.aprecv = () => {
  const a = apGet(S.apTok);
  const theme = a?.theme || apMissingTestCards.get(S.apTok)?.theme;
  const st = apState(a);
  if (st === 'guest' || st === 'kyc') return gateHTML('Red Packet', 'open this red packet');
  const top = `<div class="topbar"><button class="iconbtn" type="button" data-act="back" aria-label="Close">${ic('close')}</button><span class="t-headline" style="flex:1;text-align:center">${['ready','claimed'].includes(st) ? '' : 'Red packet'}</span>${a ? `<button class="iconbtn" type="button" data-act="apReport" aria-label="Report red packet">${ic('apFlag')}</button>` : ''}</div>`;
  const state = (title, detail, extra = '') => `<div class="rp20-state"><section class="rp20-state-card">
    ${redPacketArt(theme, 'packet')}<h2>${title}</h2><p>${detail}</p>${extra}</section></div>`;
  let body;
  if (st === 'notfound') body = state('Red packet not found', 'Check that you have the full link or QR code.');
  else if (st === 'ended') body = state(a.status === 'CANCELLED' ? 'Red packet cancelled' : 'Red packet expired', a.status === 'CANCELLED' ? 'The sender cancelled this red packet.' : 'The time to open this red packet has ended.', claimList(a));
  else if (st === 'own') body = state('This is your red packet', 'Share it so others can open it.', `<button class="rp20-primary" type="button" data-act="apDetail" data-tok="${esc(a.token)}">View details</button>`);
  else if (st === 'full') body = state('Red packet fully claimed', isLucky(a) ? 'All available prizes have been drawn.' : 'All packets have been opened.', claimList(a));
  else body = apReceivePanel(a, st === 'claimed' ? a.slots.find(slot => slot.by === 'me') : null);
  return `<div class="screen rp20-receive${st === 'claimed' ? ' is-claimed' : ''}" style="${redPacketThemeStyle(theme)}">
    ${redPacketArt(theme, 'scene', 'rp20-scene')}${statusBar()}${top}<div class="scroll">${body}</div></div>`;
};

function apAnimatePayout() {
  const value = document.querySelector('[data-ap-payout]');
  if (!value || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const payout = Number(value.dataset.apPayout);
  const start = performance.now() + 850;
  value.textContent = C(0);
  function frame(now) {
    if (!value.isConnected) return;
    const progress = Math.max(0, Math.min(1, (now - start) / 700));
    value.textContent = C(Math.round(payout * (1 - (1 - progress) ** 3)));
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---- section 7: sender detail ---- */
const STL = {ACTIVE:['Active','ok'], FULLY_CLAIMED:['Fully claimed','done'], EXPIRED:['Expired','off'], CANCELLED:['Cancelled','off']};
const apHistoryArt = (theme = 'red') => `<div class="aphist-art" aria-hidden="true">${redPacketArt(theme, 'packet', 'rp20-detail-thumb')}</div>`;
function apCompletedRecap(a) {
  const {t} = apTitles(a);
  const winner = t.luck && who(t.luck.by);
  const winnerChat = t.luck && apPersonChat(t.luck.by);
  const claimed = a.total - redPacketAmountLeft(a);
  const progress = isLucky(a) ? apOpenedLabel(a) : `All ${a.count} opened`;
  const summary = `<p class="rp20-recap-summary">${progress} · ${MY_(claimed)} claimed${a.refunded ? ` · <b>${MY_(a.refunded)} back to you</b>` : ''}</p>`;
  if (!winner) return `<section class="rp20-recap-neutral">${redPacketArt(a.theme, 'packet', 'rp20-detail-thumb')}<h1>Red packet complete</h1>${summary}</section>`;
  return `<section class="rp20-winner">
    <div class="rp20-winner-art"><img src="../features/red-packet/art/winner.svg?v=coin-rm" alt="Luckiest" width="358" height="230">${img(winner.av, '', 'rp20-winner-avatar')}</div>
    ${redPacketArt(a.theme, 'packet', 'rp20-detail-thumb')}
    <h1>${esc(winner.n)} got the most!</h1>
    <p><strong>${MY_(t.luck.amt)}</strong> from your ${MY_(a.total)} red packet</p>
    ${winnerChat ? `<button type="button" class="rp20-secondary" data-act="apCongratulate" data-id="${esc(winnerChat.id)}">Congratulate ${esc(winner.n)}</button>` : ''}
  </section>${summary}`;
}
V.apdet = () => {
  const a = apGet(S.apTok);
  if (!a) return V.aprecv();
  redPackets.settle(a);
  const [status, tone] = STL[a.status];
  const active = a.status === 'ACTIVE';
  const complete = a.status === 'FULLY_CLAIMED';
  const lucky = isLucky(a);
  const unclaimed = apLeft(a);
  const rows = [['Type', AP_TYPES[a.type]], ['Recipients', lucky ? 'No people limit' : apPeople(a.count)]];
  if (a.type === 'equal') rows.push(['Per person', MY_(a.per)]);
  if (a.expiresAt) rows.push(['Scheduled expiry', new Date(a.expiresAt).toLocaleString('en-MY', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})]);
  if (a.fee) rows.push(['Fee', MY_(a.fee)]);
  const refundNote = lucky ? 'Unused budget returned to your wallet.'
    : `Returned to your wallet from ${unclaimed} unclaimed ${unclaimed === 1 ? 'packet' : 'packets'}.`;
  return `<div class="screen apdetail" style="${redPacketThemeStyle(a.theme)}">${statusBar()}${topBar(complete ? 'Your red packet' : 'Red Packet details')}<div class="scroll"><div class="aphist-content">
    ${complete ? apCompletedRecap(a) : `<section class="aphist-hero apdetail-hero"><span class="apst ${tone}">${status}</span><h1>${esc(a.msg || 'Best wishes!')}</h1>
      <small>${lucky ? 'Packet budget' : 'Packet total'}</small><strong class="apdetail-total">${MY_(a.total)}</strong>${apHistoryArt(a.theme)}</section>`}
    ${a.refunded && !complete ? `<section class="apdetail-refund"><span class="apdetail-refund-icon">${ic('check')}</span><div><h2><strong>${MY_(a.refunded)}</strong> refunded</h2><p>${refundNote}</p></div></section>` : ''}
    ${active ? `<div class="apdetail-share">${shareBtns(a)}</div>` : ''}
    ${claimList(a, {sender:true})}
    ${complete ? `<div class="rp20-result-actions">${apConversation(a.sentChatId) ? '<button type="button" class="rp20-secondary" data-act="apThankEveryone">Thank everyone</button>' : ''}
      <button type="button" class="rp20-primary" data-act="apSendAnother">Send another</button></div>` : ''}
    <section class="apdetail-section"><h2>Packet info</h2><dl>${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section>
    ${active && redPacketAmountLeft(a) ? `<button type="button" class="btn btn-tertiary apcancel" data-act="apCancelAsk">Cancel remaining red packet</button>` : ''}</div></div></div>`;
};

/* ---- my red packet (sent / received) ---- */
V.aplist = () => {
  apSeed();
  const tab = S.apTab || 'sent';
  const sent = tab === 'sent';
  const isVisible = a => !S.apHideHistorySamples || !apHistorySamples.has(a.token);
  const history = sent ? apMine().filter(isVisible).reverse().map(a => ({a}))
    : redPackets.packets.filter(isVisible).map(a => ({a, claim:a.slots.find(slot => slot.by === 'me')})).filter(item => item.claim)
      .sort((a, b) => (b.claim.ord || 0) - (a.claim.ord || 0));
  const tabs = `<div class="aphist-tabs" role="tablist" aria-label="Red packet history">${[['sent','Sent'],['got','Received']].map(([value, label]) => `<button type="button" id="aphist-tab-${value}" role="tab" aria-selected="${tab === value}" aria-controls="aphist-panel" data-act="apTab" data-v="${value}">${label}</button>`).join('')}</div>`;
  history.forEach(({a}) => redPackets.settle(a));
  const rows = history.map(({a, claim}) => {
    const [status, tone] = STL[a.status];
    const sender = who(a.creator);
    const theme = redPacketTheme(a.theme);
    const themeName = redPacketThemes[theme].name;
    return `<li><button type="button" class="aphist-row" data-side="${tab}" data-state="${a.status}" data-act="${sent ? 'apDetail' : 'apOpenTok'}" data-tok="${esc(a.token)}">
      <span class="aphist-row-icon" style="${redPacketThemeStyle(theme)}" aria-hidden="true">${redPacketArt(theme, 'packet', 'rp20-history-thumb')}</span>
      <span class="aphist-row-copy"><b>${esc(a.msg || 'Best wishes!')}</b><small>${themeName} &middot; ${sent ? apOpenedLabel(a) : `From ${esc(sender.n)}`}</small></span>
      <span class="aphist-row-value"><b>${sent ? `−${MY_(a.total + a.fee)}` : `${claim.amt ? '+' : ''}${MY_(claim.amt)}`}</b>${sent ? `<span class="apst ${tone}">${status}</span>` : ''}</span>${ic('chev')}</button></li>`;
  }).join('');
  const count = history.length;
  const summary = sent ? `${history.filter(({a}) => a.status === 'ACTIVE').length} active` : `${count} ${count === 1 ? 'packet' : 'packets'} opened`;
  const total = sent ? count : MY_(history.reduce((sum, {claim}) => sum + claim.amt, 0));
  const content = count ? `<section class="aphist-hero"><small>${sent ? 'Packets sent' : 'Total received'}</small><strong>${total}</strong><p>${summary}</p>${apHistoryArt()}</section><ul class="aphist-items">${rows}</ul>`
    : `<section class="aphist-empty">${apHistoryArt()}<h2>${sent ? 'No red packets sent yet' : 'No red packets received yet'}</h2>
      <p>${sent ? 'Send a red packet to a friend or group.' : 'Open a red packet from a chat and it’ll appear here.'}</p>
      ${btn(sent ? 'Create red packet' : 'Open chats', sent ? 'apNew' : 'apHistoryChats')}</section>`;
  const create = sent && count ? `<button class="iconbtn" type="button" data-act="apNew" aria-label="Create red packet">${ic('plus')}</button>` : '<span style="width:32px"></span>';
  return `<div class="screen aphist">${statusBar()}<div class="topbar"><button class="iconbtn" type="button" data-act="back" aria-label="Back">${ic('back')}</button><span class="t-headline" style="flex:1;text-align:center">My Red Packet</span>${create}</div>
    ${tabs}<div class="scroll" role="tabpanel" id="aphist-panel" aria-labelledby="aphist-tab-${tab}"><div class="aphist-content">${content}</div></div></div>`;
};

/* ---- chat card ---- */
const _msgHTMLap = msgHTML;
msgHTML = function(m, c, idx){
  if (m.t !== 'angpao') return _msgHTMLap(m, c, idx);
  const a = apGet(m.tok); if (m.id === undefined) m.id = 'm'+idx;
  const card = a || apMissingTestCards.get(m.tok);
  let st = 'Tap to open', dim = false;
  if (!a) { st = 'Red Packet not found'; dim = true; }
  else { redPackets.settle(a);
    if (a.creator === 'me') { st = a.status==='ACTIVE' ? `${apOpenedLabel(a)} · View details` : STL[a.status][0]; dim = a.status !== 'ACTIVE'; }
    else if (a.slots.some(s => s.by === 'me')) { st = 'Opened'; dim = true; }
    else if (a.status === 'EXPIRED') { st = 'Expired'; dim = true; }
    else if (a.status === 'CANCELLED') { st = 'Cancelled by sender'; dim = true; }
    else if (a.status === 'FULLY_CLAIMED') { st = 'Fully claimed'; dim = true; } }
  const p = c.group && !m.me && m.who ? GP(m.who) : null;
  const bub = `<div class="bub apbub rp20-chat ${m.me?'me':''} ${dim?'apdim':''}" style="${redPacketThemeStyle(card?.theme)}" data-id="${m.id}">${p?`<b class="gwho">${esc(p.n)}</b>`:''}<button class="rp-chat-card" data-act="apTap" data-tok="${m.tok}"><span class="rp-chat-icon">${redPacketArt(card?.theme, 'packet')}</span><span class="rp-chat-copy"><b>${esc(card?.msg || 'Best wishes!')}</b><small>${st}</small></span></button><span class="apb-f">YouApp Red Packet</span><span class="bmeta">${m.at}${m.me?' ✓✓':''}</span></div>`;
  return p ? `<div class="grow">${img(p.av, p.n, 'gmav')}${bub}</div>` : bub; };

/* ---- overlays: attach row, chooser, chat/group picker, cancel dialog ---- */
const _ovAp = overlayHTML;
overlayHTML = () => { let h = _ovAp();
  if (S.sheet === 'cAttach' && S.screen === 'chat' && apConversation(S.conv)) h = h.replace('Photo &amp; Video Gallery</button>', `Photo &amp; Video Gallery</button><button class="menurow" data-act="apAttach">${ic('apGift')}Red Packet</button>`);
  const sh = (inner, label, close = 'apSheetX') => `<div class="scrim ${S.sheetAnim?'anim':''}" data-act="${close}"></div><div class="sheet ${S.sheetAnim?'anim':''}" role="dialog" aria-label="${label}"><div class="grab" aria-hidden="true"></div>${inner}</div>`;
  if (S.sheet === 'apWallet') {
    const connected = window.parent.YouAppPrototypeWallet?.connectedNames?.() ?? [];
    const otherWallets = connected.map(name => `<button class="aplrow rp20-wallet-option" type="button" disabled>
      <span class="apl-ic">${ic('wallet')}</span><span><b>${esc(name)}</b><small>Unavailable for Red Packet</small></span></button>`).join('');
    h += sh(`<h2 class="t-headline rp20-wallet-heading">Change wallet</h2>
      <button class="aplrow rp20-wallet-option" type="button" data-act="apWalletDone">
        <img class="rp20-wallet-flag" src="../features/red-packet/art/wallet-flag.svg" alt="">
        <span><b>YouWallet</b><small>${RM(apBal() / 100)} available</small></span><span class="apst ok">Selected</span>
      </button>${otherWallets}
      <p class="t-caption muted">Red packets are paid from YouWallet.</p>
      <button class="rp20-secondary rp20-wallet-topup" type="button" data-act="apTopUp">Top up YouWallet</button>`, 'Change wallet', 'apWalletDone');
  }
  if (S.sheet === 'apChoose') { const act = apMine().filter(a => { redPackets.settle(a); return a.status === 'ACTIVE'; });
    h += sh(`<h2 class="t-headline" style="margin:0 0 8px">Red Packet</h2><button class="menurow" data-act="apNewCtx">${ic('plus')}Create new red packet</button>
      <p class="kicker3" style="margin:14px 0 6px">Send a red packet you created</p>${act.length ? act.map(a => `<button class="aplrow" data-act="apSendExisting" data-tok="${a.token}"><span class="apl-ic">${ic('apGift')}</span><span><b>${esc(a.msg || 'Best wishes!')}</b><small>${AP_TYPES[a.type]} · ${apAvailability(a)}</small></span><span class="aprow-r"><b>${C(a.total)}</b></span></button>`).join('') : `<p class="apnote" style="text-align:left">No active red packet yet. Create one and it shows up here.</p>`}`, 'Red Packet');
  }
  if (S.sheet === 'apPick') { const grp = S.apPickK === 'group'; const list = C6().convs.filter(v => grp ? (v.group && !v.gone) : (!v.group));
    const a = apGet(S.apTok);
    h += sh(`<h2 class="t-headline" style="margin:0 0 8px">${grp?'Send to group':'Send to chat'}</h2>${list.length ? list.map(v => { const sent = a && a.sentTo.includes(v.name);
      return `<button class="aplrow" data-act="apSendTo" data-id="${v.id}">${grp ? gAv(v,'av36g') : img(v.av, v.name, 'av36r')}<span><b>${esc(v.name)}</b><small>${grp ? v.mem.length+' members' : 'Chat'}</small></span><span class="aprow-r">${sent?'<i class="apst done">Sent</i>':`<i class="apsend">Send</i>`}</span></button>`; }).join('')
      : `<p class="apnote" style="text-align:left">${grp ? 'You’re not in any group yet.' : 'No chats yet.'}</p>`}`, 'Send to');
  }
  if (S.dialog === 'apCancel') { const a = apGet(S.apTok); const left = apLeft(a); const amt = redPacketAmountLeft(a);
    const refund = isLucky(a) ? `${MY_(amt)} in unused budget` : `${left} unclaimed packet${left===1?'':'s'} (${MY_(amt)})`;
    h += gModal('alert', 'Cancel remaining red packet?', `${refund} will go back to your wallet. Anything already paid out stays with its recipient.`, ['Cancel Red Packet','apCancelOk'], ['Keep It','closeDialog']); }
  return h; };

/* ---- actions ---- */
const sendCard = (convId, tok) => {
  const v = apConversation(convId);
  const a = apGet(tok);
  if (!v || !a) return null;
  v.msgs.push({id:'ap-' + tok + '-' + v.msgs.length, t:'angpao', tok, me:true, at:'Now', st:'sent'}); v.at = 'Now';
  a.sentChatId ||= v.id;
  if (!a.sentTo.includes(v.name)) a.sentTo.push(v.name);
  return v;
};
function apVisitChat(chat, draft) {
  if (S.conv === chat.id && S.hist.at(-1) === 'chat') S.hist.pop();
  S.apSource = chat.id;
  S.conv = chat.id;
  S.ctext = [chat.draft, draft].filter(Boolean).join(' ').slice(0, 1000);
  chat.draft = S.ctext;
  go('chat', {replace:true});
  setTimeout(scrollChat, 20);
}

function apFinishSend() {
  const chat = apConversation(S.apSentChat);
  if (chat) {
    apVisitChat(chat);
  } else go('apdone', {replace:true});
}

function apShowSend(a) {
  S.apTok = a.token;
  S.apBusy = false;
  S.apSentChat = (apConversation(S.apCtx) && sendCard(S.apCtx, a.token))?.id;
  const previousForm = S.hist.lastIndexOf('apform');
  if (previousForm >= 0) S.hist = S.hist.slice(0, previousForm);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return apFinishSend();
  const session = S;
  go('apsending', {replace:true});
  setTimeout(() => {
    if (S === session && S.screen === 'apsending' && S.apTok === a.token) apFinishSend();
  }, 1370);
}

V.apsending = () => {
  const a = apGet(S.apTok);
  const chat = apConversation(S.apSentChat);
  return `<div class="screen rp20-sending" style="${redPacketThemeStyle(a?.theme)}">${statusBar()}
    <div class="topbar"><span class="t-headline" style="flex:1;text-align:center">Red packet</span><button class="iconbtn" type="button" data-act="apFinishSend" aria-label="Continue">${ic('close')}</button></div>
    <div class="rp20-send-stage"><img class="rp20-send-trail" src="../features/red-packet/art/send-trail.svg" alt="" aria-hidden="true">
      ${redPacketArt(a?.theme, 'packet', 'rp20-flight')}<div class="rp20-sent-mark" role="status"><span>${ic('check')}</span>
      <h2>${chat ? `Sent to ${esc(chat.name)}` : 'Red packet ready'}</h2><p>${a ? MY_(a.total) : ''}</p></div></div>
  </div>`;
};
Object.assign(A, {
  apNew: () => { S.apf = apfNew(); S.apCtx = null; S.apSim = null; go('apform'); },
  apAttach: () => { S.apCtx = S.conv; openSheet('apChoose'); },
  apNewCtx: () => { S.sheet = null; S.apf = apfNew(); S.apCtx = S.conv; S.apSim = null; go('apform'); },
  apFinishSend,
  apThanks: () => {
    const a = apGet(S.apTok);
    const chat = a && (apConversation(S.apSource) || apPersonChat(a.creator));
    if (chat) apVisitChat(chat, 'Thank you for the red packet!');
  },
  apReturnGift: () => {
    const a = apGet(S.apTok);
    const chat = a && apPersonChat(a.creator);
    if (!chat) return;
    S.apCtx = chat.id;
    S.apf = {...apfNew(), theme:redPacketTheme(a.theme)};
    S.apSim = null;
    go('apform');
  },
  apCongratulate: el => {
    const chat = apConversation(el.dataset.id);
    if (chat) apVisitChat(chat, 'Congrats! You got the biggest share.');
  },
  apThankEveryone: () => {
    const a = apGet(S.apTok);
    const chat = apConversation(a?.sentChatId);
    if (chat) apVisitChat(chat, 'Thanks everyone for opening my red packet!');
  },
  apSendAnother: () => {
    const a = apGet(S.apTok);
    S.apf = {...apfNew(), theme:redPacketTheme(a?.theme)};
    S.apCtx = apConversation(a?.sentChatId)?.id || null;
    go('apform');
  },
  apToggleOpeners: () => { S.apShowOpeners = !S.apShowOpeners; render(); },
  apSendExisting: el => { const v = sendCard(S.conv, el.dataset.tok); if (!v) return; S.sheet = null; render(); setTimeout(scrollChat, 20); toast(`Red Packet sent to ${v.name}.`); },
  apSheetX: () => { S.sheet = null; render(); },
  apType: el => {
    const mode = el.dataset.v;
    if (mode === S.apf.type) return;
    const scroll = document.getElementById('apScroll')?.scrollTop || 0;
    const keyboardFocus = el.matches(':focus-visible');
    S.apf.type = mode;
    S.apf.amt = '';
    render();
    document.getElementById('apScroll')?.scrollTo(0, scroll);
    if (keyboardFocus) document.querySelector(`.ap-modes [data-v="${mode}"]`)?.focus({preventScroll:true});
  },
  apTopUp: () => {
    if (!window.parent.__bridge) return A.openTopup();
    S.sheet = null;
    window.parent.__bridge('a30', 'walletTopUp', {kyc:scen.kyc, wallet:scen.wallet, host:scen.host});
  },
  apUpgrade: () => { try { window.parent.__bridge('a30', 'subscribe', {}); } catch(e) { toast('Opens Choose plan (VIP, SVIP).'); } },
  apNext: () => { if (!apCalc().ok) return; S.apKey = 'k' + Date.now(); go('apconf'); },
  apPay: () => { if (S.apBusy || !apReady() || !apCalc().ok) return; const key = S.apKey, session = S, form = S.apf;
    auth('Send angpao', () => {
      if (S !== session || S.apKey !== key || S.apf !== form) return;
      const alreadySent = redPackets.sentWithKey(key);
      if (alreadySent) { S.apTok = alreadySent.token; apFinishSend(); return; }
      S.apBusy = true; render();
      setTimeout(() => {
        if (S !== session || S.apKey !== key) return;
        if (S.apf !== form || (S.screen !== 'apform' && S.screen !== 'apconf')) {
          S.apBusy = false;
          if (S.screen === 'apform') render();
          return;
        }
        const f = form, r = apCalc(), x = expOf();
        if (!apReady() || !r.ok) { S.apBusy = false; render(); toast('Check the balance and red packet details, then try again.','err'); return; }
        apSeed();
        const a = redPackets.send({type:f.type, total:r.total, per:f.type==='equal'?r.a:0, count:r.n, fee:r.fee, msg:f.msg.trim(), expiresAt:x.at, expLbl:x.lbl, theme:f.theme}, key);
        apShowSend(a); }, 700);
    }); },
  apDoneX: () => { if (S.apCtx && C6().convs.find(v => v.id === S.apCtx)) { S.conv = S.apCtx; go('chat', {replace:true}); setTimeout(scrollChat, 20); return; } back(); },
  apSendCtx: el => { const v = sendCard(el?.dataset.id || S.apCtx, S.apTok); if (!v) return; toast(`Red Packet sent to ${v.name}.`); S.conv = v.id; go('chat', {replace:true}); setTimeout(scrollChat, 20); },
  apPickChat: () => { S.apPickK = 'chat'; openSheet('apPick'); },
  apPickGroup: () => { S.apPickK = 'group'; openSheet('apPick'); },
  apSendTo: el => { const v = sendCard(el.dataset.id, S.apTok); if (!v) return; S.sheetAnim = false; render(); toast(`Red Packet sent to ${v.name}.`); },
  apCopy: () => { const a = apGet(S.apTok); try { navigator.clipboard.writeText('https://' + link(a)).catch(()=>{}); } catch(e) {} toast('Red Packet link copied.'); },
  apDetail: el => { if (el && el.dataset && el.dataset.tok) S.apTok = el.dataset.tok; go('apdet'); },
  apList: () => { S.apTab = 'sent'; go('aplist'); },
  apTab: el => {
    const focused = document.activeElement === el;
    S.apTab = el.dataset.v;
    render();
    if (focused) document.getElementById(`aphist-tab-${S.apTab}`)?.focus({preventScroll:true});
  },
  apHistoryChats: () => { S.ctab = 'message'; S.cq = ''; go('chats'); },
  apOpenTok: el => { S.apTok = el.dataset.tok; S.apJust = false; S.apSource = null; S.apShowOpeners = false; go('aprecv'); },
  apTap: el => { const a = apGet(el.dataset.tok); S.apTok = el.dataset.tok; S.apJust = false; S.apSource = S.screen === 'chat' ? S.conv : null; S.apShowOpeners = false;
    S.apSim = S.apSource === PACKET_TEST_GROUP ? apTestGates.get(S.apTok) || null : null;
    if (a && a.creator === 'me') { go('apdet'); return; } go('aprecv'); },
  apOpenIt: () => {
    const a = apGet(S.apTok);
    if (apState(a) !== 'ready') return;
    const pending = S.apOpening ||= new Set();
    if (pending.has(a.token)) return;
    const session = S;
    pending.add(a.token); render();
    const viewingPacket = () => S.screen === 'aprecv' && S.apTok === a.token;
    setTimeout(() => {
      if (S !== session) return;
      pending.delete(a.token);
      if (apState(a) !== 'ready') { if (viewingPacket()) render(); return; }
      if (!redPackets.claim(a, 'me')) return;
      if (viewingPacket()) {
        S.apJust = true;
        render();
        S.apJust = false;
        apAnimatePayout();
        document.querySelector('.apreceive-result')?.focus({preventScroll:true});
      } else if ((S.screen === 'chat' || S.screen === 'bchat') &&
        [...document.querySelectorAll('.rp-chat-card')].some(card => card.dataset.tok === a.token)) render();
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 620);
  },
  apReport: () => toast('Thanks. We’ll review this red packet.'),
  apCancelAsk: () => { S.dialog = 'apCancel'; render(); },
  apCancelOk: () => { const a = apGet(S.apTok); S.dialog = null; redPackets.close(a, 'CANCELLED'); render(); toast(`${MY_(a.refunded)} is back in your wallet.`); },
  apGateGo: () => { const resume = S.screen;
    if (S.apSim) { const was = S.apSim; S.apSim = null; render(); toast(was === 'guest' ? 'Logged in. Back to your red packet.' : 'Verified and wallet active. Back to your red packet.'); return; }
    S.apResume = resume;
    if (S.session !== 'user') { S.session = 'user'; S.apResume = null; render(); toast('Logged in. Back to your red packet.'); return; }
    if (kyc() !== 'approved') { A.kycGate({dataset:{from:'angpao'}}); return; }
    S.actFrom = 'angpao'; go('activate'); },
  apExpireNow: () => { const a = apMine().reverse().find(x => x.status === 'ACTIVE' && !x.token.startsWith(PACKET_TEST_TOKEN_PREFIX)); if (!a) { toast('No active red packet of yours to expire.'); return; }
    if (!a.expiresAt) { a.expiresAt = NOW() - 1000; a.expLbl = a.expLbl === 'Never expires' ? 'Test expiry' : a.expLbl; } else a.expiresAt = NOW() - 1000; redPackets.settle(a); render(); },
});
function resumeRedPacketAfterWallet() {
  const target = S.apResume;
  if (S.actFrom !== 'angpao' || !isRedPacketEntry(target) || !apReady()) return false;
  S.apResume = null;
  S.actFrom = null;
  S.hist = S.hist.filter(screen => ![target, 'gate', 'activate', 'walletActive', 'verifying'].includes(screen));
  wallet2Frame()?.__set?.('kyc', 'passed');
  go(target, {replace:true});
  return true;
}
const walletDoneBeforeRedPacket = A.walletDone;
A.walletDone = el => {
  if (!resumeRedPacketAfterWallet()) walletDoneBeforeRedPacket(el);
};
window.__resumeRedPacketAfterWallet = () => S.screen === 'activate' && resumeRedPacketAfterWallet();

/* text inputs */
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.apf; if (!k || !S.apf) return;
  let v = e.target.value;
  if (k === 'amt') { v = v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'); const [i, d] = v.split('.'); v = d !== undefined ? `${i}.${d.slice(0,2)}` : i; }
  if (k === 'count' || k === 'days') v = v.replace(/\D/g, '').slice(0, k==='days'?3:3);
  if (k === 'msg') {
    S.apf.msg = v.replace(/\n/g, ' ').slice(0, AP_MESSAGE_LIMIT);
    if (!e.isComposing && v !== S.apf.msg) {
      const {selectionStart, selectionEnd} = e.target;
      e.target.value = S.apf.msg;
      e.target.setSelectionRange(selectionStart, selectionEnd);
    }
    document.getElementById('apMsgCount').textContent = `${S.apf.msg.length}/${AP_MESSAGE_LIMIT}`;
    document.querySelectorAll('.rp20-presets button').forEach(button => {
      button.setAttribute('aria-pressed', S.apf.msg === AP_MESSAGES[Number(button.dataset.v)]);
    });
    return;
  }
  S.apf[k] = v; const id = e.target.id, pos = v.length; const sc = document.getElementById('apScroll'); const top = sc ? sc.scrollTop : 0;
  render(); const sc2 = document.getElementById('apScroll'); if (sc2) sc2.scrollTop = top;
  const n = document.getElementById(id); if (n) { n.focus({preventScroll:true}); try { n.setSelectionRange(pos, pos); } catch(x) {} } });

document.addEventListener('keydown', e => {
  if (e.target.id !== 'apMsg' || e.key !== 'Enter' || e.isComposing) return;
  e.preventDefault();
  A.apEditMessage();
});

/* demo entry points (shell Quick scenario / internal panel) */
function apDemo(st){ apSeed(); S.apSim = null; S.apJust = false; S.apSource = null; S.apShowOpeners = false;
  if (st === 'guest' || st === 'kyc') { S.apSim = st; S.apTok = 'apCatherine'; return 'aprecv'; }
  if (st === 'notfound') { S.apTok = 'zzNotARealToken'; return 'aprecv'; }
  if (st === 'ended') { S.apTok = 'apSeraKopi'; return 'aprecv'; }
  if (st === 'full') { S.apTok = 'apSeraWelcome'; return 'aprecv'; }
  if (st === 'claimed') { S.apTok = 'apSeraFriday'; return 'aprecv'; }
  if (st === 'lucky') { S.apTok = 'apLaraLucky'; return 'aprecv'; }
  if (st === 'own') { let a = apMine().find(x => x.status === 'ACTIVE');
    if (!a) { a = redPackets.send({type:'random', total:4000, count:4, fee:feeOf(4000), msg:'Selamat Hari Raya', expiresAt:NOW()+24*3600e3, expLbl:'24 hours', claimed:['maulguy']}); }
    S.apTok = a.token; return 'aprecv'; }
  let r = redPackets.packets.find(a => a.creator !== 'me' && a.status === 'ACTIVE' && !a.slots.some(s => s.by === 'me') && redPacketAmountLeft(a));
  if (!r) r = redPackets.create({creator:'kwang', type:'random', total:1888, count:6, msg:'Ong ah!'});
  S.apTok = r.token; return 'aprecv'; }
window.__apDemo = apDemo;
Object.assign(appEntryRoutes, {
  apNew(open, context) {
    S.apf = apfNew();
    S.apCtx = null;
    S.apSim = null;
    return open('apform', context);
  },
  apHistory(open, context, variant) {
    S.apHideHistorySamples = variant === 'empty';
    S.apTab = 'sent';
    return open('aplist', context);
  },
  apChat(open, context) {
    S.conv = 'c-lara';
    open('chat', context);
    setTimeout(scrollChat, 30);
  },
  apRecv: (open, context, variant) => open(apDemo(variant || 'ready'), context),
  /* Transaction History row → the received red packet (back returns to the wallet) */
  /* variant is "<c|s|r>-<token>": received opens the packet, sent and refund open its details */
  apReceipt(open, context, variant = '') {
    const kind = variant.slice(0, 1);
    S.apTok = variant.slice(2);
    S.apJust = false;
    S.apSim = null;
    return open(kind === 'c' ? 'aprecv' : 'apdet', context);
  },
});

/* scenario panel */
if (!scen.apLim) scen.apLim = 'ok';
Object.assign(META, {
  apform:{name:'Red Packet · Create', group:'V2 · Red Packet', figma:'Spec: Red Packet 1–4', rules:['Gate: logged in, KYC approved, wallet active; otherwise onboarding, then back to this form','Random: total ≥ people × RM1, people ≤ floor(total). Equal: amount per person ≥ RM1. Max 100 people','Message ≤ 50 characters. Never expires is on by default; off: 1h / 6h / 24h / 3d / 7d / Custom 1–365 days','Fee (placeholder): Free 1% min 0.50 · VIP 0.5% min 0.30 · SVIP free. Charged on top; recipients get the full amount','total + fee must fit balance, per-transaction and monthly limit; over limit disables Continue and shows Upgrade']},
  apconf:{name:'Red Packet · Confirm', group:'V2 · Red Packet', rules:['Total, fee, deducted, recipients, validity','PIN, then one server transaction: debit total + fee, total to escrow, fee to revenue, record ACTIVE, all slots generated, random token','Idempotency key: a double tap never charges twice']},
  apdone:{name:'Red Packet · Ready to share', group:'V2 · Red Packet', rules:['Card with QR','Send to chat / Send to group / Copy link, any number of times, same token (no new transaction)','View details for the sender']},
  aprecv:{name:'Red Packet · Receive', group:'V2 · Red Packet', rules:['Checks in order: not logged in → login; KYC/wallet → onboarding; token not found; expired/cancelled → ended; sender → View details only; already claimed → your result; all slots taken → fully claimed; else Open','Open: one free slot taken with a lock, unique (red packet, user), credited without fee or PIN','Amounts are fixed at create and never sent to the app before opening','Random shows a Luckiest label on the top amount']},
  apdet:{name:'Red Packet · Details (sender)', group:'V2 · Red Packet', rules:['Status, total, fee, validity, who opened and how much','Packets left shown; their amounts stay hidden','Cancel remaining while ACTIVE: unclaimed slots back to the sender, fee not refunded','Expired: a job refunds unclaimed slots and notifies. Never-expiring red packet only refund on cancel']},
  aplist:{name:'My Red Packet', group:'V2 · Red Packet', rules:['Sent and Received lists. Sent rows open the details, received rows open your result']},
});
const _rpAp = renderPanel;
renderPanel = function(){ _rpAp(); const p = document.getElementById('panel'); if (!p) return;
  const sc = [...p.querySelectorAll('.pgroup h2')].find(x=>x.textContent==='Scenario'); const later = sc && sc.parentElement.querySelector('.later:last-child');
  if (later && !p.querySelector('[data-k="apLim"]')) later.insertAdjacentHTML('beforebegin', `${segCtl('Red Packet · monthly limit','apLim',[['ok','Plenty left'],['near','RM30 left']],'RM30 left: bigger red packet disable Continue and show Upgrade. Tier and balance come from the Wallet 2.0 scenario (Tier, Balance).')}
    <div class="ctl"><span class="lab">Red Packet · demo</span><div class="segp" role="group" aria-label="Red Packet demo">${[['ready','Ready'],['guest','Not logged in'],['kyc','KYC not done'],['notfound','Not found'],['ended','Ended'],['own','Own'],['claimed','Claimed'],['full','Fully claimed'],['lucky','Lucky draw']].map(([v,t])=>`<button data-act="apDemoGo" data-v="${v}">${t}</button>`).join('')}</div><button class="pbtn" style="margin-top:6px" data-act="apExpireNow">Expire my latest active red packet now</button></div>`); };
A.apDemoGo = el => { const t = apDemo(el.dataset.v); S.session = 'user'; S.hist = S.screen === t ? S.hist : [...S.hist, S.screen]; S.screen = t; S.sheet = null; S.dialog = null; render(); };

/* ===== V2 · Send Red Packet, simplified (no fee, no confirm screen, PIN shows the summary) ===== */
(function(){
  const MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>';
  const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>';

  function updateCreationControl(selector, change) {
    const scrollTop = document.getElementById('apScroll')?.scrollTop || 0;
    const focus = document.activeElement?.matches(':focus-visible');
    change();
    render();
    const scroll = document.getElementById('apScroll');
    if (scroll) scroll.scrollTop = scrollTop;
    if (focus) scroll?.querySelector(selector)?.focus({preventScroll:true});
  }

  function expiryFields(f, r) {
    const unit = f.expUnit || 'days';
    const max = unit === 'hours' ? 168 : 365;
    const duration = !f.forever && f.dur === 'custom' && (!f.days || r.e.days) ? 'Set a custom expiry' : `Comes back to you after ${f.forever ? '' : expOf().lbl}`;
    const label = f.forever ? 'Comes back to you when you cancel' : duration;
    return `<section class="rp20-box rp20-exp">
      <button type="button" data-act="apExpiryOptions" aria-expanded="${f.expiryOpen}" aria-controls="apExpiryFields">${ic('clock')}
        <span class="rp20-exp-copy"><small>Leftover money</small><b>${label}</b></span>${ic('chevdown')}</button>
      <div id="apExpiryFields"${f.expiryOpen ? '' : ' hidden'}><div class="apexp">
        <button type="button" class="apchk" role="checkbox" aria-checked="${f.forever}" data-act="apForever"><i>${f.forever?'✓':''}</i><span><b>Never expires</b><small>Choose when unclaimed money returns to your wallet.</small></span></button>
        ${f.forever ? '' : `<div class="apdurs">${DURS.map(([v,t]) => `<button type="button" aria-pressed="${f.dur===v}" data-act="apDur" data-v="${v}">${t}</button>`).join('')}</div>
        ${f.dur === 'custom' ? `<div class="apcustom"><div class="apunits" role="group" aria-label="Custom expiry unit">${['hours','days'].map(value => `<button type="button" aria-pressed="${unit === value}" data-act="apExpUnit" data-v="${value}">${value === 'hours' ? 'Hours' : 'Days'}</button>`).join('')}</div>
          ${fld('apDays','days',`Number of ${unit}`,f.days,{mode:'numeric', ph:`1–${max}`, suf:unit, err:r.e.days, help:'Set how long the packet stays available'})}</div>` : ''}`}
      </div></div>
    </section>`;
  }

  V.apform = () => {
    if (!apReady() || S.apSim) return gateHTML(AP_CREATE_TITLE, 'send a red packet');
    const f = S.apf ||= apfNew();
    const hasCustomMessage = Boolean(f.msg.trim()) && !AP_MESSAGES.includes(f.msg);
    const chat = apConversation(S.apCtx);
    const r = apCalc(chat);
    const theme = redPacketTheme(f.theme);
    const lucky = isLucky(f);
    const recipients = lucky ? r.groupPeople : Math.min(r.n, r.maxPeople);
    const groupCount = r.groupPeople === null ? '' : `<span class="rp20-recipient-count">${!lucky && r.n > r.maxPeople ? 'Up to ' : ''}${recipients} recipient${recipients === 1 ? '' : 's'}</span>`;
    const copy = lucky ? 'Each person gets one draw while funds last.'
      : f.type === 'random' ? 'Each person gets a random share of the total.'
      : r.n && r.a ? `Total ${MY_(r.total)} · ${MY_(r.a)} × ${apPeople(r.n)}` : 'Everyone receives the same amount.';
    const previewArt = theme === 'red' || theme === 'raya' ? 'preview' : 'scene';
    const amountHelp = r.e.amt || r.e.lim;
    const canSend = r.ok && !S.apBusy;
    const action = r.total && !r.e.amt && !r.e.count && (lucky || r.n) ? `Send ${MY_(r.total)}` : 'Send';
    return `<div class="screen rp20-form" style="${redPacketThemeStyle(theme)}">${statusBar()}
      <div class="topbar"><button type="button" class="iconbtn" data-act="back" aria-label="Back">${ic('back')}</button><span class="rp20-title t-headline"><b>${AP_CREATE_TITLE}</b>${chat ? `<small><span class="rp20-recipient-name">To ${esc(chat.name)}</span>${groupCount}</small>` : ''}</span>
        <button type="button" class="iconbtn" data-act="apList" aria-label="My red packets">${ic('apList')}</button></div>
      <div class="scroll" id="apScroll"><div class="rp20-fields">
        <div class="rp20-preview" aria-hidden="true">${redPacketArt(theme, previewArt, 'rp20-preview-background' + (previewArt === 'scene' ? ' rp20-preview-crop' : ''))}${redPacketArt(theme, 'packet', 'rp20-packet')}</div>
        <div class="rp20-themes" role="group" aria-label="Packet design">
          ${Object.entries(redPacketThemes).map(([key, design]) => `<button type="button" class="rp20-theme" data-act="apTheme" data-v="${key}" aria-pressed="${theme === key}">${redPacketArt(key,'packet')}<span>${design.name}</span></button>`).join('')}
        </div>
        <div class="apseg ap-modes" role="group" aria-label="Red Packet type">${Object.entries(AP_TYPES).map(([v,t]) => `<button type="button" aria-pressed="${f.type===v}" data-act="apType" data-v="${v}">${t}</button>`).join('')}</div>
        <section class="rp20-box rp20-amount-box">
          <label for="apAmt">${f.type === 'equal' ? 'Each person gets' : 'Total'}</label>
          <div class="rp20-amount-line"><span id="apAmtCurrency">RM</span><div class="rp20-amount-field"><input id="apAmt" data-apf="amt" value="${esc(f.amt)}" inputmode="decimal" placeholder="0.00" autocomplete="off" aria-invalid="${Boolean(amountHelp || r.e.bal)}" aria-describedby="apAmtCurrency apAmtH${r.e.bal ? ' apAmtBalance' : ''}">
            ${f.amt && Number.isFinite(r.a) ? `<span class="rp20-amount-display" aria-hidden="true">${C(r.a)}</span>` : ''}</div></div>
          ${amountHelp ? `<p class="rp20-error" id="apAmtH">${esc(amountHelp)} ${r.e.lim ? '<button class="link" type="button" data-act="apUpgrade">Upgrade</button>' : ''}</p>` : ''}
          <div class="rp20-wallet"><img class="rp20-wallet-flag" src="../features/red-packet/art/wallet-flag.svg" alt=""><span${amountHelp ? '' : ' id="apAmtH"'}>YouWallet · ${RM(r.bal / 100)}</span>
            <button class="rp20-wallet-change" type="button" data-act="apChangeWallet" aria-label="Change wallet" aria-haspopup="dialog">Change ${ic('chevdown')}</button></div>
          ${r.e.bal ? '<p class="rp20-error" id="apAmtBalance">Not enough balance in your wallet. <button class="link" type="button" data-act="apTopUp">Top up</button></p>' : ''}
        </section>
        ${lucky ? '' : `<div class="rp20-box rp20-people">${ic('group')}<div>
          <label for="apCount">How many people</label><input id="apCount" data-apf="count" value="${esc(r.count)}" inputmode="numeric" placeholder="0" autocomplete="off" aria-invalid="${Boolean(r.e.count)}"${r.e.count ? ' aria-describedby="apCountError"' : ''}></div>
          <div class="ap2-step" role="group" aria-label="Number of people">
            <button type="button" data-act="apStep" data-d="-1" aria-label="One person fewer" ${r.n <= 1 ? 'aria-disabled="true"' : ''}>${MINUS}</button>
            <button type="button" data-act="apStep" data-d="1" aria-label="One more person" ${r.n >= r.maxPeople ? 'aria-disabled="true"' : ''}>${PLUS}</button>
          </div>${r.e.count ? `<small class="rp20-error" id="apCountError">${esc(r.e.count)}</small>` : ''}</div>`}
        <p class="rp20-help">${copy}</p>
        <section class="rp20-message">
          <div class="rp20-message-header">
            <label for="apMsg">Message <span>(optional)</span></label>
            <button type="button" data-act="apEditMessage" aria-expanded="${Boolean(f.messageOpen)}" aria-controls="apMessageEditor">${f.messageOpen ? 'Done' : hasCustomMessage ? 'Edit message' : 'Write a message'}</button>
          </div>
          <div id="apMessageEditor" class="rp20-message-editor"${f.messageOpen ? '' : ' hidden'}>
            <textarea id="apMsg" class="input" data-apf="msg" rows="2" placeholder="Add a note for the recipient" maxlength="${AP_MESSAGE_LIMIT}" autocomplete="off" enterkeyhint="done" aria-describedby="apMsgCount">${esc(f.msg)}</textarea>
            <span id="apMsgCount" class="rp20-message-count">${f.msg.length}/${AP_MESSAGE_LIMIT}</span>
          </div>
          ${!f.messageOpen && hasCustomMessage ? `<p class="rp20-message-draft">${esc(f.msg)}</p>` : ''}
          <div class="rp20-presets" role="group" aria-label="Message suggestions">${AP_MESSAGES.map((msg, i) => `<button type="button" data-act="apMessage" data-v="${i}" aria-pressed="${f.msg === msg}">${esc(msg)}</button>`).join('')}</div>
        </section>
        ${expiryFields(f, r)}
      </div></div>
      <div class="rp20-footer"><button type="button" class="rp20-primary" data-act="apNext"${canSend ? '' : ' disabled'}>${S.apBusy ? 'Sending…' : action}</button></div>
    </div>`;
  };
  Object.assign(A, {
    apTheme: el => {
      const theme = redPacketTheme(el.dataset.v);
      if (theme === S.apf.theme) return;
      updateCreationControl(`[data-act="apTheme"][data-v="${theme}"]`, () => { S.apf.theme = theme; });
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      document.querySelector('.rp20-preview .rp20-packet')?.animate(
        [{opacity:.35, scale:.94, translate:'0 6px'}, {opacity:1, scale:1, translate:'0 0'}],
        {duration:240, easing:'ease-out'}
      );
    },
    apChangeWallet: () => {
      updateCreationControl('[data-act="apChangeWallet"]', () => { S.sheet = 'apWallet'; S.sheetAnim = true; });
      document.querySelector('[data-act="apWalletDone"].rp20-wallet-option')?.focus({preventScroll:true});
    },
    apWalletDone: () => {
      updateCreationControl('[data-act="apChangeWallet"]', () => { S.sheet = null; });
      document.querySelector('[data-act="apChangeWallet"]')?.focus({preventScroll:true});
    },
    apMessage: el => updateCreationControl(`[data-act="apMessage"][data-v="${el.dataset.v}"]`, () => { S.apf.msg = AP_MESSAGES[Number(el.dataset.v)] || ''; S.apf.messageOpen = false; }),
    apEditMessage: () => {
      updateCreationControl('[data-act="apEditMessage"]', () => { S.apf.messageOpen = !S.apf.messageOpen; });
      if (S.apf.messageOpen) {
        const field = document.getElementById('apMsg');
        field.closest('.rp20-message').scrollIntoView({block:'nearest', behavior:'instant'});
        field.focus();
        field.setSelectionRange(field.value.length, field.value.length);
      } else {
        document.querySelector('[data-act="apEditMessage"]')?.focus({preventScroll:true});
      }
    },
    apExpiryOptions: () => updateCreationControl('[data-act="apExpiryOptions"]', () => { S.apf.expiryOpen = !S.apf.expiryOpen; }),
    apForever: () => updateCreationControl('[data-act="apForever"]', () => { S.apf.forever = !S.apf.forever; }),
    apDur: el => updateCreationControl(`[data-act="apDur"][data-v="${el.dataset.v}"]`, () => { S.apf.dur = el.dataset.v; }),
    apExpUnit: el => updateCreationControl(`[data-act="apExpUnit"][data-v="${el.dataset.v}"]`, () => { S.apf.expUnit = el.dataset.v; S.apf.days = ''; }),
    apStep: el => {
      if (el.getAttribute('aria-disabled') === 'true') return;
      const {n, maxPeople} = apCalc();
      const direction = el.dataset.d;
      const scrollTop = document.getElementById('apScroll')?.scrollTop || 0;
      const keyboardFocus = el.matches(':focus-visible');
      S.apf.count = String(Math.min(maxPeople, Math.max(1, n + Number(direction))));
      render();
      const scroll = document.getElementById('apScroll');
      scroll.scrollTop = scrollTop;
      if (keyboardFocus) scroll.querySelector(`.ap2-step [data-d="${direction}"]`)?.focus({preventScroll:true});
    },
    apNext: () => { const r = apCalc(); if (!r.ok || S.apBusy) return; S.apKey = 'k' + Date.now();
      S.apAuthSum = `Send ${MY_(r.total)} · ${apTypeDetails({type:S.apf.type, count:r.n})}`; A.apPay(); },
  });
  /* the PIN step carries the summary the confirm screen used to show: amount big, type and people under it */
  const _ovApPin = overlayHTML;
  overlayHTML = () => { let h = _ovApPin(); if (S.sheet !== 'pin' || S.authReason !== S.apAuthSum || !S.apAuthSum || S.screen !== 'apform') return h;
    const chat = apConversation(S.apCtx), r = apCalc(chat);
    const sub = esc(S.apAuthSum);
    const hold = isLucky(S.apf) ? '<small>Set aside when you confirm</small>' : '';
    const recipient = chat ? `<small>To ${esc(chat.name)}</small>` : '';
    return h.replace(sub, `<span class="ap2-pin"><span class="ap2-pin-e">${redPacketArt(S.apf.theme, 'packet')}</span><b>${MY_(r.total)}</b>${recipient}${hold}<small>${apTypeDetails({type:S.apf.type, count:r.n})} · ${expOf().lbl}</small></span>`); };
  /* the PIN step carries the summary the confirm screen used to show */
  const _authAp = auth;
  auth = function(reason, ok, opts){ if (reason === 'Send angpao' && S.apAuthSum) reason = S.apAuthSum; return _authAp(reason, ok, opts); };
  if (typeof META === 'object') {
    if (META.apform) META.apform.rules = ['Gate: logged in, KYC approved, wallet active; otherwise onboarding, then back to this form','Random: Total ≥ people × RM1, people ≤ floor(total). Equal: amount per person ≥ RM1. Both allow up to 100 people','Lucky draw: set a RM budget with no people limit. Each person gets one draw. The payout is calculated when they open it','Message ≤ 50 characters, empty uses “Best wishes!”','Expiry: Never expires, presets from 1 hour to 7 days, or Custom using 1–168 hours / 1–365 days. Unclaimed RM returns on expiry or cancellation','No fee: you pay exactly the red packet total','Send {total} opens PIN with the summary (no separate confirm screen). Double tap never charges twice'];
    if (META.aprecv) META.aprecv.rules = ['An eligible recipient can open each packet once. The sender can only view details','Lucky draw uses the prize rates saved when the packet is created and draws from prizes the budget can afford','Luckiest marks the largest positive claim so far for Random and Lucky draw'];
    if (META.apconf) META.apconf.rules = ['Not used in the main flow any more: Send on the form goes straight to PIN'];
    if (META.apdet) META.apdet.rules = (META.apdet.rules || []).map(x => x.replace('Status, total, fee, validity', 'Status, total, validity').replace(', fee not refunded', ''));
  }
  try { render(); } catch(e) {}
})();

})();
