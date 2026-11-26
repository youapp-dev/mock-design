/* Merchant web app: renders the shared merchant page from merchant-data.js.
   Behaviour is specified in "Merchant web app: changes and behaviour" (Nov 26, 2026). */
(() => {
  const root = document.getElementById('mw');
  const DATA = window.YouAppMerchantWeb;
  if (!root || !DATA) return;
  const id = root.dataset.merchant;
  const p = DATA.places[id];
  if (!p) return;

  /* ---------- helpers ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const fmt = n => Number(n).toLocaleString('en-US');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z"/></svg>';
  const IC = {
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    nav: svg('<path d="M3 11l18-8-8 18-2-8z"/>'),
    wallet: svg('<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>'),
    link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    pin: svg('<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    prev: svg('<path d="M15 6l-6 6 6 6"/>'),
    next: svg('<path d="M9 6l6 6-6 6"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    down: svg('<path d="M6 9l6 6 6-6"/>'),
  };
  /* cashback banner art: same as the app's merchant page (merchants.js CBB_BG and GIFT) */
  const CBB_BG = "<svg class=\"mw-cb-bg\" viewBox=\"0 0 343 88\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><path d=\"M122 6c46-14 128-10 168 10 34 17 26 58-18 68-52 12-128 10-162-6C74 64 78 20 122 6z\" fill=\"#E6DCFD\"/><path d=\"M0 52c22-8 48 2 60 20 6 9 4 16 0 16H0z\" fill=\"#DCCDFA\"/><path d=\"M14 88c4-14 22-20 40-14 12 4 22 10 26 14z\" fill=\"#CFBDF7\"/><path d=\"M262 88c8-18 30-26 50-18 14-14 30-12 31-10v28z\" fill=\"#DCCDFA\"/><path d=\"M300 10c14-10 34-8 40 4 2 10-12 18-26 16-14-2-22-12-14-20z\" fill=\"#E6DCFD\"/><circle cx=\"326\" cy=\"48\" r=\"5\" fill=\"#C9B5F7\"/></svg>";
  const GIFT = "<svg viewBox=\"0 0 96 84\"><g stroke=\"#F5B82E\" stroke-width=\"4.5\" stroke-linecap=\"round\"><path d=\"M14 18l6 8M5 33l9 2M9 49l8-4M82 7l-4 9M91 20l-8 5M93 35l-9 1\"/></g><g transform=\"rotate(-12 48 52)\"><ellipse cx=\"48\" cy=\"80\" rx=\"24\" ry=\"3.5\" fill=\"#38168E\" opacity=\".18\"/><rect x=\"23\" y=\"40\" width=\"50\" height=\"36\" rx=\"6\" fill=\"#7F57E5\"/><rect x=\"23\" y=\"40\" width=\"13\" height=\"36\" rx=\"6\" fill=\"#5E35B8\" opacity=\".55\"/><rect x=\"23\" y=\"40\" width=\"50\" height=\"6\" fill=\"#38168E\" opacity=\".22\"/><rect x=\"18\" y=\"29\" width=\"60\" height=\"14\" rx=\"5\" fill=\"#9B7BF0\"/><rect x=\"18\" y=\"29\" width=\"60\" height=\"5\" rx=\"2.5\" fill=\"#fff\" opacity=\".22\"/><rect x=\"43\" y=\"29\" width=\"10\" height=\"47\" fill=\"#F5B82E\"/><rect x=\"43\" y=\"29\" width=\"4\" height=\"47\" fill=\"#FFD66B\"/><path d=\"M48 29c-6-12-20-15-21-7-1 7 12 8 21 7zM48 29c6-12 20-15 21-7 1 7-12 8-21 7z\" fill=\"#F5B82E\" stroke=\"#DE9E14\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><circle cx=\"48\" cy=\"28.5\" r=\"3.4\" fill=\"#DE9E14\"/></g></svg>";
  const plural = (n, one, many = one + 's') => `${fmt(n)} ${n === 1 ? one : many}`;

  /* app links: the same merchant page in the prototype, version from ?version= */
  const version = new URLSearchParams(location.search).get('version');
  const base = new URL(['3.2.0', '3.3.0'].includes(version) ? `../../${version}/` : '../../', location.href);
  const appUrl = jump => { const u = new URL(base.href); u.search = `?app=app30&jump=${encodeURIComponent(jump)}`; return u.href; };
  const placeUrl = appUrl(`merchantPlace:${id === 'px-thread-no-photo' ? 'px-thread' : id}`);
  const appLink = (label, cls, icon = '') => `<a class="btn ${cls}" href="${esc(placeUrl)}" target="_blank" rel="noopener">${icon}${label}</a>`;
  const canonical = ($('link[rel="canonical"]') || {}).href || location.href.split('?')[0];

  const hours = p.open ? (p.close ? `Open · Closes at ${p.close}` : 'Open now') : (p.opens ? `Closed · Opens at ${p.opens}` : 'Closed');
  const hoursHTML = p.open ? `<span class="on">Open</span>${p.close ? ` · Closes at ${esc(p.close)}` : ' now'}` : `<span class="off">Closed</span>${p.opens ? ` · Opens at ${esc(p.opens)}` : ''}`;
  const hasPhotos = p.photos && p.photos.length > 0;
  const SECTIONS = [['details', 'Details'], ...(hasPhotos ? [['photos', 'Photos']] : []), ['reviews', 'Reviews'], ['leaderboard', 'Leaderboard'], ['checkins', 'Check-ins']];
  const person = k => DATA.people[k] || {n:k, from:'', img:''};
  const avatar = (k, cls) => { const u = person(k); return u.img ? `<img class="${cls}" src="${esc(u.img)}" alt="" width="64" height="64">` : `<span class="${cls}" aria-hidden="true"></span>`; };

  /* ---------- state ---------- */
  const st = {src:'all', sort:'new', shown:3, period:'30', people:'all', more:false};

  /* ---------- templates ---------- */
  const chips = [p.rating ? `<li>${STAR}<span class="sr">Rating </span>${p.rating}</li>` : '', `<li>${esc(hours)}</li>`, p.cb ? `<li>${p.cb}% cashback</li>` : ''].join('');
  const heroHTML = `<section class="mw-hero" aria-labelledby="mwName"><div class="wrap"${p.hero ? '' : ' style="grid-template-columns:minmax(0,1fr)"'}>
    <div>
      <p class="mw-kicker">${esc([p.type, p.price].filter(Boolean).join(' · '))}</p>
      <h1 id="mwName">${esc(p.name)}</h1>
      <ul class="mw-chips" aria-label="At a glance">${chips}</ul>
      <div class="mw-hero-acts">${appLink(`Open in YouApp${IC.arrow}`, 'btn-light')}${p.map ? `<a class="btn btn-ghost-light" href="${esc(p.map)}" target="_blank" rel="noopener">Get directions</a>` : ''}</div>
    </div>
    ${p.hero ? `<div class="mw-hero-pic"><img src="${esc(p.hero)}" alt="Photo of ${esc(p.name)}" width="880" height="550"></div>` : ''}
  </div></section>`;

  const tabsHTML = `<nav class="mw-tabs" aria-label="Sections"><div class="wrap" id="mwTabs">${SECTIONS.map(([k, t], i) => `<a href="#${k}" data-sec="${k}"${i === 0 ? ' aria-current="true"' : ''}>${t}</a>`).join('')}</div></nav>`;

  const sideHTML = `<aside class="mw-side" aria-label="Actions">
    ${p.cb ? `<div class="mw-cb">${CBB_BG}<span class="mw-cb-g" aria-hidden="true">${GIFT}</span><p><small>Pay with YouApp and get</small><b>${p.cb}% cashback</b></p></div>` : ''}
    <div class="card mw-been"><h2>Been here?</h2>
      ${p.rating ? `<div class="rt"><b>${STAR}${p.rating}</b><small>${plural(p.reviews, 'review')}</small></div>` : ''}
      <p>Check in and review in the YouApp app.</p>
      ${appLink('Check in with YouApp', 'btn-primary btn-block', IC.pin)}${appLink('Write a review', 'btn-outline btn-block', IC.edit)}
    </div></aside>`;

  const detailsHTML = `<section class="card mw-sec" id="details" aria-labelledby="h-details"><h2 id="h-details">Plan your visit</h2>
    <dl class="mw-dl">
      ${p.addr ? `<div><dt>Address</dt><dd>${esc(p.addr)}</dd></div>` : ''}
      <div><dt>Hours</dt><dd>${hoursHTML}</dd></div>
      ${p.phone ? `<div><dt>Phone</dt><dd><a href="tel:${esc(p.phone.replace(/[^\d+]/g, ''))}">${esc(p.phone)}</a></dd></div>` : ''}
    </dl>
    <div class="mw-acts">
      ${p.map ? `<a class="btn btn-outline" href="${esc(p.map)}" target="_blank" rel="noopener">${IC.nav}Get directions</a>` : ''}
      ${p.cb ? appLink('Pay with YouApp', 'btn-outline', IC.wallet) : ''}
      <button type="button" class="btn btn-outline" id="mwCopy">${IC.link}Copy share link</button>
    </div>
    <p class="mw-status" id="mwCopied" role="status" aria-live="polite"></p>
    <div id="mwManual"></div>
  </section>`;

  const photosHTML = () => { if (!hasPhotos) return ''; const four = p.photos.slice(0, 4);
    return `<section class="card mw-sec" id="photos" aria-labelledby="h-photos"><h2 id="h-photos" style="margin-bottom:16px">Photos</h2>
      <div class="mw-photos" data-n="${four.length}">${four.map((ph, i) => `<button type="button" data-photo="${i}" aria-label="Open photo ${i + 1} of ${p.photoCount}"><img src="${esc(ph[0])}" alt="" style="object-position:${esc(ph[1] || '50% 50%')}" loading="lazy"></button>`).join('')}</div>
      <button type="button" class="btn btn-outline mw-more" data-photo="0">View all ${fmt(p.photoCount)} photos</button>
    </section>`; };

  const reviewsHTML = `<section class="card mw-sec" id="reviews" aria-labelledby="h-reviews">
    <div class="sec-h"><div><h2 id="h-reviews">Reviews</h2><p>From YouApp and Google visitors.</p></div></div>
    <div class="mw-rsum">
      <div class="mw-big"><b>${p.rating}</b><span class="mw-stars" aria-hidden="true">${STAR.repeat(5)}</span><small>${plural(p.reviews, 'review')}</small></div>
      <ul class="mw-bars" aria-label="Rating breakdown">${p.stars.map(([s, v]) => `<li><span>${s} star${s === 1 ? '' : 's'}</span><i><b style="width:${v}%"></b></i><em>${v}%</em></li>`).join('')}</ul>
    </div>
    <div class="mw-filters">
      <label>Source<select id="mwSrc"><option value="all">All</option><option value="YouApp">YouApp</option><option value="Google">Google</option><option value="photos">With photos</option></select></label>
      <label>Sort by<select id="mwSort"><option value="new">Newest</option><option value="high">Highest rating</option><option value="low">Lowest rating</option></select></label>
    </div>
    <div id="mwRevs" aria-live="polite"></div>
  </section>`;

  const lbHTML = `<section class="card mw-sec" id="leaderboard" aria-labelledby="h-lb">
    <div class="sec-h"><div><h2 id="h-lb">Leaderboard</h2><p id="mwLbSub"></p></div></div>
    <div class="mw-seg" role="group" aria-label="Period">${[['30', 'Last 30 days'], ['all', 'All time']].map(([k, t]) => `<button type="button" data-period="${k}" aria-pressed="${k === st.period}">${t}</button>`).join('')}</div>
    <div id="mwLb" aria-live="polite"></div>
  </section>`;

  const donut = (title, data) => { const tot = data.reduce((t, d) => t + d[1], 0); let acc = 0; const R = 15.9155;
    const segs = data.map(([, v, c]) => { const pct = v / tot * 100; const s = `<circle r="${R}" cx="21" cy="21" fill="none" stroke="${c}" stroke-width="6" stroke-dasharray="${pct.toFixed(2)} ${(100 - pct).toFixed(2)}" stroke-dashoffset="${(25 - acc).toFixed(2)}"/>`; acc += pct; return s; }).join('');
    return `<figure class="mw-dn"><svg viewBox="0 0 42 42" role="img" aria-label="${esc(title)}: ${data.map(d => `${esc(d[0])} ${Math.round(d[1] / tot * 100)}%`).join(', ')}">${segs}</svg>
      <figcaption><b>${esc(title)}</b><ul>${data.map(([l, v, c]) => `<li><i style="background:${c}"></i><em>${esc(l)}</em><small>${Math.round(v / tot * 100)}% · ${fmt(v)}</small></li>`).join('')}</ul></figcaption></figure>`; };

  const ciHTML = `<section class="card mw-sec" id="checkins" aria-labelledby="h-ci"><h2 id="h-ci" style="margin-bottom:16px">Check-ins</h2>
    <div class="mw-stats"><div><small>All time</small><b>${fmt(p.total)}</b></div><div><small>Today</small><b>${fmt(p.today)}</b></div></div>
    ${p.total ? `<h3>People who checked in</h3>
      <div class="mw-seg" role="group" aria-label="When">${[['today', 'Today'], ['week', 'This week'], ['all', 'All time']].map(([k, t]) => `<button type="button" data-people="${k}" aria-pressed="${k === st.people}">${t}</button>`).join('')}</div>
      <div class="mw-pplwrap" id="mwPpl" aria-live="polite"></div>
      ${p.total >= 50 ? `<h3 style="margin-bottom:0">Who checks in here</h3><p class="sub" style="margin-top:2px">Last 90 days</p>
        <div class="mw-dns" id="mwDns">${donut('Age', DATA.age)}${donut('Gender', DATA.gender)}</div>
        <button type="button" class="mw-toggle" id="mwMore" aria-expanded="false" aria-controls="mwDns">${IC.down}<span>Show all statistics</span></button>` : ''}`
      : '<p class="mw-empty">No check-ins yet.</p>'}
  </section>`;

  const viewerHTML = hasPhotos ? `<div class="mw-viewer" id="mwViewer" role="dialog" aria-modal="true" aria-label="Photos of ${esc(p.name)}" hidden>
    <div class="mw-vbar"><span id="mwVpos" aria-live="polite"></span><button type="button" class="btn btn-dark" id="mwVclose">${IC.close}Close</button></div>
    <div class="mw-vstage"><img id="mwVimg" src="" alt=""></div>
    <div class="mw-vnav"><button type="button" class="btn btn-dark" id="mwVprev">${IC.prev}Previous</button><button type="button" class="btn btn-dark" id="mwVnext">Next${IC.next}</button></div>
  </div>` : '';

  root.innerHTML = `<header class="mw-top"><div class="wrap"><a class="mw-logo" href="https://youapp.ai/" target="_blank" rel="noopener"><img src="web/logo.svg" alt="YouApp" width="110" height="28"></a><nav aria-label="YouApp"><a href="${esc(appUrl('discover'))}" target="_blank" rel="noopener">Browse places</a></nav></div></header>
    <main>${heroHTML}${tabsHTML}
      <div class="wrap mw-main"><div class="mw-grid"><div class="mw-col">${detailsHTML}${photosHTML()}${reviewsHTML}${lbHTML}${ciHTML}</div>${sideHTML}</div></div>
    </main>
    <footer class="mw-foot"><div class="wrap"><img src="web/logo-white.svg" alt="YouApp" width="102" height="26"><p>Travel like a local. Pay like a local.</p></div></footer>${viewerHTML}`;

  /* ---------- reviews ---------- */
  const renderReviews = () => {
    let list = p.reviewList.map((r, i) => ({...r, i})).filter(r => st.src === 'all' || (st.src === 'photos' ? r.ph && r.ph.length : r.s === st.src));
    if (st.sort !== 'new') list.sort((a, b) => (st.sort === 'high' ? b.r - a.r : a.r - b.r) || a.i - b.i);
    const max = Math.min(12, list.length); const shown = list.slice(0, Math.min(st.shown, max));
    const total = p.sourceCounts[st.src] || 0;
    $('#mwRevs').innerHTML = !list.length ? '<p class="mw-empty">No reviews match this filter.</p>'
      : `<ul class="mw-revs">${shown.map(r => `<li class="mw-rev"><header><span><b>${esc(r.n)}</b><small>${r.s} · ${esc(r.ago)}</small></span><span class="score" aria-label="${r.r} out of 5">${STAR}${r.r}</span></header><p>${esc(r.t)}</p>${r.ph && r.ph.length ? `<div class="pics">${r.ph.map(src => `<img src="${esc(src)}" alt="Review photo" loading="lazy">`).join('')}</div>` : ''}</li>`).join('')}</ul>
        ${shown.length < max ? '<button type="button" class="btn btn-outline mw-revmore" id="mwRevMore">Show more reviews</button>'
          : total > shown.length ? `<p class="mw-note">Showing ${shown.length} of ${fmt(total)}. <a href="${esc(placeUrl)}" target="_blank" rel="noopener">See all reviews in YouApp</a></p>` : ''}`;
  };
  $('#mwSrc').addEventListener('change', e => { st.src = e.target.value; st.shown = 3; renderReviews(); });
  $('#mwSort').addEventListener('change', e => { st.sort = e.target.value; st.shown = 3; renderReviews(); });
  $('#mwRevs').addEventListener('click', e => { if (!e.target.closest('#mwRevMore')) return; const before = st.shown; st.shown = 12; renderReviews();
    const next = $$('.mw-rev', $('#mwRevs'))[before]; if (next) { next.tabIndex = -1; next.focus({preventScroll:true}); } });

  /* ---------- leaderboard ---------- */
  const renderBoard = () => {
    const rows = st.period === 'all' ? p.boardAll : p.board30;
    $('#mwLbSub').textContent = st.period === 'all' ? 'Most check-ins since this place joined YouApp. The ambassador is picked from the last 30 days.' : 'Most check-ins in the last 30 days earns the ambassador spot.';
    $$('[data-period]').forEach(b => b.setAttribute('aria-pressed', b.dataset.period === st.period));
    if (!rows.length) { $('#mwLb').innerHTML = '<p class="mw-empty">No check-ins yet.</p>'; return; }
    const top = rows[0][1];
    $('#mwLb').innerHTML = `<ol class="mw-lb">${rows.map(([k, n], i) => { const u = person(k); const w = i === 0 ? 100 : Math.max(2, Math.round(n / top * 100));
      return `<li class="${i === 0 ? 'top' : ''}"><span class="mw-rank" aria-label="Rank ${i + 1}">${i + 1}</span>${avatar(k, 'mw-av')}<span class="who"><b>${esc(u.n)}</b><small>${i === 0 && st.period === '30' ? 'Ambassador · ' : ''}${esc(u.from)}</small></span><span class="n"><b>${fmt(n)}<span class="sr"> check-ins</span></b><i aria-hidden="true"><span style="width:${w}%"></span></i></span></li>`; }).join('')}</ol>`;
  };
  $('#leaderboard').addEventListener('click', e => { const b = e.target.closest('[data-period]'); if (!b || b.dataset.period === st.period) return; st.period = b.dataset.period; renderBoard(); });

  /* ---------- check-ins ---------- */
  const renderPeople = () => { const box = $('#mwPpl'); if (!box) return;
    const ks = p.visitors[st.people] || [];
    $$('[data-people]').forEach(b => b.setAttribute('aria-pressed', b.dataset.people === st.people));
    box.innerHTML = ks.length ? `<ul class="mw-ppl">${ks.map(k => { const u = person(k); return `<li>${avatar(k, '')}<b>${esc(u.n)}</b><small>${esc(u.from)}</small></li>`; }).join('')}</ul>`
      : `<p class="mw-empty">${st.people === 'today' ? 'No one has checked in today.' : 'No check-ins yet.'}</p>`; };
  $('#checkins').addEventListener('click', e => {
    const b = e.target.closest('[data-people]'); if (b) { st.people = b.dataset.people; renderPeople(); return; }
    if (e.target.closest('#mwMore')) { st.more = !st.more; const t = $('#mwMore');
      $('#mwDns').innerHTML = donut('Age', DATA.age) + donut('Gender', DATA.gender) + (st.more ? DATA.more.map(([title, d]) => donut(title, d)).join('') : '');
      t.setAttribute('aria-expanded', st.more); $('span', t).textContent = st.more ? 'Show fewer statistics' : 'Show all statistics'; }
  });

  /* ---------- copy share link ---------- */
  const message = `Check out ${p.name} on YouApp${p.cb ? ` and get ${p.cb}% cashback when you pay with YouApp` : ''}: ${canonical}`;
  $('#mwCopy').addEventListener('click', async () => {
    const status = $('#mwCopied'); status.textContent = ''; $('#mwManual').innerHTML = '';
    try { if (!navigator.clipboard || !window.isSecureContext) throw new Error('no clipboard'); await navigator.clipboard.writeText(message); status.textContent = 'Link copied.'; clearTimeout(status._t); status._t = setTimeout(() => { status.textContent = ''; }, 4000); }
    catch (_) { $('#mwManual').innerHTML = `<div class="mw-manual"><label for="mwMsg">Copy this message and share it</label><textarea id="mwMsg" readonly>${esc(message)}</textarea></div>`; const ta = $('#mwMsg'); ta.focus(); ta.select(); }
  });

  /* ---------- photo viewer ---------- */
  if (hasPhotos) {
    const v = $('#mwViewer'); let at = 0, opener = null;
    const show = i => { at = (i + p.photos.length) % p.photos.length; const ph = p.photos[at]; const im = $('#mwVimg');
      im.src = ph[0]; im.style.objectPosition = ph[1] || '50% 50%'; im.alt = `Photo ${at + 1} of ${p.photoCount}, ${p.name}`; $('#mwVpos').textContent = `${at + 1} / ${fmt(p.photoCount)}`; };
    const close = () => { v.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); };
    $('#photos').addEventListener('click', e => { const b = e.target.closest('[data-photo]'); if (!b) return; opener = b; show(+b.dataset.photo); v.hidden = false; document.body.style.overflow = 'hidden'; $('#mwVclose').focus(); });
    $('#mwVprev').addEventListener('click', () => show(at - 1));
    $('#mwVnext').addEventListener('click', () => show(at + 1));
    $('#mwVclose').addEventListener('click', close);
    v.addEventListener('click', e => { if (e.target === v || e.target.classList.contains('mw-vstage')) close(); });
    document.addEventListener('keydown', e => { if (v.hidden) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); } else if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); } else if (e.key === 'Escape') close();
      else if (e.key === 'Tab') { const f = $$('button', v); const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } } });
  }

  /* ---------- tabs: sticky bar, click to jump, scroll spy ---------- */
  const bar = $('#mwTabs'); const tabs = $$('a', bar); const secs = SECTIONS.map(([k]) => document.getElementById(k));
  let current = 'details', lockUntil = 0;
  const setActive = k => { if (k === current && tabs.some(t => t.getAttribute('aria-current'))) return; current = k;
    tabs.forEach(t => { if (t.dataset.sec === k) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
    const t = tabs.find(x => x.dataset.sec === k); if (t && bar.scrollWidth > bar.clientWidth) bar.scrollTo({left:t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2, behavior:reduce ? 'auto' : 'smooth'}); };
  bar.addEventListener('click', e => { const t = e.target.closest('a[data-sec]'); if (!t) return; e.preventDefault();
    const k = t.dataset.sec; current = ''; setActive(k); lockUntil = Date.now() + 900;
    document.getElementById(k).scrollIntoView({behavior:reduce ? 'auto' : 'smooth', block:'start'}); history.replaceState(null, '', `#${k}`); });
  let ticking = false;
  const spy = () => { ticking = false; if (Date.now() < lockUntil) return;
    const doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) { setActive(SECTIONS[SECTIONS.length - 1][0]); return; }
    const line = bar.closest('.mw-tabs').getBoundingClientRect().bottom + 140; let k = SECTIONS[0][0];
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) k = SECTIONS[i][0]; });
    setActive(k); };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, {passive:true});
  window.addEventListener('resize', () => requestAnimationFrame(spy));

  renderReviews(); renderBoard(); renderPeople();
  const hash = location.hash.slice(1); if (SECTIONS.some(([k]) => k === hash)) { current = ''; setActive(hash); lockUntil = Date.now() + 900; document.getElementById(hash).scrollIntoView(); }
})();
