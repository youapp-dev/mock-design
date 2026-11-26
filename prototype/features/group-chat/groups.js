/* ===== Group chat (Figma 3.2 · groupchat page 3019:1622) ===== */
const GPEOPLE = [
  {k:'maulguy', n:'Maulguy', u:'@maulguy', av:'ca1', c:'Portugal'},
  {k:'maulaura', n:'Maulaura', u:'@maulaura', av:'ca2', c:'Portugal'},
  {k:'ismaul', n:'Ismaul', u:'@ismailmaul', av:'ca3', c:'Netherlands'},
  {k:'maulbucin', n:'Maulbucin', u:'@maulbucin', av:'ca4', c:'Vietnam'},
  {k:'maulana', n:'Maulana', u:'@maulana', av:'ca5', c:'Vietnam'},
  {k:'catherine', n:'Catherine Lee', u:'@catca', av:'ca2', c:'Malaysia'},
  {k:'lara', n:'Lara', u:'@lara', av:'ca1', c:'Malaysia'},
  {k:'daniel', n:'Daniel Ed', u:'@daniel22', av:'ca1', c:'Malaysia'},
  {k:'kwang', n:'Lee Kwang Soo', u:'@lks22', av:'ca5', c:'Korea'},
  {k:'fionna', n:'Fionna', u:'@fionna', av:'ca4', c:'Indonesia'},
  {k:'juan', n:'Juan Bennet', u:'@juanb', av:'ca3', c:'Spain'},
];
const GP = k => GPEOPLE.find(p=>p.k===k);
const GPERM0 = () => ({add:false, send:true, media:{photo:true, video:true, document:true, gif:true, voice:true}, link:true});
const gSeed = () => ({id:'g-sera', group:true, name:'Sera.cx', letter:'S', logo:true, photo:null, unread:2, at:'28 Jun',
  bio:'Swap at the rate banks keep for themselves.\nEvery swap pays the community that makes FX fair — not a middleman. And you can be one of them.',
  mem:[{k:'me', role:null}, {k:'maulguy', role:'owner'}, {k:'maulaura', role:'member'}, {k:'ismaul', role:'admin'}, {k:'maulbucin', role:'member'}, {k:'maulana', role:'member'}],
  perm:GPERM0(), msgs:[
    {id:'gs1', text:'', gsys:'<b>Maulguy</b> created the group', at:'09:00'},
    {id:'gs2', gsys:'<b>You</b> joined group', at:'09:01'},
    {id:'gm1', t:'text', who:'maulaura', text:'Hi all! Welcome to Sera.cx 👋', at:'09:05'},
    {id:'gm2', t:'voice', who:'ismaul', dur:9, at:'09:12'},
    {id:'gm3', t:'text', me:true, text:'Thanks for adding me. Happy to be here!', at:'09:15', st:'sent'},
    {id:'gm4', t:'text', who:'maulbucin', text:'Anyone free for kopi this Saturday?', at:'15:00'},
    {id:'gs3', gsys:'<b>Maulana</b> joined group', at:'15:02'}]});
const productSeed = () => ({id:'g-products', group:true, name:'YouApp Products', letter:'YP', logo:false, photo:null, myRole:'admin', unread:0, at:'Today',
  bio:'Group-chat feature showcase: messages, media, files, calls, reactions, admin tools and Red Packet. You are a Group Admin.',
  mem:[{k:'me', role:'admin'}, {k:'maulguy', role:'owner'}, {k:'catherine', role:'admin'}, {k:'lara', role:'member'}],
  perm:{add:true, send:true, media:{photo:true, video:true, document:true, gif:true, voice:true}, link:true}, msgs:[
    {id:'yp-sys1', gsys:'<b>Maulguy</b> created the group', at:'09:00'},
    {id:'yp-sys2', gsys:'<b>You</b> were made a Group Admin', at:'09:01'},
    {id:'yp-text', t:'text', who:'maulguy', text:'Welcome! This group demonstrates every chat feature in one place 👋', at:'09:02', rx:{'👍':['me','lara'],'❤️':['catherine']}},
    {id:'yp-reply', t:'text', who:'catherine', text:'Perfect — reply, reactions and pinning are working.', reply:{id:'yp-text',who:'Maulguy',prev:'Welcome! This group demonstrates every chat feature…'}, at:'09:03'},
    {id:'yp-photo', t:'img', who:'lara', img:'gal1', cap:'Photo message with a caption', at:'09:04'},
    {id:'yp-video', t:'video', me:true, img:'act3', cap:'Short product walkthrough', at:'09:05', st:'sent'},
    {id:'yp-voice', t:'voice', who:'maulguy', dur:18, at:'09:06'},
    {id:'yp-file', t:'file', who:'catherine', name:'YouApp_Group_Features.pdf', size:'1.8 MB', at:'09:07'},
    {id:'yp-fwd', t:'text', me:true, text:'Tomorrow’s product review starts at 10:00 AM.', fwd:true, at:'09:08', st:'sent'},
    {id:'yp-del', t:'text', me:true, text:'', del:true, at:'09:09'},
    {id:'yp-call1', t:'call', kind:'voice', dur:'08:42', at:'Yesterday'},
    {id:'yp-call2', t:'call', kind:'video', dur:'24:16', at:'Yesterday'},
    {id:'yp-call3', t:'call', kind:'video', missed:true, at:'Today'},
    {id:'yp-invite', t:'ginvite', who:'maulguy', whoName:'Maulguy', av:'ca1', inv:{name:'Sera.cx',by:'Maulguy',gid:'g-sera',slug:'seracx'}, at:'09:10'},
    {id:'yp-red', t:'angpao', tok:'apSeraFriday', who:'lara', at:'09:11'},
    {id:'yp-last', t:'text', who:'maulguy', text:'Try the phone and video buttons above, or attach a photo, video, document, voice note or Red Packet below.', at:'09:12'}
  ], pin:'yp-text'});
function gStore(){ const c = C6(); if (!c.gInit) { c.gInit = true; c.convs.unshift(productSeed(), gSeed()); c.gInvite = true; } return c; }
const groups = () => gStore().convs.filter(x=>x.group);
const grp = () => groups().find(g=>g.id===S.gid) || groups()[0];
const myRole = g => g.myRole || (g.mine ? 'owner' : g.roleFix ? 'member' : (scen.gRole||'owner'));
const roleOf = (g, m) => { if (m.k==='me') return myRole(g); if (m.role==='owner' && myRole(g)==='owner') return 'admin'; return m.role; };
const person = m => m.k==='me' ? {k:'me', n:'You', u:'@elsaa', av:'avatar', c:'Malaysia'} : GP(m.k);
const gIni = n => { const w = (n||'G').trim().split(/\s+/).filter(x => /^[\p{L}\p{N}]/u.test(x)); return (w.length ? w : ['G']).slice(0,2).map(x => [...x][0]).join('').toUpperCase(); };
const gLet = g => g.logo ? (g.letter||'S') : gIni(g.name);
const gAv = (g, cls='') => g.photo ? `<span class="gav ${cls}">${img(g.photo,g.name)}</span>` : `<span class="gav ${cls} ${g.logo?'':'pur'}"><b>${esc(gLet(g))}</b></span>`;
const canAdd = g => myRole(g)!=='member' || g.perm.add;
const canEdit = g => myRole(g)!=='member';
const canShare = g => myRole(g)!=='member' || g.perm.link;
const ROLE_CHIP = {owner:'<span class="gchip own">Owner</span>', admin:'<span class="gchip adm">Group Admin</span>'};
const ROLE_CHIP2 = {owner:' <span class="gchip own">Owner</span>', admin:' <span class="gchip adm">Admin</span>'};
const gNeedKyc = () => { if (kyc()!=='approved') { S.gateFrom='group'; go('gate'); return true; } return false; };

