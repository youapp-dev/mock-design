/* ===== Trips Phase 3: the trip page in full.
   Itinerary with stays and places per stop, Add a stop (next stop or way back, per transport),
   Add a stay, Add a place, Add people (Added / Invited / Joined), what a friend sees (Join trip / Not me),
   Edit trip (name, from, order, remove, people, privacy, delete), Photos grouped by stop. ===== */
(function(){
  if (!window.TP) return;
  const P = window.TP;
  const {CITY, FRIENDS, friend, ti, art, av, meAv, plural, nf, miles, tripMiles, awayStops, isPast, fDay, fRange, addDays, lookup, flightOk, ensureStop, tripPhotos} = P;
  const T = () => P.T;

  /* extra people for Add people */
  if (!FRIENDS.some(f => f.id === 'ken')) FRIENDS.push({id:'ken', n:'Ken Nakamura', u:'@ken.tokyo', ini:'KN', col:'#14A877', v:true}, {id:'kenneth', n:'Kenneth Lee', u:'@kenlee · Kuala Lumpur', ini:'KL', col:'#3D8BFD'});

  /* sample search data per city */
  const HOTELS = {tokyo:['Hotel Sakura Shinjuku','Airbnb loft, Asakusa','Asakusa View Hotel','Park Hyatt Tokyo','Shibuya Stream Excel'], sapporo:['JR Tower Hotel Nikko','Hotel Gracery Sapporo','Cross Hotel Sapporo'], shizuoka:['Hotel Associa Shizuoka','Fuji View Hotel'], seoul:['L7 Myeongdong','Lotte Hotel Seoul'], busan:['Paradise Hotel Busan'], bali:['Alaya Resort Ubud','The Kayon Jungle'], bangkok:['Chatrium Riverside','Ad Lib Bangkok'], pen:['Eastern & Oriental Hotel','Hard Rock Hotel Penang']};
  const SPOTS = {tokyo:['Tsukiji Outer Market','Senso-ji Temple','Shibuya Sky','Meiji Shrine','teamLab Planets','Omoide Yokocho'], sapporo:['Odori Park Snow Festival','Nijo Market','Sapporo Beer Museum','Mt Moiwa Ropeway'], shizuoka:['Nihondaira, Mt Fuji view','Miho no Matsubara','Kunozan Toshogu'], seoul:['Myeongdong night market','Gwangjang Market','Bukchon Hanok Village'], busan:['Haeundae Beach','Gamcheon Culture Village'], bali:['Kuta Beach','Tegallalang rice terraces','Pura Ulun Danu Bratan'], pen:['Penang Hill','Armenian Street murals','Gurney Drive hawker centre']};
  const areaOf = c => `${CITY[c].n}${CITY[c].c !== CITY[c].n ? ', ' + CITY[c].c : ''}`;

  /* helpers */
  const target = id => (S.tpEditing && T().edit && T().edit.id === id) ? T().edit : P.tripById(id);
  const stopFrom = s => s.arrDate || s.date;
  const stopUntil = (t, i) => (t.stops[i+1] ? t.stops[i+1].date : (t.end || null));
  const stopRange = (t, i) => { const a = stopFrom(t.stops[i]), b = stopUntil(t, i); return b && b !== a ? fRange(a, b) : fDay(a); };
  const legMi = (t, i) => miles(i ? t.stops[i-1].city : t.from, t.stops[i].city);
  const isHome = (t, s) => s.city === t.from || s.city === P.HOME;
  const MODE_WORD = {plane:'by plane', train:'by rail', bus:'by road', car:'by road', boat:'by sea'};
  const SPEED = {train:62, bus:48, car:55, boat:20};
  const dur = (mi, mode) => { const h = mi / (SPEED[mode] || 60); const hh = Math.floor(h), mm = Math.round((h - hh) * 60 / 10) * 10; return hh ? `${hh} h${mm ? ' ' + mm + ' min' : ''}` : `${Math.max(10, mm)} min`; };
  const nights = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
  const scrollTop = () => { const sc = document.querySelector('#phone .scroll'); if (sc) sc.scrollTop = 0; };
  const closeTop = (title, act='tpClose', right='') => `<div class="topbar tp-top"><button class="iconbtn" data-act="${act}" aria-label="Close">${ic('close')}</button><span class="t-headline">${esc(title)}</span>${right || '<span style="width:40px"></span>'}</div>`;
  const chip = txt => `<span class="tp-tripchip">${ti('plane')}${esc(txt)}</span>`;
  const transportLine = s => s.mode === 'plane' ? (s.flight ? `${esc(s.flight)} · ${fDay(s.date)}` : `Flight · ${fDay(s.date)}`) : `${{train:'Train', bus:'Bus', car:'Car', boat:'Boat'}[s.mode] || 'Trip'}${s.line ? ' · ' + esc(s.line) : ''} · ${fDay(s.date)}`;
  const status = (t, id) => t.joined && t.joined[id] ? 'joined' : t.invited.includes(id) ? 'invited' : t.people.includes(id) ? 'added' : null;

  /* ---------- trip page ---------- */
  V.trip = () => { const t = target(S.tpId); if (!t) return V.trips(); t.stops.forEach(ensureStop);
    const away = awayStops(t), m = tripMiles(t), up = !isPast(t), noEnd = up && !t.end; const tab = S.tpTab || 'itin';
    const first = away[0] ? CITY[away[0].city].n : CITY[t.stops[0].city].n; const photosN = tripPhotos(t).length; const plansN = P.planCount ? P.planCount(t) : 0;
    const count = 1 + t.people.length + t.invited.length; const s0 = t.stops[0];
    const flash = T().flash === t.id ? `<span class="tp-flash" role="status">${ti('check')}Trip created</span>` : '';
    const blocks = t.stops.map((s, i) => { const home = isHome(t, s); const mi = legMi(t, i); const cityN = CITY[s.city].n;
      const meta = home ? `${fDay(s.date)} · ${nf(mi)} miles ${MODE_WORD[s.mode] || ''}` : `${stopRange(t, i)} · ${nf(mi)} miles ${i === 0 ? 'from ' + (t.from === 'kl' ? 'KL' : CITY[t.from].n) : MODE_WORD[s.mode] || ''}`;
      if (home) return `<div class="tp-blk last"><div class="tp-bh"><span class="tp-sn home">${i + 1}</span><b>${esc(cityN)}</b><small>${meta}</small></div></div>`;
      const stays = s.stays.map(st => `<div class="tp-line">${ti('bed')}<span>${esc(st.name)}</span><small>${fRange(st.in, st.out)}</small></div>`).join('');
      const places = s.places.map(pl => `<div class="tp-pl"><b>${esc(pl.name)}</b><small>${fDay(pl.when)}${pl.time ? ', ' + esc(pl.time) : ''}</small>
        ${pl.photos.length ? `<span class="tp-thumbs">${pl.photos.slice(0, 3).map(k => art(k, 'tp-th')).join('')}</span>` : ''}
        ${pl.with.length ? `<span class="tp-plwith">${pl.with.map(id => av(id, 'xs')).join('')}with ${pl.with.map(id => esc(friend(id).n.split(' ')[0])).join(', ')}${pl.with.some(id => t.invited.includes(id)) ? ' <em class="tp-invtag">invited</em>' : ''}</span>` : ''}</div>`).join('');
      return `<div class="tp-blk"><div class="tp-bh"><span class="tp-sn">${i + 1}</span><b>${esc(cityN)}</b><small>${meta}</small></div>
        <div class="tp-bb">${stays}<button class="tp-lnk" data-act="tpStayOpen" data-i="${i}">${ti('plus')}${s.stays.length ? 'Add a stay' : 'Add where you’re staying'}</button>
          ${places}<button class="tp-lnk" data-act="tpPlaceOpen" data-i="${i}">${ti('plus')}Add a place in ${esc(cityN)}</button></div></div>`; }).join('');
    const homeRow = `<div class="tp-blk"><div class="tp-bh"><span class="tp-sn home">${ti('pin')}</span><b>${esc(CITY[t.from].n)}</b><small>${fDay(t.start)}${s0.dep ? `, ${esc(s0.dep)}` : ''}${s0.flight ? ` · ${esc(s0.flight)}` : ''}</small></div></div>`;
    const firstEmpty = away.length && away.every(s => !s.stays.length && !s.places.length);
    const itin = `<div class="tp-itin2">${homeRow}${blocks}</div>
      ${firstEmpty ? `<div class="tp-ecard">${art('suitcase','tp-emp-art')}<b>Your ${esc(first)} days start here</b><p>Add where you’re staying and the places you go. Photos and friends too.</p>
        <div class="tp-two-btn"><button class="tp-obtn" data-act="tpStayOpen" data-i="0">${ti('bed')}Add a stay</button><button class="tp-obtn" data-act="tpPlaceOpen" data-i="0">${ti('pin')}Add a place</button></div></div>` : ''}
      <button class="btn btn-primary tp-cta tp-addstop" data-act="tpStopOpen" data-k="next">${ti('plus')}Add a stop</button>`;
    const photoTab = photosN ? `${away.filter(s => s.photos.length).map(s => `<div class="tp-pgh"><b>${esc(CITY[s.city].n)}</b><small>${plural(s.photos.length, 'photo')}</small></div><div class="tp-pgrid">${s.photos.map(k => art(k)).join('')}</div>`).join('')}
        <div class="tp-floatwrap"><button class="tp-gbtn tp-float" data-act="tpAddPhotos">${ti('camera')}Add photos</button></div>`
      : `<div class="tp-ecard big">${art('photosEmpty','tp-emp-art')}<b>No photos yet</b><p>Add photos from this trip. Everyone on the trip can add theirs too.</p><button class="btn btn-primary tp-cta" data-act="tpAddPhotos">${ti('camera')}Add photos</button></div>`;
    const plansTab = P.plansTab ? P.plansTab(t) : '';
    return `<div class="screen tp-screen tp-page">${statusBar()}<div class="scroll">
      <div class="tp-hero">${P.routeMap(t, 390, 190, {hero:true})}<div class="tp-herobar"><button class="tp-hb" data-act="tpBackList" aria-label="Back to Trips">${ti('back')}</button><span style="flex:1"></span><button class="tp-edit" data-act="tpEditOpen">Edit</button><button class="tp-hb" data-act="tpShare" aria-label="Share your travels">${ti('share')}</button></div>${flash}</div>
      <div class="tp-pad tp-body">
        <h1 class="tp-title">${esc(t.name)}</h1>
        <p class="tp-meta">${t.end ? `${fRange(t.start, t.end)} ${new Date(t.start + 'T00:00:00').getFullYear()}` : `From ${fDay(t.start)}`} · ${plural(away.length, 'stop')} · ${nf(m)} miles</p>
        <div class="tp-ppl"><span class="tp-avs">${meAv('sm')}${[...t.people, ...t.invited].slice(0, 4).map(id => av(id, t.invited.includes(id) ? 'sm inv' : 'sm')).join('')}</span><small>${count} on this trip</small><em class="tp-privchip">${ti(t.privacy === 'private' ? 'lock' : 'globe')}${t.privacy === 'private' ? 'Private' : 'Public'}</em><span style="flex:1"></span><button class="tp-addp" data-act="tpPeopleOpen">${ti('addp')}Add</button></div>
        ${noEnd ? `<div class="tp-back"><div class="tp-back-h"><span class="tp-bi">${ti('cal')}</span><span><b>When are you coming back?</b><small>Add your way back or your next stop, so the trip has an end date.</small></span></div>
          <div class="tp-lb"><span><small>Leave</small><b>${fDay(t.start)}</b></span>${ic('chev')}<span><small>Back</small><b class="no">Not added</b></span></div>
          <div class="tp-two-btn"><button class="tp-obtn" data-act="tpStopOpen" data-k="next">${ti('plus')}Next stop</button><button class="tp-gbtn" data-act="tpStopOpen" data-k="back">${ti('plane')}Way back</button></div></div>` : ''}
        <div class="tp-tabs" role="tablist">${[['itin', 'Itinerary'], ['photos', `Photos${photosN ? ' · ' + photosN : ''}`], ['plans', `Plans${plansN ? ' · ' + plansN : ''}`]].map(([k, l]) => `<button role="tab" aria-selected="${tab === k}" data-act="tpPTab" data-k="${k}">${l}</button>`).join('')}</div>
        ${tab === 'itin' ? itin : tab === 'photos' ? photoTab : plansTab}
      </div></div>${bottomNav('locals')}</div>`;
  };

  /* ---------- Add a stop (next stop, way back, or edit a stop) ---------- */
  const ts = () => S.ts;
  V.tpStop = () => { const d = ts(); const t = target(d.tripId); if (!t) return V.trips();
    const prevIdx = d.kind === 'edit' ? d.idx - 1 : t.stops.length - 1; const prev = prevIdx >= 0 ? t.stops[prevIdx] : null;
    const fromC = prev ? prev.city : t.from; const q = d.q.trim().toLowerCase(); const c = d.city && CITY[d.city];
    const opts = q ? Object.keys(CITY).filter(k => k !== fromC && (CITY[k].n.toLowerCase().startsWith(q) || CITY[k].c.toLowerCase().startsWith(q))).slice(0, 5)
      : [t.from, ...['tokyo','osaka','sapporo','seoul','bangkok','sg']].filter((k, i, a) => k !== fromC && a.indexOf(k) === i).slice(0, 5);
    const minDate = prev ? stopFrom(prev) : P.TODAY; const dateErr = d.date && d.date < minDate;
    const mi = c ? miles(fromC, d.city) : 0; const L = c && d.mode === 'plane' && !d.noFlight && flightOk(d.flight) && d.date ? lookup({from:fromC, to:d.city, flight:d.flight, date:d.date}) : null;
    const ok = !!c && !!d.date && !dateErr && (d.mode !== 'plane' || d.noFlight || flightOk(d.flight));
    const MODES = P.MODES; const optF = (label, key, ph, icon) => `<label class="tp-field"><small>${label} <em class="tp-opt">optional</em></small><span>${ti(icon)}<input id="ts-${key}" data-in="tpS_${key}" value="${esc(d[key] || '')}" placeholder="${ph}" autocomplete="off"></span></label>`;
    let fields = '';
    if (c) { const date = `<label class="tp-field ${dateErr ? 'err' : ''}"><small>Date</small><span>${ti('cal')}<input id="ts-date" data-in="tpS_date" type="date" min="${minDate}" value="${d.date}" aria-label="Date"></span></label>`;
      if (d.mode === 'plane') fields = `<div class="tp-two ${d.noFlight ? 'one' : ''}">${d.noFlight ? '' : `<label class="tp-field ${d.flight && !flightOk(d.flight) ? 'err' : ''}"><small>Flight number</small><span>${ti('plane')}<input id="ts-flight" data-in="tpS_flight" value="${esc(d.flight)}" placeholder="JL 503" autocapitalize="characters" autocomplete="off" aria-label="Flight number"></span></label>`}${date}</div>
        ${L ? `<div class="tp-found"><b>${esc(L.code)}</b><small>${esc(L.air)} · ${L.dep} ${CITY[fromC].code} → ${CITY[d.city].code} ${L.arr}</small><em>Found</em></div>` : ''}
        <p class="tp-alt">${d.noFlight ? 'Have a flight number? ' : 'No flight number? '}<button class="tp-link" data-act="tpSNoFlight">${d.noFlight ? 'Add it' : 'Pick dates instead'}</button></p>`;
      else { const extra = d.mode === 'train' ? `<div class="tp-two">${optF('Leaves','time','08:00','cal')}${optF('Train or line','line','Shinkansen','train')}</div>`
          : d.mode === 'bus' ? `<div class="tp-two">${optF('Leaves','time','09:30','cal')}${optF('Bus company','line','Aeroline','bus')}</div>`
          : d.mode === 'boat' ? `<div class="tp-two">${optF('Leaves','time','10:00','cal')}${optF('Ferry or cruise','line','Langkawi Ferry','boat')}</div>`
          : `<p class="tp-lbl">Driving how? <em class="tp-opt">optional</em></p><div class="tp-cars" role="radiogroup" aria-label="Driving how">${['My car','Rental','Grab / taxi'].map(x => `<button role="radio" aria-checked="${d.line === x}" data-act="tpSCar" data-k="${x}">${x}</button>`).join('')}</div>`;
        fields = `${date}${extra}<div class="tp-sum">${ti(d.mode)}<span><b>About ${dur(mi, d.mode)} ${MODE_WORD[d.mode]}</b><small>${esc(CITY[fromC].n)} → ${esc(c.n)}</small></span><em>${nf(mi)} mi</em></div>
          <p class="tp-need">${ti('check')}Need: from, to and date. ${d.mode === 'car' ? 'Car type is optional.' : 'Time and ' + ({train:'train', bus:'bus company', boat:'ferry'}[d.mode]) + ' name are optional.'}</p>`; }
      if (dateErr) fields += `<p class="tp-err">Pick ${fDay(minDate)} or later, after the stop before.</p>`; }
    return `<div class="screen tp-screen tp-flow">${statusBar()}${closeTop(d.kind === 'edit' ? 'Edit stop' : 'Add a stop')}<div class="scroll tp-fpad">
      ${chip(t.name)}<h1 class="tp-h1">${d.kind === 'back' ? 'Your way back' : d.kind === 'edit' ? 'Change this stop' : 'Where to next?'}</h1><p class="tp-sub">Anywhere: another city, home, or a new home.</p>
      ${prev ? `<p class="tp-prev"><span class="tp-sn sm">${prevIdx + 1}</span><b>${esc(CITY[prev.city].n)}</b><small>${stopRange(t, prevIdx)}</small></p>` : ''}
      <p class="tp-fromto">${ti('pin')}From <b>${esc(CITY[fromC].n)}</b> ${ic('chev')} to</p>
      <label class="tp-field tp-to ${c ? 'set' : ''}"><small>To</small><span>${ti('search')}<input id="ts-q" data-in="tpS_q" value="${esc(c && !d.q ? c.n : d.q)}" placeholder="Search a city" autocomplete="off" aria-label="Next stop"></span></label>
      ${c && !d.q ? '' : opts.length ? `<div class="tp-res">${opts.map(k => `<button class="tp-ropt" data-act="tpSCity" data-k="${k}" aria-pressed="${d.city === k}"><span class="tp-flag">${ic(CITY[k].f)}</span><span class="tp-rx"><b>${CITY[k].n}${k === t.from ? ' <em class="tp-home">Home</em>' : ''}</b><small>${CITY[k].c} · ${nf(miles(fromC, k))} miles from ${esc(CITY[fromC].n)}</small></span>${d.city === k ? ti('check', 'ok') : ''}</button>`).join('')}</div>` : `<p class="tp-none">No cities match “${esc(d.q)}”.</p>`}
      ${c ? `<p class="tp-lbl">How?</p><div class="tp-modes" role="radiogroup" aria-label="How you get there">${MODES.map(([k, l]) => `<button role="radio" aria-checked="${d.mode === k}" data-act="tpSMode" data-k="${k}">${ti(k)}${l}</button>`).join('')}</div>${fields}` : ''}
    </div><div class="tp-foot">${btn(c ? (d.kind === 'edit' ? 'Save stop' : `Add ${esc(c.n)}`) : 'Add stop', ok ? 'tpSAdd' : 'noop', {disabled:!ok})}</div></div>`;
  };

  /* ---------- Add a stay ---------- */
  V.tpStay = () => { const d = S.tst; const t = target(d.tripId); const s = t && t.stops[d.si]; if (!s) return V.trips();
    const q = d.q.trim().toLowerCase(); const list = (HOTELS[s.city] || []).filter(h => !s.stays.some(x => x.name === h) && (!q || h.toLowerCase().includes(q)));
    const custom = q && !list.some(h => h.toLowerCase() === q) ? d.q.trim() : null; const n = d.in && d.out ? nights(d.in, d.out) : 0; const bad = d.in && d.out && n <= 0;
    const ok = !!d.pick && !!d.in && !!d.out && !bad;
    return `<div class="screen tp-screen tp-flow">${statusBar()}${closeTop('Add a stay')}<div class="scroll tp-fpad">
      <span class="tp-tripchip">${ti('pin')}${esc(t.name)} · ${esc(CITY[s.city].n)} · ${stopRange(t, d.si)}</span>
      <label class="tp-search tp-mt">${ti('search')}<input id="tst-q" data-in="tpT_q" value="${esc(d.q)}" placeholder="Hotel, Airbnb or address" autocomplete="off" aria-label="Search where you stay"></label>
      <div class="tp-res">${list.slice(0, 4).map(h => `<button class="tp-ropt" data-act="tpTPick" data-k="${esc(h)}" aria-pressed="${d.pick === h}"><span class="tp-tile">${ti('bed')}</span><span class="tp-rx"><b>${esc(h)}</b><small>${esc(areaOf(s.city))}</small></span>${d.pick === h ? ti('check', 'ok') : ''}</button>`).join('')}
        ${custom ? `<button class="tp-ropt" data-act="tpTPick" data-k="${esc(custom)}" aria-pressed="${d.pick === custom}"><span class="tp-tile">${ti('plus')}</span><span class="tp-rx"><b>Add “${esc(custom)}”</b><small>Use this name</small></span>${d.pick === custom ? ti('check', 'ok') : ''}</button>` : ''}
        ${!list.length && !custom ? `<p class="tp-none pad">Type the name of your hotel or Airbnb.</p>` : ''}</div>
      <div class="tp-two tp-mt"><label class="tp-field"><small>Check in</small><span>${ti('cal')}<input id="tst-in" data-in="tpT_in" type="date" value="${d.in}" aria-label="Check in"></span></label>
        <label class="tp-field ${bad ? 'err' : ''}"><small>Check out</small><span>${ti('cal')}<input id="tst-out" data-in="tpT_out" type="date" value="${d.out}" aria-label="Check out"></span></label></div>
      ${bad ? '<p class="tp-err">Check out must be after check in.</p>' : n ? `<p class="tp-nights">${plural(n, 'night')}</p>` : ''}
      ${s.stays.length ? `<p class="tp-kick">Already in ${esc(CITY[s.city].n)}</p><div class="tp-res">${s.stays.map(st => `<div class="tp-ropt"><span class="tp-tile">${ti('bed')}</span><span class="tp-rx"><b>${esc(st.name)}</b><small>${fDay(st.in)} – ${fDay(st.out)} · ${plural(nights(st.in, st.out), 'night')}</small></span></div>`).join('')}</div>` : ''}
      <p class="tp-note">${ti('lock')}Only people on the trip see where you stay. Never shown publicly.</p>
    </div><div class="tp-foot">${btn('Add stay', ok ? 'tpTAdd' : 'noop', {disabled:!ok})}</div></div>`;
  };

  /* ---------- Add a place ---------- */
  V.tpPlace = () => { const d = S.tpl; const t = target(d.tripId); const s = t && t.stops[d.si]; if (!s) return V.trips();
    const q = d.q.trim().toLowerCase(); const list = (SPOTS[s.city] || []).filter(h => !s.places.some(x => x.name === h) && (!q || h.toLowerCase().includes(q)));
    const custom = q && !list.some(h => h.toLowerCase() === q) ? d.q.trim() : null; const ok = !!d.pick && !!d.when;
    const people = [...t.people, ...t.invited]; const free = people.filter(id => !d.with.includes(id));
    return `<div class="screen tp-screen tp-flow">${statusBar()}${closeTop('Add a place')}<div class="scroll tp-fpad">
      <span class="tp-tripchip">${ti('pin')}${esc(t.name)} · ${esc(CITY[s.city].n)}</span>
      <label class="tp-search tp-mt">${ti('search')}<input id="tpl-q" data-in="tpL_q" value="${esc(d.q)}" placeholder="Search a place" autocomplete="off" aria-label="Search a place"></label>
      <div class="tp-res">${list.slice(0, 4).map(h => `<button class="tp-ropt" data-act="tpLPick" data-k="${esc(h)}" aria-pressed="${d.pick === h}"><span class="tp-tile pk">${ti('pin')}</span><span class="tp-rx"><b>${esc(h)}</b><small>${esc(areaOf(s.city))}</small></span>${d.pick === h ? ti('check', 'ok') : ''}</button>`).join('')}
        ${custom ? `<button class="tp-ropt" data-act="tpLPick" data-k="${esc(custom)}" aria-pressed="${d.pick === custom}"><span class="tp-tile pk">${ti('plus')}</span><span class="tp-rx"><b>Add “${esc(custom)}”</b><small>${esc(CITY[s.city].n)}</small></span>${d.pick === custom ? ti('check', 'ok') : ''}</button>` : ''}
        ${!list.length && !custom ? '<p class="tp-none pad">Type the place you went.</p>' : ''}</div>
      <p class="tp-lbl">When</p><div class="tp-two"><label class="tp-field"><small>Day</small><span>${ti('cal')}<input id="tpl-when" data-in="tpL_when" type="date" value="${d.when}" aria-label="Day"></span></label>
        <label class="tp-field"><small>Time <em class="tp-opt">optional</em></small><span><input id="tpl-time" data-in="tpL_time" type="time" value="${d.time24 || ''}" aria-label="Time"></span></label></div>
      <p class="tp-lbl">Photos <em class="tp-opt">${d.photos.length ? plural(d.photos.length, 'photo') + ' added' : 'optional'}</em></p>
      <div class="tp-phadd">${d.photos.map((k, i) => `<span class="tp-phx">${art(k)}<button data-act="tpLPhotoX" data-i="${i}" aria-label="Remove photo ${i + 1}">${ic('close')}</button></span>`).join('')}<button class="tp-phplus" data-act="tpLPhoto" aria-label="Add a photo">${ti('camera')}<small>Add</small></button></div>
      <p class="tp-lbl">Who was there? <em class="tp-opt">from this trip</em></p>
      <div class="tp-who">${d.with.map(id => `<button class="tp-wchip on" data-act="tpLWith" data-id="${id}" aria-label="Remove ${esc(friend(id).n)}">${av(id, 'xs')}${esc(friend(id).n)}${ic('close')}</button>`).join('')}
        ${free.length ? (d.whoOpen ? free.map(id => `<button class="tp-wchip" data-act="tpLWith" data-id="${id}">${av(id, 'xs')}${esc(friend(id).n)}</button>`).join('') : `<button class="tp-wchip add" data-act="tpLWhoOpen">${ti('addp')}Add someone</button>`) : (people.length ? '' : '<small class="tp-muted">Add people to the trip first.</small>')}</div>
    </div><div class="tp-foot">${btn('Save place', ok ? 'tpLAdd' : 'noop', {disabled:!ok})}</div></div>`;
  };

  /* ---------- Add people to this trip ---------- */
  V.tpPeople = () => { const d = S.tpp; const t = target(d.tripId); if (!t) return V.trips(); const q = d.q.trim().toLowerCase();
    const match = f => !q || f.n.toLowerCase().includes(q) || (f.u || '').toLowerCase().includes(q);
    const on = FRIENDS.filter(f => !f.off && match(f)), off = FRIENDS.filter(f => f.off && match(f));
    const pill = f => { const st = status(t, f.id);
      if (st === 'joined') return '<span class="tp-pill ok" aria-label="Joined">Joined</span>';
      if (st === 'added') return `<button class="tp-pill ok" data-act="tpPAdd" data-id="${f.id}" aria-pressed="true" aria-label="Added ${esc(f.n)}, tap to undo">Added</button>`;
      if (st === 'invited') return `<button class="tp-pill inv" data-act="tpPAdd" data-id="${f.id}" aria-pressed="true" aria-label="Invited ${esc(f.n)}, tap to undo">Invited</button>`;
      return `<button class="tp-pill ${f.off ? 'wa' : 'add'}" data-act="tpPAdd" data-id="${f.id}">${f.off ? 'Invite' : 'Add'}</button>`; };
    const row = f => `<div class="tp-prow">${av(f.id)}<span class="tp-rx"><b>${esc(f.n)}${f.v ? ` ${vbadge()}` : ''}</b><small>${f.off ? '+60 12-345 6789 · not on YouApp' : esc(f.u)}</small></span>${pill(f)}</div>`;
    const inv = t.invited.map(friend).filter(Boolean).slice(-1)[0]; const places = P.awayStops(t).map(s => CITY[s.city].n);
    const placeTxt = places.length > 1 ? places.slice(0, -1).join(', ') + ' and ' + places.slice(-1) : places[0] || '';
    return `<div class="screen tp-screen tp-flow">${statusBar()}<div class="topbar tp-top"><button class="iconbtn" data-act="tpPBack" aria-label="Back">${ti('back')}</button><span class="t-headline">Add people to this trip</span><span style="width:40px"></span></div><div class="scroll tp-fpad">
      <label class="tp-search">${ti('search')}<input id="tpp-q" data-in="tpP_q" value="${esc(d.q)}" placeholder="Name, @username or phone" autocomplete="off" aria-label="Search people"></label>
      ${on.length ? `<p class="tp-kick">On YouApp</p><div class="tp-plist">${on.map(row).join('')}</div>` : ''}
      ${off.length ? `<p class="tp-kick">From your contacts</p><div class="tp-plist">${off.map(row).join('')}</div>` : ''}
      ${!on.length && !off.length ? `<p class="tp-none">No one matches “${esc(d.q)}”.</p>` : ''}
      ${inv ? `<div class="tp-invite"><b>${ti('wa')}Invite ${esc(inv.n.split(' ')[0])} to join this trip</b><p>“Join our ${esc(t.name)} trip on YouApp: ${esc(placeTxt)}${t.end ? ', ' + fRange(t.start, t.end) : ''}.”</p><small>${esc(inv.n.split(' ')[0])} joins the trip once they sign up. It counts as your referral.</small></div>` : ''}
      <p class="tp-hint">Adding someone means they join the trip, not just a tag. They tap Join trip first.</p>
    </div></div>`;
  };

  /* ---------- What a friend sees: Join trip / Not me ---------- */
  const INVITE = () => ({id:'t-penang', name:'Penang weekend', owner:'hafiz', privacy:'private', from:'kl', start:'2027-02-06', end:'2027-02-08', cover:'cover1', people:['hafiz','meiling'], invited:[], joined:{hafiz:true, meiling:true},
    stops:[{city:'pen', date:'2027-02-06', mode:'car', line:'My car', stays:[{name:'Hard Rock Hotel Penang', area:'Batu Ferringhi, Penang', in:'2027-02-06', out:'2027-02-08'}], places:[], photos:[]}, {city:'kl', date:'2027-02-08', mode:'car', stays:[], places:[], photos:[]}]});
  P.inviteCard = () => T().invite === 'pending' && !P.empty() ? `<button class="tp-invcard" data-act="tpJoinOpen">${av('hafiz')}<span class="tp-rx"><b>Hafiz added you to a trip</b><small>Penang weekend · ${fRange('2027-02-06', '2027-02-08')}</small></span><em>Review</em></button>` : '';
  V.tpJoin = () => { const t = INVITE(); const o = friend(t.owner);
    return `<div class="screen tp-screen tp-flow">${statusBar()}${closeTop('', 'tpJoinX')}<div class="scroll tp-fpad tp-joinpad">
      <div class="tp-joinmap">${P.routeMap(t, 326, 170, {padB:58})}<span class="tp-joinav">${av(t.owner, 'lg')}</span></div>
      <h1 class="tp-h1 c">${esc(o.n)} added you to ${esc(t.name)}</h1>
      <p class="tp-sub c">${esc(P.awayStops(t).map(s => CITY[s.city].n).join(' → '))} · ${fRange(t.start, t.end)}</p>
      <p class="tp-going">${t.people.map(id => av(id, 'xs')).join('')}${esc(P.names(t.people))} are going</p>
      <div class="tp-checks">${['The trip shows in your Trips', 'Add your own places and photos', `${nf(tripMiles(t))} miles count for you too`].map(x => `<p>${ti('check')}${esc(x)}</p>`).join('')}</div>
    </div><div class="tp-foot tp-two-btn"><button class="tp-obtn big" data-act="tpJoinNo">Not me</button><button class="tp-gbtn big" data-act="tpJoinYes">Join trip</button></div></div>`;
  };

  /* ---------- Edit trip ---------- */
  V.tpEdit = () => { const t = T().edit; if (!t) return V.trips(); t.stops.forEach(ensureStop);
    const rows = t.stops.map((s, i) => { const home = isHome(t, s);
      return `<div class="tp-ecardrow"><div class="tp-erh"><span class="tp-sn ${home ? 'home' : ''}">${i + 1}</span><b>${esc(CITY[s.city].n)}</b><small>${home ? fDay(s.date) : stopRange(t, i)}</small><span style="flex:1"></span>
          <button class="tp-ico-b" data-act="tpEMove" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move ${esc(CITY[s.city].n)} up">${ic('chevdown')}</button><button class="tp-ico-b dn" data-act="tpEMove" data-i="${i}" data-d="1" ${i === t.stops.length - 1 ? 'disabled' : ''} aria-label="Move ${esc(CITY[s.city].n)} down">${ic('chevdown')}</button>
          <button class="tp-ico-b x" data-act="tpERemove" data-i="${i}" ${t.stops.length < 2 ? 'disabled' : ''} aria-label="Remove ${esc(CITY[s.city].n)}">${ic('close')}</button></div>
        <div class="tp-erow">${ti(s.mode)}<span>${transportLine(s)}</span><button class="tp-link" data-act="tpEStop" data-i="${i}">Edit</button></div>
        <div class="tp-erow">${ti('bed')}<span>${home ? 'Home' : s.stays.length ? `${plural(s.stays.length, 'stay')}: ${esc(s.stays.map(x => x.name).join(', '))}` : 'Add where you’re staying'}</span>${home ? '' : `<button class="tp-link" data-act="tpEStay" data-i="${i}">${s.stays.length ? 'Edit' : 'Add'}</button>`}</div></div>`; }).join('');
    const who = ['You', ...t.people.map(id => friend(id).n.split(' ')[0]), ...t.invited.map(id => friend(id).n.split(' ')[0] + ' (invited)')].join(', ');
    const nameBad = !t.name.trim();
    return `<div class="screen tp-screen tp-flow">${statusBar()}${closeTop('Edit trip', 'tpEditX', `<button class="tp-skip" data-act="tpEditSave" ${nameBad ? 'aria-disabled="true"' : ''}>Save</button>`)}<div class="scroll tp-fpad">
      <label class="tp-field ${nameBad ? 'err' : ''}"><small>Trip name</small><span><input id="tpe-name" data-in="tpE_name" value="${esc(t.name)}" maxlength="40" aria-label="Trip name"></span></label>${nameBad ? '<p class="tp-err">Give your trip a name.</p>' : ''}
      <div class="tp-field tp-mt tp-rowf"><span>${ti('pin')}<span class="tp-rx"><small>From</small><b>${esc(CITY[t.from].n)}</b></span><button class="tp-link" data-act="tpEFrom">Change</button></span></div>
      <div class="tp-erows">${rows}</div>
      <button class="tp-lnk tp-mt" data-act="tpEAddStop">${ti('plus')}Add a stop</button>
      <div class="tp-field tp-mt tp-rowf"><span>${ti('addp')}<span class="tp-rx"><small>On this trip</small><b>${esc(who)}</b></span><button class="tp-link" data-act="tpEPeople">Edit</button></span></div>
      <div class="tp-field tp-mt tp-rowf"><span>${ti(t.privacy === 'private' ? 'lock' : 'globe')}<span class="tp-rx"><small>Who can see it</small><b>${t.privacy === 'private' ? 'Private · only people on the trip' : 'Public · on your profile'}</b></span><button class="tp-link" data-act="tpEPriv">Change</button></span></div>
      <p class="tp-hint">The way back is just the last stop. Use the arrows to change the order.</p>
      <button class="tp-del" data-act="tpEDelete">Delete trip</button>
    </div></div>`;
  };

  /* ---------- small dialog (delete / discard) ---------- */
  P.dialogHTML = () => { const g = T().dialog; if (!g) return '';
    return `<div class="tp-dlg-scrim" data-act="tpDlgNo"></div><div class="tp-dlg" role="dialog" aria-modal="true" aria-labelledby="tpDlgT"><b id="tpDlgT">${esc(g.title)}</b><p>${esc(g.body)}</p><div class="tp-two-btn"><button class="tp-obtn" data-act="tpDlgNo">${esc(g.no || 'Cancel')}</button><button class="tp-gbtn ${g.danger ? 'danger' : ''}" data-act="tpDlgYes">${esc(g.ok)}</button></div></div>`; };

  /* ---------- actions ---------- */
  const reEnd = t => { const last = t.stops[t.stops.length - 1]; t.end = last && isHome(t, last) ? last.date : null; if (t.stops[0]) t.start = t.stops[0].date; };
  Object.assign(A, {
    tpClose: () => back(),
    tpShare: () => { if (P.openShare) P.openShare(); else toast('Sharing arrives in Phase 5.'); },
    tpStopOpen: el => { const t = target(S.tpId); const last = t.stops[t.stops.length - 1]; const kind = el.dataset.k;
      S.ts = {tripId:t.id, kind, idx:-1, q:'', city:kind === 'back' ? t.from : null, mode:last && last.mode === 'plane' ? 'plane' : 'train', flight:'', noFlight:false, date:addDays(stopFrom(last || {date:t.start}), 3), time:'', line:''};
      go('tpStop'); scrollTop(); },
    tpSCity: el => { const d = ts(); d.city = el.dataset.k; d.q = ''; render(); },
    tpSMode: el => { const d = ts(); d.mode = el.dataset.k; d.line = ''; render(); },
    tpSNoFlight: () => { const d = ts(); d.noFlight = !d.noFlight; render(); },
    tpSCar: el => { const d = ts(); d.line = d.line === el.dataset.k ? '' : el.dataset.k; render(); },
    tpSAdd: () => { const d = ts(); const t = target(d.tripId); const c = d.city;
      const prevIdx = d.kind === 'edit' ? d.idx - 1 : t.stops.length - 1; const fromC = prevIdx >= 0 ? t.stops[prevIdx].city : t.from;
      const L = d.mode === 'plane' && !d.noFlight && flightOk(d.flight) ? lookup({from:fromC, to:c, flight:d.flight, date:d.date}) : null;
      const data = {city:c, date:d.date, arrDate:L ? L.arrDate : d.date, mode:d.mode, flight:L ? L.code : '', dep:L ? L.dep : (d.time || ''), line:d.line || ''};
      if (d.kind === 'edit') Object.assign(t.stops[d.idx], data); else t.stops.push(ensureStop(Object.assign(data, {stays:[], places:[], photos:[]})));
      reEnd(t); back(); toast(d.kind === 'edit' ? `${CITY[c].n} updated.` : c === t.from ? `Way back added. The trip ends ${fDay(d.date)}.` : `${CITY[c].n} added.`); },
    tpStayOpen: el => { const t = target(S.tpId); const i = +el.dataset.i; const si = isHome(t, t.stops[i]) ? 0 : i; const s = t.stops[si];
      S.tst = {tripId:t.id, si, q:'', pick:null, in:stopFrom(s), out:stopUntil(t, si) || addDays(stopFrom(s), 2)}; go('tpStay'); scrollTop(); },
    tpTPick: el => { S.tst.pick = el.dataset.k; render(); },
    tpTAdd: () => { const d = S.tst; const t = target(d.tripId); const s = t.stops[d.si]; s.stays.push({name:d.pick, area:areaOf(s.city), in:d.in, out:d.out}); s.stays.sort((a, b) => a.in.localeCompare(b.in)); back(); toast(`${d.pick} added to ${CITY[s.city].n}.`); },
    tpPlaceOpen: el => { const t = target(S.tpId); const i = +el.dataset.i; const s = t.stops[i]; S.tpl = {tripId:t.id, si:i, q:'', pick:null, when:stopFrom(s), time24:'', photos:[], with:[], whoOpen:false}; go('tpPlace'); scrollTop(); },
    tpLPick: el => { S.tpl.pick = el.dataset.k; render(); },
    tpLPhoto: () => { const pool = ['pSeoul2','pSeoul1','pBali3','cover1','cover2','pBali2','pSeoul3','pBali1']; const d = S.tpl; d.photos.push(pool[d.photos.length % pool.length]); render(); },
    tpLPhotoX: el => { S.tpl.photos.splice(+el.dataset.i, 1); render(); },
    tpLWhoOpen: () => { S.tpl.whoOpen = true; render(); },
    tpLWith: el => { const d = S.tpl; const id = el.dataset.id; const i = d.with.indexOf(id); if (i >= 0) d.with.splice(i, 1); else d.with.push(id); render(); },
    tpLAdd: () => { const d = S.tpl; const t = target(d.tripId); const s = t.stops[d.si];
      const time = d.time24 ? (([h, m]) => `${(+h % 12) || 12}${m !== '00' ? ':' + m : ''} ${+h < 12 ? 'AM' : 'PM'}`)(d.time24.split(':')) : '';
      s.places.push({name:d.pick, area:areaOf(s.city), when:d.when, time, photos:[...d.photos], with:[...d.with]}); s.places.sort((a, b) => a.when.localeCompare(b.when)); s.photos.push(...d.photos);
      back(); toast(`${d.pick} saved.`); },
    tpPeopleOpen: () => { S.tpp = {tripId:S.tpId, q:''}; go('tpPeople'); scrollTop(); },
    tpPBack: () => back(),
    tpPAdd: el => { const t = target(S.tpp.tripId); const id = el.dataset.id; const f = friend(id);
      if (f.off) { const i = t.invited.indexOf(id); if (i >= 0) t.invited.splice(i, 1); else { t.invited.push(id); toast(`WhatsApp invite sent to ${f.n}.`); } }
      else { const i = t.people.indexOf(id); if (i >= 0) t.people.splice(i, 1); else { t.people.push(id); toast(`${f.n} gets a request to join.`); } }
      render(); },
    tpAddPhotos: () => { const t = target(S.tpId); const s = P.awayStops(t)[0]; if (!s) return; const pool = ['pSeoul2','pSeoul1','pBali3','cover1','cover2','pBali2']; s.photos.unshift(pool[s.photos.length % pool.length]); render(); toast(`Photo added to ${CITY[s.city].n}.`); },
    tpJoinOpen: () => { go('tpJoin'); scrollTop(); },
    tpJoinX: () => back(),
    tpJoinNo: () => { T().invite = 'declined'; back(); toast('Got it. Hafiz will see you’re not on this trip.'); },
    tpJoinYes: () => { const t = INVITE(); t.people = ['hafiz','meiling']; T().list.push(t); T().invite = 'joined'; S.tpId = t.id; S.tpTab = 'itin'; S.hist = ['discover', 'trips']; go('trip', {replace:true}); scrollTop(); toast('You joined Penang weekend.'); },
    tpEditOpen: () => { const t = P.tripById(S.tpId); T().edit = JSON.parse(JSON.stringify(t)); S.tpEditing = true; go('tpEdit'); scrollTop(); },
    tpEditX: () => { const e = T().edit, o = P.tripById(e.id); if (JSON.stringify(e) !== JSON.stringify(o)) { T().dialog = {title:'Discard changes?', body:'Your edits to this trip won’t be saved.', ok:'Discard', danger:true, yes:'discard'}; render(); return; } T().edit = null; S.tpEditing = false; back(); },
    tpEditSave: () => { const e = T().edit; if (!e.name.trim()) return; e.name = e.name.trim(); reEnd(e); const i = T().list.findIndex(x => x.id === e.id); T().list[i] = e; T().edit = null; S.tpEditing = false; back(); toast('Trip saved.'); },
    tpEMove: el => { const t = T().edit; const i = +el.dataset.i, j = i + (+el.dataset.d); if (j < 0 || j >= t.stops.length) return; [t.stops[i], t.stops[j]] = [t.stops[j], t.stops[i]]; render(); },
    tpERemove: el => { const t = T().edit; if (t.stops.length < 2) return; const s = t.stops.splice(+el.dataset.i, 1)[0]; render(); toast(`${CITY[s.city].n} removed. Save to keep it.`); },
    tpEFrom: () => { const t = T().edit; const o = P.FROM_OPTIONS; t.from = o[(o.indexOf(t.from) + 1) % o.length]; render(); },
    tpEPriv: () => { const t = T().edit; t.privacy = t.privacy === 'private' ? 'public' : 'private'; render(); },
    tpEStop: el => { const t = T().edit; const i = +el.dataset.i; const s = t.stops[i]; S.ts = {tripId:t.id, kind:'edit', idx:i, q:'', city:s.city, mode:s.mode, flight:s.flight || '', noFlight:!s.flight && s.mode === 'plane', date:s.date, time:s.dep || '', line:s.line || ''}; go('tpStop'); scrollTop(); },
    tpEStay: el => { S.tpId = T().edit.id; A.tpStayOpen(el); },
    tpEAddStop: () => { S.tpId = T().edit.id; A.tpStopOpen({dataset:{k:'next'}}); },
    tpEPeople: () => { S.tpp = {tripId:T().edit.id, q:''}; go('tpPeople'); scrollTop(); },
    tpEDelete: () => { T().dialog = {title:'Delete this trip?', body:'Its stops, places and photos are removed for everyone on the trip. This can’t be undone.', ok:'Delete', danger:true, yes:'delete'}; render(); },
    tpDlgNo: () => { T().dialog = null; render(); },
    tpDlgYes: () => { const g = T().dialog; T().dialog = null;
      if (g.yes === 'discard') { T().edit = null; S.tpEditing = false; back(); return; }
      if (g.yes === 'delete') { const id = T().edit.id; T().list = T().list.filter(x => x.id !== id); T().edit = null; S.tpEditing = false; P.goTrips(); toast('Trip deleted.'); return; }
      if (g.run) g.run(); render(); },
  });

  /* inputs */
  const I = P.inputs || (P.inputs = {});
  ['q','date','flight','time','line'].forEach(k => { I['tpS_' + k] = v => { const d = ts(); if (k === 'q') { d.q = v; if (d.city && v !== CITY[d.city].n) d.city = null; } else d[k] = k === 'flight' ? v.slice(0, 8) : v; }; });
  I.tpT_q = v => { S.tst.q = v; }; I.tpT_in = v => { S.tst.in = v; }; I.tpT_out = v => { S.tst.out = v; };
  I.tpL_q = v => { S.tpl.q = v; }; I.tpL_when = v => { S.tpl.when = v; }; I.tpL_time = v => { S.tpl.time24 = v; };
  I.tpP_q = v => { S.tpp.q = v; }; I.tpE_name = v => { T().edit.name = v; };

  /* overlays (dialog, share sheet) drawn inside the current screen */
  const _rOv = render;
  render = function(){ _rOv.apply(this, arguments); const ph = document.getElementById('phone'); const scr = ph && ph.querySelector('.screen'); if (!scr) return;
    const h = (P.dialogHTML() || '') + (P.sheetHTML ? P.sheetHTML() : ''); if (!h) return;
    const w = document.createElement('div'); w.className = 'tp-ovl'; w.innerHTML = h; scr.appendChild(w); const f = w.querySelector('[role="dialog"] button:last-child'); if (f) f.focus({preventScroll:true}); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && (P.T.dialog || P.T.sheet)) { P.T.dialog = null; P.T.sheet = null; render(); } });

  /* scenario-panel notes */
  Object.assign(META, {
    tpStop:{name:'Add a stop', group:'Trips', figma:'YouApp Trips tab › Add a stop', rules:['From the trip page: Next stop, Way back (home preselected) or Add a stop. From is the last stop.','Plane: flight number + date (or pick dates). Train, bus, boat: date needed, time and line/company optional. Car: date needed, My car / Rental / Grab optional.','The date can’t be before the previous stop. The way back is just another stop and sets the trip’s end date. Miles recalculate.']},
    tpStay:{name:'Add a stay', group:'Trips', figma:'YouApp Trips tab › Add a stay', rules:['Added any time under each stop. A stop can have several stays, each with its own dates.','Check out must be after check in. Only people on the trip see stays; never shown publicly.']},
    tpPlace:{name:'Add a place', group:'Trips', figma:'YouApp Trips tab › Add a place', rules:['Search or name the place, set the day (time optional), add photos, and pick who was there from the people on the trip.']},
    tpPeople:{name:'Add people to this trip', group:'Trips', figma:'YouApp Trips tab › Add people', rules:['Adding someone on YouApp sends a request: they tap Join trip first (Added → Joined).','People not on YouApp get a WhatsApp invite (Invited) and join when they sign up; it counts as your referral.']},
    tpJoin:{name:'What a friend sees', group:'Trips', figma:'YouApp Trips tab › What a friend sees', rules:['Join trip adds the trip to your Trips and counts its miles for you. Not me declines and tells the person who added you.']},
    tpEdit:{name:'Edit trip', group:'Trips', figma:'YouApp Trips tab › Edit trip', rules:['Change the name, From, each stop’s transport and stays, the order (arrows), remove stops, people and privacy.','Save keeps the changes; closing with changes asks to discard. Delete trip asks to confirm.']},
  });
})();
