/* ===== Trips Phase 4: Plans.
   Small meetups in the city you're in, on your dates. Anyone verified can join or start one.
   Trip › Plans (switch stops, your plans first, then near your hotel), a plan, Join, plan chat, Start a plan. ===== */
(function(){
  if (!window.TP) return;
  const P = window.TP; const {CITY, ti, av, plural, fDay} = P; const T = () => P.T;

  /* hosts of sample plans (people in each city) */
  const HOST = {ken:{n:'Ken Nakamura', ini:'KN', col:'#14A877', v:true, about:'Local · product designer · 23 plans hosted'}, yuki:{n:'Yuki', ini:'YK', col:'#3D8BFD', about:'Local · ramen hunter'}, rina:{n:'Rina', ini:'RN', col:'#C05CA8', about:'Local · photographer'},
    club:{n:'Tokyo Pickle Club', ini:'TP', col:'#E0A21B', about:'YouApp shop · weekly open play'}, sara:{n:'Sara', ini:'SA', col:'#E25A5A', about:'Visiting from Penang'}, mio:{n:'Mio', ini:'MO', col:'#14A877', about:'Local · snowboarder'}, taro:{n:'Taro', ini:'TR', col:'#3D8BFD', about:'Local · tea farmer'}};
  const hav = (k, cls='') => { const h = HOST[k] || {}; return k === 'me' ? `<img class="tp-av tp-me ${cls}" src="${IMG.avatar}" alt="">` : `<span class="tp-av ${cls}" style="background:${h.col || '#8C849D'}">${esc(h.ini || '?')}</span>`; };
  const TYPES = [['food','🍜','Food'],['coffee','☕','Coffee'],['drinks','🍶','Drinks'],['walk','🚶','Walk'],['sport','🏓','Sport']];
  const typeOf = k => TYPES.find(x => x[0] === k) || TYPES[0];
  const SEED = () => ({
    tokyo:[
      {id:'pl-ramen', type:'food', title:'Ramen at Fuunji', date:'2027-01-05', time:'8 PM', place:'Fuunji, Shinjuku', dist:'5 min from your hotel', host:'yuki', going:['yuki','me','sara','ken'], cap:6, about:'Tsukemen queue moves fast. Meet at the door at 7:50.'},
      {id:'pl-coffee', type:'coffee', title:'Morning coffee before work', date:'2027-01-06', time:'8–9 AM', place:'Blue Leaf Coffee, Shinjuku', dist:'3 min from your hotel', host:'ken', going:['ken','sara'], cap:4, about:'I grab coffee here before work most days. Happy to chat about Tokyo, design or where to eat.'},
      {id:'pl-walk', type:'walk', title:'Sunset walk, Meiji shrine', date:'2027-01-07', time:'5 PM', place:'Harajuku', dist:'12 min by train', host:'rina', going:['rina'], cap:6, about:'Easy walk through the forest path, then crepes on Takeshita Street.'},
      {id:'pl-pickle', type:'sport', title:'Pickleball open play', date:'2027-01-06', time:'7 PM', place:'Yoyogi Park courts', dist:'15 min by train', host:'club', going:['club','ken'], cap:10, shop:true, about:'Paddles to borrow. All levels welcome.'}],
    sapporo:[{id:'pl-curry', type:'food', title:'Soup curry crawl', date:'2027-01-08', time:'7 PM', place:'Susukino', dist:'8 min walk', host:'mio', going:['mio'], cap:5, about:'Three spots, small bowls at each. Bring an appetite.'}],
    shizuoka:[{id:'pl-tea', type:'walk', title:'Green tea farm walk', date:'2027-01-11', time:'10 AM', place:'Makinohara tea fields', dist:'40 min by train', host:'taro', going:['taro'], cap:8, about:'Walk the rows, then tasting at the farmhouse.'}],
  });
  const store = () => { const t = T(); if (!t.plans || !t.plans.tokyo) t.plans = SEED(); return t.plans; };
  const allPlans = () => Object.values(store()).flat();
  const planById = id => allPlans().find(p => p.id === id);
  const cityOf = id => Object.keys(store()).find(c => store()[c].some(p => p.id === id));
  const mine = p => p.going.includes('me');
  const left = p => Math.max(0, p.cap - p.going.length);
  const verified = () => kyc() === 'approved';
  P.planCount = t => P.awayStops(t).reduce((n, s) => n + (store()[s.city] || []).length, 0);

  const card = p => { const [, em] = typeOf(p.type); const h = HOST[p.host] || {};
    return `<div class="tp-plan"><button class="tp-planm" data-act="tpPlanOpen" data-id="${p.id}"><span class="tp-plem" aria-hidden="true">${em}</span><span class="tp-rx"><b>${esc(p.title)}</b><small>${ti('cal')}${fDay(p.date)}, ${esc(p.time)}</small><small>${ti('pin')}${esc(p.place)} · ${esc(p.dist)}${p.shop ? ' <em class="tp-shop">YouApp shop</em>' : ''}</small></span></button>
      <div class="tp-planf">${hav(p.host, 'xs')}<small>${esc(h.n || '')}${h.about && h.about.startsWith('Local') ? ', local' : ''} · ${mine(p) ? plural(p.going.length, 'going', 'going') : left(p) ? plural(left(p), 'spot') + ' left' : 'Full'}</small>
        ${mine(p) ? '<span class="tp-pill ok">Going</span>' : left(p) ? `<button class="tp-pill add" data-act="tpPlanJoin" data-id="${p.id}">Join</button>` : '<span class="tp-pill inv">Full</span>'}</div></div>`; };

  /* Trip › Plans tab */
  P.plansTab = t => { const stops = P.awayStops(t); if (!stops.length) return '';
    const cur = stops.some(s => s.city === S.tpPlanCity) ? S.tpPlanCity : stops[0].city; const list = store()[cur] || []; const cn = CITY[cur].n;
    const hotel = (stops.find(s => s.city === cur).stays || [])[0];
    const chips = `<div class="tp-stopchips" role="tablist" aria-label="Stops">${stops.map((s, i) => `<button role="tab" aria-selected="${s.city === cur}" data-act="tpPlanCity" data-k="${s.city}">${esc(CITY[s.city].n)}</button>`).join('')}</div>`;
    const yours = list.filter(mine), near = list.filter(p => !mine(p));
    return `<p class="tp-planintro">Meet people in the same city on the same days: food, coffee, a walk, a game. Anyone verified can join.</p>
      <button class="tp-add" data-act="tpPlanNew">${ti('plus')}Start a plan</button>${chips}
      ${list.length ? `${yours.length ? `<h3 class="tp-h3">Your plans</h3>${yours.map(card).join('')}` : ''}
        ${near.length ? `<div class="tp-h2row"><h3 class="tp-h3">${hotel ? 'Near your hotel' : `Near you in ${esc(cn)}`}</h3><button class="tp-link" data-act="tpLater" data-msg="The map view of plans opens here.">Map</button></div>${near.map(card).join('')}` : ''}`
      : `<div class="tp-ecard big">${art('plansEmpty', 'tp-emp-art')}<b>No plans in ${esc(cn)} yet</b><p>Plans are small meetups on your dates: food, coffee, a walk, a game. Start one and people in ${esc(cn)} can join.</p><button class="btn btn-primary tp-cta" data-act="tpPlanNew">${ti('plus')}Start a plan</button><small>Plans from others in ${esc(cn)} show here once your dates are near.</small></div>`}`;
  };
  const art = (k, cls) => P.art(k, cls);

  /* a plan */
  V.tpPlan = () => { const p = planById(S.tpPlanId); if (!p) return V.trips(); const [, em] = typeOf(p.type); const h = HOST[p.host] || {};
    const slots = Array.from({length:Math.min(p.cap, 6)}, (_, i) => p.going[i] ? hav(p.going[i], 'md') : '<span class="tp-av md slot" aria-hidden="true"></span>').join('');
    return `<div class="screen tp-screen tp-page">${statusBar()}<div class="scroll"><div class="tp-planhero" aria-hidden="true"><span>${em}</span></div>
      <div class="tp-herobar tp-planbar"><button class="tp-hb" data-act="tpPlanBack" aria-label="Back">${ti('back')}</button><span style="flex:1"></span><button class="tp-hb" data-act="tpLater" data-msg="Share this plan with a friend." aria-label="Share plan">${ti('share')}</button></div>
      <div class="tp-pad tp-body"><h1 class="tp-title">${esc(p.title)}</h1>
        <p class="tp-meta">${ti('cal')}${fDay(p.date)} · ${esc(p.time)}</p><p class="tp-meta">${ti('pin')}${esc(p.place)} · ${esc(p.dist)}</p>
        <div class="tp-host">${p.host === 'me' ? hav('me', 'md') : hav(p.host, 'md')}<span class="tp-rx"><b>${p.host === 'me' ? 'You' : esc(h.n)}${h.v ? ' ' + vbadge() : ''}</b><small>${p.host === 'me' ? 'You started this plan' : esc(h.about || '')}</small></span></div>
        <p class="tp-about">${esc(p.about || '')}</p>
        <h3 class="tp-h3">Going · ${p.going.length} of ${p.cap}</h3><div class="tp-slots">${slots}${p.cap > 6 ? `<small>+${p.cap - 6}</small>` : ''}</div>
        <p class="tp-verif">${ti('lock')}Only ID-verified people can join. Public places only.</p>
      </div></div><div class="tp-foot">${mine(p) ? `<button class="btn btn-secondary" data-act="tpPlanChatOpen" data-id="${p.id}">Open plan chat</button>` : left(p) ? btn('Join plan', 'tpPlanJoin') : btn('This plan is full', 'noop', {disabled:true})}</div></div>`;
  };

  /* plan chat */
  const msgs = id => { const t = T(); t.chats = t.chats || {}; if (!t.chats[id]) { const p = planById(id); const h = HOST[p.host] || {};
      t.chats[id] = p.host === 'me' ? [{sys:'You started the plan'}] : [{sys:'You joined the plan'}, {who:p.host, text:p.type === 'coffee' ? 'Welcome! I’ll be at the window seats.' : `Welcome! See you ${fDay(p.date).split(' ')[0]}.`}, ...(p.going.includes('sara') ? [{who:'sara', text:'See you there ☕'}] : [])]; }
    return t.chats[id]; };
  V.tpPlanChat = () => { const p = planById(S.tpPlanId); if (!p) return V.trips(); const [, em] = typeOf(p.type); const list = msgs(p.id);
    const body = list.map(m => m.sys ? `<p class="tp-csys">${esc(m.sys)}</p>` : m.me ? `<div class="tp-cme"><span>${esc(m.text)}</span></div>` : `<div class="tp-cthem">${hav(m.who, 'xs')}<span><small>${esc((HOST[m.who] || {}).n || '')}</small><span>${esc(m.text)}</span></span></div>`).join('');
    return `<div class="screen tp-screen tp-chat">${statusBar()}<div class="topbar tp-top tp-chathead"><button class="iconbtn" data-act="tpPlanChatBack" aria-label="Back">${ti('back')}</button><span class="tp-plem sm" aria-hidden="true">${em}</span><span class="tp-rx"><b>${esc(p.title)}</b><small>${fDay(p.date).replace(/^\w+ /, m => m)}, ${esc(p.time)} · ${p.going.length} going</small></span></div>
      <div class="scroll tp-cbody" id="tpChatBody"><div class="tp-cpin">${ti('pin')}<span class="tp-rx"><b>${esc(p.place.split(',')[0])}</b><small>${esc(p.place.split(',').slice(1).join(',').trim() || CITY[cityOf(p.id)].n)} · ${esc(p.dist)}</small></span><button class="tp-link" data-act="tpLater" data-msg="Opens directions in your maps app.">Directions</button></div>${body}</div>
      <form class="tp-compose" data-tp-compose="1"><input id="tpMsg" data-in="tpC_msg" value="${esc(S.tpMsg || '')}" placeholder="Message" autocomplete="off" aria-label="Message"><button type="submit" class="tp-send" data-act="tpPlanSend" aria-label="Send" ${(S.tpMsg || '').trim() ? '' : 'disabled'}>${ic('send')}</button></form></div>`;
  };

  /* start a plan */
  const np = () => S.tpNew;
  V.tpPlanNew = () => { const d = np(); const t = P.tripById(S.tpId); const s = t && P.awayStops(t).find(x => x.city === d.city) || (t && P.awayStops(t)[0]); if (!s) return V.trips();
    const hotel = (s.stays || [])[0]; const cn = CITY[s.city].n; const q = d.q.trim().toLowerCase();
    const near = ({tokyo:[['Omoide Yokocho','Shinjuku · 4 min walk'],['Golden Gai','Shinjuku · 6 min walk']], sapporo:[['Nijo Market','Chuo Ward · 7 min walk']], shizuoka:[['Shizuoka Oden Street','Aoi Ward · 5 min walk']]}[s.city] || []);
    const far = ({tokyo:[['Ebisu Yokocho','Shibuya · 20 min by train'],['Yoyogi Park','Shibuya · 15 min by train']], sapporo:[['Odori Park','Chuo Ward · 10 min walk']], shizuoka:[['Sumpu Castle Park','Aoi Ward · 12 min walk']]}[s.city] || []);
    const f = l => l.filter(([n]) => !q || n.toLowerCase().includes(q));
    const custom = q && ![...near, ...far].some(([n]) => n.toLowerCase() === q) ? d.q.trim() : null;
    const opt = ([n, sub]) => `<button class="tp-ropt" data-act="tpNPick" data-k="${esc(n)}" data-s="${esc(sub)}" aria-pressed="${d.where === n}"><span class="tp-tile pk">${ti('pin')}</span><span class="tp-rx"><b>${esc(n)}</b><small>${esc(sub)}</small></span>${d.where === n ? ti('check', 'ok') : ''}</button>`;
    const ok = d.title.trim().length >= 3 && d.type && d.date && d.where;
    return `<div class="screen tp-screen tp-flow">${statusBar()}<div class="topbar tp-top"><button class="iconbtn" data-act="tpClose" aria-label="Close">${ic('close')}</button><span class="t-headline">Start a plan</span><span style="width:40px"></span></div><div class="scroll tp-fpad">
      <span class="tp-tripchip">${ti('plane')}${esc(t.name)} · ${esc(cn)}</span>
      <div class="tp-field tp-mt tp-ta"><textarea id="tpn-title" data-in="tpN_title" maxlength="80" rows="2" placeholder="What’s the plan? e.g. Anyone up for izakaya after the conference?" aria-label="What’s the plan">${esc(d.title)}</textarea>
        <div class="tp-types" role="radiogroup" aria-label="Type">${TYPES.map(([k, e, l]) => `<button role="radio" aria-checked="${d.type === k}" data-act="tpNType" data-k="${k}"><span aria-hidden="true">${e}</span>${l}</button>`).join('')}</div></div>
      <div class="tp-two tp-mt"><label class="tp-field"><small>Day</small><span>${ti('cal')}<input id="tpn-date" data-in="tpN_date" type="date" min="${s.date}" value="${d.date}" aria-label="Day"></span></label><label class="tp-field"><small>Time</small><span><input id="tpn-time" data-in="tpN_time" type="time" value="${d.time}" aria-label="Time"></span></label></div>
      <p class="tp-lbl">Where</p><label class="tp-search">${ti('search')}<input id="tpn-q" data-in="tpN_q" value="${esc(d.q)}" placeholder="Search any place" autocomplete="off" aria-label="Where"></label>
      ${f(near).length ? `<p class="tp-kick">${hotel ? 'Near your hotel · ' + esc(hotel.name.split(',')[0]) : 'Near you in ' + esc(cn)}</p><div class="tp-res">${f(near).map(opt).join('')}</div>` : ''}
      ${f(far).length ? `<p class="tp-kick">Anywhere in ${esc(cn)}</p><div class="tp-res">${f(far).map(opt).join('')}</div>` : ''}
      ${custom ? `<div class="tp-res tp-mt">${opt([custom, cn])}</div>` : ''}
      <div class="tp-field tp-mt tp-rowf"><span>${ti('addp')}<span class="tp-rx"><small>How many people</small><b>Up to ${d.cap}</b></span><span class="tp-step"><button data-act="tpNCap" data-d="-1" ${d.cap <= 2 ? 'disabled' : ''} aria-label="Fewer people">−</button><button data-act="tpNCap" data-d="1" ${d.cap >= 12 ? 'disabled' : ''} aria-label="More people">+</button></span></span></div>
      <p class="tp-note">${ti('lock')}Only ID-verified people can join. Pick a public place.</p>
    </div><div class="tp-foot">${btn('Post plan', ok ? 'tpNPost' : 'noop', {disabled:!ok})}</div></div>`;
  };

  /* actions */
  const needVerify = () => { if (verified()) return false; S.gateFrom = 'chat'; S.tpGate = S.screen; go('gate'); return true; };
  const hm12 = v => { if (!v) return ''; const [h, m] = v.split(':'); return `${(+h % 12) || 12}${m !== '00' ? ':' + m : ''} ${+h < 12 ? 'AM' : 'PM'}`; };
  Object.assign(A, {
    tpPlanCity: el => { S.tpPlanCity = el.dataset.k; render(); },
    tpPlanOpen: el => { S.tpPlanId = el.dataset.id; go('tpPlan'); const sc = document.querySelector('#phone .scroll'); if (sc) sc.scrollTop = 0; },
    tpPlanBack: () => back(),
    tpPlanJoin: el => { const id = (el && el.dataset.id) || S.tpPlanId; const p = planById(id); if (!p || mine(p)) return; if (needVerify()) return;
      if (!left(p)) { toast('This plan just filled up.'); render(); return; } p.going.push('me'); S.tpPlanId = id; S.tpMsg = ''; go('tpPlanChat'); toast('You’re going. Say hi in the plan chat.'); setTimeout(() => { const b = document.getElementById('tpChatBody'); if (b) b.scrollTop = b.scrollHeight; }, 30); },
    tpPlanChatOpen: el => { S.tpPlanId = el.dataset.id; S.tpMsg = ''; go('tpPlanChat'); setTimeout(() => { const b = document.getElementById('tpChatBody'); if (b) b.scrollTop = b.scrollHeight; }, 30); },
    tpPlanChatBack: () => { if (S.hist[S.hist.length - 1] === 'tpPlan') back(); else { back(); } },
    tpPlanSend: () => { const v = (S.tpMsg || '').trim(); if (!v) return; msgs(S.tpPlanId).push({me:true, text:v}); S.tpMsg = ''; render(); const b = document.getElementById('tpChatBody'); if (b) b.scrollTop = b.scrollHeight; const i = document.getElementById('tpMsg'); if (i) i.focus(); },
    tpPlanNew: () => { if (needVerify()) return; const t = P.tripById(S.tpId); const stops = P.awayStops(t); const s = stops.find(x => x.city === S.tpPlanCity) || stops[0];
      S.tpNew = {city:s.city, title:'', type:null, date:s.arrDate || s.date, time:'19:00', q:'', where:null, whereSub:'', cap:6}; go('tpPlanNew'); },
    tpNType: el => { np().type = el.dataset.k; render(); },
    tpNPick: el => { const d = np(); d.where = el.dataset.k; d.whereSub = el.dataset.s; render(); },
    tpNCap: el => { const d = np(); d.cap = Math.max(2, Math.min(12, d.cap + (+el.dataset.d))); render(); },
    tpNPost: () => { const d = np(); const p = {id:'pl-' + Date.now(), type:d.type, title:d.title.trim(), date:d.date, time:hm12(d.time) || 'Any time', place:`${d.where}${d.whereSub && !d.whereSub.includes(d.where) ? ', ' + d.whereSub.split(' · ')[0] : ''}`, dist:(d.whereSub.split(' · ')[1] || 'In ' + CITY[d.city].n), host:'me', going:['me'], cap:d.cap, about:'Started by you. People in ' + CITY[d.city].n + ' on these dates can join.'};
      (store()[d.city] = store()[d.city] || []).unshift(p); S.tpPlanCity = d.city; S.tpPlanId = p.id; go('tpPlan', {replace:true}); toast('Plan posted. People nearby can join now.'); },
  });
  const I = P.inputs || (P.inputs = {});
  I.tpC_msg = v => { S.tpMsg = v; };
  I.tpN_title = v => { np().title = v; }; I.tpN_date = v => { np().date = v; }; I.tpN_time = v => { np().time = v; }; I.tpN_q = v => { const d = np(); d.q = v; if (d.where && v && d.where.toLowerCase() !== v.toLowerCase()) d.where = null; };
  document.addEventListener('submit', e => { if (e.target && e.target.dataset && e.target.dataset.tpCompose) { e.preventDefault(); A.tpPlanSend(); } }, true);

  Object.assign(META, {
    tpPlan:{name:'A plan', group:'Trips', figma:'YouApp Trips tab › A plan', rules:['Who started it, when and where, who’s going and spots left. Join with one tap.','Only ID-verified people can join (unverified users see Badge Verification first). Public places only.','Full plans can’t be joined.']},
    tpPlanChat:{name:'Plan chat', group:'Trips', figma:'YouApp Trips tab › Plan chat', rules:['Joining opens a group chat for the plan, with the place and directions pinned.']},
    tpPlanNew:{name:'Start a plan', group:'Trips', figma:'YouApp Trips tab › Start a plan', rules:['Write what it is (3+ characters), pick a type, when and where (near your hotel first, or any place), and how many people (2–12).','Verified users only. Post plan opens the new plan.']},
  });
})();
