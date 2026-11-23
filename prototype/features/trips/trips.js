/* ===== Trips tab (was Locals). Design board: "YouApp Trips tab".
   Phase 1: bottom tab renamed Locals -> Trips, Trips header (avatar, Trips | Leaderboard, Inbox),
            the old chat list becomes Inbox (top-right icon, back to Trips).
   Phase 2: Trips list (stats, Coming up, Past), Add a trip in 4 steps, the trip page.
   Data lives in memory for the session, like the rest of the prototype. ===== */
(function(){
  const TODAY = '2026-11-23';
  const HOME = 'kl';

  /* ---------- cities (sample table with coordinates for great-circle miles) ---------- */
  const CITY = {
    kl:{n:'Kuala Lumpur', c:'Malaysia', f:'flag_ms', code:'KUL', lat:3.139, lon:101.687},
    sg:{n:'Singapore', c:'Singapore', f:'flag_sg', code:'SIN', lat:1.352, lon:103.82},
    pen:{n:'Penang', c:'Malaysia', f:'flag_ms', code:'PEN', lat:5.414, lon:100.329},
    tokyo:{n:'Tokyo', c:'Japan', f:'flag_ja', code:'HND', lat:35.676, lon:139.65},
    tokushima:{n:'Tokushima', c:'Japan', f:'flag_ja', code:'TKS', lat:34.07, lon:134.555},
    sapporo:{n:'Sapporo', c:'Japan', f:'flag_ja', code:'CTS', lat:43.062, lon:141.354},
    shizuoka:{n:'Shizuoka', c:'Japan', f:'flag_ja', code:'FSZ', lat:34.976, lon:138.383},
    osaka:{n:'Osaka', c:'Japan', f:'flag_ja', code:'KIX', lat:34.694, lon:135.502},
    seoul:{n:'Seoul', c:'South Korea', f:'flag_ko', code:'ICN', lat:37.567, lon:126.978},
    busan:{n:'Busan', c:'South Korea', f:'flag_ko', code:'PUS', lat:35.18, lon:129.076},
    bali:{n:'Bali', c:'Indonesia', f:'flag_id', code:'DPS', lat:-8.65, lon:115.217},
    jakarta:{n:'Jakarta', c:'Indonesia', f:'flag_id', code:'CGK', lat:-6.208, lon:106.846},
    bangkok:{n:'Bangkok', c:'Thailand', f:'flag_th', code:'BKK', lat:13.756, lon:100.502},
    taipei:{n:'Taipei', c:'Taiwan', f:'flag_tw', code:'TPE', lat:25.033, lon:121.565},
    hk:{n:'Hong Kong', c:'Hong Kong', f:'flag_hk', code:'HKG', lat:22.319, lon:114.169},
    hanoi:{n:'Hanoi', c:'Vietnam', f:'flag_vi', code:'HAN', lat:21.028, lon:105.834},
    manila:{n:'Manila', c:'Philippines', f:'flag_ph', code:'MNL', lat:14.6, lon:120.984},
    sydney:{n:'Sydney', c:'Australia', f:'flag_au', code:'SYD', lat:-33.869, lon:151.209},
    london:{n:'London', c:'United Kingdom', f:'flag_gb', code:'LHR', lat:51.507, lon:-0.128},
    tokat:{n:'Tokat', c:'Türkiye', f:'flag_globe', code:'TJK', lat:40.314, lon:36.554},
  };
  const FROM_OPTIONS = ['kl', 'sg', 'pen'];
  const POPULAR = ['tokyo', 'seoul', 'bangkok', 'bali', 'taipei', 'sydney'];

  /* ---------- people you can add (initials avatars like the board) ---------- */
  const FRIENDS = [
    {id:'meiling', n:'Mei Ling', u:'@meiling', ini:'ML', col:'#C05CA8'},
    {id:'kenji', n:'Kenji Tan', ini:'KT', col:'#8C849D', off:true},
    {id:'hafiz', n:'Hafiz', u:'@hafiz.kl', ini:'HF', col:'#3D8BFD'},
    {id:'jason', n:'Jason', u:'@jason.t', ini:'JS', col:'#E0A21B'},
    {id:'aiko', n:'Aiko', u:'@aiko', ini:'AK', col:'#14A877'},
    {id:'sarah', n:'Sarah Lim', ini:'SL', col:'#8C849D', off:true},
  ];
  const friend = id => FRIENDS.find(f => f.id === id);

  /* ---------- small icon set (stroke icons in the runtime's style) ---------- */
  const st = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const TI = {
    plane: st('<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'),
    train: st('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4"/><circle cx="9" cy="14" r=".6" fill="currentColor"/><circle cx="15" cy="14" r=".6" fill="currentColor"/>'),
    bus: st('<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M7 21v-3M17 21v-3"/><circle cx="8" cy="14.5" r=".6" fill="currentColor"/><circle cx="16" cy="14.5" r=".6" fill="currentColor"/>'),
    car: st('<path d="M5 16l1.6-5.2A2 2 0 0 1 8.5 9.4h7a2 2 0 0 1 1.9 1.4L19 16"/><rect x="3" y="15" width="18" height="5" rx="2"/><path d="M6.5 20v1.5M17.5 20v1.5"/>'),
    boat: st('<path d="M3 17l2.5 3.5h13L21 17H3z"/><path d="M12 3v14M12 4l6 9h-6"/>'),
    inbox: st('<path d="M3.5 13.5l2.3-7.1A2 2 0 0 1 7.7 5h8.6a2 2 0 0 1 1.9 1.4l2.3 7.1"/><path d="M3.5 13.5V18a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4.5h-5l-1.5 2h-4l-1.5-2h-5z"/>'),
    pin: st('<path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
    cal: st('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
    route: st('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>'),
    trophy: st('<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M8.5 20h7"/>'),
    lock: st('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    globe: st('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5z"/>'),
    addp: st('<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.6-3.6 3.2-6 6.5-6 1.5 0 2.8.5 3.9 1.3M18 14v6M15 17h6"/>'),
    bed: st('<path d="M3 18V7M3 14h18v4M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5"/><circle cx="7" cy="11" r="1.8"/>'),
    camera: st('<path d="M4.5 8a1.5 1.5 0 0 1 1.5-1.5h2.2l1.4-2h4.8l1.4 2H18A1.5 1.5 0 0 1 19.5 8v10a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V8z"/><circle cx="12" cy="12.8" r="3.4"/>'),
    plus: st('<path d="M12 5v14M5 12h14"/>'),
    check: st('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    chevd: st('<path d="M6 9l6 6 6-6"/>'),
    share: st('<path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
    back: st('<path d="M15 5l-7 7 7 7"/>'),
    search: st('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
    wa: st('<path d="M5 19l1.2-3.5A7.5 7.5 0 1 1 9 18.6L5 19z"/><path d="M9.5 9.5c.3 2 1.8 3.7 4 4.3l1-1.1 1.6.8-.4 1.3c-3.2.3-6.5-2.8-6.2-6l1.3-.4.8 1.6-1.1 1z"/>'),
  };
  const ti = (k, cls='') => `<span class="tp-i ${cls}" aria-hidden="true">${TI[k]||''}</span>`;
  const MODES = [['plane','Plane'],['train','Train'],['bus','Bus'],['car','Car'],['boat','Boat']];

  /* ---------- dates, miles ---------- */
  const D = s => new Date(s + 'T00:00:00');
  const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fDay = s => { const d = D(s); return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`; };
  const fMonth = s => { const d = D(s); return `${MO[d.getMonth()]} ${d.getFullYear()}`; };
  const fRange = (a, b) => { const x = D(a), y = D(b); return x.getMonth() === y.getMonth() ? `${x.getDate()}–${y.getDate()} ${MO[y.getMonth()]}` : `${x.getDate()} ${MO[x.getMonth()]} – ${y.getDate()} ${MO[y.getMonth()]}`; };
  const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const daysUntil = s => Math.round((D(s) - D(TODAY)) / 864e5);
  const miles = (a, b) => { const A = CITY[a], B = CITY[b]; if (!A || !B || a === b) return 0; const r = Math.PI / 180;
    const h = Math.sin((B.lat - A.lat) * r / 2) ** 2 + Math.cos(A.lat * r) * Math.cos(B.lat * r) * Math.sin((B.lon - A.lon) * r / 2) ** 2;
    return Math.round(3958.8 * 2 * Math.asin(Math.sqrt(h))); };
  const nf = n => n.toLocaleString('en-US');
  /* route = home, stops in order; miles = sum of each leg (home to stop 1, stop 1 to stop 2 ...) */
  const route = t => [t.from, ...t.stops.map(s => s.city)];
  const tripMiles = t => { const r = route(t); let m = 0; for (let i = 1; i < r.length; i++) m += miles(r[i-1], r[i]); return m; };
  const awayStops = t => t.stops.filter(s => s.city !== t.from && s.city !== HOME);
  const isPast = t => (t.end || t.start) < TODAY;
  const tripPhotos = t => t.stops.flatMap(s => s.photos || []);
  const ensureStop = s => { s.stays = s.stays || []; s.places = s.places || []; s.photos = s.photos || []; return s; };
  const tripEnd = t => t.end || t.stops[t.stops.length - 1].date;

  /* ---------- store ---------- */
  const rep = (a, n) => Array.from({length:n}, (_, i) => a[i % a.length]);
  const seed = () => ({
    tab:'trips', all:false, flash:null, sheet:null, invite:'pending', lbMetric:'cities', lbScope:'friends', lbYear:false,
    list:[
      {id:'t-japan', name:'Japan winter', privacy:'private', from:HOME, start:'2027-01-03', end:'2027-01-13', cover:'cover2', people:['meiling'], invited:['kenji'], joined:{meiling:true},
        stops:[
          {city:'tokyo', date:'2027-01-03', arrDate:'2027-01-04', mode:'plane', flight:'MH 88', dep:'23:30',
            stays:[{name:'Hotel Sakura Shinjuku', area:'Shinjuku, Tokyo', in:'2027-01-04', out:'2027-01-05'}, {name:'Airbnb loft, Asakusa', area:'Taito City, Tokyo', in:'2027-01-05', out:'2027-01-07'}],
            places:[{name:'Tsukiji Outer Market', area:'Chuo City, Tokyo', when:'2027-01-04', time:'9 AM', photos:['pSeoul2','pSeoul1'], with:['meiling']}, {name:'Senso-ji Temple', area:'Taito City, Tokyo', when:'2027-01-05', time:'4 PM', photos:['pBali3'], with:[]}],
            photos:rep(['pSeoul2','pSeoul1','pBali3'], 9)},
          {city:'sapporo', date:'2027-01-07', mode:'plane', flight:'JL 503', stays:[],
            places:[{name:'Odori Park Snow Festival', area:'Chuo Ward, Sapporo', when:'2027-01-08', time:'', photos:['cover2'], with:['kenji']}], photos:rep(['cover2','cover2','pSeoul1'], 5)},
          {city:'shizuoka', date:'2027-01-10', mode:'train', line:'Shinkansen', stays:[],
            places:[{name:'Nihondaira, Mt Fuji view', area:'Shimizu, Shizuoka', when:'2027-01-11', time:'', photos:['cover1','pBali2'], with:[]}], photos:rep(['cover1','pBali2','cover1'], 4)},
          {city:'kl', date:'2027-01-13', mode:'plane', flight:'MH 71', stays:[], places:[], photos:[]}]},
      {id:'t-seoul', name:'Seoul and Busan', privacy:'public', from:HOME, start:'2026-10-09', end:'2026-10-16', cover:'pSeoul1', people:['hafiz','meiling'], invited:[], joined:{hafiz:true, meiling:true},
        stops:[{city:'seoul', date:'2026-10-09', mode:'plane', stays:[{name:'L7 Myeongdong', area:'Jung-gu, Seoul', in:'2026-10-09', out:'2026-10-13'}],
                places:[{name:'Myeongdong night market', area:'Jung-gu, Seoul', when:'2026-10-10', time:'8 PM', photos:['pSeoul1'], with:['hafiz','meiling']}, {name:'Gwangjang Market', area:'Jongno-gu, Seoul', when:'2026-10-11', time:'1 PM', photos:['pSeoul2'], with:['meiling']}], photos:rep(['pSeoul1','pSeoul2'], 16)},
               {city:'busan', date:'2026-10-13', mode:'train', line:'KTX', stays:[], places:[{name:'Haeundae Beach', area:'Haeundae, Busan', when:'2026-10-14', time:'', photos:['pSeoul3'], with:['hafiz']}], photos:rep(['pSeoul3','pSeoul1'], 8)},
               {city:'kl', date:'2026-10-16', mode:'plane', stays:[], places:[], photos:[]}]},
      {id:'t-bali', name:'Bali', privacy:'public', from:HOME, start:'2026-08-14', end:'2026-08-18', cover:'pBali1', people:['jason'], invited:[], joined:{jason:true},
        stops:[{city:'bali', date:'2026-08-14', mode:'plane', stays:[{name:'Alaya Resort Ubud', area:'Ubud, Bali', in:'2026-08-14', out:'2026-08-18'}],
                places:[{name:'Kuta Beach', area:'Kuta, Bali', when:'2026-08-14', time:'6 PM', photos:['pBali1'], with:['jason']}, {name:'Tegallalang rice terraces', area:'Ubud, Bali', when:'2026-08-15', time:'9 AM', photos:['pBali2'], with:['jason']}, {name:'Pura Ulun Danu Bratan', area:'Tabanan, Bali', when:'2026-08-16', time:'', photos:['pBali3'], with:[]}], photos:rep(['pBali1','pBali2','pBali3'], 31)},
               {city:'kl', date:'2026-08-18', mode:'plane', stays:[], places:[], photos:[]}]},
      ...[['t-bkk','Bangkok food run','public',[['bangkok','2026-06-05']],'2026-06-08',12,[]],
          ['t-tpe','Taipei and Hong Kong','private',[['taipei','2026-02-12'],['hk','2026-02-16']],'2026-02-19',40,['aiko']],
          ['t-hanoi','Hanoi','public',[['hanoi','2025-11-20']],'2025-11-24',9,[]],
          ['t-osaka','Osaka spring','public',[['osaka','2025-04-02']],'2025-04-09',58,['meiling']],
          ['t-syd','Sydney','public',[['sydney','2025-01-08']],'2025-01-15',22,[]],
          ['t-manila','Manila work trip','private',[['manila','2024-09-17']],'2024-09-20',4,[]],
          ['t-london','London','public',[['london','2024-05-03']],'2024-05-12',35,[]]].map(([id, name, privacy, st, end, n, ppl]) => ({id, name, privacy, from:HOME, start:st[0][1], end, cover:'cover1', people:ppl, invited:[], joined:Object.fromEntries(ppl.map(p => [p, true])),
          stops:[...st.map(([city, date], k) => ({city, date, mode:'plane', stays:[], places:[], photos:k ? [] : rep(['cover1','pSeoul1','pBali1'], n)})), {city:'kl', date:end, mode:'plane', stays:[], places:[], photos:[]}]})),
    ],
    plans:{}, myPlans:{}, chats:{},
  });
  let T = seed();
  window.__trips = () => T;
  const empty = () => scen.content === 'empty' || scen.tpList === 'empty';
  const trips = () => empty() ? [] : T.list;
  const tripById = id => T.list.find(t => t.id === id);
  const upcoming = () => trips().filter(t => !isPast(t)).sort((a, b) => a.start.localeCompare(b.start));
  const past = () => trips().filter(isPast).sort((a, b) => b.start.localeCompare(a.start));
  /* stats only count trips that already happened; cities and countries count once */
  const stats = () => { const ps = past(); const cities = new Set(), countries = new Set(); let m = 0;
    ps.forEach(t => { awayStops(t).forEach(s => { cities.add(s.city); countries.add(CITY[s.city].c); }); m += tripMiles(t); });
    return {cities:cities.size, countries:countries.size, miles:m}; };

  /* ---------- route map (great-circle stops projected into a small box) ---------- */
  function routeMap(t, W, H, opt={}){
    const pts = route(t).filter((c, i, a) => i === 0 || c !== a[i-1]);
    const uniq = [...new Set(pts)];
    const lat = uniq.map(c => CITY[c].lat), lon = uniq.map(c => CITY[c].lon);
    const pad = {l:30, r:70, t:24, b:24}; if (opt.hero) { pad.t = 70; pad.b = 26; } if (opt.padB) pad.b = opt.padB;
    const minLa = Math.min(...lat), maxLa = Math.max(...lat), minLo = Math.min(...lon), maxLo = Math.max(...lon);
    const sx = (W - pad.l - pad.r) / Math.max(maxLo - minLo, 1e-6), sy = (H - pad.t - pad.b) / Math.max(maxLa - minLa, 1e-6);
    const s = Math.min(sx, sy, 60);
    const ox = pad.l + ((W - pad.l - pad.r) - (maxLo - minLo) * s) / 2, oy = pad.t + ((H - pad.t - pad.b) - (maxLa - minLa) * s) / 2;
    /* project, then spread stops that land too close together so every dot and label stays readable */
    const pos = {}; uniq.forEach(c => { pos[c] = [ox + (CITY[c].lon - minLo) * s, oy + (maxLa - CITY[c].lat) * s]; });
    const MIN = 46, clampX = x => Math.max(pad.l - 8, Math.min(W - 24, x)), clampY = y => Math.max(pad.t - 6, Math.min(H - 14, y));
    for (let it = 0; it < 60; it++) { let moved = false;
      for (let i = 0; i < uniq.length; i++) for (let j = i + 1; j < uniq.length; j++) { const a = pos[uniq[i]], b = pos[uniq[j]];
        let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy); if (d >= MIN) continue; moved = true;
        if (d < .01) { dx = 1; dy = .6; d = Math.hypot(dx, dy); } const push = (MIN - d) / 2, ux = dx / d, uy = dy / d;
        a[0] = clampX(a[0] - ux * push); a[1] = clampY(a[1] - uy * push); b[0] = clampX(b[0] + ux * push); b[1] = clampY(b[1] + uy * push); }
      if (!moved) break; }
    const P = c => [Math.round(pos[c][0]), Math.round(pos[c][1])];
    let dots = ''; for (let y = 6; y < H; y += 22) for (let x = (y * 7) % 26; x < W; x += 26) dots += `<circle cx="${x}" cy="${y}" r="1.4" fill="#D5C8F0"/>`;
    let legs = '', plane = '';
    for (let i = 1; i < pts.length; i++) { const [x1, y1] = P(pts[i-1]), [x2, y2] = P(pts[i]); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.max(18, Math.abs(x2 - x1) * .18);
      legs += `<path d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}" stroke="#7A55C8" stroke-width="2.5" stroke-dasharray="5 6" fill="none" stroke-linecap="round"/>`;
      if (i === 1) { const qx = .25*x1 + .5*mx + .25*x2, qy = .25*y1 + .5*my + .25*y2; const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        plane = `<g transform="translate(${qx} ${qy}) rotate(${Math.round(ang + 45)})"><svg x="-11" y="-11" width="22" height="22" viewBox="0 0 24 24" overflow="visible"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="#5E35B8"/></svg></g>`; } }
    const label = c => c === 'kl' ? 'KL' : CITY[c].n;
    /* labels: try right, left, above, below; take the first spot that clears other labels and dots */
    const boxes = [], hit = (r, q) => r.x < q.x + q.w && q.x < r.x + r.w && r.y < q.y + q.h && q.y < r.y + r.h;
    const dotsB = uniq.map(c => { const [x, y] = P(c); return {x:x - 9, y:y - 9, w:18, h:18}; });
    const marks = uniq.map(c => { const [x, y] = P(c); const home = c === t.from; const w = Math.round(label(c).length * 6.6 + 12);
      const opts = [[x + 12, y - 9], [x - 12 - w, y - 9], [x - w / 2, y - 31], [x - w / 2, y + 13], [x + 10, y - 26], [x - 10 - w, y + 8]];
      let pick = null; for (const [lx, ly] of opts) { const r = {x:lx, y:ly, w, h:18}; if (lx < 2 || lx + w > W - 2 || ly < 2 || ly + 18 > H - 2) continue; if (boxes.some(q => hit(r, q)) || dotsB.some(q => hit(r, q))) continue; pick = r; break; }
      if (!pick) pick = {x:Math.max(2, Math.min(W - w - 2, x + 12)), y:Math.max(2, Math.min(H - 20, y - 9)), w, h:18}; boxes.push(pick);
      return `<g><circle cx="${x}" cy="${y}" r="${home?7:9}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${home?4.5:6}" fill="${home?'#C05CA8':'#5E35B8'}"/><g transform="translate(${Math.round(pick.x)} ${Math.round(pick.y)})"><rect x="0" y="0" width="${w}" height="18" rx="9" fill="#fff"/><text x="6" y="13" font-family="Inter,sans-serif" font-weight="700" font-size="11" fill="#1E1050">${esc(label(c))}</text></g></g>`; }).join('');
    return `<svg class="tp-map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Route: ${esc(pts.map(label).join(' to '))}"><rect width="${W}" height="${H}" fill="#F4EFFF"/>${dots}<path d="M${W-100} ${H+10}Q${W-86} ${H-40} ${W-64} ${H-60}Q${W-50} ${H-100} ${W-30} ${H-110}Q${W-20} ${H-80} ${W-36} ${H-40}Z" fill="#E3D8F6"/><path d="M14 ${H-20}Q24 ${H-44} 44 ${H-36}Q58 ${H-24} 46 ${H-8}Z" fill="#E3D8F6"/>${legs}${plane}${marks}</svg>`;
  }
  const art = (k, cls='') => `<span class="tp-art ${cls}" aria-hidden="true">${TRIP_ART[k] || TRIP_ART.cover1}</span>`;
  const av = (id, cls='') => { const f = friend(id); return f ? `<span class="tp-av ${cls}" style="background:${f.col}" title="${esc(f.n)}">${esc(f.ini)}</span>` : ''; };
  const meAv = cls => `<img class="tp-av tp-me ${cls||''}" src="${IMG.avatar}" alt="">`;
  const names = ids => { const n = ids.map(id => friend(id)?.n).filter(Boolean); return n.length <= 2 ? n.join(' and ') : `${n[0]}, ${n[1]} and ${n.length - 2} more`; };
  const plural = (n, one, many) => `${nf(n)} ${n === 1 ? one : (many || one + 's')}`;

  /* ---------- inbox badge: unread chats + announcements, 0 when Content = empty ---------- */
  const inboxUnread = () => { if (empty()) return 0; try { const c = (typeof gStore === 'function' ? gStore() : C6());
    return (c.convs || []).reduce((n, x) => n + (x.unread || 0), 0) + (scen.ann !== 'none' ? (C6().annUnread || 0) : 0); } catch(e) { return 0; } };

  /* ---------- Trips header ---------- */
  const inboxBtn = () => { const u = inboxUnread();
    return `<button class="tp-inbox" data-act="tpInbox" aria-label="Inbox${u?`, ${u} unread`:''}">${ti('inbox')}${u?`<i>${u > 99 ? '99+' : u}</i>`:''}</button>`; };
  const head = () => { const u = inboxUnread();
    return `<div class="appbar tp-appbar"><button class="avatar" data-act="youpage" aria-label="Open YouPage"><img src="${IMG.avatar}" alt=""></button>
      <div class="htabs" role="tablist" aria-label="Trips or Leaderboard"><button role="tab" aria-selected="${T.tab==='trips'}" data-act="tpTab" data-k="trips">Trips</button><button role="tab" aria-selected="${T.tab==='board'}" data-act="tpTab" data-k="board">Leaderboard</button></div>
      <button class="tp-inbox" data-act="tpInbox" aria-label="Inbox${u?`, ${u} unread`:''}">${ti('inbox')}${u?`<i>${u > 99 ? '99+' : u}</i>`:''}</button></div>`; };

  /* ---------- Trips list ---------- */
  V.trips = () => {
    if (T.tab === 'board') return `<div class="screen tp-screen">${statusBar()}${head()}<div class="scroll"><div class="phase-note">${ic('info')}<div><b>Leaderboard arrives in Phase 5.</b><br>Cities and miles against friends, Malaysia or everyone, with your row always shown.</div></div></div>${bottomNav('locals')}</div>`;
    const sx = stats(), up = upcoming(), ps = past();
    const statCard = `<section class="tp-stats" aria-label="Your travels">${art('globe','tp-globe')}<div class="tp-stx"><small>Your travels</small>
      <div class="tp-nums"><span><b>${nf(sx.cities)}</b><em>${sx.cities === 1 ? 'city' : 'cities'}</em></span><span><b>${nf(sx.countries)}</b><em>${sx.countries === 1 ? 'country' : 'countries'}</em></span><span><b>${nf(sx.miles)}</b><em>miles</em></span></div>
      ${sx.cities ? `<span class="tp-rank">${ti('trophy')}#${window.TP && TP.myRank ? TP.myRank() : 12} among your friends</span>` : `<span class="tp-rank muted">Your first trip starts the count</span>`}</div></section>`;
    const addBtn = `<button class="tp-add" data-act="tpNew">${ti('plus')}Add a trip</button>`;
    if (!up.length && !ps.length) return `<div class="screen tp-screen">${statusBar()}${head()}<div class="scroll tp-pad">${statCard}
      <div class="tp-empty">${art('suitcase','tp-emp-art')}<b>Where to next?</b><p>Add a trip to count your cities and miles, and keep the places and photos together.</p><button class="btn btn-primary tp-cta" data-act="tpNew">${ti('plus')}Add a trip</button></div></div>${bottomNav('locals')}</div>`;
    const upCard = t => { const away = awayStops(t);
      return `<button class="tp-card tp-up" data-act="tpOpen" data-id="${t.id}">${routeMap(t, 326, 120)}<span class="tp-cb"><b>${esc(t.name)}</b>
        <small>${esc(away.map(s => CITY[s.city].n).join(' → '))} · ${t.end ? fRange(away[0] ? away[0].date : t.start, t.end) : `From ${fDay(t.start)}`}</small>
        <span class="tp-chips"><em>${ti('pin')}${plural(away.length,'stop')}</em><em>${ti('plane')}${nf(tripMiles(t))} miles</em><em>${(d => d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `in ${d} days`)(daysUntil(t.start))}</em></span></span></button>`; };
    const pastCard = t => { const away = awayStops(t); const all = tripPhotos(t); const ph = all.length ? [...new Set(all)] : [t.cover];
      return `<button class="tp-card tp-past" data-act="tpOpen" data-id="${t.id}"><span class="tp-ph tp-ph${Math.min(ph.length,3)}">${ph.slice(0,3).map(k => art(k)).join('')}</span><span class="tp-cb"><b>${esc(t.name)}</b>
        <small>${fMonth(t.start)} · ${plural(away.length,'stop')} · ${nf(tripMiles(t))} miles</small>
        <span class="tp-with">${t.people.length ? `<span class="tp-avs">${t.people.slice(0,3).map(id => av(id,'sm')).join('')}</span>with ${esc(names(t.people))} · ` : ''}${plural(all.length,'photo')}</span></span></button>`; };
    const pastRow = t => { const away = awayStops(t);
      return `<button class="tp-row" data-act="tpOpen" data-id="${t.id}"><span class="tp-flag">${ic(CITY[away[0].city].f)}</span><span class="tp-rx"><b>${esc(t.name)}</b><small>${fMonth(t.start)} · ${plural(away.length,'stop')} · ${nf(tripMiles(t))} miles</small></span>${ic('chev')}</button>`; };
    const shownPast = T.all ? ps : ps.slice(0, 2);
    return `<div class="screen tp-screen">${statusBar()}${head()}<div class="scroll tp-pad">${window.TP && TP.inviteCard ? TP.inviteCard() : ''}${statCard}${addBtn}
      ${up.length ? `<h2 class="tp-h2">Coming up</h2>${up.map(upCard).join('')}` : ''}
      ${ps.length ? `<div class="tp-h2row"><h2 class="tp-h2">Past trips</h2>${ps.length > 2 ? `<button class="tp-link" data-act="tpAll">${T.all ? 'Show less' : `See all ${ps.length}`}</button>` : ''}</div>
        ${shownPast.map((t, i) => i < 2 ? pastCard(t) : pastRow(t)).join('')}` : ''}
    </div>${bottomNav('locals')}</div>`;
  };

  /* ---------- Add a trip: 4 steps (where, how, who, name) ---------- */
  const draft = () => T.draft || (T.draft = {step:1, from:HOME, fromOpen:false, q:'', to:null, mode:'plane', flight:'', date:'', noFlight:false, who:{}, pq:'', name:'', nameTouched:false, cover:'cover2', privacy:'private'});
  const AIR = {MH:'Malaysia Airlines', AK:'AirAsia', OD:'Batik Air', SQ:'Singapore Airlines', TR:'Scoot', JL:'Japan Airlines', NH:'ANA', KE:'Korean Air', GA:'Garuda Indonesia', TG:'Thai Airways', CX:'Cathay Pacific', BR:'EVA Air', QF:'Qantas', BA:'British Airways'};
  const flightOk = f => /^[A-Z0-9]{2}\s?\d{1,4}$/i.test(f.trim());
  const normFlight = f => f.trim().toUpperCase().replace(/^([A-Z0-9]{2})\s?(\d+)$/, '$1 $2');
  /* mock lookup: the same flight number flies every day, times and airports fill in */
  const lookup = d => { const m = miles(d.from, d.to); const mins = Math.round(m / 520 * 60 + 35); const dep = 23 * 60 + 30; const arrAbs = dep + mins;
    const hm = x => `${String(Math.floor(x / 60) % 24).padStart(2,'0')}:${String(x % 60).padStart(2,'0')}`;
    return {code:normFlight(d.flight), air:AIR[d.flight.trim().slice(0,2).toUpperCase()] || 'Airline', dep:hm(dep), arr:hm(arrAbs % 1440), arrDate:addDays(d.date, Math.floor(arrAbs / 1440)), dur:`${Math.floor(mins/60)}h ${String(mins%60).padStart(2,'0')}m`, mi:m}; };
  const canNext = d => d.step === 1 ? !!d.to : d.step === 2 ? (!!d.date && (d.mode !== 'plane' || d.noFlight || flightOk(d.flight))) : d.step === 3 ? true : !!d.name.trim();
  const stepBar = n => `<div class="tp-steps" aria-label="Step ${n} of 4">${[1,2,3,4].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>`;
  const top = (title, skip) => `<div class="topbar tp-top"><button class="iconbtn" data-act="tpBack" aria-label="Back">${ti('back')}</button><span class="t-headline">${esc(title)}</span>${skip ? `<button class="tp-skip" data-act="tpSkip">Skip</button>` : '<span style="width:40px"></span>'}</div>`;
  const foot = (label, act, ok) => `<div class="tp-foot">${btn(label, ok ? act : 'noop', {disabled:!ok})}</div>`;

  V.tripAdd = () => { const d = draft(); const to = d.to && CITY[d.to];
    if (d.step === 1) { const q = d.q.trim().toLowerCase();
      const res = q ? Object.keys(CITY).filter(k => k !== d.from && (CITY[k].n.toLowerCase().startsWith(q) || CITY[k].c.toLowerCase().startsWith(q) || CITY[k].n.toLowerCase().includes(' ' + q))).slice(0, 6) : POPULAR;
      const fromSel = FROM_OPTIONS.map(k => `<button class="tp-fopt" data-act="tpFrom" data-k="${k}" aria-pressed="${d.from===k}">${ti('pin')}<span>${CITY[k].n}</span>${k===HOME?'<em>Home</em>':''}${d.from===k?ti('check','ok'):''}</button>`).join('');
      return `<div class="screen tp-screen tp-flow">${statusBar()}${top('Add a trip')}${stepBar(1)}<div class="scroll tp-fpad">
        <h1 class="tp-h1">Where are you going?</h1><p class="tp-sub">Add more stops after this.</p>
        <button class="tp-field tp-from" data-act="tpFromOpen" aria-expanded="${d.fromOpen}"><small>From</small><span>${ti('pin')}<b>${CITY[d.from].n}</b>${d.from===HOME?'<em>Home</em>':''}</span></button>
        ${d.fromOpen ? `<div class="tp-fopts">${fromSel}</div>` : ''}
        <span class="tp-arrow" aria-hidden="true">${ti('chevd')}</span>
        <label class="tp-field tp-to ${to?'set':''}"><small>To</small><span>${ti('search')}<input id="tpQ" data-in="tpQ" value="${esc(to && !d.q ? to.n : d.q)}" placeholder="Search a city" autocomplete="off" aria-label="Where to"></span></label>
        ${!q && !to ? '<p class="tp-kick">Popular</p>' : ''}
        ${res.length ? `<div class="tp-res">${res.map(k => `<button class="tp-ropt" data-act="tpTo" data-k="${k}" aria-pressed="${d.to===k}"><span class="tp-flag">${ic(CITY[k].f)}</span><span class="tp-rx"><b>${CITY[k].n}</b><small>${CITY[k].c} · ${nf(miles(d.from,k))} miles from ${CITY[d.from].n}</small></span>${d.to===k?ti('check','ok'):''}</button>`).join('')}</div>`
          : `<p class="tp-none">No cities match “${esc(d.q)}”. Try another spelling.</p>`}
      </div>${foot('Next','tpNext',canNext(d))}</div>`; }
    if (d.step === 2) { const f = d.mode === 'plane' && !d.noFlight; const L = f && flightOk(d.flight) && d.date ? lookup(d) : null;
      return `<div class="screen tp-screen tp-flow">${statusBar()}${top(to.n)}${stepBar(2)}<div class="scroll tp-fpad">
        <h1 class="tp-h1">How are you getting to ${esc(to.n)}?</h1><p class="tp-sub">${f ? 'Flight number and date. We fill in the rest.' : 'Pick the date you leave. Everything else is optional.'}</p>
        <div class="tp-modes" role="radiogroup" aria-label="How you get there">${MODES.map(([k,l]) => `<button role="radio" aria-checked="${d.mode===k}" data-act="tpMode" data-k="${k}">${ti(k)}${l}</button>`).join('')}</div>
        <div class="tp-two ${f?'':'one'}">${f ? `<label class="tp-field ${d.flight && !flightOk(d.flight) ? 'err' : ''}"><small>Flight number</small><span>${ti('plane')}<input id="tpFl" data-in="tpFl" value="${esc(d.flight)}" placeholder="MH 88" autocomplete="off" autocapitalize="characters" aria-label="Flight number"></span></label>` : ''}
          <label class="tp-field"><small>${d.mode === 'plane' && !f ? 'Date you fly' : 'Date'}</small><span>${ti('cal')}<input id="tpDt" data-in="tpDt" type="date" min="${TODAY}" value="${d.date}" aria-label="Date"></span></label></div>
        ${f && d.flight && !flightOk(d.flight) ? '<p class="tp-err">Use the airline code and number, like MH 88.</p>' : ''}
        ${L ? `<div class="tp-flt"><div class="tp-flt-h"><b>${esc(L.code)}</b><small>${esc(L.air)}</small><em>On time</em></div>
          <div class="tp-flt-r"><span><b>${L.dep}</b><small>${CITY[d.from].code} · ${fDay(d.date)}</small></span><span class="tp-flt-m">${ti('plane')}<small>${L.dur} · ${nf(L.mi)} mi</small></span><span class="r"><b>${L.arr}</b><small>${to.code} · ${fDay(L.arrDate)}</small></span></div></div>`
          : f && !d.date && flightOk(d.flight) ? '<p class="tp-hint">Add the date to see the times.</p>' : ''}
        ${d.mode === 'plane' ? `<p class="tp-alt">${f ? `No flight number? <button class="tp-link" data-act="tpNoFlight">Pick dates instead</button>` : `Have a flight number? <button class="tp-link" data-act="tpNoFlight">Add it</button>`}</p>` : `<p class="tp-hint">Times, ${d.mode === 'car' ? 'car or Grab' : d.mode + ' name'} and more can be added on the trip page.</p>`}
      </div>${foot('Next','tpNext',canNext(d))}</div>`; }
    if (d.step === 3) { const q = d.pq.trim().toLowerCase(); const list = FRIENDS.filter(f => !q || f.n.toLowerCase().includes(q) || (f.u||'').includes(q));
      const phone = /^\+?[\d\s-]{8,}$/.test(d.pq.trim());
      const row = f => { const s = d.who[f.id];
        return `<div class="tp-prow">${av(f.id)}<span class="tp-rx"><b>${esc(f.n)}</b><small>${f.off ? (s ? 'Not on YouApp · invited on WhatsApp' : 'Not on YouApp') : esc(f.u)}</small></span>
          ${s ? `<button class="tp-pill ${f.off?'inv':'ok'}" data-act="tpWho" data-id="${f.id}" aria-pressed="true" aria-label="${f.off?'Invited':'Added'} ${esc(f.n)}, tap to undo">${f.off?'Invited':'Added'}</button>`
              : `<button class="tp-pill add" data-act="tpWho" data-id="${f.id}" aria-pressed="false">${f.off ? 'Invite' : 'Add'}</button>`}</div>`; };
      return `<div class="screen tp-screen tp-flow">${statusBar()}${top('Who’s coming?', true)}${stepBar(3)}<div class="scroll tp-fpad">
        <h1 class="tp-h1">Who’s going with you?</h1><p class="tp-sub">They join the trip: it shows in their Trips, they can add places and photos, and their miles count too.</p>
        <label class="tp-search">${ti('search')}<input id="tpPq" data-in="tpPq" value="${esc(d.pq)}" placeholder="Name, @username or phone" autocomplete="off" aria-label="Search people"></label>
        <div class="tp-plist">${list.map(row).join('')}${phone ? `<div class="tp-prow"><span class="tp-av" style="background:#14A877">${ti('wa')}</span><span class="tp-rx"><b>${esc(d.pq.trim())}</b><small>Invite on WhatsApp</small></span><button class="tp-pill add" data-act="tpInvitePhone">Invite</button></div>` : ''}
          ${!list.length && !phone ? `<p class="tp-none">No one matches “${esc(d.pq)}”. Type a phone number to invite them on WhatsApp.</p>` : ''}</div>
        <p class="tp-hint">Friends not on YouApp get a WhatsApp invite and join the trip when they sign up. It counts as your referral.</p>
      </div>${foot('Next','tpNext',true)}</div>`; }
    /* step 4 */
    const covers = ['cover2','cover1'];
    return `<div class="screen tp-screen tp-flow">${statusBar()}${top('Name and privacy')}${stepBar(4)}<div class="scroll tp-fpad">
      <h1 class="tp-h1">Name your trip</h1>
      <label class="tp-field ${!d.name.trim() && d.nameTouched ? 'err' : ''}"><small>Trip name</small><span><input id="tpNm" data-in="tpNm" value="${esc(d.name)}" maxlength="40" placeholder="e.g. ${esc(to.n)} trip" aria-label="Trip name"></span></label>
      ${!d.name.trim() && d.nameTouched ? '<p class="tp-err">Give your trip a name.</p>' : ''}
      <p class="tp-lbl">Cover</p><div class="tp-covers" role="radiogroup" aria-label="Cover">${covers.map(k => `<button role="radio" aria-checked="${d.cover===k}" data-act="tpCover" data-k="${k}" aria-label="Cover ${k.slice(-1)}">${art(k)}</button>`).join('')}<button class="tp-coveradd" data-act="toast" data-msg="Pick a photo from your gallery." aria-label="Add your own cover">${ti('camera')}</button></div>
      <p class="tp-lbl">Who can see it?</p>
      <div class="tp-priv" role="radiogroup" aria-label="Who can see it">
        ${[['public','globe','Public','On your profile for anyone. Places and photos too.'],['private','lock','Private','Only people on the trip see places and photos.']].map(([k,i,t,s]) => `<button role="radio" aria-checked="${d.privacy===k}" data-act="tpPriv" data-k="${k}"><span class="tp-pi">${ti(i)}</span><span class="tp-rx"><b>${t}</b><small>${s}</small></span><i class="tp-radio"></i></button>`).join('')}</div>
      <p class="tp-note">${ti('trophy')}Both count on the Leaderboard. Only the city and miles show there.</p>
    </div>${foot('Create trip','tpCreate',canNext(d))}</div>`;
  };

  /* ---------- actions ---------- */
  const goTrips = () => { S.hist = ['discover']; go('trips', {replace:true}); };
  Object.assign(A, {
    nav: (orig => el => { if (el.dataset.to === 'locals' && !isGuest()) {
      if (kyc() !== 'approved' && !SESS6.localsLater) { S.gateFrom = 'locals'; S.hist = ['discover']; go('gate', {replace:true}); return; }
      goTrips(); return; } orig(el); })(A.nav),
    gateLater: (orig => () => { if (S.gateFrom === 'locals') { SESS6.localsLater = true; goTrips(); return; } orig(); })(A.gateLater),
    tpTab: el => { T.tab = el.dataset.k; render(); },
    tpInbox: () => { S.ctab = S.ctab || 'message'; go('chats'); },
    tpAll: () => { T.all = !T.all; render(); },
    tpOpen: el => { S.tpId = el.dataset.id; S.tpTab = 'itin'; T.flash = null; go('trip'); const sc = document.querySelector('#phone .scroll'); if (sc) sc.scrollTop = 0; },
    tpBackList: () => { T.flash = null; if (S.hist[S.hist.length-1] === 'trips') back(); else goTrips(); },
    tpPTab: el => { S.tpTab = el.dataset.k; render(); },
    tpLater: el => toast(el.dataset.msg || 'This arrives in a later phase.'),
    tpNew: () => { T.draft = null; draft(); go('tripAdd'); },
    tpBack: () => { const d = draft(); if (d.step > 1) { d.step--; render(); } else { T.draft = null; back(); } },
    tpSkip: () => { const d = draft(); d.who = {}; d.step = 4; if (!d.nameTouched && !d.name) d.name = `${CITY[d.to].n} trip`; render(); },
    tpNext: () => { const d = draft(); if (!canNext(d)) return; d.step++; if (d.step === 4 && !d.nameTouched && !d.name) d.name = `${CITY[d.to].n} trip`; render(); const sc = document.querySelector('#phone .scroll'); if (sc) sc.scrollTop = 0; },
    tpFromOpen: () => { const d = draft(); d.fromOpen = !d.fromOpen; render(); },
    tpFrom: el => { const d = draft(); d.from = el.dataset.k; d.fromOpen = false; if (d.to === d.from) d.to = null; render(); },
    tpTo: el => { const d = draft(); d.to = el.dataset.k; d.q = ''; d.name = d.nameTouched ? d.name : ''; render(); },
    tpMode: el => { const d = draft(); d.mode = el.dataset.k; render(); },
    tpNoFlight: () => { const d = draft(); d.noFlight = !d.noFlight; render(); },
    tpWho: el => { const d = draft(); const id = el.dataset.id; const f = friend(id); if (d.who[id]) delete d.who[id]; else { d.who[id] = true; if (f.off) toast(`WhatsApp invite sent to ${f.n}.`); } render(); },
    tpInvitePhone: () => { const d = draft(); toast(`WhatsApp invite sent to ${d.pq.trim()}.`); d.pq = ''; render(); },
    tpCover: el => { draft().cover = el.dataset.k; render(); },
    tpPriv: el => { draft().privacy = el.dataset.k; render(); },
    tpCreate: () => { const d = draft(); d.nameTouched = true; if (!canNext(d)) { render(); return; }
      const L = d.mode === 'plane' && !d.noFlight && flightOk(d.flight) ? lookup(d) : null;
      const t = {id:'t-' + Date.now(), name:d.name.trim(), privacy:d.privacy, from:d.from, start:d.date, end:null, cover:d.cover,
        people:Object.keys(d.who).filter(id => !friend(id).off), invited:Object.keys(d.who).filter(id => friend(id).off), joined:{},
        stops:[{city:d.to, date:d.date, arrDate:L ? L.arrDate : d.date, mode:d.mode, flight:L ? L.code : '', dep:L ? L.dep : '', stays:[], places:[], photos:[]}]};
      T.list.unshift(t); T.draft = null; T.flash = t.id; S.tpId = t.id; S.tpTab = 'itin';
      S.hist = ['discover', 'trips']; go('trip', {replace:true});
      clearTimeout(T._ft); T._ft = setTimeout(() => { if (T.flash === t.id) { T.flash = null; if (S.screen === 'trip') render(); } }, 3200); },
  });

  window.TP = Object.assign(window.TP || {}, {get T(){ return T; }, TODAY, HOME, CITY, FRIENDS, FROM_OPTIONS, MODES, AIR, friend, ti, TI, art, av, meAv, names, plural, nf, routeMap, miles, tripMiles, route, awayStops, isPast, tripEnd, tripPhotos, ensureStop,
    fDay, fMonth, fRange, addDays, daysUntil, stats, upcoming, past, trips, tripById, empty, head, top, foot, flightOk, normFlight, lookup, goTrips, keepFocus:null});
  /* text inputs: keep focus and caret while re-rendering */
  const _in = document.addEventListener.bind(document);
  TP.inputs = TP.inputs || {};
  _in('input', e => { const k = e.target && e.target.dataset && e.target.dataset.in; if (!k || !k.startsWith('tp')) return;
    const d = draft(); const v = e.target.value;
    if (TP.inputs[k]) TP.inputs[k](v, e.target);
    else if (k === 'tpQ') { d.q = v; if (d.to && v !== CITY[d.to].n) d.to = null; }
    else if (k === 'tpFl') d.flight = v.slice(0, 8);
    else if (k === 'tpDt') d.date = v;
    else if (k === 'tpPq') d.pq = v;
    else if (k === 'tpNm') { d.name = v; d.nameTouched = true; }
    const id = e.target.id, pos = e.target.selectionStart; render(); const n = document.getElementById(id); if (n) { n.focus(); try { if (n.type !== 'date') n.setSelectionRange(pos, pos); } catch(_){} } }, true);

  /* kyc approved from the Trips gate lands on Trips */
  const _kyc = kycApproved;
  kycApproved = function(silent){
    if (S.tpGate && S.gateFrom === 'chat') { const back2 = S.tpGate; S.tpGate = null; scen.kyc = 'approved'; saveScen(); if (!silent) push('Identity Approved', 'Your badge verification has been approved. Enjoy verified benefits on YouApp.');
      const i = S.hist.lastIndexOf('gate'); if (i >= 0) S.hist = S.hist.slice(0, i); if (S.hist[S.hist.length - 1] === back2) S.hist.pop(); go(back2, {replace:true}); return; }
    if (S.gateFrom !== 'locals') return _kyc.apply(this, arguments);
    scen.kyc = 'approved'; saveScen(); if (!silent) push('Identity Approved', 'Your badge verification has been approved. Enjoy verified benefits on YouApp.');
    const i = S.hist.lastIndexOf('gate'); if (i >= 0) S.hist = S.hist.slice(0, i); S.hist = ['discover']; go('trips', {replace:true}); };

  /* guests: Trips opens the login page, like Locals did */
  const _gl = V.guestlock;
  V.guestlock = () => { let h = _gl(); if (S.lockKind === 'scan') return h;
    return h.replace(/(<span class="t-headline">)Locals(<\/span>)/, '$1Trips$2').replace(/<h1>[^<]*<\/h1><p>[^<]*<\/p>/, '<h1>Keep every trip in one place</h1><p>Sign in to add your trips, count your cities and miles, and see who you’re travelling with.</p>'); };

  /* entry points for the control panel */
  appEntryRoutes.trips = (open, c) => open('locals', c);
  appEntryRoutes.inbox = (open, c) => { open('locals', c); if (S.screen === 'trips') go('chats'); };

  /* Inbox: the old chat list, opened from Trips, with a back button and no Liked people */
  const _rTp = render;
  render = function(){ _rTp.apply(this, arguments); const ph = document.getElementById('phone'); if (!ph) return;
    ph.querySelectorAll('.bnav [data-to="locals"]').forEach(b => { b.innerHTML = `${ti('globe','tp-navi')}Trips`; });
    /* Discover: the More options menu is replaced by the same Inbox button as Trips */
    if (S.screen === 'discover') ph.querySelectorAll('.appbar [data-act="menu"]').forEach(b => { b.outerHTML = inboxBtn(); });
    if (S.screen === 'chats') { const scr = ph.querySelector('.screen'); const bar = scr && scr.querySelector('.topbar, .g7top');
      if (bar && !bar.dataset.tpInbox) { bar.dataset.tpInbox = '1'; bar.classList.add('tp-inboxbar');
        bar.innerHTML = `<button class="iconbtn" data-act="tpInboxBack" aria-label="Back">${ic('back')}</button><span class="t-headline">Inbox</span><span class="tp-sp" aria-hidden="true"></span>`; }
      ph.querySelectorAll('[aria-label="Liked people"]').forEach(b => b.remove()); }
    if (S.tpGate && S.screen === S.tpGate) S.tpGate = null;
    ph.classList.toggle('tp-on', ['trips','trip','tripAdd'].includes(S.screen)); };
  A.tpInboxBack = () => { if (['trips','discover'].includes(S.hist[S.hist.length-1])) back(); else goTrips(); };

  /* scenario-panel notes for these screens */
  Object.assign(META, {
    trips:{name:'Trips', group:'Trips', figma:'YouApp Trips tab › Trips (was Locals)', rules:['Bottom tab renamed Locals → Trips. Header: avatar, Trips | Leaderboard, Inbox with unread badge (chats + announcements, 0 when Content is empty).','Stats count past trips only. Cities and countries count once; miles are great-circle distances between consecutive stops, starting from home.','Coming up shows the route map; Past shows photos, who went and miles. See all lists every past trip.','Unverified users see Badge Verification first; Maybe later continues to Trips. Guests get the login page.']},
    tripAdd:{name:'Add a trip', group:'Trips', figma:'YouApp Trips tab › Add a trip (4 steps)', rules:['Four steps: where, how, who, name. Stays, places and more stops are added on the trip page.','From starts at the home city (tap to change). Miles show next to every city.','Plane: flight number + date fills airports and times (mock lookup). No flight number → pick dates instead. Other modes need only the date here.','People on YouApp are added; people not on YouApp get a WhatsApp invite (counts as referral). Skip is allowed.','Public: on your profile. Private: only people on the trip. Create trip opens the trip straight away.']},
    trip:{name:'Trip page', group:'Trips', figma:'YouApp Trips tab › Trip created', rules:['Opens right after Create trip with a short “Trip created” note.','Coming-up trips without an end date ask “When are you coming back?” with Next stop and Way back.','Itinerary lists home and each stop with miles per leg. Photos and Plans show empty states until Phase 3–4.','Edit, Add people, stays, places, photos and plans arrive in Phases 3–5.']},
  });
  if (META.chats) META.chats = Object.assign({}, META.chats, {name:'Inbox · chat list', figma:'YouApp Trips tab › Inbox (was Locals chat list)'});

  const _restartTp = restart; restart = function(){ T = seed(); return _restartTp.apply(this, arguments); };
  try { render(); } catch(e) {}
})();