const GEMPTY_ART = `<svg class="gempty-svg" viewBox="0 0 120 110" aria-hidden="true"><ellipse cx="60" cy="100" rx="38" ry="5" fill="#ece6f7"/>
<circle cx="18" cy="22" r="3" fill="#b79be6"/><circle cx="101" cy="20" r="2.5" fill="#e0569b"/><circle cx="22" cy="86" r="3" fill="#18a76b"/><circle cx="103" cy="80" r="2" fill="#b79be6"/>
<path d="M14 92c0-14 8-22 20-22s20 8 20 22z" fill="#b48fe0"/><circle cx="34" cy="56" r="11" fill="#f6c9a6"/><path d="M22 54c0-9 6-14 12-14s12 5 12 14c-3-4-7-6-12-6s-9 2-12 6z" fill="#3a1d86"/>
<path d="M66 92c0-14 8-22 20-22s20 8 20 22z" fill="#b48fe0"/><circle cx="86" cy="56" r="11" fill="#f6c9a6"/><path d="M74 54c0-9 6-14 12-14s12 5 12 14c-3-4-7-6-12-6s-9 2-12 6z" fill="#3a1d86"/>
<path d="M34 98c0-20 11-31 26-31s26 11 26 31z" fill="#4b23a8"/><circle cx="60" cy="46" r="15" fill="#f6c9a6"/><path d="M44 44c0-12 7-19 16-19s16 7 16 19c-4-6-9-8-16-8s-12 2-16 8z" fill="#3a1d86"/>
<circle cx="60" cy="82" r="10" fill="#18a76b"/><path d="M60 77v10M55 82h10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`;
/* Locals tabs: All / Host / Group */
const _chatsV = V.chats;
V.chats = () => { const c = gStore();
  if (scen.gEvent && scen.gEvent!=='none') { const g = groups().find(x=>x.id==='g-sera');
    if (g) { gGone(g, scen.gEvent==='removed' ? 'removed' : 'disbanded'); }
    scen.gEvent = 'none'; saveScen(); }
  const tab = S.ctab==='service'||S.ctab==='experience' ? 'host' : S.ctab==='message' || !S.ctab ? 'all' : S.ctab;
  const was = S.ctab; S.ctab = tab==='host' ? 'service' : 'message';
  const hide = scen.gList==='empty'; const saved = c.convs; if (hide) c.convs = c.convs.filter(x=>x.id!=='g-sera');
  let h; try { h = _chatsV(); } finally { S.ctab = was; c.convs = saved; }
  const tabs = `<div class="ctabs" role="tablist">${[['all','msg','All'],['host','person','Host'],['group','group','Group']].map(([k,i,t])=>`<button role="tab" aria-selected="${tab===k}" data-act="ctab" data-k="${k}">${ic(i)}${t}</button>`).join('')}</div>`;
  h = h.replace(/<div class="ctabs" role="tablist">[\s\S]*?<\/div><\/div>/, tabs + '</div>');
  const gl = hide ? groups().filter(x=>x.id!=='g-sera') : groups();
  if (tab==='all') h = h.replace(/<span class="hb" aria-label="Host">H<\/span>/g, '');
  if (tab==='all') gl.forEach(g => { const i = h.indexOf(`data-act="openConv" data-id="${g.id}"`); if (i<0) return; const a = h.lastIndexOf('<button', i); const b = h.indexOf('</button>', i) + 9; h = h.slice(0,a) + gRow(g) + h.slice(b); });
  if (tab==='host') { const q = (S.cq||'').trim().toLowerCase(); const bks = D.bookings.filter(b=>!q || HOSTS[b.host].name.toLowerCase().includes(q) || b.title.toLowerCase().includes(q));
    const body = `<div class="pad16">${bks.map(b=>{ const ho = HOSTS[b.host]; const last = b.msgs[b.msgs.length-1]; return `<button class="clrow" data-act="openBkChat2" data-id="${b.id}">${img(ho.av,ho.name,'av44')}<span class="cm"><b>${esc(ho.name)} ${vbadge()}${hbadge()}</b><small><span class="ichip sm">${esc(b.title)}</span> ${preview(last)}</small></span><span class="cr"><span class="stchip ${STATUS[b.status][1]}">${STATUS[b.status][0]}</span></span></button>`; }).join('')}${!bks.length ? stateBlock('emptycal','No host chats yet','Chats about services and experiences you book show up here.') : ''}</div>`;
    h = h.replace(/<div class="scroll" style="padding-bottom:96px">[\s\S]*<\/div>\s*<button class="cfab"/, `<div class="scroll" style="padding-bottom:96px">${body}</div>\n  <button class="cfab"`); }
  if (tab==='group') { const q = (S.cq||'').trim().toLowerCase(); const list = gl.filter(g=>!q || g.name.toLowerCase().includes(q));
    const body = !gl.length ? `<div class="gempty">${GEMPTY_ART}<p class="t-body">You have no group chat yet</p><button class="gnewbtn" data-act="gNew">${ic('plus')}Create new group chat</button></div>`
      : `<div class="pad16">${list.map(gRow).join('')}${!list.length?stateBlock('search','No groups found',`No groups match “${esc(S.cq)}”.`):''}</div>`;
    h = h.replace(/<div class="scroll" style="padding-bottom:96px">[\s\S]*<\/div>\s*<button class="cfab"/, `<div class="scroll" style="padding-bottom:96px">${body}</div>\n  <button class="cfab"`); }
  if (tab==='group') h = h.replace(/<button class="cfab" data-act="addPeople" aria-label="Add people">[\s\S]*?<\/button>/, gl.length ? `<button class="cfab" data-act="gNew" aria-label="Create group">${ic('userplus')}</button>` : '');
  /* Host tab (26 Nov): the floating button finds hosts: Discover › Locals › Hosts, with a discover (compass) icon */
  if (tab==='host') h = h.replace(/<button class="cfab" data-act="addPeople" aria-label="Add people">[\s\S]*?<\/button>/, `<button class="cfab" data-act="findHosts" aria-label="Find hosts on Discover">${ic('compass')}</button>`);
  return h; };
