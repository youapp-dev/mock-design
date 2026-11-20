/* ===== V2 · Group chat flow uses the "wallet screens, redesigned" style (scoped class on #phone) ===== */
(function(){
  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const GXS = () => { const s = S.screen;
    if (['gpick','gform','gperm','gpic','apform','apconf','apdone','aplist'].includes(s)) return true;
    if (s === 'chat') { try { const c = conv(); return !!(c && c.group); } catch(e) { return false; } }
    return false; };
  const _rgx = render;
  render = function(){ _rgx(); const ph = document.getElementById('phone'); if (!ph) return; const on = GXS();
    ph.className = ph.className.replace(/\bgx-\w+/g, '').trim(); ph.classList.toggle('gxs', on); ph.classList.toggle('gxl', S.screen === 'chats' && S.ctab === 'group');
    if (on) { ph.classList.add('gx-' + S.screen);
      ph.querySelectorAll('[data-act="back"] .ico, [data-act="chatBack"] .ico').forEach(e => { e.innerHTML = CHEV; }); } };
  try { render(); } catch(e) {}
})();

/* ===== V2 · Create group picker: selection like a messenger "New Group" (chips + check badge on avatar, no checkbox) ===== */
(function(){
  const _gpk = V.gpick;
  V.gpick = () => { const f = S.gf;
    if (f.mode!=='add' && scen.gContacts==='none') return _gpk();
    const q = (S.gq||'').trim().toLowerCase(); const g = f.mode==='add' ? grp() : null;
    const all = GPEOPLE.filter(p => !(g && g.mem.some(m=>m.k===p.k)));
    const pool = all.filter(p => !q || p.n.toLowerCase().includes(q) || p.u.includes(q));
    const sel = f.sel.map(GP);
    const title = f.mode==='add' ? 'Add members' : 'Create group';
    const sub = sel.length ? `${sel.length} of ${all.length} selected` : (f.mode==='add' ? 'Choose people to add' : 'Members are optional');
    const head = `<div class="topbar gpk-top"><button class="iconbtn" data-act="back" aria-label="Back">${ic('back')}</button><span class="gpk-tt"><b>${title}</b><small>${sub}</small></span><span style="width:32px"></span></div>`;
    const chips = sel.length ? `<div class="gpk-chips">${sel.map(p=>`<button class="gpk-chip" data-act="gPickTog" data-k="${p.k}" aria-label="Remove ${esc(p.n)}">${img(p.av,p.n)}<span>${esc(p.n.split(' ')[0])}</span><i>${ic('close')}</i></button>`).join('')}</div>` : '';
    const search = `<label class="search gpk-search">${ic('search')}<input id="gq" data-gm="gq" value="${esc(S.gq||'')}" placeholder="Who would you like to add?" autocomplete="off">${S.gq?`<button class="iconbtn" style="margin:0" data-act="gqClear" aria-label="Clear search">${ic('xcircle')}</button>`:''}</label>`;
    const rows = pool.map(p => { const on = f.sel.includes(p.k);
      return `<button class="gpk-row ${on?'on':''}" data-act="gPickTog" data-k="${p.k}" aria-pressed="${on}"><span class="gpk-av">${img(p.av,p.n)}${on?`<i>${ic('check')}</i>`:''}</span><span class="cm"><b>${esc(p.n)} ${vbadge()}</b><small>${esc(p.u)}</small></span></button>`; }).join('');
    return `<div class="screen">${statusBar()}${head}<div class="gpk-head">${search}${chips}</div>
      <div class="scroll gpk-list">${rows}${!pool.length?stateBlock('search','No one found', q?`No one matches “${esc(S.gq)}”.`:'Everyone is already in this group.'):''}</div>
      <div class="cta">${btn(f.mode==='add'?`Add${f.sel.length?' ('+f.sel.length+')':''}`:`Continue${f.sel.length?' ('+f.sel.length+')':''}`, f.mode==='add'?'gAddGo':'gPickNext', {disabled:f.mode==='add' && !f.sel.length})}</div></div>`; };
  try { render(); } catch(e) {}
})();

