/* ===== V2 · Chatroom features: reactions, emoji, files, forward, delete for me / everyone, voice + video call ===== */
(function(){
const sv = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
Object.assign(SVG, {
  cxSmile: sv('<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.9 2 5.1 2 7 0"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r=".9" fill="currentColor"/>'),
  cxFwd: sv('<path d="M14 5l7 7-7 7"/><path d="M21 12H9a6 6 0 0 0-6 6v1"/>'),
  cxPhone: sv('<path d="M6.6 3.5h2.7l1.4 4.3-2 1.4a12 12 0 0 0 6.1 6.1l1.4-2 4.3 1.4v2.7a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>'),
  cxVideo: sv('<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3"/>'),
  cxEnd: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-3.2 0-6.2.9-8.6 2.6a1.6 1.6 0 0 0-.4 2.1l1.3 2a1.6 1.6 0 0 0 2 .6l2.6-1.2a1.6 1.6 0 0 0 .9-1.4v-1.9a14 14 0 0 1 4.4 0v1.9c0 .6.4 1.2.9 1.4l2.6 1.2a1.6 1.6 0 0 0 2-.6l1.3-2a1.6 1.6 0 0 0-.4-2.1A15 15 0 0 0 12 9z"/></svg>',
  cxMicOff: sv('<path d="M9 9v2a3 3 0 0 0 5 2.2M15 9.3V6a3 3 0 0 0-5.7-1.3"/><path d="M18 11a6 6 0 0 1-9.3 5M6 11a6 6 0 0 0 .6 2.6M12 17v4M3 3l18 18"/>'),
  cxSpk: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  cxFlip: sv('<path d="M4 8h11l-3-3M20 16H9l3 3"/>'),
  cxDoc: sv('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
  cxPlus: sv('<path d="M12 5v14M5 12h14"/>'),
});
const QUICK = ['👍','❤️','😂','😮','😢','🙏'];
const EMO_ALL = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😋','😜','🤪','😎','🤗','🤔','😴','😮','😢','😭','😤','😡','🥳','😱','👍','👎','👏','🙌','🙏','💪','👋','🤝','👌','✌️','❤️','🧡','💛','💚','💙','💜','🖤','💯','🔥','✨','🎉','🎁','☕','🍜','📸','✈️','🏝️','⛰️','🌸','⚽'];
const FILES = [['Itinerary_KL_Trip.pdf','1.2 MB'],['Meeting_point_map.png','860 KB'],['Activity_rules.docx','240 KB'],['Receipt_Oct.pdf','312 KB']];
const isEmo = t => { const s = (t||'').replace(/\s/g,''); if (!s || s.length > 16) return false; try { return /^(\p{Extended_Pictographic}|‍|️|\p{Emoji_Modifier})+$/u.test(s) && [...s].filter(ch => /\p{Extended_Pictographic}/u.test(ch)).length <= 3; } catch(e) { return false; } };
const newId = () => 'x' + Date.now() + Math.floor(Math.random()*99);
const ME = 'me';

/* ---------- message rendering ---------- */
const _msgCx = msgHTML;
msgHTML = function(m, c, idx){
  if (m.hidden) return '';
  if (m.id === undefined) m.id = 'm' + idx;
  if (m.t === 'call') return `<p class="cx-callp">${ic(m.kind==='video'?'cxVideo':'cxPhone')}${m.kind==='video'?'Video':'Voice'} call · ${m.missed?'No answer':m.dur}</p>`;
  let h;
  if (m.t === 'file') {
    const p = c.group && !m.me && m.who ? GP(m.who) : null; const sel = S.cs === m.id;
    const bub = `<div class="bub cx-file ${m.me?'me':''} ${sel?'sel':''}" data-act="mSel" data-id="${m.id}">${p?`<b class="gwho">${esc(p.n)}</b>`:''}${m.reply?`<span class="rq"><b>${esc(m.reply.who)}</b>${m.reply.prev}</span>`:''}<span class="cx-fi"><span class="cx-fic">${ic('cxDoc')}</span><span class="cx-fn"><b>${esc(m.name)}</b><small>${esc(m.size)} · ${esc((m.name.split('.').pop()||'').toUpperCase())}</small></span><button class="cx-fdl" data-act="cxDl" data-n="${esc(m.name)}" aria-label="Download ${esc(m.name)}">${ic('download')}</button></span><span class="bmeta">${m.at}${m.me?' ✓✓':''}</span></div>`;
    h = p ? `<div class="grow">${img(p.av, p.n, 'gmav')}${bub}</div>` : bub;
  } else h = _msgCx(m, c, idx);
  if (!h || m.gsys || m.sys) return h;
  if (m.del && m.me) h = h.replace('This message was deleted', 'You deleted this message');
  if (m.fwd && !m.del) h = h.replace(`data-id="${m.id}">`, `data-id="${m.id}"><span class="cx-fwdl">${ic('cxFwd')}Forwarded</span>`);
  if (!m.del && m.t === 'text' && isEmo(m.text)) h = h.replace('class="bub ', 'class="bub cx-big ');
  if (m.reply && m.reply.id !== undefined) h = h.replace('<span class="rq">', `<span class="rq" data-act="cxJump" data-to="${m.reply.id}">`);
  const other = c.group && !m.me;
  const rx = m.rx && Object.keys(m.rx).filter(e => m.rx[e].length);
  if (rx && rx.length) h += `<div class="cx-rx ${m.me?'me':''} ${other?'g':''}">${rx.map(e => `<button class="${m.rx[e].includes(ME)?'on':''}" data-act="cxRx" data-id="${m.id}" data-e="${e}">${e}${m.rx[e].length>1?`<small>${m.rx[e].length}</small>`:''}</button>`).join('')}</div>`;
  if (S.cs === m.id && !m.del) h = `<div class="cx-qr ${m.me?'me':''} ${other?'g':''}">${QUICK.map(e => `<button data-act="cxRx" data-id="${m.id}" data-e="${e}" aria-label="React ${e}">${e}</button>`).join('')}<button class="more" data-act="cxEmoReact" aria-label="More reactions">${ic('cxPlus')}</button></div>` + h;
  return h;
};

/* ---------- chat screen: selection bar, call buttons, emoji button ---------- */
const _chatCx = chatHTML;
chatHTML = function(c, o){ let h = _chatCx(c, o);
  const selM = S.cs !== undefined && S.cs !== null ? c.msgs.find(m => m.id === S.cs) : null;
  if (selM) { const a = h.indexOf('<div class="topbar selbar">'); const b = a >= 0 ? h.indexOf('</div>', a) + 6 : -1;
    if (a >= 0) { const del = selM.del;
      const bar = `<div class="topbar selbar cx-sel"><button class="iconbtn" data-act="mDesel" aria-label="Cancel selection">${ic('close')}</button><b style="flex:1">1 selected</b>
        ${del ? `<button class="iconbtn" data-act="mDel" aria-label="Delete">${ic('trash')}</button>` : `<button class="iconbtn" data-act="mReply" aria-label="Reply">${ic('reply')}</button><button class="iconbtn" data-act="cxFwd" aria-label="Forward">${ic('cxFwd')}</button><button class="iconbtn" data-act="mPin" aria-label="${c.pin===selM.id?'Unpin':'Pin'}">${ic('pinm')}</button>${selM.t==='text'?`<button class="iconbtn" data-act="mCopy" aria-label="Copy">${ic('copy')}</button>`:''}<button class="iconbtn cx-delb" data-act="mDel" aria-label="Delete">${ic('trash')}</button>`}</div>`;
      h = h.slice(0, a) + bar + h.slice(b); } }
  else { const a = h.indexOf('<div class="topbar" style="border-bottom:1px solid var(--a-line)">');
    if (a >= 0) { const end = h.indexOf('</div>', a);
      const calls = c.group && c.gone ? '' : `<span class="cx-calls"><button class="iconbtn" data-act="cxCall" data-k="voice" aria-label="Voice call">${ic('cxPhone')}</button><button class="iconbtn" data-act="cxCall" data-k="video" aria-label="Video call">${ic('cxVideo')}</button></span>`;
      const dots = h.indexOf('data-act="chatMenu"', a);
      const at = dots > 0 && dots < end ? h.lastIndexOf('<button', dots) : end;
      h = h.slice(0, at) + calls + h.slice(at); } }
  h = h.replace(/(<button class="hostedby"[^>]*>[\s\S]*?<span style="text-align:left">)([\s\S]*?)(<span class="cstatus)/, '$1<span class="cx-nm">$2</span>$3');
  h = h.replace('<input class="cinput"', `<button class="iconbtn cx-emob" style="margin:0" data-act="cxEmo" aria-label="Emoji">${ic('cxSmile')}</button><input class="cinput"`);
  return h; };
/* group chat removes the 3-dot menu after chatHTML: keep our call buttons (they are not the menu) */

/* ---------- overlays ---------- */
const _ovCx = overlayHTML;
overlayHTML = () => { let h = _ovCx();
  const sh = (inner, label) => `<div class="scrim ${S.sheetAnim?'anim':''}" data-act="cxSheetX"></div><div class="sheet gx-sheet ${S.sheetAnim?'anim':''}" role="dialog" aria-label="${label}"><div class="grab" aria-hidden="true"></div>${inner}</div>`;
  if (S.sheet === 'cAttach') h = h.replace(/(<button class="menurow" data-act="attachGal">[\s\S]*?<\/button>)/, `$1<button class="menurow" data-act="cxDocs">${ic('cxDoc')}Document</button>`);
  if (S.sheet === 'cxEmo') h += sh(`<p class="sh-t">${S.cxEmoMode==='react'?'React':'Emoji'}</p><div class="cx-emog">${EMO_ALL.map(e => `<button data-act="cxEmoPick" data-e="${e}">${e}</button>`).join('')}</div>`, 'Emoji');
  if (S.sheet === 'cxDocs') h += sh(`<p class="sh-t">Send a document</p><p class="sh-s">Recent files on your phone</p><div class="gx-sg">${FILES.map(([n, s], i) => `<button class="gx-sr" data-act="cxDocSend" data-i="${i}"><span class="gx-si">${ic('cxDoc')}</span><span><b>${n}</b><small>${s}</small></span>${ic('send')}</button>`).join('')}</div>`, 'Send a document');
  if (S.sheet === 'cxFwd') { const list = C6().convs.filter(v => !v.gone); const sel = S.cxFwdSel || [];
    h += sh(`<p class="sh-t">Forward to</p><p class="sh-s">${sel.length ? `${sel.length} selected` : 'Choose chats or groups'}</p><div class="cx-fwl">${list.map(v => { const on = sel.includes(v.id); return `<button class="cx-fwr ${on?'on':''}" data-act="cxFwdTog" data-id="${v.id}"><span class="gpk-av">${v.group ? gAv(v,'av44g') : img(v.av, v.name)}${on?`<i>${ic('check')}</i>`:''}</span><span class="cm"><b>${esc(v.name)}</b><small>${v.group ? v.mem.length + ' members' : 'Chat'}</small></span></button>`; }).join('')}</div>
      <div style="margin-top:12px">${btn(sel.length ? `Forward (${sel.length})` : 'Forward', 'cxFwdGo', {disabled:!sel.length})}</div>`, 'Forward'); }
  if (S.dialog === 'cxDel') { const c = curChat(); const m = c.msgs.find(x => x.id === S.cs); const mine = m && m.me && !m.del;
    h += `<div class="scrim anim"></div><div class="dialog anim gm8" role="alertdialog" aria-labelledby="cxDelT"><div class="gm8-top"><span class="gm8-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GMI.trash}</svg></span></div>
      <div class="gm8-body"><h2 id="cxDelT">Delete message?</h2><p>${mine ? 'Delete it for everyone in this chat, or only for you.' : 'This removes the message from your chat only.'}</p></div>
      <div class="gm8-acts">${mine ? `<button class="gm8-pri" data-act="cxDelGo" data-k="all">Delete for everyone</button><button class="gm8-pri act-alt" data-act="cxDelGo" data-k="me">Delete for me</button>` : `<button class="gm8-pri" data-act="cxDelGo" data-k="me">Delete for me</button>`}<button class="gm8-sec" data-act="closeDialog">Cancel</button></div></div>`; }
  if (S.call) { const k = S.call; const live = k.st === 'live'; const vid = k.kind === 'video';
    const people = k.group ? k.mem.slice(0, 4) : [];
    h += `<div class="cx-call ${vid?'vid':''}" role="dialog" aria-label="${vid?'Video':'Voice'} call">
      ${vid && live && k.cam ? `<div class="cx-self">${img('avatar','You')}</div>` : ''}
      <div class="cx-cbg">${img(k.av, '')}</div>
      <div class="cx-ctop"><button class="cx-min" data-act="cxCallEnd" aria-label="End call">${ic('back')}</button><span>${vid?'Video':'Voice'} call${k.group?' · group':''}</span><span style="width:36px"></span></div>
      <div class="cx-cmid">${k.group ? `<div class="cx-cgrid">${people.map(p => `<span>${img(p.av, p.n)}<small>${esc(p.n.split(' ')[0])}</small></span>`).join('')}</div>` : `<span class="cx-cav">${img(k.av, k.name)}</span>`}
        <b>${esc(k.name)}</b><small id="cxCallT">${live ? fmtDur(Math.floor((Date.now()-k.t0)/1000)) : k.group ? 'Ringing members…' : 'Calling…'}</small></div>
      <div class="cx-cbar">
        <button class="${k.mute?'on':''}" data-act="cxCallTog" data-k="mute" aria-label="Mute">${ic('cxMicOff')}<small>${k.mute?'Unmute':'Mute'}</small></button>
        ${vid ? `<button class="${!k.cam?'on':''}" data-act="cxCallTog" data-k="cam" aria-label="Camera">${ic('cxVideo')}<small>${k.cam?'Camera off':'Camera on'}</small></button><button data-act="cxCallTog" data-k="flip" aria-label="Flip camera">${ic('cxFlip')}<small>Flip</small></button>` : `<button class="${k.spk?'on':''}" data-act="cxCallTog" data-k="spk" aria-label="Speaker">${ic('cxSpk')}<small>Speaker</small></button>`}
        <button class="end" data-act="cxCallEnd" aria-label="End call">${ic('cxEnd')}<small>End</small></button></div></div>`; }
  return h; };

/* ---------- actions ---------- */
const msgOf = id => { const c = curChat(); return c.msgs.find(x => String(x.id) === String(id)); };
const pushMsg = (list, m) => { list.push(m); };
Object.assign(A, {
  cxSheetX: () => { S.sheet = null; render(); },
  cxRx: el => { const m = msgOf(el.dataset.id); const e = el.dataset.e; m.rx = m.rx || {};
    Object.keys(m.rx).forEach(k => { if (k !== e) m.rx[k] = m.rx[k].filter(x => x !== ME); });
    const l = m.rx[e] = m.rx[e] || []; const i = l.indexOf(ME); if (i >= 0) l.splice(i, 1); else l.push(ME);
    S.cs = null; render(); },
  cxEmoReact: () => { S.cxEmoMode = 'react'; S.cxEmoFor = S.cs; openSheet('cxEmo'); },
  cxEmo: () => { S.cxEmoMode = 'text'; openSheet('cxEmo'); },
  cxEmoPick: el => { const e = el.dataset.e;
    if (S.cxEmoMode === 'react') { S.sheet = null; S.cs = S.cxEmoFor; A.cxRx({dataset:{id:S.cxEmoFor, e}}); return; }
    S.ctext = (S.ctext || '') + e; S.sheet = null; render(); const i = document.querySelector('.cinput'); if (i) { i.focus({preventScroll:true}); try { i.setSelectionRange(i.value.length, i.value.length); } catch(x) {} } },
  cxDocs: () => openSheet('cxDocs'),
  cxDocSend: el => { const [n, s] = FILES[+el.dataset.i]; const c = curChat(); const m = {id:newId(), me:true, t:'file', name:n, size:s, at:nowHM(), st:'sent'}; if (S.creply) { m.reply = S.creply; S.creply = null; } pushMsg(c.msgs, m); S.sheet = null; render(); scrollChat(); toast(`${n} sent.`); },
  cxDl: el => toast(`Downloading ${el.dataset.n}…`),
  cxJump: el => { const to = el.dataset.to; const t = document.querySelector(`#chatScroll .bub[data-id="${CSS.escape(String(to))}"]`); if (!t) { toast('Original message isn’t available.'); return; } t.scrollIntoView({block:'center', behavior:'smooth'}); t.classList.add('cx-flash'); setTimeout(() => t.classList.remove('cx-flash'), 1200); },
  cxFwd: () => { S.cxFwdMsg = S.cs; S.cxFwdSel = []; openSheet('cxFwd'); },
  cxFwdTog: el => { const id = el.dataset.id; const l = S.cxFwdSel || []; S.cxFwdSel = l.includes(id) ? l.filter(x => x !== id) : [...l, id]; S.sheetAnim = false; render(); },
  cxFwdGo: () => { const src = msgOf(S.cxFwdMsg); if (!src || !(S.cxFwdSel||[]).length) return; const names = [];
    S.cxFwdSel.forEach(id => { const v = C6().convs.find(x => x.id === id); if (!v) return; const m = {...src, id:newId(), me:true, fwd:true, at:'Now', st:'sent'}; delete m.reply; delete m.rx; delete m.who; delete m.whoName; v.msgs.push(m); v.at = 'Now'; names.push(v.name); });
    S.sheet = null; S.cs = null; S.cxFwdSel = []; render(); toast(`Forwarded to ${names.length === 1 ? names[0] : names.length + ' chats'}.`); },
  mDel: () => { S.dialog = 'cxDel'; render(); },
  cxDelGo: el => { const c = curChat(); const m = c.msgs.find(x => x.id === S.cs); if (!m) { S.dialog = null; render(); return; }
    if (el.dataset.k === 'all') { m.del = true; delete m.rx; } else m.hidden = true;
    if (c.pin === m.id) c.pin = undefined; S.cs = null; S.dialog = null; render(); toast(el.dataset.k === 'all' ? 'Deleted for everyone.' : 'Deleted for you.'); },
  mReply: (orig => el => { const id = S.cs; orig(el); if (S.creply) S.creply.id = id; })(A.mReply),
  cxCall: el => { const c = curChat(); if (c.group && c.gone) { toast('You’re no longer a member of this group.'); return; } const kind = el.dataset.k;
    if (c.group) { const mem = c.mem.filter(m => m.k !== 'me').map(m => GP(m.k) || {n:m.k, av:'avatar'}); S.call = {kind, name:c.name, av:(c.photo||'avatar'), group:true, mem, st:'ring', mute:false, spk:false, cam:true}; }
    else S.call = {kind, name:c.name, av:c.av||'avatar', group:false, st:'ring', mute:false, spk:false, cam:true};
    S.call.conv = c; render();
    clearTimeout(timers.cxRing); timers.cxRing = setTimeout(() => { if (!S.call || S.call.st !== 'ring') return; S.call.st = 'live'; S.call.t0 = Date.now(); render();
      clearInterval(timers.cxTick); timers.cxTick = setInterval(() => { const t = document.getElementById('cxCallT'); if (!S.call || S.call.st !== 'live') { clearInterval(timers.cxTick); return; } if (t) t.textContent = fmtDur(Math.floor((Date.now()-S.call.t0)/1000)); }, 1000); }, 1800); },
  cxCallTog: el => { const k = el.dataset.k; if (k === 'flip') { toast('Camera flipped.'); return; } S.call[k] = !S.call[k]; render(); },
  cxCallEnd: () => { const k = S.call; if (!k) return; clearTimeout(timers.cxRing); clearInterval(timers.cxTick);
    const sec = k.st === 'live' ? Math.max(1, Math.floor((Date.now()-k.t0)/1000)) : 0;
    k.conv.msgs.push({id:newId(), t:'call', kind:k.kind, dur:fmtDur(sec), missed:!sec, me:true, at:nowHM()});
    S.call = null; render(); scrollChat(); toast(sec ? `Call ended · ${fmtDur(sec)}` : 'Call cancelled.'); },
});
Object.assign(META.chat || {}, {rules:[...((META.chat||{}).rules||[]), 'Tap a message: quick reactions (👍 ❤️ 😂 😮 😢 🙏, + for more), Reply, Forward, Pin, Copy, Delete', 'Delete: your messages → Delete for everyone (no time limit) or Delete for me; others’ messages → Delete for me', '📎 Camera, Photo & Video, Document, Red Packet. 😊 opens the emoji panel; emoji-only messages show large', 'Voice and video calls are available in active chats; call controls are hidden for former group members, while past call messages remain in chat history']});
try { render(); } catch(e) {}
})();

/* ===== V2 · Chat header like a messenger: voice call + ⋮ menu (video call inside the menu) ===== */
(function(){
  const sv = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  Object.assign(SVG, {
    cmMute: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>'),
    cmMuted: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
    cmBroom: sv('<path d="M19 3l-7.5 7.5"/><path d="M11.5 10.5c-3 0-6 2-7.5 5.5L8 20c3.5-1.5 5.5-4.5 5.5-7.5z"/>'),
  });
  /* personal + host chats: keep only the voice call button in the header */
  const _chatCm = chatHTML;
  chatHTML = function(c, o){ let h = _chatCm(c, o);
    if (!c.group) h = h.replace(/<button class="iconbtn" data-act="cxCall" data-k="video" aria-label="Video call">[\s\S]*?<\/button>/, '');
    if (c.muted) h = h.replace('<span class="cx-nm">', `<span class="cx-nm">`).replace(/(<span class="cx-nm">[\s\S]*?)(<\/span><span class="cstatus)/, `$1<span class="cm-mi" aria-label="Muted">${ic('cmMuted')}</span>$2`);
    return h; };
  A.chatMenu = () => { S.sheet = 'cxMenu'; S.sheetAnim = true; render(); };
  const _ovCm = overlayHTML;
  overlayHTML = () => { let h = _ovCm();
    if (S.sheet === 'cxMenu') { const c = curChat(); const bl = C6().blocked.some(b => b.name === c.name); const first = esc(c.name.split(' ')[0]);
      const row = (act, i, t, extra='', cls='') => `<button class="cm-row ${cls}" data-act="${act}" ${extra}>${ic(i)}<span>${t}</span></button>`;
      const items = c.group
        ? `${c.gone ? '' : row('cmVideo', 'cxVideo', 'Video Call')}${row('gInfo', 'group', 'Group info')}${row('cmClear', 'cmBroom', 'Clear History')}${row('openReport', 'flag', 'Report a problem')}`
        : `${row('cmMute', c.muted ? 'cmMuted' : 'cmMute', c.muted ? 'Unmute' : 'Mute', '', 'chev')}<i class="cm-sep"></i>${row('cmVideo', 'cxVideo', 'Video Call')}${row('cmSearch', 'search', 'Search')}${S.screen==='bchat' && c.bk ? row('openTxn', 'receipt', 'Transaction detail', `data-id="${c.bk.id}"`) : ''}${row('cmClear', 'cmBroom', 'Clear History')}${row(bl ? 'cUnblock' : 'cBlock', 'ublock', bl ? `Unblock ${first}` : `Block ${first}`)}${row('openReport', 'flag', 'Report a problem')}${S.screen==='chat' ? row('cmDelete', 'trash', 'Delete Chat', '', 'dng') : ''}`;
      h += `<div class="cm-scrim" data-act="cmClose"></div><div class="cm-pop ${S.sheetAnim?'anim':''}" role="menu" aria-label="Chat options">
        ${items}</div>`; }
    if (S.dialog === 'cmClear') h += gModal('trash', 'Clear history?', 'All messages in this chat are removed from your phone. The other person still has them.', ['Clear History','cmClearOk'], ['Cancel','closeDialog']);
    if (S.dialog === 'cmDelete') h += gModal('trash', 'Delete chat?', 'This chat and its messages are removed from your chat list.', ['Delete Chat','cmDeleteOk'], ['Cancel','closeDialog']);
    return h; };
  Object.assign(A, {
    cmClose: () => { S.sheet = null; render(); },
    cmMute: () => { const c = curChat(); c.muted = !c.muted; S.sheet = null; render(); toast(c.muted ? 'Notifications muted for this chat.' : 'Notifications turned on.'); },
    cmVideo: () => { S.sheet = null; A.cxCall({dataset:{k:'video'}}); },
    cmSearch: () => { S.sheet = null; render(); toast('Search in chat follows the current app.'); },
    cmClear: () => { S.sheet = null; S.dialog = 'cmClear'; render(); },
    cmClearOk: () => { const c = curChat(); c.msgs.splice(0, c.msgs.length); c.pin = undefined; S.dialog = null; render(); toast('Chat history cleared.'); },
    cmDelete: () => { S.sheet = null; S.dialog = 'cmDelete'; render(); },
    cmDeleteOk: () => { const c = curChat(); const st = C6(); st.convs = st.convs.filter(v => v !== c); S.dialog = null; S.hist = S.hist.filter(x => x !== 'chat'); go('chats', {replace:true}); toast('Chat deleted.'); },
  });
  try { render(); } catch(e) {}
})();

/* ===== V2 · Group creation v2: sectioned picker, compact form + settings, welcome card, Invite link ===== */
(function(){
const slugOf = n => (n||'group').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,18) || 'group';
const tokenOf = () => Math.random().toString(36).slice(2, 8);
const linkOf = g => { if (!g.linkTok) g.linkTok = tokenOf(); return `youapp.ai/g/${slugOf(g.name)}-${g.linkTok}`; };
const autoName = f => { const ns = (f.mem||[]).filter(m=>m.k!=='me').map(m=>(GP(m.k)||{n:''}).n.split(' ')[0]); return ns.length ? (ns.length > 2 ? `${ns.slice(0,2).join(', ')} & ${ns.length-1} others` : `${ns.join(', ')} & you`) : 'e.g. Weekend Pickleball Crew'; };

/* ---------- A. picker: action rows + Recent chats + A–Z ---------- */
const _gpk2 = V.gpick;
V.gpick = () => { let h = _gpk2(); const f = S.gf; if (!f || (S.gq||'').trim()) return h;
  const recentNames = C6().convs.filter(v => !v.group).map(v => v.name);
  const rowsStart = h.indexOf('<div class="scroll gpk-list">'); if (rowsStart < 0) return h;
  const listOpen = '<div class="scroll gpk-list">'; const listEnd = h.indexOf('</div>\n      <div class="cta">', rowsStart); if (listEnd < 0) return h;
  const rowsHTML = h.slice(rowsStart + listOpen.length, listEnd);
  const rows = rowsHTML.split(/(?=<button class="gpk-row)/).filter(x => x.startsWith('<button class="gpk-row'));
  const keyOf = r => (r.match(/data-k="([^"]+)"/)||[])[1];
  const recent = rows.filter(r => { const p = GP(keyOf(r)); return p && recentNames.includes(p.n); });
  const rest = rows.filter(r => !recent.includes(r));
  const sec = (t, list) => list.length ? `<p class="gx-sl gc-sl">${t}</p>${list.join('')}` : '';
  const body = sec('Recent chats', recent) + sec('YouApp Friends', rest);
  return h.slice(0, rowsStart + listOpen.length) + body + h.slice(listEnd); };

/* ---------- B. compact form ---------- */
V.gform = () => { const f = S.gf; const edit = f.mode === 'edit'; const g = edit ? grp() : null; const role = g ? myRole(g) : 'owner';
  const pic = f.photo ? img(f.photo, 'Group photo') : (f.name && edit) ? `<b>${esc(gIni(f.name))}</b>` : ic('camera');
  const mem = f.mem || [];
  const strip = `<div class="gc-strip">${edit ? '' : `<button class="gc-add" data-act="gFormAdd" aria-label="Add members"><span>${ic('plus')}</span><small>Add</small></button>`}${mem.map(m => { const p = person(m); return `<span class="gc-m">${img(p.av, p.n)}${!edit && m.k !== 'me' ? `<button class="gc-rm" data-act="gFormRm" data-k="${m.k}" aria-label="Remove ${esc(p.n)}">${ic('close')}</button>` : ''}<small>${esc(m.k==='me' ? 'You' : p.n.split(' ')[0])}</small></span>`; }).join('')}</div>`;
  const canSet = !edit || role === 'owner';
  const settings = canSet ? `<p class="gx-sl">Settings</p><div class="gx-sg gc-set">
      <button class="gx-sr" data-act="gfPerm"><span class="gx-si">${ic('shield')}</span><span><b>Group permissions</b><small>What members can do</small></span>${ic('chev')}</button>
</div>` : '';
  return `<div class="screen">${statusBar()}${topBar(edit ? 'Edit group' : 'New group')}<div class="scroll" style="padding:8px 16px ${edit ? 24 : 110}px">
    <div class="gc-id ${edit ? '' : 'gc-hint'}"><button class="gc-pic ${f.photo?'has':''}" data-act="gPhotoMenu" aria-label="${f.photo?'Change':'Add'} group photo">${pic}<i>${ic('camera')}</i></button>
      <div class="field ${S.gfErr?'err':''}">${edit ? `<label for="gfName">Group name <span class="gx-req">*</span></label>` : ''}<input id="gfName" class="input" data-gm="gfName" value="${esc(f.name)}" placeholder="Group name" ${edit ? '' : 'aria-label="Group name"'} aria-describedby="gfNameH" maxlength="40" autocomplete="off"><span class="helper ${S.gfErr?'gerr':''}" id="gfNameH">${S.gfErr ? `${ic('alert')}Enter the group name` : `<span id="gfNameN">${f.name.length}</span>/40`}</span></div></div>
    <div class="field" style="margin-top:14px"><label for="gfBio">Description <span class="gc-opt">(optional)</span></label><textarea id="gfBio" class="input" data-gm="gfBio" rows="4" maxlength="300" placeholder="What is this group about?">${esc(f.bio)}</textarea></div>
    <p class="gx-sl">Members · ${mem.length}</p>${strip}
    ${settings}</div>
    ${edit ? `<div class="cta">${btn('Save Changes', 'gSaveAsk')}</div>` : `<button class="gc-fab" data-act="gCreate" aria-label="Create group"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`}</div>`; };
document.addEventListener('input', e => { if (e.target.id === 'gfName') { const n = document.getElementById('gfNameN'); if (n) n.textContent = e.target.value.length; } });

/* permissions from the form (before the group exists) */
A.gfPerm = () => { const f = S.gf; const base = f.mode === 'edit' ? grp().perm : (f.perm || GPERM0()); S.gp = JSON.parse(JSON.stringify(base)); S.gMediaOpen = false; S.gpFor = f.mode === 'edit' ? null : 'form'; go('gperm'); };
A.gPermSave = (orig => el => { if (S.gpFor === 'form') { S.gf.perm = S.gp; S.gpFor = null; back(); toast('Permissions set for the new group.'); return; } orig(el); })(A.gPermSave);

/* ---------- C. create: settings carried over + welcome card ---------- */
A.gCreate = (orig => el => { if (S.screen !== 'gform') return; const f = S.gf; orig(el); const g = grp(); if (!g || S.gfErr) return;
  if (f.perm) g.perm = f.perm; g.welcome = true; linkOf(g); render(); })(A.gCreate);
A.gCreate = (orig => el => { orig(el); if (S.screen === 'gform' && S.gfErr) { const n = document.getElementById('gfName'); if (n) n.focus({preventScroll:true}); } })(A.gCreate);

const _chatGc = V.chat;
V.chat = () => { let h = _chatGc(); let c; try { c = conv(); } catch(e) { return h; }
  if (!c || !c.group || !c.welcome || c.gone || !['owner','admin'].includes(myRole(c))) return h;
  const card = `<div class="gc-wel" role="region" aria-label="Group created"><button class="gc-x" data-act="gcWelX" aria-label="Dismiss">${ic('close')}</button><b>Group created</b><span>Invite people with a link or QR, and add a description so they know what it’s about.</span>
    <div class="gx-two"><button class="b1" data-act="gcInvite">${ic('link')}Invite link</button><button class="b2" data-act="gcDesc">${ic('pen')}${c.bio ? 'Edit description' : 'Add description'}</button></div></div>`;
  return h.replace('<p class="sysline">Today</p>', '<p class="sysline">Today</p>' + card); };
Object.assign(A, {
  gcWelX: () => { const c = conv(); c.welcome = false; render(); },
  gcInvite: () => { const c = conv(); S.gid = c.id; c.welcome = false; S.ginvFrom = 'chat'; go('ginvite'); },
  gcDesc: () => { const c = conv(); S.gid = c.id; c.welcome = false; A.gEdit(); setTimeout(() => { const b = document.getElementById('gfBio'); if (b) b.focus({preventScroll:true}); }, 30); },
});

/* ---------- D. Invite link screen ---------- */
const qr = tok => { let h = 0; const N = 25, cells = []; for (let i = 0; i < tok.length; i++) h = (h * 31 + tok.charCodeAt(i)) >>> 0;
  const fp = (x, y) => (x < 7 && y < 7) || (x >= N-7 && y < 7) || (x < 7 && y >= N-7);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (fp(x, y)) continue; h = (h * 1103515245 + 12345) >>> 0; if ((h >>> 16) & 1) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`); }
  const eye = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x+1}" y="${y+1}" width="5" height="5" fill="#fff"/><rect x="${x+2}" y="${y+2}" width="3" height="3"/>`;
  return `<svg viewBox="-1 -1 27 27" role="img" aria-label="Group invite QR code"><rect x="-1" y="-1" width="27" height="27" fill="#fff"/><g fill="#1E1050">${cells.join('')}${eye(0,0)}${eye(N-7,0)}${eye(0,N-7)}</g></svg>`; };
/* 26 Nov: laid out like Refer a Friend (Figma YouApp-3.0 3719:115757), in group terms:
   purple header with the group, a "joins right away" card (Reset link for admins), gradient QR with the group code,
   link pill, Save QR / Share link, then the members. */
const GQ_ART = `<svg class="gq-art" viewBox="0 0 160 128" fill="none" aria-hidden="true">
  <path d="M18 34l9-5M46 14l3 9M128 20l7 6M108 8l-2 9M150 58l-9 2" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
  <path d="M84 22l2.6 6.4L93 31l-6.4 2.6L84 40l-2.6-6.4L75 31l6.4-2.6zM140 34l1.8 4.2 4.2 1.8-4.2 1.8L140 46l-1.8-4.2-4.2-1.8 4.2-1.8z" fill="#fff" fill-opacity=".45"/>
  <circle cx="98" cy="74" r="18" fill="#fff" fill-opacity=".16"/><circle cx="134" cy="78" r="14" fill="#fff" fill-opacity=".12"/><circle cx="64" cy="80" r="14" fill="#fff" fill-opacity=".12"/>
  <path d="M60 128c4-22 20-34 38-34s34 12 38 34z" fill="#fff" fill-opacity=".14"/>
  <path d="M38 128c3-16 14-25 26-25 7 0 13 3 18 8M158 128c-3-16-12-25-24-25-7 0-13 3-18 8" stroke="#fff" stroke-opacity=".14" stroke-width="10" stroke-linecap="round"/></svg>`;
const qrGrad = tok => qr(tok).replace('<g fill="#1E1050">', '<defs><linearGradient id="gqGrad" x1="0" y1="0" x2="25" y2="25" gradientUnits="userSpaceOnUse"><stop stop-color="#9A6BBF"/><stop offset="1" stop-color="#3D1C96"/></linearGradient></defs><g fill="url(#gqGrad)">');
V.ginvite = () => { const g = grp(); if (!g) return V.chats(); const link = linkOf(g); const admin = ['owner','admin'].includes(myRole(g));
  const n = g.mem.length; const order = {owner:0, admin:1, member:2};
  const mem = [...g.mem].sort((a, b) => (a.k === 'me' ? -1 : b.k === 'me' ? 1 : (order[a.role] ?? 2) - (order[b.role] ?? 2)));
  const role = {owner:'Owner', admin:'Admin'};
  const rows = mem.slice(0, 5).map(m => { const p = GP(m.k) || {}; return `<div class="gq-mem">${img(p.av, p.n, 'gq-av')}<span><b>${esc(m.k === 'me' ? 'You' : p.n || '')}</b><small>${esc(p.u || '')}</small></span>${role[m.role] ? `<i class="gq-role">${role[m.role]}</i>` : ''}</div>`; }).join('');
  return `<div class="screen">${statusBar()}${topBar('Invite link')}<div class="scroll gq" style="padding:0 0 24px">
    <div class="gq-head">${GQ_ART}${gAv(g, 'gq-hav')}<span class="gq-hid"><b>${esc(g.name)}</b><small>${n} member${n === 1 ? '' : 's'}</small><i>Group</i></span></div>
    <div class="gq-body">
      <div class="gq-info"><span class="gq-ic">${ic('link')}</span><span><b>Anyone with the link joins</b><small>${admin ? 'No approval needed.' : 'No approval needed. Only admins can reset it.'}</small></span>${admin ? `<button class="gq-pill" data-act="gcReset">Reset link</button>` : ''}</div>
      <div class="gq-card">
        <div class="gq-qr">${qrGrad(g.linkTok + g.id)}<span class="gq-mark" aria-hidden="true">${gAv(g, 'gc-qav')}</span></div>
        <p class="gq-code"><span>Group</span> Code<b>${esc(String(g.linkTok).toUpperCase())}</b></p>
        <div class="gq-link">${ic('link')}<span>${link}</span><button data-act="gcCopy" aria-label="Copy group link">${ic('copy')}</button></div>
        <div class="gq-two"><button class="gq-out" data-act="gcSaveQr">${ic('download')}Save QR</button><button class="gq-fill" data-act="extShare">${ic('share')}Share link</button></div>
      </div>
      <div class="gq-mh"><b>Members</b><span><b>${n}</b> member${n === 1 ? '' : 's'}</span></div>
      <div class="gq-list">${rows}${n > 5 ? `<button class="link gq-all" data-act="gInfo">See all in Group info</button>` : ''}</div>
    </div>
  </div></div>`; };
{ const st = document.createElement('style'); st.textContent = `
  .gq-head{position:relative; overflow:hidden; display:flex; align-items:center; gap:14px; min-height:128px; padding:18px 16px; background:linear-gradient(100deg,#9A6BBF 0%,#6A3FB8 48%,#3D1C96 100%); color:#fff}
  .gq-art{position:absolute; right:-6px; bottom:0; width:168px; height:auto; pointer-events:none}
  .gq-head .gav.gq-hav{position:relative; width:64px; height:64px; border-radius:20px; box-shadow:0 0 0 3px rgba(255,255,255,.85)} .gq-head .gav.gq-hav b{font-size:28px}
  .gq-hid{position:relative; display:grid; gap:2px; min-width:0; justify-items:start}
  .gq-hid b{font:700 18px/1.3 Inter, sans-serif; color:#fff; overflow-wrap:anywhere; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden}
  .gq-hid small{font:500 13px Inter, sans-serif; color:rgba(255,255,255,.82)}
  .gq-hid i{margin-top:4px; padding:2px 10px; border-radius:999px; background:rgba(255,255,255,.22); font:600 11.5px/18px Inter, sans-serif; font-style:normal; color:#fff}
  .gq-body{padding:16px 16px 0}
  .gq-info{display:flex; align-items:center; gap:12px; padding:14px; border:1px solid #ECE7F7; border-radius:16px; background:#fff}
  .gq-ic{flex:none; display:grid; place-items:center; width:40px; height:40px; border-radius:12px; background:#F4EFFF; color:#4B2A9E} .gq-ic .ico{width:20px; height:20px}
  .gq-info > span:nth-child(2){flex:1; min-width:0} .gq-info b{display:block; font:700 14.5px Inter, sans-serif; color:#1E1050} .gq-info small{display:block; margin-top:2px; font:500 12px/16px Inter, sans-serif; color:#6E6688}
  .gq-pill{flex:none; height:34px; padding:0 12px; border:0; border-radius:999px; background:linear-gradient(100deg,#9A6BBF,#3D1C96); color:#fff; font:700 13px Inter, sans-serif; cursor:pointer}
  .gq-card{margin-top:12px; padding:16px; border:1px solid #ECE7F7; border-radius:16px; background:#fff; text-align:center}
  .gq-qr{position:relative; width:220px; max-width:100%; aspect-ratio:1; margin:0 auto} .gq-qr svg{width:100%; height:100%; display:block}
  .gq-mark{position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); padding:4px; border-radius:14px; background:#fff; display:grid}
  .gq-mark .gav.gc-qav{width:40px; height:40px; border-radius:11px} .gq-mark .gav.gc-qav b{font-size:18px}
  .gq-code{margin:12px 0 0; font:700 14px/20px Inter, sans-serif; color:#3D1C96} .gq-code span{color:#9A6BBF} .gq-code b{display:block; font:800 16px/22px Inter, sans-serif; letter-spacing:.5px; color:#3D1C96}
  .gq-link{display:flex; align-items:center; gap:8px; margin:14px 0 12px; padding:6px 6px 6px 12px; border-radius:999px; background:#F4EFFF; color:#4B2A9E}
  .gq-link > .ico{width:18px; height:18px; flex:none} .gq-link span{flex:1; min-width:0; text-align:left; font:500 12.5px Inter, sans-serif; color:#3D1C96; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
  .gq-link button{flex:none; display:grid; place-items:center; width:36px; height:36px; border:0; border-radius:999px; background:none; color:#4B2A9E; cursor:pointer} .gq-link button .ico{width:18px; height:18px}
  .gq-two{display:flex; gap:10px} .gq-two button{flex:1; min-width:0; height:46px; display:flex; align-items:center; justify-content:center; gap:7px; border-radius:999px; font:700 14.5px Inter, sans-serif; cursor:pointer} .gq-two .ico{width:18px; height:18px}
  .gq-out{border:1.5px solid #3D1C96; background:#fff; color:#3D1C96} .gq-fill{border:0; background:linear-gradient(100deg,#9A6BBF,#3D1C96); color:#fff}
  .gq-mh{display:flex; align-items:baseline; justify-content:space-between; margin:20px 2px 8px} .gq-mh > b{font:700 16px Inter, sans-serif; color:#1E1050} .gq-mh span{font:500 13px Inter, sans-serif; color:#6E6688} .gq-mh span b{color:#1E1050}
  .gq-mem{display:flex; align-items:center; gap:12px; padding:8px 2px} .gq-av{width:42px; height:42px; border-radius:50%; object-fit:cover; flex:none}
  .gq-mem > span{flex:1; min-width:0} .gq-mem b{display:block; font:600 14.5px Inter, sans-serif; color:#1E1050} .gq-mem small{display:block; font:500 12px Inter, sans-serif; color:#6E6688}
  .gq-role{padding:3px 10px; border-radius:999px; background:#F4EFFF; font:700 11.5px/16px Inter, sans-serif; font-style:normal; color:#4B2A9E}
  .gq-all{display:block; margin:6px auto 0}
  .gq button:focus-visible{outline:2px solid #5E35B8; outline-offset:2px}
  @media (max-width:340px){ .gq-two button{font-size:13.5px} }`; document.head.appendChild(st); }
A.gcCopy = () => { const g = grp(); try { navigator.clipboard.writeText('https://' + linkOf(g)).catch(()=>{}); } catch(e) {} toast('Group link copied.'); };
A.gcSaveQr = () => toast('QR code saved to your photos.');
A.gcReset = () => { S.dialog = 'gcReset'; render(); };
A.gcResetOk = () => { const g = grp(); g.linkTok = tokenOf(); S.dialog = null; gMsg(g, '<b>You</b> reset the group invite link'); render(); toast('New link created. The old one no longer works.'); };
const _ovGc = overlayHTML;
overlayHTML = () => { let h = _ovGc();
  if (S.dialog === 'gcReset') h += gModal('alert', 'Reset invite link?', 'The current link and QR code stop working. People already in the group stay.', ['Reset link','gcResetOk'], ['Cancel','closeDialog']);
  if (S.sheet === 'gMenu') h = h.replace(/(<div class="gx-sg">)(<button class="gx-sr[^"]*" data-act="gEdit")/, `$1<button class="gx-sr" data-act="gcMenuInvite"><span class="gx-si">${ic('link')}</span><span><b>Invite link</b><small>Link, QR and who can join</small></span>${ic('chev')}</button>$2`);
  return h; };
A.gcMenuInvite = () => { S.sheet = null; S.ginvFrom = 'info'; go('ginvite'); };

/* style scope + panel notes */
const _rgGc = render;
render = function(){ _rgGc(); const ph = document.getElementById('phone'); if (ph && S.screen === 'ginvite') { ph.classList.add('gxs', 'gx-ginvite'); ph.querySelectorAll('[data-act="back"] .ico').forEach(e => { e.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'; }); } };
Object.assign(META, {
  ginvite:{name:'Group · Invite link', group:'Group chat', rules:['QR + link with copy, Save QR, Share link. Anyone with the link joins right away (no approval)','Admins: Reset link (old link stops working)','Opened from the welcome card in a new group and the group ⋮ menu']},
});
if (META.gpick) META.gpick.rules = [...(META.gpick.rules||[]), 'List: Recent chats, then friends A–Z'];
if (META.gform) META.gform.rules = [...(META.gform.rules||[]), 'Photo + name on one row (name required, 40 chars), optional description, members as an avatar strip, Settings: Group permissions. Everyone added joins right away'];
try { render(); } catch(e) {}
})();

/* shell Quick scenario: open the group Invite link screen */
appEntryRoutes.gInvite = (open, context) => {
  scen.gList = 'has';
  scen.gRole ||= 'owner';
  saveScen();
  C6();
  S.gid = 'g-sera';
  S.conv = 'g-sera';
  S.ginvFrom = 'info';
  return open('ginvite', context);
};

/* picker: messenger-style round next button instead of the full-width pill */
(function(){
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const _gpk3 = V.gpick;
  V.gpick = () => { let h = _gpk3(); const f = S.gf; if (!f) return h;
    if (f.mode !== 'add' && f.mode !== 'fadd' && scen.gContacts === 'none') return h;  /* empty-state screen keeps its own button */
    const add = f.mode === 'add', n = (f.sel||[]).length; const dis = add && !n;
    const label = add ? (n ? `Add ${n} member${n>1?'s':''}` : 'Select people to add') : f.mode === 'fadd' ? 'Done' : 'Next';
    const fab = `<button class="gc-fab" data-act="${add ? 'gAddGo' : 'gPickNext'}" aria-label="${label}" ${dis ? 'aria-disabled="true"' : ''}>${add || f.mode === 'fadd' ? CHECK : ARROW}${n ? `<i>${n}</i>` : ''}</button>`;
    return h.replace(/<div class="cta">[\s\S]*?<\/div><\/div>\s*$/, `${fab}</div>`); };
  A.gAddGo = (orig => el => { if (!(S.gf && (S.gf.sel||[]).length)) { toast('Select at least one person to add.'); return; } orig(el); })(A.gAddGo);
  try { render(); } catch(e) {}
})();

/* picker: keep the newest selected chip in view (single scroll row under the search) */
(function(){ const _rG = render; render = function(){ const prev = document.querySelector('.gpk-chips'); const n0 = prev ? prev.children.length : 0; const sl = prev ? prev.scrollLeft : 0; _rG.apply(this, arguments);
  const c = document.querySelector('.gpk-chips'); if (!c) return; if (c.children.length > n0) c.scrollLeft = c.scrollWidth; else c.scrollLeft = sl; }; })();

/* picker: picking someone from search results clears the query and keeps the cursor in search (WhatsApp/Telegram) */
A.gPickTog = (orig => el => { const fromList = el && !el.classList.contains('gpk-chip'); const hadQ = !!(S.gq || '').trim(); orig(el);
  if (fromList && hadQ) { S.gq = ''; render(); const q = document.getElementById('gq'); if (q) q.focus({preventScroll:true}); } })(A.gPickTog);

/* ===== V2 · Group info, simple style (centred identity, round quick actions, ⋮ popover like personal chat) ===== */
(function(){
  const _giOld = V.ginfo;
  const roleTxt = {owner:'Owner', admin:'Admin'};
  V.ginfo = () => { const g = grp(); if (!g) return V.chats(); const r = myRole(g); const admin = r === 'owner' || r === 'admin';
    const n = g.mem.length; const nTxt = `${n} member${n === 1 ? '' : 's'}`;
    const bioLong = (g.bio || '').length > 90;
    const bio = g.bio ? `<p class="gi2-bio">${esc(S.gBioOpen || !bioLong ? g.bio : g.bio.slice(0, 88) + '…')}${bioLong ? ` <button class="link" data-act="gBioTog">${S.gBioOpen ? 'Less' : 'More'}</button>` : ''}</p>` : '';
    const acts = [...(canShare(g) ? [['link', 'Invite', 'gcMenuInvite', '']] : []), ['apGift', 'Red packet', 'giRed', 'rp'], ['search', 'Search', 'giSearch', ''], [g.muted ? 'cmMuted' : 'cmMute', g.muted ? 'Unmute' : 'Mute', 'giMute', '']];
    let link = '';
    const L = window.__actLinkOf && window.__actLinkOf(g);
    if (L) link = `<button class="act-link gi2-act" data-act="${L.act}" data-id="${L.id}">${img(L.img, L.title, 'act-th')}<span><small>Linked activity</small><b>${esc(L.title)}</b><em>${L.run ? 'Running · leave locked until it ends' : 'All sessions ended'}</em></span>${ic('chev')}</button>`;
    const nMedia = g.id === 'g-sera' ? 9 : g.id === 'g-products' ? 3 : 0;
    const order = {owner:0, admin:1, member:2};
    const mems = [...g.mem].sort((a, b) => (a.k === 'me' ? -1 : b.k === 'me' ? 1 : order[roleOf(g, a)] - order[roleOf(g, b)]));
    const LIM = 8; const shown = S.giAll ? mems : mems.slice(0, LIM);
    const row = m => { const p = person(m); const ro = roleOf(g, m); const me = m.k === 'me';
      const inner = `${img(p.av, p.n, 'gi2-av40')}<span class="gi2-mt"><b>${esc(me ? 'You' : p.n)}</b><small>${esc(p.u)}</small></span>${roleTxt[ro] ? `<span class="gi2-role ${ro}">${roleTxt[ro]}</span>` : ''}`;
      return me ? `<div class="gi2-mem">${inner}</div>` : `<button class="gi2-mem" data-act="gMemMenu" data-k="${m.k}" aria-label="${esc(p.n)}, options">${inner}</button>`; };
    const danger = `<div class="gi2-sec">
        <button class="gi2-row dng" data-act="gLeave">${ic('logout')}<span>Exit group</span></button>
        <button class="gi2-row dng" data-act="giReport">${ic('flag')}<span>Report group</span></button></div>`;
    return `<div class="screen gi2">${statusBar()}
      <div class="gi2-top"><button class="gi2-ib" data-act="back" aria-label="Back">${ic('back')}</button><b>Group info</b><button class="gi2-ib" data-act="giMenu" aria-label="Group options" aria-haspopup="menu">${ic('dots')}</button></div>
      <div class="scroll gi2-scroll">
        <div class="gi2-id"><button class="gi2-pic" data-act="gPicView" aria-label="View group photo">${g.photo ? img(g.photo, 'Group photo') : `<b>${esc(gLet(g))}</b>`}</button>
          <h1>${esc(g.name)}</h1><small>${nTxt}${g.created ? ` · Created ${esc(g.created)}` : ''}</small>${bio}</div>
        <div class="gi2-acts n${acts.length}">${acts.map(([i, t, a, c]) => `<button data-act="${a}"><i class="${c}">${c === 'rp' ? RP_ICON : ic(i)}</i><span>${t}</span></button>`).join('')}</div>
        ${link}
        <div class="gi2-sec"><button class="gi2-row" data-act="giMedia">${ic('image')}<span>Media &amp; files</span><em>${nMedia || ''}</em>${ic('chev')}</button></div>
        <p class="gi2-sl">Members · ${n}</p>
        <div class="gi2-sec">${canAdd(g) ? `<button class="gi2-mem gi2-add" data-act="gAddMem"><span class="gi2-plus">${ic('plus')}</span><span class="gi2-mt"><b>Add member</b></span></button>` : ''}${shown.map(row).join('')}
          ${mems.length > LIM ? `<button class="gi2-more" data-act="giAll">${S.giAll ? 'Show less' : `See all (${mems.length})`}</button>` : ''}</div>
        ${danger}
      </div></div>`; };

  /* Media, links & files: the old Members/Media/Files tabs live here now */
  V.gimedia = () => { const g = grp(); if (!g) return V.chats(); const tab = S.gmtab || 'media';
    const tabs = [['media','Media'],['files','Files']];
    const body = tab === 'media'
      ? (g.id === 'g-sera' ? `<div class="gmedia">${['gal1','gal2','act3','act4','exp2'].map(k => `<span>${img(k, 'Shared photo')}</span>`).join('')}</div>` : g.id === 'g-products' ? `<div class="gmedia">${['gal1','act3'].map(k => `<span>${img(k, 'Shared media')}</span>`).join('')}</div>` : `<div class="gtabempty">${ic('image')}<span>No media shared yet</span></div>`)
      : (g.id === 'g-sera' ? `<div class="gfiles">${[0,1,2,3].map(() => `<div class="gfile"><span class="gfic">${ic('file')}</span><span class="cm"><b>Document.docx</b><small>9.2MB, 04 Dec 2026 at 10:12</small></span><button class="iconbtn" data-act="toast" data-msg="Downloads Document.docx to your phone." aria-label="Download Document.docx">${ic('download')}</button></div>`).join('')}</div>` : g.id === 'g-products' ? `<div class="gfiles"><div class="gfile"><span class="gfic">${ic('file')}</span><span class="cm"><b>YouApp_Group_Features.pdf</b><small>1.8 MB · Today at 09:07</small></span><button class="iconbtn" data-act="toast" data-msg="Downloading YouApp_Group_Features.pdf…" aria-label="Download YouApp Group Features PDF">${ic('download')}</button></div></div>` : `<div class="gtabempty">${ic('file')}<span>No files shared yet</span></div>`);
    return `<div class="screen">${statusBar()}${topBar("Media & files")}<div class="scroll" style="padding:4px 16px 24px"><div class="gtabs n2" role="tablist">${tabs.map(([k, t]) => `<button role="tab" aria-selected="${tab === k}" data-act="giMTab" data-k="${k}">${t}</button>`).join('')}</div>${body}</div></div>`; };

  if (typeof META === 'object') { META.gimedia = {name:"Media & files", group:'V2 · Group chat', rules:['Opened from Group info › Media & files','Media and Files tabs, empty states when nothing is shared']};
    if (META.ginfo) META.ginfo.rules = ['Centred identity: photo or initial, name, member count, description','Quick actions: Invite (if allowed), Red packet, Search, Mute','⋮ menu uses the personal chat popover: Edit group, Invite link, Mute, Search, Group permissions (owner), Clear history, Delete group (owner)','Members: you first, then owner/admins; Add member on top; tap a member for Message / Make admin / Remove; See all after 8','Exit and Report stay at the bottom; Exit is locked while a linked activity is running']; }

  const toConv = () => { const g = grp(); if (g) S.conv = g.id; return g; };
  Object.assign(A, {
    giMenu: () => { S.sheet = 'giMenu'; S.sheetAnim = true; render(); },
    giRed: () => { toConv(); A.apAttach(); },
    giSearch: () => { S.sheet = null; render(); toast('Search in chat follows the current app.'); },
    giMute: () => { const g = grp(); g.muted = !g.muted; S.sheet = null; render(); toast(g.muted ? 'Notifications muted for this group.' : 'Notifications turned on.'); },
    giMedia: () => { S.gmtab = 'media'; go('gimedia'); },
    giMTab: el => { S.gmtab = el.dataset.k; render(); },
    giAll: () => { S.giAll = !S.giAll; render(); },
    giReport: () => { toConv(); A.openReport(); },
    giEdit: () => { S.sheet = null; A.gEdit(); },
    giInvite: () => { S.sheet = null; A.gcMenuInvite(); },
    giPerm: () => { S.sheet = null; A.gPerm(); },
    giClear: () => { toConv(); A.cmClear(); },
  });
  const _gInfoGi = A.gInfo; A.gInfo = el => { S.giAll = false; _gInfoGi(el); };

  const _ovGi = overlayHTML;
  overlayHTML = () => { let h = _ovGi();
    if (S.sheet === 'giMenu' && S.screen === 'ginfo') { const g = grp(); if (!g) return h; const r = myRole(g); const admin = r === 'owner' || r === 'admin';
      const row = (act, i, t, cls = '') => `<button class="cm-row ${cls}" role="menuitem" data-act="${act}">${ic(i)}<span>${t}</span></button>`;
      h += `<div class="cm-scrim" data-act="cmClose"></div><div class="cm-pop gi2-pop ${S.sheetAnim ? 'anim' : ''}" role="menu" aria-label="Group options">
        ${row('giMute', g.muted ? 'cmMuted' : 'cmMute', g.muted ? 'Unmute' : 'Mute')}
        <i class="cm-sep"></i>
        ${admin ? row('giEdit', 'pen', 'Edit group') : ''}
        ${canShare(g) ? row('giInvite', 'link', 'Invite link') : ''}
        ${row('giSearch', 'search', 'Search')}
        ${r === 'owner' ? row('giPerm', 'shield', 'Group permissions') : ''}
        ${row('giClear', 'cmBroom', 'Clear history')}
        ${r === 'owner' ? `<i class="cm-sep"></i>${row('gDisband', 'trash', 'Delete group')}` : ''}</div>`; }
    return h; };

  /* new groups remember when they were made */
  const _gcGi = A.gCreate; A.gCreate = el => { const before = S.screen; _gcGi(el); const g = grp(); if (before === 'gform' && S.screen !== 'gform' && g && !g.created) g.created = 'today'; };
  try { render(); } catch(e) {}
})();

/* Chat is a real scroll surface: state-only re-renders must never jump it to the top. */
(function(){
  const _renderKeepChatScroll = render;
  render = function(){
    const old = document.getElementById('chatScroll');
    const sameChat = old && (S.screen === 'chat' || S.screen === 'bchat');
    const top = sameChat ? old.scrollTop : null;
    const fromBottom = sameChat ? old.scrollHeight - old.clientHeight - old.scrollTop : null;
    const wasAtBottom = fromBottom !== null && fromBottom < 28;
    _renderKeepChatScroll.apply(this, arguments);
    if (top === null) return;
    const next = document.getElementById('chatScroll');
    if (!next) return;
    next.scrollTop = wasAtBottom ? next.scrollHeight : Math.min(top, Math.max(0, next.scrollHeight - next.clientHeight));
  };
})();

/* Red Packet icon shared by the chat attach panel and Group info (purple + red packets, 25 Nov) */
const RP_ICON = `<svg viewBox="0.75 0.9 22 22" width="30" height="30" aria-hidden="true"><path d="M10.2 5.6l10.3 2.1-2.9 14.1-10.3-2.1z" fill="#38168E"/><path d="M11.6 7.9l7 1.4-2.2 10.6-7-1.4" fill="none" stroke="#C9B8F2" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="2" width="11" height="17" rx="1.2" fill="#E5484D"/><path d="M3 3.2A1.2 1.2 0 0 1 4.2 2h8.6A1.2 1.2 0 0 1 14 3.2v1.6L12.4 6H4.6L3 4.8z" fill="#B42335"/><path d="M5 7.6v8.9h7V7.6" fill="none" stroke="#FFD6DA" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 8c1.3 1 1.2 2-.1 3.1s-1 2.3.2 3.1" fill="none" stroke="#B42335" stroke-width=".8" stroke-linecap="round"/><circle cx="8.5" cy="5.4" r="2.1" fill="#5E35B8" stroke="#fff" stroke-width=".6"/><path d="M8.5 4.5l.9.9-.9.9-.9-.9z" fill="#fff"/></svg>`;
/* ---- Attach panel (25 Nov): opens under the composer like the live app, not a dimmed bottom sheet.
   One row of round tiles: Red Packet first (when the chat allows it), then Gallery, Camera, Document, Location.
   No GIF. Tap the paperclip again, tap the chat, pick an item, or press Esc to close. Chat stays visible and usable. ---- */
(() => {
  const P = d => `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${d}"/></svg>`;
  const TILE = {
    attachGal: ['Gallery', P('M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm1.5 4a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM19 15.6l-3.3-3.3a1 1 0 0 0-1.4 0L9 17.6l-1.3-1.3a1 1 0 0 0-1.4 0L5 17.6V17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1.4Z')],
    attachCam: ['Camera', P('M9.2 3.5h5.6a2 2 0 0 1 1.8 1.1l.7 1.4H19a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h1.7l.7-1.4a2 2 0 0 1 1.8-1.1ZM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z')],
    cxDocs: ['Document', P('M7 2h6.6a2 2 0 0 1 1.4.6l4.4 4.4a2 2 0 0 1 .6 1.4V19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm6 1.8V7a2 2 0 0 0 2 2h3.2L13 3.8ZM8 12.2a.9.9 0 0 0 0 1.8h8a.9.9 0 0 0 0-1.8H8Zm0 3.6a.9.9 0 0 0 0 1.8h5a.9.9 0 0 0 0-1.8H8Z')],
    cxLoc: ['Location', P('M12 2a8 8 0 0 1 8 8c0 5.2-6 10.6-7.3 11.7a1.1 1.1 0 0 1-1.4 0C10 20.6 4 15.2 4 10a8 8 0 0 1 8-8Zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z')],
    /* Red Packet: two packets (back purple, front red) with a purple seal, recoloured from the reference icon to fit the app (25 Nov) */
    apAttach: ['Red Packet', RP_ICON]
  };
  const ORDER = ['apAttach', 'attachGal', 'attachCam', 'cxDocs', 'cxLoc'];   /* Red Packet first (25 Nov) */
  const SHEET = /<div class="scrim[^"]*" data-act="closeSheet2"><\/div><div class="sheet[^"]*" role="dialog" aria-label="Attach"><div class="grab" aria-hidden="true"><\/div><div style="display:grid">([\s\S]*?)<\/div><\/div>/;
  const _ovAt = overlayHTML;
  overlayHTML = () => { let h = _ovAt();
    if (S.sheet !== 'cAttach') return h;
    const m = h.match(SHEET); if (!m) return h;
    const acts = [...m[1].matchAll(/data-act="([^"]+)"/g)].map(x => x[1]);
    if (acts.includes('attachGal')) acts.push('cxLoc');           /* Location sits with the media items */
    const items = ORDER.filter(a => acts.includes(a) && TILE[a]);
    const tiles = items.map(a => `<button type="button" class="catt-b" data-act="${a}"><span class="catt-ic">${TILE[a][1]}</span><span class="catt-l">${TILE[a][0]}</span></button>`).join('');
    return h.replace(m[0], `<div class="catt ${S.sheetAnim ? 'anim' : ''}" id="cAttPanel" role="group" aria-label="Attach">${tiles}</div>`); };
  /* paperclip toggles the panel */
  A.cAttach = (orig => () => { if (S.sheet === 'cAttach') { closeSheet(); return; } orig(); })(A.cAttach);
  A.cxLoc = () => { S.sheet = null; toast('Shares your current location in the chat.'); };
  /* close when tapping outside the panel (chat, header, the message box) without re-rendering, so typing still works */
  const shut = () => { if (S.sheet !== 'cAttach') return; S.sheet = null; document.getElementById('cAttPanel')?.remove(); document.querySelector('[data-act="cAttach"]')?.setAttribute('aria-expanded', 'false'); };
  document.addEventListener('pointerdown', e => { if (S.sheet === 'cAttach' && !e.target.closest('#cAttPanel, [data-act="cAttach"]')) shut(); }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheet === 'cAttach') { shut(); document.querySelector('[data-act="cAttach"]')?.focus(); } });
  /* expose the open state on the paperclip */
  const _rAt = render;
  render = function(){ _rAt.apply(this, arguments); const b = document.querySelector('.cbar2 [data-act="cAttach"]'); if (b) { b.setAttribute('aria-expanded', S.sheet === 'cAttach' ? 'true' : 'false'); b.setAttribute('aria-controls', 'cAttPanel'); b.setAttribute('aria-label', 'Attach'); } };
  const css = document.createElement('style');
  css.textContent = `
  #phone .catt{position:absolute; left:12px; right:12px; bottom:22px; z-index:30; display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); gap:2px; padding:16px 6px 14px; border-radius:24px; background:var(--a-white,#fff); box-shadow:0 8px 28px rgba(30,16,80,.16), 0 0 0 1px rgba(30,16,80,.05)}
  #phone .catt.anim{animation:cattIn .18s ease-out}
  @keyframes cattIn{from{opacity:0; transform:translateY(12px)} to{opacity:1; transform:none}}
  @media (prefers-reduced-motion:reduce){ #phone .catt.anim{animation:none} }
  #phone .catt-b{display:flex; flex-direction:column; align-items:center; gap:8px; min-width:0; min-height:44px; padding:0; border:0; background:none; font:inherit; color:var(--a-ink,#1a181b); cursor:pointer}
  #phone .catt-ic{display:grid; place-items:center; width:56px; height:56px; border-radius:50%; background:#EDE6FA; color:#38168E; transition:transform .12s, background .12s}
  #phone .catt-b:active .catt-ic{transform:scale(.94); background:#E2D7F7}
  #phone .catt-b:focus-visible{outline:none} #phone .catt-b:focus-visible .catt-ic{outline:2px solid #5E35B8; outline-offset:2px}
  #phone .catt-l{font:500 12px/16px Inter, sans-serif; text-align:center; max-width:100%; overflow-wrap:anywhere}
  #phone:has(.catt) .cfoot{padding-bottom:150px}
  @media (max-width:340px){ #phone .catt{left:8px; right:8px; padding:14px 4px 12px; gap:2px} #phone .catt-ic{width:50px; height:50px} #phone .catt-l{font-size:11.5px; line-height:14px} #phone:has(.catt) .cfoot{padding-bottom:156px} }`;
  document.head.appendChild(css);
})();