A.findHosts = () => { S.hist = []; S.htab = 'discover'; S.seg = 'locals'; go('discover', {replace:true}); document.querySelector('.scroll')?.scrollTo(0, 0); };
const gFix = g => { const o = g.mem.find(m=>m.k!=='me'); g.msgs.forEach(m=>{ if (!m.me && !m.who && !m.gsys && !m.sys && m.t!=='ginvite' && o) m.who = o.k; }); };
function gRow(g){ gFix(g); const last = [...g.msgs].reverse().find(m=>!m.gsys && !m.sys) || g.msgs[g.msgs.length-1] || {};
  const who = last.me ? 'You: ' : last.who ? GP(last.who).n.split(' ')[0]+': ' : '';
  const pv = last.gsys ? last.gsys.replace(/<[^>]+>/g,'') : who + (last.t==='voice' ? `${ic('mic')} Voice message (0:0${last.dur||9})` : last.t==='img' ? `${ic('image')} Photo` : last.t==='ginvite' ? 'Group invitation' : esc(last.text||''));
  return `<button class="clrow" data-act="openConv" data-id="${g.id}">${gAv(g,'av44g')}<span class="cm"><b>${esc(g.name)}</b><small>${pv}</small></span><span class="cr"><small>${g.at||'Today'}</small>${g.unread?`<i class="ucount">${g.unread}</i>`:''}</span></button>`; }

/* chatroom: group header, sender names, join pills, permissions */
const _msgHTML = msgHTML;
msgHTML = function(m, c, idx){
  if (m.gsys) return `<p class="gpill">${m.gsys}</p>`;
  if (m.t==='ginvite') { const inv = m.inv; const body = `<span class="ginv"><b>${esc(inv.name)}</b><span>${esc(inv.by)} invites you to join this group on YouApp</span><button data-act="gInvView" data-g="${inv.gid}">View Group</button></span><span class="ginvl">youapp.ai/group/${esc(inv.slug)}</span>`;
    return `<div class="${m.me?'':'grow'}">${m.me?'':img(m.av||'ca3','', 'gmav')}<div class="bub ${m.me?'me':''} ginvb" data-id="${m.id}">${m.me?'':`<b class="gwho">${esc(m.whoName||'')}</b>`}${body}<span class="bmeta">${m.at}${m.me?' ✓✓':''}</span></div></div>`; }
  let h = _msgHTML(m, c, idx);
  if (c.group && !m.me && m.who) { const p = GP(m.who);
    h = h.replace(`data-id="${m.id}">`, `data-id="${m.id}"><b class="gwho">${esc(p.n)}</b>`);
    h = `<div class="grow">${img(p.av, p.n, 'gmav')}${h}</div>`; }
  return h; };
