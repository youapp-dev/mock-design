/* ===== Trips Phase 5: Leaderboard and sharing.
   Cities / Miles boards (Friends, Malaysia, Everyone; this year or all time), podium, list, your row always shown,
   nudge from your next trip, "just you" state with invite, share sheet, what friends see. ===== */
(function(){
  if (!window.TP) return;
  const P = window.TP; const {ti, nf, plural, CITY} = P; const T = () => P.T;

  /* friends on YouApp with their travel totals (all time and this year) */
  const FR = [
    {id:'aiko', n:'Aiko', ini:'AK', col:'#E25A8A', c:38, m:35600, cy:12, my:9800, sub:'Tokyo, Osaka, Paris and 35 more', trips:12},
    {id:'hafiz', n:'Hafiz', ini:'HF', col:'#3D8BFD', c:31, m:52880, cy:9, my:14200, sub:'Istanbul, Seoul, Bali and 28 more', trips:10},
    {id:'jason', n:'Jason', ini:'JS', col:'#E0A21B', c:27, m:47300, cy:7, my:11050, sub:'London, Sydney and 25 more', trips:8},
    {id:'nurul', n:'Nurul', ini:'NR', col:'#7F57E5', c:22, m:39120, cy:9, my:12900, sub:'Seoul, Tokyo, Paris and 19 more', trips:9},
    {id:'priya', n:'Priya', ini:'PK', col:'#E25A5A', c:20, m:28450, cy:6, my:7300, sub:'Bali, Sydney and 18 more', trips:6},
    {id:'ravi', n:'Ravi', ini:'RT', col:'#14A877', c:17, m:64210, cy:5, my:21400, sub:'London, Dubai and 15 more', trips:7},
    {id:'meiling', n:'Mei Ling', ini:'ML', col:'#C05CA8', c:16, m:18900, cy:5, my:6200, sub:'Seoul, Osaka and 14 more', trips:5},
    {id:'ken', n:'Ken', ini:'KN', col:'#14A877', c:15, m:24000, cy:4, my:5100, sub:'Tokyo, Taipei and 13 more', trips:4},
    {id:'sara', n:'Sara', ini:'SA', col:'#E25A5A', c:13, m:12300, cy:6, my:4900, sub:'Penang, Bangkok and 11 more', trips:6},
    {id:'yuki', n:'Yuki', ini:'YK', col:'#3D8BFD', c:13, m:15800, cy:3, my:2600, sub:'Sapporo, Seoul and 11 more', trips:3},
    {id:'daniel', n:'Daniel', ini:'DE', col:'#8C849D', c:12, m:21900, cy:2, my:3100, sub:'Hanoi, Manila and 10 more', trips:2},
  ];
  const WIDE = {my:[['Farid','FA',61,148200],['Liyana','LY',58,131000],['Kumar','KU',52,166400],['Wei Jie','WJ',49,120300],['Aishah','AS',47,98700],['Arjun','AR',45,141900]],
    all:[['Mateo','MT',143,402300],['Sofia','SO',131,377900],['Hiroshi','HI',126,451000],['Amara','AM',119,333100],['Lucas','LU',114,365800],['Noor','NO',108,298400]]};
  const COLS = ['#7F57E5','#14A877','#E0A21B','#3D8BFD','#E25A8A','#C05CA8'];
  const me = () => { try { const p = window.__walletProfile ? window.__walletProfile() : null; return {name:(p && p.name) || 'You', handle:((p && p.handle) || '@you').replace('@','')}; } catch(e) { return {name:'You', handle:'you'}; } };
  const year = P.TODAY.slice(0, 4);
  const myVals = yr => { const ps = P.past().filter(t => !yr || t.start.startsWith(year)); const cs = new Set(), co = new Set(); let m = 0;
    ps.forEach(t => { P.awayStops(t).forEach(s => { cs.add(s.city); co.add(CITY[s.city].c); }); m += P.tripMiles(t); }); return {c:cs.size, co:co.size, m, trips:ps.length, list:[...cs]}; };
  const alone = () => scen.tpLb === 'alone';

  /* rows for the current board */
  const rows = () => { const t = T(); const metric = t.lbMetric || 'cities', scope = t.lbScope || 'friends', yr = !!t.lbYear;
    const mv = myVals(yr); const mine = {id:'me', n:'You', me:true, v:metric === 'cities' ? mv.c : mv.m, sub:metric === 'cities' ? subOf(mv.list) : `${plural(mv.trips, 'trip')}${yr ? ' this year' : ''}`};
    let list;
    if (scope === 'friends') list = FR.map(f => ({id:f.id, n:f.n, ini:f.ini, col:f.col, v:metric === 'cities' ? (yr ? f.cy : f.c) : (yr ? f.my : f.m), sub:metric === 'cities' ? f.sub : `${f.trips} trips${yr ? ' this year' : ''}`}));
    else list = WIDE[scope === 'malaysia' ? 'my' : 'all'].map(([n, ini, c, m], i) => ({id:'w' + i, n, ini, col:COLS[i % COLS.length], v:Math.round((metric === 'cities' ? c : m) * (yr ? .3 : 1)), sub:scope === 'malaysia' ? 'Malaysia' : ['Spain','Italy','Japan','Nigeria','Brazil','UAE'][i]}));
    list = list.sort((a, b) => b.v - a.v);
    if (scope === 'friends') { const all = [...list, mine].sort((a, b) => b.v - a.v || (a.me ? 1 : -1)); all.forEach((r, i) => { r.rank = i + 1; }); return {all, mine, metric, scope, yr}; }
    list.forEach((r, i) => { r.rank = i + 1; }); mine.rank = scope === 'malaysia' ? 2418 - mine.v * (metric === 'cities' ? 21 : .004) | 0 : 48906 - mine.v * (metric === 'cities' ? 310 : .07) | 0;
    return {all:list, mine, metric, scope, yr, wide:true}; };
  const subOf = l => { const n = l.map(c => CITY[c].n); return n.length > 3 ? `${n.slice(0, 3).join(', ')} and ${n.length - 3} more` : n.join(', ') || 'No trips yet'; };
  P.myRank = () => { if (alone()) return 1; const t = T(); const keep = [t.lbMetric, t.lbScope, t.lbYear]; t.lbMetric = 'cities'; t.lbScope = 'friends'; t.lbYear = false; const r = rows().mine.rank; [t.lbMetric, t.lbScope, t.lbYear] = keep; return r; };

  /* the nudge: how your next trip moves you */
  const nudge = R => { if (R.scope !== 'friends' || R.yr) return ''; const up = P.upcoming()[0]; if (!up) return '';
    const mv = myVals(false); const add = R.metric === 'cities' ? P.awayStops(up).filter(s => !mv.list.includes(s.city)).length : P.tripMiles(up);
    if (!add) return ''; const nv = R.mine.v + add; const nr = 1 + R.all.filter(r => !r.me && r.v >= nv).length;
    return `<p class="tp-nudge">${ti('trophy')}${nr < R.mine.rank ? `Your ${esc(up.name)} trip will move you up to <b>#${nr}</b>` : `Your ${esc(up.name)} trip adds ${R.metric === 'cities' ? plural(add, 'city', 'cities') : nf(add) + ' miles'}`}</p>`; };

  const lav = r => r.me ? `<img class="tp-av md tp-me" src="${IMG.avatar}" alt="">` : `<span class="tp-av md" style="background:${r.col}">${esc(r.ini)}</span>`;
  const val = (R, v) => R.metric === 'cities' ? nf(v) : nf(v);
  const unit = R => R.metric === 'cities' ? 'cities' : 'mi';

  /* share card (what the link shows) */
  const shareCard = (cls='') => { const mv = myVals(false); const m = me();
    return `<div class="tp-scard ${cls}"><div class="tp-sch">${'<img class="tp-av xs tp-me" src="' + IMG.avatar + '" alt="">'}<b>${esc(m.name)} has been to</b></div>
      <div class="tp-scn"><span><b>${nf(mv.c)}</b><small>cities</small></span><span><b>${nf(mv.co)}</b><small>countries</small></span></div><p>${nf(mv.m)} miles travelled</p><em>Can you beat that?</em>
      <span class="tp-scglobe" aria-hidden="true">${P.art('globe')}</span><span class="tp-scbrand">YouApp</span></div>`; };

  /* Leaderboard tab */
  const board = () => { const t = T(); const metric = t.lbMetric || 'cities';
    const toggle = `<div class="tp-lbt" role="tablist" aria-label="Board"><button role="tab" aria-selected="${metric === 'cities'}" data-act="tpLbM" data-k="cities">${ti('pin')}Cities</button><button role="tab" aria-selected="${metric === 'miles'}" data-act="tpLbM" data-k="miles">${ti('plane')}Miles</button></div>`;
    if (alone()) { const mv = myVals(false);
      return `${toggle}<div class="tp-alone"><span class="tp-confetti" aria-hidden="true">${Array.from({length:14}, (_, i) => `<i style="left:${(i * 37) % 96 + 2}%; top:${(i * 23) % 70 + 4}%; background:${COLS[i % COLS.length]}; transform:rotate(${i * 29}deg)"></i>`).join('')}</span>
        <span class="tp-crown" aria-hidden="true">👑</span><img class="tp-av xl tp-me" src="${IMG.avatar}" alt=""><b class="tp-aname">You</b><small>${metric === 'cities' ? plural(mv.c, 'city', 'cities') : nf(mv.m) + ' miles'}</small><span class="tp-pod one">1</span></div>
        <h2 class="tp-big">You’re #1!</h2><p class="tp-joke">…but only because you’re the only one here.</p>
        <div class="tp-invbox"><b>Invite friends to race you</b><small>They see your cities, countries and miles.</small>${shareCard('sm')}<button class="btn btn-primary tp-cta" data-act="tpShare">${ti('share')}Invite friends</button></div>`; }
    const R = rows(); const top3 = R.all.slice(0, 3); const order = [top3[1], top3[0], top3[2]].filter(Boolean);
    const scopes = [['friends','Friends'],['malaysia','Malaysia'],['everyone','Everyone']];
    const chips = `<div class="tp-lbc">${scopes.map(([k, l]) => `<button aria-pressed="${(t.lbScope || 'friends') === k}" data-act="tpLbS" data-k="${k}">${l}</button>`).join('')}<button class="yr" aria-pressed="${!!t.lbYear}" data-act="tpLbY">This year</button></div>`;
    const podium = `<div class="tp-podium">${order.map(r => { const pos = r.rank; return `<div class="tp-pcol p${pos}">${pos === 1 ? '<span class="tp-crown sm" aria-hidden="true">👑</span>' : ''}${lav(r)}<b>${esc(r.n)}</b><small>${val(R, r.v)} ${unit(R)}</small><span class="tp-pod">${pos}</span></div>`; }).join('')}</div>`;
    const rest = R.all.slice(3, 6); const shownMe = R.all.slice(0, 6).some(r => r.me);
    const row = r => `<div class="tp-lrow ${r.me ? 'me' : ''}"><span class="tp-lr">${nf(r.rank)}</span>${lav(r)}<span class="tp-rx"><b>${esc(r.n)}</b><small>${esc(r.sub)}</small></span><b class="tp-lv">${val(R, r.v)}</b></div>`;
    return `${toggle}${chips}${podium}<div class="tp-ltable"><div class="tp-lhead"><span>#</span><span>${R.scope === 'friends' ? 'Friend' : 'Traveller'}</span><span>${R.metric === 'cities' ? 'Cities' : 'Miles'}</span></div>
      ${rest.map(row).join('')}${shownMe ? '' : `<div class="tp-ldots" aria-hidden="true">···</div>${row(R.mine)}`}</div>${nudge(R)}
      <button class="tp-obtn wide" data-act="tpShare">${ti('share')}Share your travels</button>`; };

  const _V = V.trips;
  V.trips = () => { if (T().tab !== 'board') return _V();
    return `<div class="screen tp-screen">${statusBar()}${P.head()}<div class="scroll tp-pad tp-lbpad">${board()}</div>${bottomNav('locals')}</div>`; };

  /* share sheet */
  P.openShare = () => { T().sheet = 'share'; render(); };
  P.sheetHTML = () => { if (T().sheet !== 'share') return ''; const mv = myVals(false); const m = me(); const link = `youapp.me/${m.handle}`;
    const txt = `I’ve been to ${plural(mv.c, 'city', 'cities')} and ${plural(mv.co, 'country', 'countries')}, ${nf(mv.m)} miles. Can you beat that? Join me on YouApp`;
    return `<div class="tp-dlg-scrim" data-act="tpShareX"></div><div class="tp-sheet" role="dialog" aria-modal="true" aria-labelledby="tpShT"><span class="tp-grab" aria-hidden="true"></span><b id="tpShT">Share your travels</b>${shareCard()}
      <div class="tp-linkrow"><span>${esc(link)}</span><button class="tp-link" data-act="tpCopy" data-v="https://${esc(link)}">${ic('copy')}Copy</button></div><p class="tp-sharetxt">“${esc(txt)}.”</p>
      <button class="btn btn-primary tp-cta" data-act="tpShareGo">${ti('share')}Share</button><small>Friends who join from your link count as your referral.</small>
      <button class="tp-link c" data-act="tpFriendOpen">See what friends get</button></div>`; };

  /* what friends see in a chat app */
  V.tpFriend = () => { const mv = myVals(false); const m = me();
    return `<div class="screen tp-screen tp-wa">${statusBar()}<div class="topbar tp-top tp-wahead"><button class="iconbtn" data-act="tpFriendBack" aria-label="Back">${ti('back')}</button><span class="tp-av sm" style="background:#3D8BFD">HF</span><span class="tp-rx"><b>Hafiz</b><small>online</small></span></div>
      <div class="scroll tp-wabody"><div class="tp-wame"><div class="tp-walink">${shareCard('sm')}<b>${esc(m.name)} on YouApp</b><small>${nf(mv.c)} cities · ${nf(mv.co)} countries · ${nf(mv.m)} miles</small><small class="u">youapp.me/${esc(m.handle)}</small></div>
        <p>I’ve been to ${nf(mv.c)} cities and ${nf(mv.co)} countries, ${nf(mv.m)} miles. Can you beat that? Join me on YouApp</p></div>
        <div class="tp-wathem"><span class="tp-av xs" style="background:#3D8BFD">HF</span><p>Haha challenge accepted. Joining now</p></div>
        <p class="tp-hint c">This is how your link shows in WhatsApp, Telegram or any chat app.</p></div></div>`; };

  Object.assign(A, {
    tpLbM: el => { T().lbMetric = el.dataset.k; render(); },
    tpLbS: el => { T().lbScope = el.dataset.k; render(); },
    tpLbY: () => { T().lbYear = !T().lbYear; render(); },
    tpShareX: () => { T().sheet = null; render(); },
    tpCopy: el => { try { navigator.clipboard.writeText(el.dataset.v).catch(() => {}); } catch(e) {} toast('Link copied.'); },
    tpShareGo: () => { T().sheet = null; render(); toast('Opens your phone’s share sheet with the card, link and text.'); },
    tpFriendOpen: () => { T().sheet = null; go('tpFriend'); },
    tpFriendBack: () => back(),
  });

  /* scenario toggles from the outer control panel: Trips has/empty, Leaderboard with friends / just you */
  const _set = window.__set;
  window.__set = (k, v) => { if (k === 'tpList' || k === 'tpLb') { scen[k] = v; saveScen(); S.session = 'user'; S.sheet = null; S.dialog = null; T().sheet = null;
      if (k === 'tpLb') T().tab = 'board'; else T().tab = 'trips'; if (!['trips'].includes(S.screen)) { S.hist = ['discover']; S.screen = 'trips'; } render(); return; }
    return _set ? _set(k, v) : undefined; };
  const _st = window.__state;
  window.__state = () => Object.assign(_st ? _st() : {}, {tpList:scen.tpList === 'empty' ? 'empty' : 'has', tpLb:scen.tpLb === 'alone' ? 'alone' : 'friends'});

  /* panel jumps */
  appEntryRoutes.tripAdd = (open, c) => { open('locals', c); if (S.screen === 'trips') A.tpNew(); };
  appEntryRoutes.tripPage = (open, c) => { open('locals', c); if (S.screen === 'trips') A.tpOpen({dataset:{id:'t-japan'}}); };
  appEntryRoutes.tripInvite = (open, c) => { open('locals', c); if (S.screen === 'trips') { T().invite = 'pending'; A.tpJoinOpen(); } };
  appEntryRoutes.tpBoard = (open, c) => { open('locals', c); if (S.screen === 'trips') { T().tab = 'board'; render(); } };

  Object.assign(META, {
    tpFriend:{name:'What friends see (share link)', group:'Trips', figma:'YouApp Trips tab › What friends see', rules:['The link shows as a card in any chat app: photo, cities, countries, miles and youapp.me/{username}.']},
  });
  if (META.trips) META.trips.rules = [...META.trips.rules, 'Leaderboard: Cities or Miles; Friends, Malaysia or Everyone; This year filter. Top 3 on a podium, then the list; your row always shows. A nudge shows how your next trip moves you up.', 'Just you (scenario): “You’re #1” with an invite card. Share opens the share sheet: card, link (Copy), text; joins from the link count as referrals.'];
})();