/* ===== V2 · Group chat flow, full "wallet screens, redesigned" layout ===== */
(function(){
  const WM = '<svg class="gi-wm" viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="7"><circle cx="60" cy="60" r="54"/><path d="M60 98C40 80 34 52 60 22c26 30 20 58 0 76z"/><path d="M58 96C34 92 18 74 22 46c22 4 36 24 36 50zM62 96c24-4 40-22 36-50-22 4-36 24-36 50z"/></svg>';
  const sl = t => `<p class="gx-sl">${t}</p>`;
  const conn = (act, t, s) => `<button class="gx-conn" data-act="${act}"><span class="gx-ci">${ic('plus')}</span><span><b>${t}</b><small>${s}</small></span>${ic('chev')}</button>`;
  const empty = (i, t, s) => `<div class="gx-empty"><span>${ic(i)}</span><b>${t}</b><small>${s}</small></div>`;
  const ROLE_T = {owner:'Owner', admin:'Admin', member:'Member'};

  /* Group info: new layout reverted to the original hero (kept for reference) */
  const _giNew = () => { const g = grp(); if (!g) return V.chats(); const r = myRole(g); const tab = S.gtab||'members';
    const acts = [['msg','Chat','gChat'], ...(canShare(g)?[['share','Share','gShare']]:[]), ['logout','Leave','gLeave']];
    const bioLong = (g.bio||'').length > 110;
    const bio = g.bio ? `${sl('About')}<div class="gi-bio">${esc(S.gBioOpen||!bioLong ? g.bio : g.bio.slice(0,108)+'…')}${bioLong?` <button class="link" data-act="gBioTog">${S.gBioOpen?'See less':'See more'}</button>`:''}</div>` : '';
    const mems = [...g.mem].sort((a,b)=>({owner:0,admin:1,member:2}[roleOf(g,a)]-{owner:0,admin:1,member:2}[roleOf(g,b)]));
    let body;
    if (tab==='members') body = `${sl(`Members · ${g.mem.length}`)}${canAdd(g)?conn('gAddMem','Add members','From your friend list'):''}
      <div class="gx-sg">${mems.map(m=>{ const p = person(m); const ro = roleOf(g,m); const hasAct = m.k!=='me';
        return `<div class="gmrow">${img(p.av,p.n,'av40')}<span class="cm"><b>${esc(p.n)} ${vbadge()}${ROLE_CHIP2[ro]||''}</b><small>${esc(p.u)}</small></span>${hasAct?`<button class="iconbtn gdots" data-act="gMemMenu" data-k="${m.k}" aria-label="Actions for ${esc(p.n)}">${ic('dots')}</button>`:'<span class="gdots"></span>'}</div>`; }).join('')}</div>`;
    else if (tab==='media') body = g.id==='g-sera' ? `${sl('Photos & videos · 5')}<div class="gmedia">${['gal1','gal2','act3','act4','exp2'].map(k=>`<span>${img(k,'Shared photo')}</span>`).join('')}</div>` : empty('image','No media shared','Photos and videos shared in this group show up here.');
    else body = g.id==='g-sera' ? `${sl('Documents · 4')}<div class="gx-sg">${[0,1,2,3].map(()=>`<div class="gfile"><span class="gfic">${ic('file')}</span><span class="cm"><b>Document.docx</b><small>9.2MB · 04 Dec 2026, 10:12</small></span><button class="iconbtn" data-act="toast" data-msg="Downloads Document.docx to your phone." aria-label="Download Document.docx">${ic('download')}</button></div>`).join('')}</div>` : empty('file','No document shared','Documents shared in this group show up here.');
    const right = r==='owner' ? `<button class="iconbtn" data-act="gMenu" aria-label="Group options">${ic('dots')}</button>` : r==='admin' ? `<button class="iconbtn" data-act="gEdit" aria-label="Edit group">${ic('pen')}</button>` : '<span style="width:32px"></span>';
    return `<div class="screen ginfo gi">${statusBar()}<div class="topbar"><button class="iconbtn" data-act="back" aria-label="Back">${ic('back')}</button><span class="t-headline" style="flex:1; text-align:center">Group info</span>${right}</div>
      <div class="scroll" style="padding-bottom:24px">
        <div class="gi-card ${g.logo?'logo':''}">${WM}
          <div class="gi-h"><span class="gi-lbl">Group</span><span class="gi-role">${ic('group')}${ROLE_T[r]||'Member'}</span></div>
          <div class="gi-id"><button class="gi-avb" data-act="gPicView" aria-label="View group photo">${gAv(g,'gi-av')}</button><span><b>${esc(g.name)}</b><small>${g.mem.length} member${g.mem.length === 1 ? "" : "s"}</small></span></div>
        </div>
        <div class="gi-acts n${acts.length}">${acts.map(([i,t,a])=>`<button data-act="${a}"><i>${ic(i)}</i>${t}</button>`).join('')}</div>
        <div class="gi-pad">${bio}
          <div class="gtabs n3" role="tablist">${[['members','Members'],['media','Media'],['files','Files']].map(([k,t])=>`<button role="tab" aria-selected="${tab===k}" data-act="gTab" data-k="${k}">${t}</button>`).join('')}</div>
          ${body}</div></div></div>`; };

  /* Create / edit group */
  V.gform = () => { const f = S.gf; const edit = f.mode==='edit';
    const pic = f.photo ? img(f.photo,'Group photo') : f.name&&edit ? `<b>${esc(f.name[0])}</b>` : `<span class="gfph">${ic('group')}</span>`;
    return `<div class="screen">${statusBar()}${topBar(edit?'Edit group':'Create group')}<div class="scroll" style="padding:4px 16px 24px">
      <div class="gf-top"><button class="gf-pic ${f.photo?'has':f.name&&edit?'let':''}" data-act="gPhotoMenu" aria-label="Change group photo">${pic}<i>${ic('camera')}</i></button><button class="gf-plink" data-act="gPhotoMenu">${f.photo?'Change photo':'Add group photo'}</button></div>
      ${sl('Group details')}
      <div class="gx-card">
        <div class="field ${S.gfErr?'err':''}"><label for="gfName">Group name <span class="gx-req">*</span></label><input id="gfName" class="input" data-gm="gfName" value="${esc(f.name)}" placeholder="Enter your group name" maxlength="40">${S.gfErr?`<span class="helper gerr">${ic('alert')}Enter the group name</span>`:''}</div>
        <div class="field"><label for="gfBio">Bio</label><textarea id="gfBio" class="input" data-gm="gfBio" rows="3" maxlength="300" placeholder="What is this group about?">${esc(f.bio)}</textarea></div>
      </div>
      ${sl(`Members · ${f.mem.length}`)}
      <div class="gx-sg">${f.mem.map(m=>{ const p = person(m); return `<div class="gmrow">${img(p.av,p.n,'av40')}<span class="cm"><b>${esc(p.n)} ${vbadge()}</b><small>${esc(p.u)}</small></span>${edit ? `<span class="gmr">${ROLE_CHIP[roleOf(grp(),m)]||''}</span>` : m.k==='me' ? '<span class="gmr"><span class="gchip own">Owner</span></span>' : `<button class="iconbtn gx-rm" data-act="gFormRm" data-k="${m.k}" aria-label="Remove ${esc(p.n)}">${ic('close')}</button>`}</div>`; }).join('')}</div>
      ${edit?'':conn('gFormAdd','Add members','Optional. You can add people later')}</div>
      <div class="cta">${btn(edit?'Save Changes':'Create group', edit?'gSaveAsk':'gCreate')}</div></div>`; };

  /* Group photo */
  V.gpic = () => { const g = grp();
    return `<div class="screen">${statusBar()}${topBar('Group photo')}<div class="scroll gp-wrap">
      <div class="gp-big ${g.photo?'':g.logo?'logo':'pur'}">${g.photo?img(g.photo,g.name):`<b>${esc(gLet(g))}</b>`}</div>
      <p class="gp-name">${esc(g.name)}</p><p class="gp-sub">${g.mem.length} member${g.mem.length === 1 ? "" : "s"}</p></div>
      ${canEdit(g)?`<div class="cta">${btn('Change photo','gPhotoPick')}</div>`:''}</div>`; };

  /* Group permissions: settings rows with values */
  const _gperm = V.gperm;
  V.gperm = () => _gperm().replace('<p class="kicker3" style="padding:0">Members can:</p>', `${sl('Members can')}`);

  /* sheets */
  const MINE = ['gMenu','gMem','gShare'];
  const _ovG3 = overlayHTML;
  overlayHTML = () => { const k = S.sheet; const g = S.gid && groups().find(x=>x.id===S.gid);
    if (!MINE.includes(k) || !g) return _ovG3();
    S.sheet = null; let h; try { h = _ovG3(); } finally { S.sheet = k; }
    const sheet = (inner, label) => `<div class="scrim ${S.sheetAnim?'anim':''}" data-act="closeSheet2"></div><div class="sheet gx-sheet ${S.sheetAnim?'anim':''}" role="dialog" aria-label="${label}"><div class="grab" aria-hidden="true"></div>${inner}</div>`;
    const row = (act, i, t, s, extra='', danger) => `<button class="gx-sr ${danger?'dng':''}" data-act="${act}" ${extra}><span class="gx-si">${ic(i)}</span><span><b>${t}</b>${s?`<small>${s}</small>`:''}</span>${ic('chev')}</button>`;
    if (k==='gMenu') { const r = myRole(g);
      h += sheet(`<p class="sh-t">Group options</p><p class="sh-s">${esc(g.name)}</p><div class="gx-sg">${row('gEdit','pen','Edit group','Name, photo and bio')}${r==='owner'?row('gPerm','shield','Group permissions','What members can do')+row('gDisband','trash','Disband group','Removes everyone and closes the group','',true):''}</div>`, 'Group options'); }
    if (k==='gMem') { const m = g.mem.find(x=>x.k===S.gmk); const p = GP(S.gmk); const me = myRole(g); const ro = roleOf(g,m);
      const rows = [['msg','msg','Send message','Open a chat with '+esc(p.n.split(' ')[0])], ['prof','person','View profile','']];
      if (me==='owner') { if (ro==='admin') { rows.shift(); rows.push(['demote','person','Demote to member','They lose admin rights']); } else if (ro==='member') rows.push(['promote','shield','Promote to admin','They can add and remove members']); rows.push(['remove','trash','Remove from group','They can’t see new messages']); }
      else if (me==='admin' && ro==='member') rows.push(['remove','trash','Remove from group','They can’t see new messages']);
      h += sheet(`<div class="gx-prof">${img(p.av,p.n,'gx-pf')}<span><b>${esc(p.n)} ${vbadge()}</b><small>${esc(p.u)}</small><em class="gchip ${ro==='owner'?'own':ro==='admin'?'adm':'mem'}">${ROLE_T[ro]||'Member'}</em></span></div>
        <div class="gx-sg">${rows.map(([a,i,t,s])=>row('gMemAct', i, t, s, `data-a="${a}"`, a==='remove')).join('')}</div>`, 'Member actions'); }
    if (k==='gShare') { const list = gStore().convs.filter(x=>!x.group); const slug = 'youapp.ai/group/' + g.name.toLowerCase().replace(/[^a-z0-9]+/g,'');
      h += sheet(`<p class="sh-t">Share group</p><p class="sh-s">Invite people to ${esc(g.name)}</p>
        <p class="gx-sl" style="margin-left:4px">Send to</p><div class="gshare">${list.map(x=>`<button data-act="gShareTo" data-id="${x.id}">${img(x.av,x.name)}<small>${esc(x.name)}</small></button>`).join('')}</div>
        <div class="gx-code"><span><small>Group link</small><b>${slug}</b></span><button data-act="toast" data-msg="Group link copied." aria-label="Copy group link">${ic('copy')}</button></div>
        <div class="gx-two"><button class="b2" data-act="toast" data-msg="Shows the group QR code.">${ic('qr')}My QR</button><button class="b1" data-act="extShare">${ic('share')}Share link</button></div>`, 'Share group'); }
    return h; };

  /* Locals header (all tabs) */
  const _rg3 = render;
  render = function(){ _rg3(); const ph = document.getElementById('phone'); if (ph) ph.classList.toggle('gxl', S.screen === 'chats'); };
  try { render(); } catch(e) {}
})();