const _chatV = V.chat;
V.chat = () => { const c = conv(); if (!c.group) return _chatV(); c.unread = 0; S.gid = c.id; gFix(c);
  let h = chatHTML(c, {inId:'chatIn', sendAct:'cSend', profAct:'gInfo', top:`<p class="sysline">Today</p>`});
  const a = h.indexOf('<button class="hostedby"'); if (a>=0) { const b = h.indexOf('</button>', a) + 9;
    h = h.slice(0,a) + `<button class="hostedby" data-act="gInfo">${gAv(c,'av36g')}<span style="text-align:left"><b style="font-size:16px">${esc(c.name)}</b><span class="cstatus">${c.mem.length} ${c.mem.length === 1 ? "member" : "members"}</span></span></button>` + h.slice(b); }
  h = h.replace(/<button class="iconbtn" data-act="cxCall" data-k="video" aria-label="Video call">[\s\S]*?<\/button>/, '');
  const r = myRole(c);
  if (r==='member' && !c.perm.send) h = h.replace(/<div class="cbar2[\s\S]*?<\/div>(?=<\/div><\/div>$)/, `<div class="gnosend">${ic('lock')}Only admins can send messages in this group.</div>`);
  else if (r==='member' && !Object.values(c.perm.media).some(Boolean)) h = h.replace(/<button class="iconbtn" style="margin:0" data-act="cAttach"[\s\S]*?<\/button>/, '');
  return h; };
A.chatMenu = (orig => () => { if (S.screen==='chat' && conv().group) { A.gInfo(); return; } orig(); })(A.chatMenu);
appEntryRoutes.products = (open, context) => {
  scen.gList = 'has';
  saveScen();
  C6();
  S.gid = 'g-products';
  S.conv = 'g-products';
  S.ctab = 'group';
  open('chat', context);
  setTimeout(scrollChat, 30);
};

/* group info */
V.ginfo = () => { const g = grp(); if (!g) return V.chats(); const r = myRole(g); const tab = S.gtab||'members';
  const tabs = [['members','Members'],['media','Media'],['files','Files']];
  const acts = [['msg','Chat','gChat'], ...(canShare(g)?[['share','Share','gShare']]:[]), ['logout','Leave','gLeave']];
  const bioLong = (g.bio||'').length > 90; const bio = g.bio ? `<div class="gbio">${esc(S.gBioOpen||!bioLong ? g.bio : g.bio.slice(0,88)+'…')}${bioLong?` <button class="link" data-act="gBioTog">${S.gBioOpen?'See less':'See more'}</button>`:''}</div>` : '';
  const mems = [...g.mem].sort((a,b)=>({owner:0,admin:1,member:2}[roleOf(g,a)]-{owner:0,admin:1,member:2}[roleOf(g,b)]));
  let body;
  if (tab==='members') body = `<div class="row-between gmhead"><b>Group Members</b>${canAdd(g)?`<button class="link gadd" data-act="gAddMem">${ic('userplus')}Add Members</button>`:''}</div>
    ${mems.map(m=>{ const p = person(m); const ro = roleOf(g,m); const hasAct = m.k!=='me';
      return `<div class="gmrow">${img(p.av,p.n,'av40')}<span class="cm"><b>${esc(p.n)} ${vbadge()}${ROLE_CHIP2[ro]||''}</b><small>${esc(p.u)}</small></span>${hasAct?`<button class="iconbtn gdots" data-act="gMemMenu" data-k="${m.k}" aria-label="Actions for ${esc(p.n)}">${ic('dots')}</button>`:'<span class="gdots"></span>'}</div>`; }).join('')}`;
  else if (tab==='media') body = g.id==='g-sera' ? `<div class="gmedia">${['gal1','gal2','act3','act4','exp2'].map(k=>`<span>${img(k,'Shared photo')}</span>`).join('')}</div>` : `<div class="gtabempty">${ic('image')}<span>No media shared</span></div>`;
  else if (tab==='files') body = g.id==='g-sera' ? `<div class="gfiles">${[0,1,2,3].map(()=>`<div class="gfile"><span class="gfic">${ic('file')}</span><span class="cm"><b>Document.docx</b><small>9.2MB, 04 Dec 2026 at 10:12</small></span><button class="iconbtn" data-act="toast" data-msg="Downloads Document.docx to your phone." aria-label="Download Document.docx">${ic('download')}</button></div>`).join('')}</div>` : `<div class="gtabempty">${ic('file')}<span>No document shared</span></div>`;
  else if (tab==='voices') body = `<div class="pad0">${[['ismaul','0:09'],['maulaura','0:21']].map(([k,d])=>`<div class="gmrow">${img(GP(k).av,'','av40')}<span class="cm"><b>${GP(k).n}</b><small>${ic('mic')} Voice message (${d})</small></span><span class="gmr"><small>28 Jun</small></span></div>`).join('')}</div>`;
  else body = stateBlock(tab==='files'?'file':'image', tab==='files'?'No files yet':'No GIFs yet', tab==='files'?'Documents shared in this group show up here.':'GIFs shared in this group show up here.');
  return `<div class="screen ginfo">${statusBar()}<div class="scroll" style="padding-bottom:20px">
    <div class="ghero ${g.photo?'photo':g.logo?'':'pur'}" ${g.photo?`style="background-image:linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.05) 35%,rgba(0,0,0,.65)),url('${IMG[g.photo]}')"`:''}><div class="ghtop"><button class="iconbtn" data-act="back" aria-label="Back">${ic('back')}</button><span style="flex:1"></span>${r==='owner'?`<button class="iconbtn" data-act="gMenu" aria-label="Group options">${ic('dots')}</button>`:r==='admin'?`<button class="iconbtn" data-act="gEdit" aria-label="Edit group">${ic('pen')}</button>`:''}</div>
      <button class="ghpic" data-act="gPicView" aria-label="View group photo">${g.photo?'':`<b>${esc(gLet(g))}</b>`}</button>
      <div class="ghname"><b>${esc(g.name)}</b><small>${g.mem.length} member${g.mem.length === 1 ? "" : "s"}</small></div>
      <div class="ghacts n${acts.length}">${acts.map(([i,t,a])=>`<button data-act="${a}">${ic(i)}${t}</button>`).join('')}</div>${bio}</div>
    <div class="gsheet"><div class="gtabs n${tabs.length}" role="tablist">${tabs.map(([k,t])=>`<button role="tab" aria-selected="${tab===k}" data-act="gTab" data-k="${k}">${t}</button>`).join('')}</div>${body}</div></div></div>`; };
V.gpic = () => { const g = grp(); return `<div class="screen gpicscr">${statusBar()}<div class="topbar gpictop"><button class="iconbtn" data-act="back" aria-label="Back">${ic('back')}</button><b>Group Profile</b>${canEdit(g)?`<button class="iconbtn" data-act="gPhotoMenu" aria-label="Photo options">${ic('dots')}</button>`:'<span style="width:40px"></span>'}</div><div class="gpicbig ${g.photo||g.logo?'':'pur'}">${g.photo?img(g.photo,g.name):`<b>${esc(gLet(g))}</b>`}</div></div>`; };

/* create group + add members (pick people) */
const GPICK_ART = `<svg class="gpk-svg" viewBox="0 0 120 110" aria-hidden="true"><ellipse cx="58" cy="100" rx="34" ry="4" fill="#ece6f7"/><circle cx="20" cy="30" r="4" fill="#b79be6"/><circle cx="16" cy="48" r="3" fill="none" stroke="#b79be6" stroke-width="1.6"/><circle cx="22" cy="80" r="2.5" fill="#18a76b"/>
<path d="M92 18l2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.7-4.8 2.7 1-5.3-4-3.7 5.4-.6z" fill="none" stroke="#e0569b" stroke-width="1.6"/>
<rect x="34" y="20" width="50" height="76" rx="5" fill="#4b23a8"/><rect x="40" y="20" width="44" height="76" rx="4" fill="#6a3fd0"/><rect x="48" y="32" width="28" height="28" rx="4" fill="#b79be6"/><circle cx="62" cy="42" r="6" fill="#4b23a8"/><path d="M52 58c1-7 5-10 10-10s9 3 10 10z" fill="#4b23a8"/>
<rect x="50" y="68" width="18" height="3" rx="1.5" fill="#b79be6"/><rect x="84" y="34" width="6" height="10" rx="2" fill="#f6c9a6"/><rect x="84" y="48" width="6" height="10" rx="2" fill="#b79be6"/>
<circle cx="78" cy="80" r="11" fill="#f6c9a6" stroke="#3a1d86" stroke-width="2"/><rect x="72" y="78.5" width="12" height="3" rx="1.5" fill="#3a1d86"/></svg>`;
V.gpick = () => { const f = S.gf;
  if (f.mode!=='add' && scen.gContacts==='none') return `<div class="screen">${statusBar()}${topBar('Create group')}<div class="scroll"><div class="gpkempty">${GPICK_ART}<b>You have no friend list yet</b><span>You can still create the group and add friends later.</span></div></div><div class="cta">${btn('Continue','gPickNext')}</div></div>`; const q = (S.gq||'').trim().toLowerCase(); const g = f.mode==='add' ? grp() : null;
  const pool = GPEOPLE.filter(p => !(g && g.mem.some(m=>m.k===p.k)) && (!q || p.n.toLowerCase().includes(q) || p.u.includes(q)));
  const sel = f.sel.map(GP);
  return `<div class="screen">${statusBar()}${topBar(f.mode==='add'?'Add members':'Create group')}<div class="pad16" style="padding-bottom:0"><label class="search" style="margin:0; width:100%">${ic('search')}<input id="gq" data-gm="gq" value="${esc(S.gq||'')}" placeholder="Search for someone to add" style="border:0; outline:0; flex:1; font:inherit; font-size:16px; background:none; min-width:0">${S.gq?`<button class="iconbtn" style="margin:0" data-act="gqClear" aria-label="Clear search">${ic('xcircle')}</button>`:''}</label>
    ${sel.length?`<div class="gsel">${sel.map(p=>`<button data-act="gPickTog" data-k="${p.k}" aria-label="Remove ${esc(p.n)}"><span>${img(p.av,p.n)}<i>×</i></span><small>${esc(p.n.split(' ')[0])}</small></button>`).join('')}</div>`:''}</div>
    <div class="scroll pad16" style="padding-bottom:20px">${pool.map(p=>{ const on = f.sel.includes(p.k); return `<button class="gpkrow" data-act="gPickTog" data-k="${p.k}">${img(p.av,p.n,'av40')}<span class="cm"><b>${esc(p.n)} ${vbadge()}</b><small>${esc(p.u)}</small></span><i class="gck ${on?'on':''}">${on?'✓':''}</i></button>`; }).join('')}${!pool.length?stateBlock('search','No one found', q?`No one matches “${esc(S.gq)}”.`:'Everyone is already in this group.'):''}</div>
    <div class="cta">${btn(f.mode==='add'?`Add${f.sel.length?' ('+f.sel.length+')':''}`:'Continue', f.mode==='add'?'gAddGo':'gPickNext', {disabled:f.mode==='add' && !f.sel.length})}</div></div>`; };
V.gform = () => { const f = S.gf; const edit = f.mode==='edit';
  return `<div class="screen">${statusBar()}${topBar(edit?'Edit group':'Create group')}<div class="scroll pad16" style="padding-bottom:20px">
    <button class="gfpic" data-act="gPhotoMenu" aria-label="Change group photo">${f.photo?img(f.photo,'Group photo'):f.name&&edit?`<b>${esc(f.name[0])}</b>`:`<span class="gfph">${ic('group')}</span>`}<i>${ic('pen')}</i></button>
    <div class="field ${S.gfErr?'err':''}"><label for="gfName">Group Name <span style="color:var(--a-error)">*</span></label><input id="gfName" class="input" data-gm="gfName" value="${esc(f.name)}" placeholder="Enter your group name" maxlength="40">${S.gfErr?`<span class="helper gerr">${ic('alert')}Enter the group name</span>`:''}</div>
    <div class="field"><label for="gfBio">Bio</label><textarea id="gfBio" class="input" data-gm="gfBio" rows="4" maxlength="300" placeholder="Enter your group bio">${esc(f.bio)}</textarea></div>
    <div class="row-between gmhead"><b>${edit?`Members: ${f.mem.length}`:'Group Members'}</b>${edit?'':`<button class="link gadd" data-act="gFormAdd">${ic('userplus')}Add Members</button>`}</div>
    ${f.mem.map(m=>{ const p = person(m); return `<div class="gmrow">${img(p.av,p.n,'av40')}<span class="cm"><b>${esc(p.n)} ${vbadge()}</b><small>${esc(p.u)}</small></span>${edit ? `<span class="gmr">${ROLE_CHIP[edit?roleOf(grp(),m):m.role]||''}</span>` : m.k==='me' ? '<span class="gmr"><span class="gchip own">Owner</span></span>' : `<button class="iconbtn" style="color:var(--a-error)" data-act="gFormRm" data-k="${m.k}" aria-label="Remove ${esc(p.n)}">${ic('trash')}</button>`}</div>`; }).join('')}</div>
    <div class="cta">${btn(edit?'Save Changes':'Create', edit?'gSaveAsk':'gCreate')}</div></div>`; };
V.gperm = () => { const p = S.gp; const n = Object.values(p.media).filter(Boolean).length; const sw = (k, on, t, ic0) => `<div class="gprow">${ic(ic0)}<span>${t}</span><button class="switch ${on?'on':''}" role="switch" aria-checked="${on}" data-act="gPermTog" data-k="${k}" aria-label="${t}"><i></i></button></div>`;
  return `<div class="screen">${statusBar()}${topBar('Group permissions')}<div class="scroll pad16" style="padding-bottom:20px"><p class="kicker3" style="padding:0">Members can:</p>
    ${sw('add', p.add, 'Add other members', 'userplus')}${sw('send', p.send, 'Send messages', 'msg')}
    <div class="gprow"><span class="ico"></span><button class="gpexp" data-act="gMediaExp">${ic('image')}<span>Send media <small>${n}/5</small></span>${ic(S.gMediaOpen?'chevdown':'chev')}</button><button class="switch ${n?'on':''}" role="switch" aria-checked="${!!n}" data-act="gPermTog" data-k="mediaAll" aria-label="Send media"><i></i></button></div>
    ${S.gMediaOpen?`<div class="gpmedia">${[['photo','Photo'],['video','Video'],['document','Document'],['gif','GIF'],['voice','Voice']].map(([k,t])=>`<button class="gpm" data-act="gPermTog" data-k="m_${k}"><i class="gck ${p.media[k]?'on':''}">${p.media[k]?'✓':''}</i>${t}</button>`).join('')}</div>`:''}
    ${sw('link', p.link, 'Invite via link', 'link')}</div><div class="cta">${btn('Save Changes','gPermSave')}</div></div>`; };

/* actions */
const gHome = () => { S.ctab='group'; S.hist=['discover']; go('chats',{replace:true}); };
const gToast = t => toast(t);
const gMsg = (g, html) => { g.msgs.push({id:'gs'+nid(), gsys:html, at:nowHM()}); };
Object.assign(A, {
  gNew: () => { if (gNeedKyc()) return; S.gf = {mode:'new', sel:[], name:'', bio:'', photo:null, mem:[]}; S.gq=''; go('gpick'); },
  gPickTog: el => { const k = el.dataset.k; const f = S.gf; f.sel = f.sel.includes(k) ? f.sel.filter(x=>x!==k) : [...f.sel, k]; render(); },
  gqClear: () => { S.gq=''; render(); },
  gPickNext: () => { const f = S.gf; if (f.mode==='new') { f.mem = [{k:'me', role:'owner'}, ...f.sel.map(k=>({k, role:'member'}))]; S.gfErr=false; S.gfMemErr=false; go('gform'); } else { f.sel.forEach(k=>{ if (!f.mem.some(m=>m.k===k)) f.mem.push({k, role:'member'}); }); f.mem = f.mem.filter(m=>m.k==='me' || f.sel.includes(m.k)); f.mode='new'; if (f.mem.length>1) S.gfMemErr=false; back(); } },
  gFormAdd: () => { const f = S.gf; f.sel = f.mem.filter(m=>m.k!=='me').map(m=>m.k); f.mode='fadd'; S.gq=''; go('gpick'); },
  gFormRm: el => { const f = S.gf; f.mem = f.mem.filter(m=>m.k!==el.dataset.k); f.sel = f.sel.filter(k=>k!==el.dataset.k); render(); },
  gCreate: () => { const f = S.gf; S.gfErr = !f.name.trim(); S.gfMemErr = false; if (S.gfErr) { render(); return; } const c = gStore();
    const g = {id:'g'+nid(), group:true, mine:true, name:f.name.trim(), letter:gIni(f.name), photo:f.photo, bio:f.bio.trim(), unread:0, at:'Today', mem:f.mem.map(m=>({...m})), perm:GPERM0(),
      msgs:[{id:'gs'+nid(), gsys:'<b>You</b> created the group', at:nowHM()}, ...f.mem.filter(m=>m.k!=='me').map(m=>({id:'gs'+nid(), gsys:`<b>${esc(GP(m.k).n)}</b> joined group`, at:nowHM()}))]};
    c.convs.unshift(g); S.conv = g.id; S.gid = g.id; S.cs=null; S.creply=null; S.ctext=''; S.ctab='group'; S.hist=['discover','chats']; go('chat',{replace:true}); gToast('Group created'); },
  gInfo: () => { S.gid = conv().group ? conv().id : S.gid; S.gtab='members'; S.gBioOpen=false; go('ginfo'); },
  gChat: () => { const g = grp(); S.conv = g.id; if (S.hist[S.hist.length-1]==='chat') back(); else go('chat'); },
  gTab: el => { S.gtab = el.dataset.k; render(); },
  gBioTog: () => { S.gBioOpen = !S.gBioOpen; render(); },
  gPicView: () => go('gpic'),
  gMenu: () => openSheet('gMenu'),
  gMemMenu: el => { S.gmk = el.dataset.k; openSheet('gMem'); },
  gEdit: () => { const g = grp(); S.gf = {mode:'edit', name:g.name, bio:g.bio||'', photo:g.photo, mem:g.mem, sel:[]}; S.gfErr=false; go('gform'); },
  gPerm: () => { S.gp = JSON.parse(JSON.stringify(grp().perm)); S.gMediaOpen=false; go('gperm'); },
  gPermTog: el => { const k = el.dataset.k; const p = S.gp; if (k==='mediaAll') { const on = !Object.values(p.media).some(Boolean); Object.keys(p.media).forEach(x=>p.media[x]=on); } else if (k.startsWith('m_')) p.media[k.slice(2)] = !p.media[k.slice(2)]; else p[k] = !p[k]; render(); },
  gMediaExp: () => { S.gMediaOpen = !S.gMediaOpen; render(); },
  gPermSave: () => { grp().perm = S.gp; back(); gToast('Group permissions updated'); },
  gSaveAsk: () => { if (!S.gf.name.trim()) { S.gfErr = true; render(); return; } S.gDlg='gSave'; S.dialog='g'; render(); },
  gSaveOk: () => { const g = grp(); const f = S.gf; const renamed = g.name!==f.name.trim(); g.name = f.name.trim(); g.letter = g.logo ? g.letter : gIni(g.name); g.bio = f.bio.trim(); g.photo = f.photo; if (renamed) gMsg(g, `<b>You</b> changed the group name to “${esc(g.name)}”`); S.dialog=null; back(); gToast('Group info updated'); },
  gPhotoMenu: () => openSheet('gPhoto'),
  gPhotoPick: () => openSheet('gGal'),
  gPhotoDel: () => { if (S.screen==='gform') S.gf.photo = null; else grp().photo = null; S.sheet=null; render(); },
  gGalPick: el => { if (S.screen==='gform') S.gf.photo = el.dataset.m; else { grp().photo = el.dataset.m; gToast('Group info updated'); } S.sheet=null; render(); },
  gAddMem: () => { const g = grp(); S.gf = {mode:'add', sel:[], mem:g.mem}; S.gq=''; go('gpick'); },
  gAddGo: () => { const g = grp(); const f = S.gf; f.sel.forEach(k=>{ g.mem.push({k, role:'member'}); gMsg(g, `<b>You</b> added <b>${esc(GP(k).n)}</b>`); }); const n = f.sel.length; back(); gToast(n===1?`${GP(f.sel[0]).n} added to group`:`${n} members added to group`); },
  gMemAct: el => { const a = el.dataset.a; const p = GP(S.gmk); S.sheet=null;
    if (a==='msg') { const cv = gStore().convs.find(x=>!x.group && x.name===p.n); if (cv) { S.conv = cv.id; go('chat'); } else gToast(`Opens a chat with ${p.n}.`); return; }
    if (a==='prof') { gToast(`Opens ${p.n}’s profile.`); render(); return; }
    S.gDlg = a; S.dialog='g'; render(); },
  gDlgOk: () => { const g = grp(); const d = S.gDlg; const m = g && g.mem.find(x=>x.k===S.gmk); const p = S.gmk && GP(S.gmk); S.dialog=null;
    if (d==='promote') { m.role='admin'; gMsg(g, `<b>You</b> made <b>${esc(p.n)}</b> a group admin`); render(); gToast(`${p.n} promoted to admin`); }
    else if (d==='demote') { m.role='member'; render(); gToast(`${p.n} demoted to member`); }
    else if (d==='remove') { g.mem = g.mem.filter(x=>x!==m); gMsg(g, `<b>${esc(p.n)}</b> removed from group`); render(); gToast(`${p.n} removed from group`); }
    else if (d==='leave') { gGone(g, 'left'); gHome(); }
    else if (d==='disband') { const c = gStore(); S.gUndo = {g, i:c.convs.indexOf(g)}; c.convs = c.convs.filter(x=>x!==g); gHome(); toast('Group already disbanded', 'undo', 5000); }
    else render(); },
  gLeave: () => { S.gDlg='leave'; S.dialog='g'; render(); },
  gDisband: () => { S.sheet=null; S.gDlg='disband'; S.dialog='g'; render(); },
  gShare: () => openSheet('gShare'),
  gShareTo: el => { const g = grp(); const cv = gStore().convs.find(x=>x.id===el.dataset.id); S.sheet=null;
    cv.msgs.push({id:nid(), me:true, t:'ginvite', text:'Group invitation', at:nowHM(), inv:{gid:g.id, name:g.name, by:'You', slug:g.name.toLowerCase().replace(/[^a-z0-9]+/g,'')}}); render(); gToast(`Invite sent to ${cv.name}`); },
  gInvView: el => { S.ginv = el.dataset.g; openSheet('gJoin'); },
  gJoin: () => { const c = gStore(); const id = S.ginv; let g = groups().find(x=>x.id===id); S.sheet=null;
    if (g) { S.conv = g.id; go('chat'); gToast('You’re already in this group'); return; }
    if (gNeedKyc()) return;
    const t = GINV[id]; g = {id, group:true, name:t.name, letter:t.name[0], photo:null, bio:t.bio, unread:0, at:'Today', mem:[{k:'me', role:'member'}, ...t.mem.map(k=>({k, role:k===t.mem[0]?'owner':'member'}))], perm:GPERM0(),
      msgs:[{id:'gs'+nid(), gsys:`<b>${esc(GP(t.mem[0]).n)}</b> created the group`, at:'10:00'}, {id:'gs'+nid(), gsys:'<b>You</b> joined group', at:nowHM()}]};
    g.roleFix = true; c.convs.unshift(g); S.conv = g.id; go('chat'); gToast(`You joined ${t.name}`); },
});
const GINV = {'g-kopi':{name:'Kopi Lovers KL', bio:'Weekend kopi crawls around KL. Everyone is welcome.', mem:['catherine','daniel','fionna','juan','kwang']}};
/* joined groups: you are a member there, whatever the Sera.cx scenario says */

/* seed a group invitation in the first personal chat */
(function(){ const c = gStore(); if (c.gInvSeeded) return; c.gInvSeeded = true; const cv = c.convs.find(x=>!x.group);
  if (cv) cv.msgs.push({id:'inv1', t:'ginvite', text:'Group invitation', whoName:'Catherine Lee', av:'ca2', at:'15:00', inv:{gid:'g-kopi', name:'Kopi Lovers KL', by:'Catherine Lee', slug:'kopiloverskl'}}); })();

/* sheets + dialogs */
const _ovGrp = overlayHTML; overlayHTML = () => { let h = _ovGrp();
  const sheet = (inner, label) => `<div class="scrim ${S.sheetAnim?'anim':''}" data-act="closeSheet2"></div><div class="sheet ${S.sheetAnim?'anim':''}" role="dialog" aria-label="${label}"><div class="grab" aria-hidden="true"></div>${inner}</div>`;
  const g = S.gid && groups().find(x=>x.id===S.gid);
  if (S.sheet==='gMenu' && g) { const r = myRole(g); h += sheet(`<div style="display:grid"><button class="menurow" data-act="gEdit">${ic('pen')}Edit Group</button>${r==='owner'?`<button class="menurow" data-act="gPerm">${ic('shield')}Group Permissions</button><button class="menurow danger" data-act="gDisband">${ic('trash')}Disband Group</button>`:''}</div>`, 'Group options'); }
  if (S.sheet==='gMem' && g) { const m = g.mem.find(x=>x.k===S.gmk); const p = GP(S.gmk); const me = myRole(g); const ro = roleOf(g,m);
    const rows = [['msg','msg','Send message']];
    rows.push(['prof','person','View profile']);
    if (me==='owner') { if (ro==='admin') { rows.shift(); rows.push(['demote','person','Demote to member']); } else if (ro==='member') rows.push(['promote','shield','Promote to admin']); rows.push(['remove','trash','Remove from group']); }
    else if (me==='admin' && ro==='member') rows.push(['remove','trash','Remove from group']);
    h += sheet(`<div class="gmhd">${img(p.av,p.n,'av40')}<span><b>${esc(p.n)}</b><small>${esc(p.u)}</small></span></div><div style="display:grid">${rows.map(([a,i,t])=>`<button class="menurow ${a==='remove'?'danger':''}" data-act="gMemAct" data-a="${a}">${ic(i)}${t}</button>`).join('')}</div>`, 'Member actions'); }
  if (S.sheet==='gPhoto') { const has = S.screen==='gform' ? S.gf.photo : g && g.photo; h += sheet(`<div style="display:grid"><button class="menurow" data-act="gPhotoPick">${ic('image')}Change Photo</button></div>`, 'Group photo'); }
  if (S.sheet==='gGal') h += sheet(`<div class="row-between" style="margin-bottom:10px"><b class="t-headline">Recents</b></div><div class="pickgrid">${['mountain','gal1','gal2','act3','act4','exp2','svct1','exp1','profCover'].map(o=>`<button data-act="gGalPick" data-m="${o}">${img(o,'Photo')}</button>`).join('')}</div>`, 'Choose a photo');
  if (S.sheet==='gShare') { const list = gStore().convs.filter(x=>!x.group); h += sheet(`<div class="row-between" style="margin-bottom:12px"><span class="ico">${ic('search')}</span><b class="t-headline">Send to</b><span style="width:24px"></span></div><div class="gshare">${list.map(x=>`<button data-act="gShareTo" data-id="${x.id}">${img(x.av,x.name)}<small>${esc(x.name)}</small></button>`).join('')}</div>`, 'Send to'); }
  if (S.sheet==='gJoin') { const id = S.ginv; const t = GINV[id] || (groups().find(x=>x.id===id) ? {name:groups().find(x=>x.id===id).name, bio:groups().find(x=>x.id===id).bio, mem:groups().find(x=>x.id===id).mem.filter(m=>m.k!=='me').map(m=>m.k)} : null);
    if (t) { const open = S.gJoinMore; const long = (t.bio||'').length>70;
      h += sheet(`<div style="text-align:center"><span class="gav av64g" style="margin:6px auto 8px"><b>${esc(t.name[0])}</b></span><h2 class="t-headline" style="margin:0">${esc(t.name)}</h2><p class="t-caption subtle" style="margin:2px 0 12px">${t.mem.length+1} members</p></div>
        <p class="t-body" style="margin:0 0 14px; white-space:pre-line">${esc(open||!long?t.bio:t.bio.slice(0,68)+'…')}${long?` <button class="link" data-act="gJoinMore">${open?'See less':'See more'}</button>`:''}</p>
        <div class="gjav">${t.mem.slice(0,4).map(k=>`<span>${img(GP(k).av,GP(k).n)}<small>${esc(GP(k).n.split(' ')[0])}</small></span>`).join('')}${t.mem.length>4?`<span><i>+${t.mem.length-4}</i><small>Others</small></span>`:''}</div>
        ${btn('Join Group','gJoin')}`, 'Join group'); } }
  if (S.dialog==='g') { const g2 = g; const p = S.gmk && GP(S.gmk); const nm = esc(S.gDlgName || (g2&&g2.name) || '');
    const own = g2&&myRole(g2)==='owner';
    const D7 = {
      promote:['shieldUp','Promote to Admin', `Are you sure want to promote ${p&&esc(p.n)} to Group Admin?`, ['Yes, Promote','gDlgOk'], ['Cancel','closeDialog']],
      demote:['shield','Demote to Member', `Are you sure want to demote ${p&&esc(p.n)} to member again?`, ['Yes, Demote','gDlgOk'], ['Cancel','closeDialog']],
      remove:['trash','Remove from Group?', `Are you sure you want to remove ${p&&esc(p.n)} from this group? They will no longer have access to this chat.`, ['Remove','gDlgOk'], ['Cancel','closeDialog']],
      leave:['leave','Leave Group?', `Are you sure you want to leave this group?${own?' The earliest admin becomes the owner. If there are no admins, the earliest member does.':''}`, ['Leave','gDlgOk'], ['Cancel','closeDialog']],
      disband:['userX','Disband Group', `Are you sure want to disband ${nm} chat group? This will remove all members from this group also.`, ['Disband','gDlgOk'], ['Cancel','closeDialog']],
      gDiscard:['alert','Discard Changes?', 'Are you sure you want to go back? Your changes won’t be saved.', ['Keep Editing','closeDialog'], ['Discard','gDiscardOk']],
      gSave:['edit','Save Group Changes?', 'Are you sure you want to save these changes to your group?', ['Save','gSaveOk'], ['Cancel','closeDialog']],
      gLeft:['leave','You left the group', `You are no longer ${nm}’s member. The group is now deleted from your chat list.`, ['Okay','closeDialog']],
      gDisbanded:['userX','Group disbanded', `You disbanded ${nm}. The group is now deleted from your chat list.`, ['Okay','closeDialog']],
      gRemovedMe:['userMinus','You are removed from group', `You are no longer ${nm}’s member. The group is now deleted from your chat list.`, ['Okay','closeDialog']],
      gDisbandedMe:['userX','Group disbanded', `${nm} was disbanded by its owner. The group is now deleted from your chat list.`, ['Okay','closeDialog']],
    }[S.gDlg];
    if (D7) h += gModal(...D7); }
  return h; };
A.gJoinMore = () => { S.gJoinMore = !S.gJoinMore; S.sheetAnim=false; render(); };

/* inputs (keep focus while typing) */
document.addEventListener('input', e => { const m = e.target.dataset && e.target.dataset.gm; if (!m) return;
  if (m==='gq') { S.gq = e.target.value; const pos = e.target.selectionStart; render(); const i = document.getElementById('gq'); if (i) { i.focus(); i.setSelectionRange(pos,pos); } }
  if (m==='gfName') { const had = S.gfErr; S.gf.name = e.target.value; S.gfErr = false; if (had) { const pos = e.target.selectionStart; render(); const i = document.getElementById('gfName'); if (i) { i.focus(); i.setSelectionRange(pos,pos); } } }
  if (m==='gfBio') S.gf.bio = e.target.value; });

Object.assign(META, {
  ginfo:{name:'Group info', group:'Chat', figma:'3.2 groupchat › Group as Creator / Group Admin / Group Member', rules:['All roles: Chat · Share · Leave and tabs Members / Media / Files. Owner and Admin tags sit next to the name.','Creator: ⋯ Edit Group, Group Permissions, Disband Group. On a member: Send message, View profile, Promote to admin, Remove from group. On an admin: View profile, Demote to member, Remove from group.','Admin: pencil opens Edit group; can add members, change the photo and remove members. On the owner or another admin: Send message, View profile only.','Member: no edit icons, no Add Members (unless allowed). Share hides when Invite via link is off. On anyone: Send message, View profile.','Creator leaves: the earliest admin becomes the creator; with no admins, the earliest-joined member.']},
  gpick:{name:'Create group · pick members', group:'Chat', figma:'3.2 groupchat › Create Group', rules:['Badge Verified users only; others go to Badge Verification first.','Search, tick people, picked people show on top. Continue needs at least one.']},
  gform:{name:'Create / Edit group', group:'Chat', figma:'3.2 groupchat › Create Group / edit', rules:['Photo (Change / Delete), Group Name required, Bio optional, members with remove.','Edit: Save Changes asks “Save Group Changes?”, then toast Group info updated.']},
  gperm:{name:'Group permissions', group:'Chat', figma:'3.2 groupchat › Group Permissions', rules:['Creator only. Members can: Add other members, Send messages, Send media (Photo, Video, Document, GIF, Voice), Invite via link.','Send messages off: members see “Only admins can send messages”.']},
  gpic:{name:'Group profile photo', group:'Chat', figma:'3.2 groupchat › Profil Picture', rules:['Full-screen group photo; creator and admins can change or delete it.']},
});
if (!scen.gContacts) scen.gContacts = 'has';
if (scen.gListV !== 2) { scen.gList = 'empty'; scen.gListV = 2; saveScen(); } if (!scen.gRole) scen.gRole = 'owner'; if (!scen.gEvent) scen.gEvent = 'none';

/* ===== Group chat update (Figma 3.2 · 17 Nov): exit states stay in the list, disband undo, permission hints, discard edits ===== */
const G_GONE = {left:'You left the group', removed:g=>`${GP((g.mem.find(m=>m.role==='owner')||{k:'maulguy'}).k).n} removed you`, disbanded:'This group has been disbanded by the owner'};
function gGone(g, why){ g.gone = why; g.unread = 0; const t = typeof G_GONE[why]==='function' ? G_GONE[why](g) : G_GONE[why]; g.goneText = t; g.msgs.push({id:'gs'+nid(), gsys:esc(t), at:nowHM()}); g.at = 'Today'; }
const _gRow0 = gRow;
gRow = function(g){ if (!g.gone) return _gRow0(g); return `<button class="clrow" data-act="openConv" data-id="${g.id}">${gAv(g,'av44g')}<span class="cm"><b>${esc(g.name)}</b><small class="ggone">${esc(g.goneText)}</small></span><span class="cr"><small>${g.at||'Today'}</small></span></button>`; };
const _chatVG = V.chat;
V.chat = () => { const c = conv(); let h = _chatVG(); if (!c.group || !c.gone) return h;
  h = h.replace('<button class="hostedby" data-act="gInfo">', '<button class="hostedby" data-act="noop">');
  return h.replace(/<div class="cfoot">[\s\S]*<\/div><\/div>$/, `<div class="cfoot"><div class="gnosend">${ic('info')}You’re no longer a member of this group.</div></div></div>`); };
A.gUndo = () => { const u = S.gUndo; if (u) { const c = gStore(); c.convs.splice(Math.max(0,u.i), 0, u.g); S.gUndo = null; } S.toast = null; render(); };
const _renderToastG = renderToast;
renderToast = function(){ if (!S.toast || S.toast.kind!=='undo') return _renderToastG(); const ph = document.getElementById('phone'); let t = document.getElementById('toast'); if (t) t.remove();
  ph.insertAdjacentHTML('beforeend', `<div class="toast gundo" id="toast" role="status">${ic('check')}<span>${esc(S.toast.text)}</span><button data-act="gUndo">${ic('undo')}Undo</button></div>`); };
/* edit group: keep the original to detect changes */
A.gEdit = (orig => () => { orig(); S.gf.orig = {name:S.gf.name, bio:S.gf.bio, photo:S.gf.photo}; })(A.gEdit);
A.back = (orig => el => { if (S.screen==='gform' && S.gf && S.gf.mode==='edit' && S.gf.orig && (S.gf.name!==S.gf.orig.name || S.gf.bio!==S.gf.orig.bio || S.gf.photo!==S.gf.orig.photo)) { S.gDlg='gDiscard'; S.dialog='g'; render(); return; } orig(el); })(A.back);
A.gDiscardOk = () => { S.dialog = null; back(); };
A.gInfo = (orig => () => { if (conv().group && conv().gone) return; orig(); })(A.gInfo);
/* permissions with hints (Figma 3201:9748) */
V.gperm = () => { const p = S.gp; const n = Object.values(p.media).filter(Boolean).length;
  const sw = (k, on, t, sub, ic0) => `<div class="gprow g2">${ic(ic0)}<span class="gpt"><b>${t}</b><small>${sub}</small></span><button class="switch ${on?'on':''}" role="switch" aria-checked="${on}" data-act="gPermTog" data-k="${k}" aria-label="${t}"><i></i></button></div>`;
  return `<div class="screen">${statusBar()}${topBar('Group permissions')}<div class="scroll pad16" style="padding-bottom:20px"><p class="kicker3" style="padding:0">Members can:</p>
    ${sw('add', p.add, 'Add other members', 'Members can add people from their contact', 'userplus')}${sw('send', p.send, 'Send messages', 'Members can post in the group', 'msg')}
    <div class="gprow g2">${ic('camera')}<button class="gpt gpexp2" data-act="gMediaExp"><b>Send media</b><small>Choose which media types members can send</small></button><span class="gpn">${n}/5 ${ic(S.gMediaOpen?'chevdown':'chev')}</span><button class="switch ${n?'on':''}" role="switch" aria-checked="${!!n}" data-act="gPermTog" data-k="mediaAll" aria-label="Send media"><i></i></button></div>
    ${S.gMediaOpen?`<div class="gpmedia">${[['photo','Photo'],['video','Video'],['document','Document'],['gif','GIF'],['voice','Voice']].map(([k,t])=>`<button class="gpm" data-act="gPermTog" data-k="m_${k}"><i class="gck ${p.media[k]?'on':''}">${p.media[k]?'✓':''}</i>${t}</button>`).join('')}</div>`:''}
    ${sw('link', p.link, 'Invite via link', 'Members can share the group invite link', 'link')}</div><div class="cta">${btn('Save Changes','gPermSave')}</div></div>`; };
Object.assign(META.ginfo||{}, {rules:[...(META.ginfo&&META.ginfo.rules||[]), 'Leaving, being removed or the group being disbanded keeps the group in your list with a status line: “You left the group”, “Maulguy removed you”, “This group has been disbanded by the owner”. The chat becomes read-only.', 'Owner disbands: back to Locals with toast “Group already disbanded” and Undo.', 'Group photo menu: Change Photo only.']});

/* ===== V2 · Group modal format (Figma 3.2 · 3239:219222) ===== */
const GMI = {
  leave:'<path d="M14 4h-7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7"/><path d="M14 4l5 1.5v13L14 20z" fill="currentColor"/><path d="M11 12H3m3-3-3 3 3 3"/>',
  edit:'<path d="M12 20h8"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2"/><path d="M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14z" fill="currentColor"/><path d="M10 11v6M14 11v6" stroke="#fff"/>',
  userX:'<circle cx="11" cy="8" r="4"/><path d="M3 21c0-4 3.5-6.5 8-6.5"/><path d="M16 16l5 5m0-5-5 5"/>',
  userMinus:'<circle cx="11" cy="8" r="4"/><path d="M3 21c0-4 3.5-6.5 8-6.5"/><path d="M15 19h6"/>',
  alert:'<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 7v6M12 16.5v.5" stroke="#fff"/>',
  shield:'<path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5z" fill="currentColor"/><path d="M9 11l3 3 3-3" stroke="#fff"/>',
  shieldUp:'<path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5z" fill="currentColor"/><path d="M9 13l3-3 3 3" stroke="#fff"/>'
};
function gModal(icon, title, body, pri, sec){
  return `<div class="scrim anim"></div><div class="dialog anim gm8" role="alertdialog" aria-labelledby="gm8t">
    <div class="gm8-top"><span class="gm8-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GMI[icon]||GMI.alert}</svg></span></div>
    <div class="gm8-body"><h2 id="gm8t">${title}</h2><p>${body}</p></div>
    <div class="gm8-acts"><button class="gm8-pri" data-act="${pri[1]}">${pri[0]}</button>${sec?`<button class="gm8-sec" data-act="${sec[1]}">${sec[0]}</button>`:''}</div></div>`;
}
