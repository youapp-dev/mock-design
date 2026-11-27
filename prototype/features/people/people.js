/* ===== Locals › People (heart in the Locals header): Scan QR, Scanned, Liked Hosts (27 Nov) =====
   Scan QR: scan someone's YouApp profile QR (tap to simulate) or upload a photo of it; My QR shows your own.
   Scanned: Who I scanned / Who scanned you. Liked Hosts: hosts you liked on their profile.
   Each person is a card that opens their profile, with a Chat button that opens the chat. */
(() => {
  const ME_QR = 'youapp-profile-elsa';
  /* decorative profile QR (same pattern as the group invite QR), purple gradient */
  const profileQr = tok => { let h = 0; const N = 25, cells = []; for (let i = 0; i < tok.length; i++) h = (h * 31 + tok.charCodeAt(i)) >>> 0;
    const fp = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (fp(x, y)) continue; h = (h * 1103515245 + 12345) >>> 0; if ((h >>> 16) & 1) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`); }
    const eye = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
    return `<svg viewBox="-1 -1 27 27" role="img" aria-label="Your profile QR code"><defs><linearGradient id="ppQrGrad" x1="0" y1="0" x2="25" y2="25" gradientUnits="userSpaceOnUse"><stop stop-color="#9A6BBF"/><stop offset="1" stop-color="#38168E"/></linearGradient></defs><rect x="-1" y="-1" width="27" height="27" fill="#fff"/><g fill="url(#ppQrGrad)">${cells.join('')}${eye(0, 0)}${eye(N - 7, 0)}${eye(0, N - 7)}</g></svg>`; };
  const store = () => { if (!D.people) {
      D.people = {iScanned:['nugi', 'ismail'], scannedMe:['elsa', 'maulguy', 'maulida', 'lucas', 'emma']};
      ['aisyah', 'lucas', 'maulana', 'maulaura'].forEach(k => { if (D.likes['u-' + k] === undefined) D.likes['u-' + k] = true; });
    } return D.people; };
  const liked = () => Object.keys(HOSTS).filter(k => D.likes['u-' + k]);

  const card = k => { const h = HOSTS[k]; if (!h) return '';
    return `<li class="pp-card"><button class="pp-pic" data-act="openProfile" data-h="${k}" aria-label="Open ${esc(h.name)}’s profile">${img(h.av, '', 'pp-img')}
        <span class="pp-meta"><b><span class="pp-n">${esc(h.name)}</span>${vbadge()}${h.host ? hbadge() : ''}</b><small>${esc(h.title || '')}</small></span></button>
      <button class="pp-chat" data-act="pplChat" data-h="${k}" aria-label="Chat with ${esc(h.name)}">${ic('chat')}Chat</button></li>`; };
  const grid = ks => `<ul class="pp-grid">${ks.map(card).join('')}</ul>`;
  const empty = (icon, title, text, act, label) => `<div class="pp-empty"><span class="pp-eic">${ic(icon)}</span><b>${title}</b><p>${text}</p>${act ? btn(label, act, {kind:'btn-secondary', cls:'btn-sm'}) : ''}</div>`;

  V.people = () => { const s = store(); const tab = S.pplTab || 'liked'; const sub = S.pplSub || 'mine';
    const tabs = `<div class="ctabs pp-tabs" role="tablist" aria-label="People">${[['scan', 'Scan QR'], ['scanned', 'Scanned'], ['liked', 'Liked Hosts']].map(([k, t]) => `<button role="tab" aria-selected="${tab === k}" data-act="pplTab" data-k="${k}">${t}</button>`).join('')}</div>`;
    let body;
    if (tab === 'scan') body = `<div class="pp-scan"><button class="pp-vf" data-act="pplScan" aria-label="Scan a profile QR (tap to simulate)"><span class="pp-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="pp-vft">${S.pplReading ? '<span class="spin" aria-hidden="true"></span>Reading QR…' : 'Point at a YouApp profile QR'}</span></button>
        <div class="scanbar"><span class="roundbtn pp-ghost" aria-hidden="true"></span>${btn(`${ic('qr')}My QR`, 'pplMyQr')}<button class="roundbtn" data-act="pplUpload" aria-label="Upload a photo of a QR">${ic('image')}</button></div>
        <p class="t-caption subtle pp-note">Scan a YouApp profile QR to see the person and start a chat. Tap the camera to simulate a scan.</p></div>`;
    else if (tab === 'scanned') { const list = sub === 'mine' ? s.iScanned : s.scannedMe;
      body = `<div class="pp-sub" role="tablist" aria-label="Scanned">${[['mine', 'Who I scanned'], ['me', 'Who scanned you']].map(([k, t]) => `<button role="tab" aria-selected="${sub === k}" data-act="pplSub" data-k="${k}">${t}</button>`).join('')}</div>
        ${list.length ? grid(list) : sub === 'mine' ? empty('scan', 'You haven’t scanned anyone yet', 'Scan a YouApp profile QR and the person shows up here.', 'pplToScan', 'Scan QR') : empty('qr', 'No one has scanned your QR yet', 'Show your QR so people can find you.', 'pplMyQr', 'Show my QR')}`; }
    else { const list = liked();
      body = list.length ? grid(list) : empty('heart', 'No liked hosts yet', 'Tap Like on a host’s profile and they show up here.', 'pplFind', 'Find hosts'); }
    return `<div class="screen">${statusBar()}${topBar('People')}<div class="pad16 pp-head">${tabs}</div><div class="scroll pad16 pp-body">${body}</div></div>`; };

  const next = () => { const s = store(); return Object.keys(HOSTS).find(k => !s.iScanned.includes(k) && k !== 'elsa'); };
  const scanned = k => { const s = store(); s.iScanned = [k, ...s.iScanned.filter(x => x !== k)]; S.prof = k; S.profTab = 'profil'; toast(`You scanned ${HOSTS[k].name}.`); go('profile'); };
  Object.assign(A, {
    pplOpen: guard(() => { S.pplTab = 'liked'; S.pplSub = 'mine'; go('people'); }),
    pplTab: el => { S.pplTab = el.dataset.k; render(); },
    pplSub: el => { S.pplSub = el.dataset.k; render(); },
    pplToScan: () => { S.pplTab = 'scan'; render(); },
    pplFind: () => { S.hist = ['discover']; go('discover', {replace:true}); },
    pplChat: el => { const h = HOSTS[el.dataset.h]; if (h) openConvFor(h.name, h.av); },
    pplScan: () => { if (S.pplReading) return; const k = next(); if (!k) { toast('Everyone in this demo is already scanned.'); return; }
      S.pplReading = true; render(); setTimeout(() => { S.pplReading = false; if (S.screen === 'people') scanned(k); }, 900); },
    pplUpload: () => { const k = next(); if (!k) { toast('Everyone in this demo is already scanned.'); return; } scanned(k); },
    pplMyQr: () => { S.sheet = 'pplQr'; S.sheetAnim = true; render(); },
    pplQrShare: () => { S.sheet = null; render(); toast('Opens the share sheet with your profile link.'); },
  });

  const css = document.createElement('style');
  css.textContent = `
  #phone .pp-head{padding-top:4px; padding-bottom:4px}
  #phone .pp-tabs{margin-top:0} #phone .pp-tabs button{white-space:nowrap; font-size:14px}
  #phone .pp-vf{position:relative; display:grid; place-items:center; width:100%; aspect-ratio:1/1; max-height:340px; border:0; border-radius:20px; background:radial-gradient(120% 90% at 50% 40%, #2b2244, #0f0b1c); cursor:pointer; overflow:hidden}
  #phone .pp-frame{position:relative; width:62%; aspect-ratio:1/1}
  #phone .pp-frame i{position:absolute; width:28px; height:28px; border:4px solid #fff}
  #phone .pp-frame i:nth-child(1){left:0; top:0; border-right:0; border-bottom:0; border-top-left-radius:10px}
  #phone .pp-frame i:nth-child(2){right:0; top:0; border-left:0; border-bottom:0; border-top-right-radius:10px}
  #phone .pp-frame i:nth-child(3){left:0; bottom:0; border-right:0; border-top:0; border-bottom-left-radius:10px}
  #phone .pp-frame i:nth-child(4){right:0; bottom:0; border-left:0; border-top:0; border-bottom-right-radius:10px}
  #phone .pp-vft{position:absolute; left:0; right:0; bottom:14px; display:flex; align-items:center; justify-content:center; gap:8px; color:rgba(255,255,255,.85); font:500 13px/18px Inter, sans-serif}
  #phone .pp-vft .spin{width:14px; height:14px}
  #phone .pp-body{padding-top:8px; padding-bottom:24px}
  #phone .pp-sub{display:grid; grid-template-columns:1fr 1fr; gap:4px; padding:4px; margin:0 0 14px; border-radius:12px; background:var(--a-indigo-100)}
  #phone .pp-sub button{height:36px; border:0; border-radius:9px; background:none; font:600 13px/1 Inter, sans-serif; color:var(--a-ink)}
  #phone .pp-sub button[aria-selected="true"]{background:#fff; color:var(--a-indigo); box-shadow:0 1px 3px rgba(30,16,80,.12)}
  #phone .pp-grid{display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px 12px; margin:0; padding:0; list-style:none}
  #phone .pp-card{display:grid; gap:8px; min-width:0}
  #phone .pp-pic{position:relative; display:block; aspect-ratio:4/5; padding:0; border:0; border-radius:16px; overflow:hidden; background:var(--a-indigo-100); cursor:pointer}
  #phone .pp-pic .pp-img{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:50% 35%; transform:scale(1.45); transform-origin:50% 40%}
  #phone .pp-pic::after{content:""; position:absolute; inset:45% 0 0; background:linear-gradient(180deg, rgba(20,10,50,0), rgba(20,10,50,.78))}
  #phone .pp-meta{position:absolute; left:10px; right:10px; bottom:10px; z-index:1; display:grid; gap:2px; text-align:left; color:#fff}
  #phone .pp-meta b{display:flex; align-items:center; gap:4px; min-width:0; font:700 14px/18px Inter, sans-serif}
  #phone .pp-meta .pp-n{overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0}
  #phone .pp-meta .vb, #phone .pp-meta .hb{flex:none}
  #phone .pp-meta small{font:500 12px/16px Inter, sans-serif; opacity:.9; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
  #phone .pp-chat{display:flex; align-items:center; justify-content:center; gap:6px; height:40px; border:0; border-radius:999px; background:var(--a-grad); color:#fff; font:600 14px/1 Inter, sans-serif; cursor:pointer}
  #phone .pp-chat .ico{width:18px; height:18px}
  #phone .pp-chat:active{transform:scale(.98)}
  #phone .pp-empty{display:grid; justify-items:center; gap:6px; padding:40px 16px; text-align:center}
  #phone .pp-eic{display:grid; place-items:center; width:72px; height:72px; margin-bottom:6px; border-radius:50%; background:var(--a-indigo-100); color:var(--a-indigo)}
  #phone .pp-eic .ico{width:30px; height:30px}
  #phone .pp-empty b{font:700 16px/22px Inter, sans-serif; color:var(--a-ink)}
  #phone .pp-empty p{margin:0 0 10px; font:400 14px/20px Inter, sans-serif; color:var(--a-muted, #66616b); max-width:260px}
  #phone .pp-scan .scanbar{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:14px}
  #phone .pp-scan .scanbar .btn{flex:1}
  #phone .pp-scan .scanbar .btn .ico{width:18px; height:18px}
  #phone .pp-ghost{visibility:hidden}
  #phone .pp-note{text-align:center; margin:12px 16px 0}
  #phone .pp-qr{display:grid; justify-items:center; gap:12px; padding:18px; border-radius:20px; background:var(--a-indigo-100)}
  #phone .sheet .pp-qr > svg{width:188px; height:188px; padding:10px; border-radius:16px; background:#fff}
  #phone .pp-qrme{display:flex; align-items:center; gap:8px; text-align:left}
  #phone .pp-qrme b{display:block; font-size:14px} #phone .pp-qrme small{color:var(--a-muted, #66616b); font-size:12px}
  `;
  document.head.appendChild(css);

  const _ov = overlayHTML;
  overlayHTML = () => { if (S.sheet !== 'pplQr') return _ov(); const me = HOSTS.elsa;
    return `<div class="scrim ${S.sheetAnim ? 'anim' : ''}" data-act="closeSheet2"></div><div class="sheet ${S.sheetAnim ? 'anim' : ''}" role="dialog" aria-label="My QR"><div class="grab" aria-hidden="true"></div>
      <b class="t-headline" style="display:block; text-align:center">My QR</b><p class="t-body muted" style="margin:4px 0 14px; text-align:center">People scan this to see your profile and chat with you.</p>
      <div class="pp-qr">${profileQr(ME_QR)}<span class="pp-qrme">${img('avatar', '', 'av32')}<span><b>${esc(me.name)}</b><small>${esc(me.handle)}</small></span></span></div>
      <div style="margin-top:14px">${btn(`${ic('share')}Share my profile`, 'pplQrShare')}</div></div>`; };

  META.people = {name:'People (Scan QR, Scanned, Liked Hosts)', group:'Chat', figma:'Live app › Scan QR / Scanned / Liked Hosts (27 Nov, restyled)',
    rules:['Opens from the heart in the Locals header, on Liked Hosts.', 'Scan QR: tap the camera or upload a photo; the person is added to Who I scanned and their profile opens. My QR shows your profile QR.',
      'Scanned: Who I scanned and Who scanned you. Liked Hosts: hosts you liked on their profile; unliking removes them.', 'Card opens the profile; Chat opens the chat with that person (no identity check).', 'Each list has its own empty state with a next step.']};
})();
