/* ===== Activity V3: free activities, owner-approved requests, linked group chat and schedule locks ===== */
(function(){
const AV = window.AV = {mine:[], req:{}, seeded:false, seq:10, joinSeq:2};
GMI.check = '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M7.5 12.5l3 3 6-6.5" stroke="#fff"/>';
function sampleActivitySessions(){
  const first = new Date(); first.setDate(first.getDate()+1); first.setHours(0,0,0,0);
  const second = new Date(first); second.setDate(second.getDate()+1);
  const label = date => date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  return [['s1',label(first),'04:00 PM - 09:00 PM',12],['s2',label(second),'09:00 AM - 01:00 PM',8]];
}
const ACT_SESS = {'e-batu':sampleActivitySessions()};
const sessOf = id => (ACT_SESS[id] = ACT_SESS[id] || sampleActivitySessions());
window.__actSess = id => sessOf(id);
const pk = k => GP(k) ? k : 'maulguy';
const who2 = k => k==='me' ? {n:'You', av:'avatar', u:'@elsaa'} : (GP(k) || {n:k, av:'avatar', u:''});
const accPax = a => a.appl.filter(x=>x.st==='accepted').reduce((n,x)=>n+x.pax,0);
const takenPax = a => a.appl.filter(x=>x.st!=='rejected').reduce((n,x)=>n+x.pax,0);
function sessionsEnded(sessions){
  if (!sessions || !sessions.length) return false;
  const ends = sessions.map(([,dateLabel,timeRange]) => {
    const date = String(dateLabel).match(/\b(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\b/);
    const times = String(timeRange).match(/\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!date || !times) return null;
    const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
    const end = new Date(Number(date[3]), months[date[2]], Number(date[1]));
    let hour = Number(times[1]) % 12 + (times[3].toUpperCase()==='PM' ? 12 : 0);
    end.setHours(hour, Number(times[2]), 0, 0);
    return Number.isNaN(end.getTime()) ? null : end.getTime();
  }).filter(x => x !== null);
  return ends.length === sessions.length && Math.max.apply(null, ends) <= Date.now();
}
const hasEnded = a => !!a.ended || (a.status==='live' && sessionsEnded(a.sess));
window.__actEnded = hasEnded;
const isActive = a => a.status==='live' && !hasEnded(a);
const stOf = a => a.status==='review' ? ['In review','pend'] : a.status==='rejected' ? ['Rejected','rej'] : hasEnded(a) ? (a.listed ? ['Ended','off'] : ['Unlisted','off']) : a.listed ? ['Live','ok'] : ['Unlisted','off'];
const findGroup = id => C6().convs.find(v => v.id === id);

function mkGroup(c, a){
  const id = 'g-act-' + a.id; if (c.convs.some(v=>v.id===id)) return;
  const acc = a.appl.filter(x=>x.st==='accepted');
  c.convs.unshift({id, group:true, name:'Activity: ' + a.title, letter:a.title[0], logo:false, photo:a.img, unread:0, at:'Now',
    bio:`This group is linked to the activity “${a.title}”. Everyone who joins the activity is added here automatically.`,
    mem:[{k:'me', role:'owner', joinedAt:0}, ...acc.map((x,i)=>({k:x.k, role:'member', joinedAt:x.joinedAt||i+1}))], perm:GPERM0(), actId:a.id,
    msgs:[{id:'ga'+a.id+'1', gsys:'Group created for this activity. <b>You</b> are the admin', at:'09:00'}, ...acc.map((x,i)=>({id:'ga'+a.id+'j'+i, gsys:`<b>${esc(who2(x.k).n)}</b> joined group`, at:'09:0'+(i+1)}))]});
  a.gid = id;
}
function seed(c){
  if (AV.seeded) return; AV.seeded = true;
  const a1 = {id:'a1', expId:'e-art', title:'Street Art Photo Walk in Kuala Lumpur', img:'act5', photos:['act5','act3','act4'], cat:'Local Travel', sub:'City Walks', desc:'Walk the murals of Kuala Lumpur with a photographer and learn to shoot street scenes.', loc:['Petaling Street','Kuala Lumpur'], min:2, maxOn:true, max:10, status:'live', ended:false, listed:true,
    sess:[['s1','Sat, 24 Oct 2026','09:00 AM - 11:00 AM'],['s2','Sun, 25 Oct 2026','04:00 PM - 06:00 PM']],
    appl:[{id:'p1', k:'catherine', pax:2, sess:'s1', st:'new'}, {id:'p2', k:'daniel', pax:1, sess:'s1', st:'new'}, {id:'p3', k:'kwang', pax:1, sess:'s2', st:'accepted'}, {id:'p4', k:'fionna', pax:1, sess:'s2', st:'rejected'}]};
  const a2 = {id:'a2', title:'Sunrise Hike at Bukit Tabur', img:'act3', photos:['act3','act4','act1'], cat:'Sport', sub:'Running', desc:'An early hike to watch the sunrise over the city.', loc:['Bukit Tabur','Selangor'], min:3, maxOn:true, max:12, status:'review', ended:false, listed:true, sess:sampleActivitySessions().map((s,i)=>[s[0],s[1],i?'09:00 AM - 11:00 AM':'05:30 AM - 08:30 AM']), appl:[]};
  const a3 = {id:'a3', title:'Night Market Food Crawl', img:'act4', photos:['act4','act1','act3'], cat:'Culinary', sub:'Tasting & Tours', desc:'Taste the best stalls at the night market.', loc:['Jalan Alor','Kuala Lumpur'], min:2, maxOn:false, max:10, status:'rejected', note:'The photos show other brands’ logos. Please use your own photos.', ended:false, listed:true, sess:[['s1','Fri, 30 Oct 2026','07:00 PM - 10:00 PM']], appl:[]};
  AV.mine.push(a1, a2, a3); mkGroup(c, a1);
}
const _C6act = C6;
C6 = function(){ const c = _C6act(); if (!AV.seeded) seed(c); return c; };
const mineById = id => { C6(); return AV.mine.find(a => a.id === id); };
const cur = () => mineById(S.actId);

/* ---------- gates ---------- */
function actGate(next){
  if (S.session !== 'user') { if (A.g7Login) A.g7Login(); else openSheet('login'); return; }
  if (kyc() !== 'approved') { openSheet('actKyc'); return; }
  next();
}
function activityMemberCannotBeRemoved(g, k){
  if (!g || !(g.actId || g.expId)) return false;
  if (g.actId) { const a = mineById(g.actId); return !!(a && a.appl.some(x=>x.k===k && x.st==='accepted')); }
  return g.mem.some(m=>m.k===k && m.role!=='owner');
}
const lockMsg = {
  delete:'You can’t delete this activity while its schedule is active. You can delete it after the last session ends.',
  unlist:'You can unlist this activity after its last session ends.',
  edit:'You can’t edit this activity because people have already joined. Edits are possible again after the last session ends.',
  leave:'You can’t leave this group while the activity is running. You can leave after the last session ends.',
  cancel:'You can’t cancel your spot while the activity is running.'};
const lock = k => { S.actLock = lockMsg[k]; S.dialog = 'actLock'; render(); };

/* ---------- My Activities ---------- */
V.actmine = () => { C6(); const tab = S.actTab || 'created';
  const tabs = `<div class="gtabs n2 act-tabs" role="tablist">${[['created','Created'],['applied','Applied']].map(([k,t])=>`<button role="tab" aria-selected="${tab===k}" data-act="actTab" data-k="${k}">${t}</button>`).join('')}</div>`;
  let body;
  if (tab === 'created') {
    body = AV.mine.length ? `<p class="gx-sl">Your activities · ${AV.mine.length}</p><div class="gx-sg">${AV.mine.map(a => { const s = stOf(a); const nw = a.appl.filter(x=>x.st==='new').length;
      return `<button class="act-row" data-act="actOpen" data-id="${a.id}">${img(a.img, a.title, 'act-th')}<span class="cm"><b>${esc(a.title)}</b><small>${a.status==='live' ? `${accPax(a)} joined${a.maxOn?' of '+a.max:''}${nw?` · <em>${nw} new request${nw>1?'s':''}</em>`:''}` : a.status==='review' ? 'Waiting for admin review' : 'Tap to see why'}</small></span><i class="act-st ${s[1]}">${s[0]}</i></button>`; }).join('')}</div>`
      : `<div class="gx-empty"><span>${ic('cal')}</span><b>No activities yet</b><small>Create a free activity and invite people to join.</small></div>`;
  } else {
    const reqs = Object.entries(AV.req);
    body = reqs.length ? `<p class="gx-sl">Requests you sent · ${reqs.length}</p><div class="gx-sg">${reqs.map(([id, r]) => { const e = expById(id); const s = sessOf(id).find(x=>x[0]===r.sess) || sessOf(id)[0];
      const chipT = r.st==='pending' ? ['Pending','pend'] : r.st==='accepted' ? ['Joined','ok'] : ['Not accepted','rej'];
      return `<div class="act-row">${img(e.img, e.title, 'act-th')}<span class="cm"><b>${esc(e.title)}</b><small>${s[1]} · ${r.pax} ${r.pax>1?'people':'person'}</small>
        ${r.st==='pending' ? `<button class="act-mini" data-act="actWithdraw" data-id="${id}">Withdraw request</button>` : r.st==='accepted' ? `<button class="act-mini on" data-act="actOpenExpGroup" data-id="${id}">${ic('chat')}Group chat</button>` : ''}</span><i class="act-st ${chipT[1]}">${chipT[0]}</i></div>`; }).join('')}</div>
      <p class="act-note">Pending requests stay open until the owner answers. You can withdraw them anytime.</p>`
      : `<div class="gx-empty"><span>${ic('send')}</span><b>No requests yet</b><small>Find an activity in Discover › Activities and tap Request to Join.</small></div>`;
  }
  return `<div class="screen">${statusBar()}${topBar('My Activities')}<div class="act-hd">${tabs}</div><div class="scroll" style="padding:0 16px 24px">${body}</div>
    ${tab==='created' ? `<div class="cta">${btn('Create Activity','actCreate')}</div>` : ''}</div>`; };

/* ---------- my activity (owner) ---------- */
V.actd = () => { const a = cur(); if (!a) return V.actmine(); const s = stOf(a); const g = a.gid && findGroup(a.gid);
  const nw = a.appl.filter(x=>x.st==='new').length;
  const row = (act, i, t, sub, locked, danger) => `<button class="gx-sr ${locked?'locked':''} ${danger?'dng':''}" data-act="${act}"><span class="gx-si">${ic(locked?'lock':i)}</span><span><b>${t}</b><small>${sub}</small></span>${ic('chev')}</button>`;
  const canEdit = !(isActive(a) && accPax(a) > 0);
  const rows = [row('actEdit','pen','Edit activity', a.status==='live' ? 'Saving sends it back to review' : 'Change details and resubmit', !canEdit)];
  if (a.status === 'live') rows.push(row('actUnlist', a.listed?'eyeoff':'eye', a.listed?'Unlist activity':'List again', hasEnded(a) ? (a.listed?'Hide it from Discover. The group stays active':'Show it in Discover again') : 'Available after the last session ends', isActive(a)));
  rows.push(row('actDelete','trash','Delete activity', isActive(a) ? 'Available after the last session ends' : g ? 'Choose what happens to the group chat' : 'Removes it for good', isActive(a), !isActive(a)));
  const note = a.status==='review' ? `<div class="act-banner">${ic('clock')}<span><b>Waiting for review</b>An admin checks new activities, usually within 24 hours. The group chat is created once it’s approved.</span></div>`
    : a.status==='rejected' ? `<div class="act-banner rej">${ic('alert')}<span><b>Not approved</b>${esc(a.note||'Please check the details and resubmit.')}</span></div>`
    : hasEnded(a) ? `<div class="act-banner off">${ic('check')}<span><b>All sessions ended</b>You can now unlist or delete it, and members can leave the group.</span></div>` : '';
  return `<div class="screen">${statusBar()}${topBar('My activity')}<div class="scroll" style="padding:4px 16px 24px">
    <div class="act-hero">${img(a.img, a.title)}<i class="act-st ${s[1]}">${s[0]}</i></div>
    <h1 class="act-t">${esc(a.title)}</h1>
    <p class="act-price"><b>Free</b> · you approve each request</p>
    ${note}
    ${a.status==='live' ? `<div class="act-tiles">
      <button data-act="actAppl"><i>${ic('person')}</i><b>${nw}</b><small>New requests</small></button>
      <button data-act="actAppl" data-t="accepted"><i>${ic('group')}</i><b>${accPax(a)}${a.maxOn?'/'+a.max:''}</b><small>Joined</small></button>
      <button data-act="actGroup" ${g?'':'disabled'}><i>${ic('chat')}</i><b>Group</b><small>${g?'Open chat':'Not created'}</small></button></div>` : ''}
    <p class="gx-sl">Sessions</p><div class="gx-sg">${a.sess.map(([id,d,t]) => `<div class="act-sess"><span class="gx-si">${ic('cal')}</span><span><b>${d}</b><small>${t}</small></span><em>${a.appl.filter(x=>x.sess===id && x.st==='accepted').reduce((n,x)=>n+x.pax,0)} joined</em></div>`).join('')}</div>
    <p class="gx-sl">Manage</p><div class="gx-sg">${rows.join('')}</div>
    <p class="gx-sl">Details</p><div class="gx-sg act-kv"><div><span>Category</span><b>${esc(a.cat)} · ${esc(a.sub)}</b></div><div><span>Meeting point</span><b>${esc(a.loc[0])}</b></div><div><span>Participants</span><b>Min ${a.min}${a.maxOn?' · max '+a.max:' · no max'}</b></div><div><span>Join approval</span><b>Required</b></div></div>
  </div></div>`; };

V.actedit = () => { const a = cur(), c = S.cx; if (!a || !c || !c.editId) return V.actd();
  const section = (title, detail, stage) => `<div class="boxcard" style="margin-top:10px; gap:8px"><div class="row-between" style="align-items:flex-start"><span><b>${title}</b><small style="display:block; margin-top:4px">${detail}</small></span><button class="link" data-act="actEditSection" data-stage="${stage}">Change</button></div></div>`;
  const photos = c.photos.length ? `<div class="kgrid" style="grid-template-columns:repeat(3,1fr); margin-top:10px">${c.photos.map(p=>`<span class="kslot" style="aspect-ratio:1/1">${img(p,'Activity photo')}</span>`).join('')}</div>` : '<p class="t-caption subtle">No photos added.</p>';
  const activities = c.acts.length ? c.acts.map(x=>esc(x.t)).join(', ') : 'No activities added.';
  const loc = c.loc || a.loc || ['',''];
  const sessions = Object.entries(c.sched).flatMap(([key, slots]) => {
    const [y,m,d] = key.split('-').map(Number); const date = new Date(y,m-1,d);
    return slots.map(([start,end]) => `${date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})} · ${hh(start)} - ${hh(end)}`);
  });
  const schedule = sessions.length ? sessions.join('<br>') : 'No sessions added.';
  return `<div class="screen">${statusBar()}${topBar('Edit activity')}<div class="scroll" style="padding:4px 16px 24px">
    <div class="act-banner"><span><b>Changes require admin review</b>Resubmitting this activity sends it back for review.</span></div>
    <div class="boxcard" style="margin-top:12px; gap:8px"><div class="row-between"><b>Photos</b><button class="link" data-act="actEditSection" data-stage="3">Change</button></div>${photos}</div>
    ${section('Category', `${esc(c.cat)} · ${esc(c.sub)}`, 1)}
    ${section('Title and description', `${esc(c.title)}<br>${esc(c.desc)}`, 2)}
    ${section('Activities', activities, 4)}
    ${section('Location', `${esc(loc[0])}${loc[1]?` · ${esc(loc[1])}`:''}`, 5)}
    ${section('Schedule', schedule, 6)}
    ${section('Participants', `Min ${c.min} · ${c.maxOn?'Max '+c.max:'No maximum'}<br>Owner approval required`, 7)}
  </div><div class="cta">${btn('Save & resubmit','actSubmit')}</div></div>`; };

V.actappl = () => { const a = cur(); const t = S.actAt || 'new';
  const list = a.appl.filter(x => x.st === t);
  const sessT = id => (a.sess.find(s=>s[0]===id)||a.sess[0])[1];
  return `<div class="screen">${statusBar()}${topBar('Applicants')}<div class="act-hd"><div class="gtabs n3" role="tablist">${[['new','New Request'],['accepted','Accepted'],['rejected','Rejected']].map(([k,l])=>`<button role="tab" aria-selected="${t===k}" data-act="actAt" data-k="${k}">${l} <small class="act-cnt">${a.appl.filter(x=>x.st===k).length}</small></button>`).join('')}</div></div>
    <div class="scroll" style="padding:0 16px 24px">
      <div class="act-cap"><span>${takenPax(a)}${a.maxOn?' of '+a.max:''} spots taken</span><small>Pending requests count toward the limit</small></div>
      ${t==='accepted' ? `<p class="act-note" style="margin-top:0">Accepted people are in the group chat and can’t be removed.</p>` : ''}
      ${list.length ? `<div class="gx-sg">${list.map(x => { const p = who2(x.k); return `<div class="act-ap">${img(p.av, p.n, 'av40')}<span class="cm"><b>${esc(p.n)} ${vbadge()}</b><small>${x.pax} ${x.pax>1?'people':'person'} · ${sessT(x.sess)}</small></span>
        ${t==='new' ? `<span class="act-apb"><button class="b2" data-act="actApplAct" data-id="${x.id}" data-a="rejected">Reject</button><button class="b1" data-act="actApplAct" data-id="${x.id}" data-a="accepted">Accept</button></span>` : t==='accepted' ? `<i class="act-st ok">In group</i>` : ''}</div>`; }).join('')}</div>`
        : `<div class="gx-empty"><span>${ic('person')}</span><b>${t==='new'?'No new requests':t==='accepted'?'No one accepted yet':'No rejected requests'}</b><small>${t==='new'?'Requests stay here until you answer them.':''}</small></div>`}
    </div></div>`; };

/* ---------- Create Activity: reuse the experience form, 7 steps, no price ---------- */
const CX_ACT_EDIT_ORDER = [3,1,2,4,5,6,7];
const _cexp = V.cexp;
V.cexp = () => { const c = S.cx; if (!c || !c.act) return _cexp();
  const displayStep = c.step; const n = c.editId ? CX_ACT_EDIT_ORDER[displayStep-1] : displayStep;
  c.step = n;
  let h = _cexp();
  c.step = displayStep;
  h = h.replace(/<div class="hprog">[\s\S]*?<\/div>/, `<div class="hprog">${[1,2,3,4,5,6,7].map(i=>`<i class="${i<=displayStep?'on':''}"></i>`).join('')}</div>`);
  h = h.replace(`>${n}/8<`, `>${displayStep}/7<`).replace(/experience/g, 'activity').replace(/Experience/g, 'Activity');
  if (c.editId) {
    h = h.replace(/<div class="hprog">[\s\S]*?<\/div>/, '');
    h = h.replace(/<button\b(?=[^>]*data-act="cxLeave")[^>]*>[\s\S]*?<\/button>/, '');
    const titles = {1:'Change Category',2:'Change Title',3:'Edit Photos',4:'Change Activity',5:'Change Location',6:'Change Schedule',7:'Participants'};
    h = h.replace(/<span class="t-headline" style="flex:1; text-align:center">\d+\/7<\/span>/, '<span class="t-headline" style="flex:1; text-align:center">Edit activity</span>');
    h = h.replace(/<h1 class="t-headline" style="margin:4px 0 4px">[\s\S]*?<\/h1>/, `<h1 class="t-headline" style="margin:4px 0 4px">${titles[n]}</h1>`);
    const descriptions = {
      1:'Choose the category and subcategory for this activity.',
      2:'Update the activity title and description.',
      3:'Update the photos for this activity.',
      4:'Update the activities guests will take part in.',
      5:'Update the meeting point for this activity.',
      6:'Update dates and session times.',
    };
    if (descriptions[n]) h = h.replace(/<p class="t-body muted" style="margin:0 0 (?:10|12)px">[\s\S]*?<\/p>/, `<p class="t-body muted" style="margin:0 0 12px">${descriptions[n]}</p>`);
  }
  if (c.editSection) h = h.replace(/data-act="cx(?:Back|Leave)"/g, 'data-act="actEditSectionBack"');
  if (c.editSection) {
    h = h.replace(/<div class="cta">[\s\S]*$/, `<div class="cta">${btn('Save changes','cxNext',{disabled:!cxValid(n)})}</div></div>`);
  } else if (displayStep === 7) {
    h = h.replace(/<div class="cta">[\s\S]*$/, `<div class="cta">${btn(c.editId?'Save & resubmit':'Create Activity','actSubmit',{disabled:!cxValid(7)})}</div></div>`);
  }
  return h; };
A.cxNext = (orig => el => { const c = S.cx; if (c && c.act) {
  const stage = c.editId ? CX_ACT_EDIT_ORDER[c.step-1] : c.step;
  if (!cxValid(stage)) { toast({1:'Pick a category and a subcategory.',2:'Add a title and a description.',3:'Add at least 3 photos.',4:'Each activity needs a title and a description.',5:'Select a location.',6:'Add at least one session.'}[stage]||'Check the activity details.','err'); return; }
  if (c.editSection) { c.editSection = false; back(); return; }
  if (c.step === 7) { A.actSubmit(); return; }
  c.step++; render(); return;
} orig(el); })(A.cxNext);

/* ---------- Request to Join (other people's activities) ---------- */
const _vexpA = V.exp;
V.exp = () => { let h = _vexpA(); const e = expById(S.exp) || EXPERIENCES[0]; C6();
  const i = h.lastIndexOf('<div class="cta'); if (i < 0) return h;
  const r = AV.req[e.id]; const cross = e.country !== userCountry(); const available = sessOf(e.id).some(s=>s[3]>0);
  const own = e.host === 'elsa';
  let label = 'Request to Join', act = 'actJoin', dis = false, left = `<b>Free</b><small>owner approves</small>`;
  if (own) { label = 'Manage activity'; act = 'actManageOwn'; left = `<b>Free</b><small>your activity</small>`; }
  else if (e.full || !available) { label = 'Fully Booked'; dis = true; }
  else if (sessionsEnded(sessOf(e.id))) { label = 'Activity Ended'; dis = true; }
  else if (cross) { label = 'Not in your country'; dis = true; }
  else if (r && r.st === 'pending') { label = 'Request Sent'; dis = true; left = `<b>Pending</b><small><button class="link" data-act="actWithdraw" data-id="${e.id}">Withdraw request</button></small>`; }
  else if (r && r.st === 'accepted') { label = 'Open group chat'; act = 'actOpenExpGroup'; left = `<b class="act-okt">Joined</b><small>You’re in</small>`; }
  else if (r && r.st === 'rejected') { label = 'Not accepted'; dis = true; }
  if (dis) act = 'noop';
  const bar = `<div class="cta paybar act-bar"><div class="act-bl">${left}</div>${btn(label, act, {disabled:dis}).replace(`data-act="${act}"`, `data-act="${act}" data-id="${e.id}"`)}</div>`;
  return h.slice(0, i) + bar + '</div>'; };

/* group for an activity the user joined */
function joinExpGroup(e){
  const c = C6(); const id = 'g-exp-' + e.id; let g = c.convs.find(v=>v.id===id);
  if (!g) { const host = pk(e.host);
    g = {id, group:true, name:'Activity: ' + e.title, letter:e.title[0], logo:false, photo:e.img, unread:1, at:'Now', expId:e.id,
      bio:`This group is linked to the activity “${e.title}”. Everyone who joins is added here automatically.`,
      mem:[{k:host, role:'owner', joinedAt:0}, {k:'maulaura', role:'member', joinedAt:1}, {k:'maulana', role:'member', joinedAt:2}], perm:GPERM0(),
      msgs:[{id:'ge'+e.id+'1', gsys:`Group created for this activity. <b>${esc(who2(host).n)}</b> is the admin`, at:'09:00'}, {id:'ge'+e.id+'2', t:'text', who:host, text:'Welcome! See you at the meeting point 👋', at:'09:05'}]};
    c.convs.unshift(g); }
  if (!g.mem.some(m=>m.k==='me')) { const request = AV.req[e.id]; g.mem.push({k:'me', role:'member', joinedAt:request && request.joinedAt || ++AV.joinSeq}); g.msgs.push({id:'ge'+Date.now(), gsys:'<b>You</b> joined group', at:'Now'}); }
  return g;
}

/* ---------- overlays ---------- */
const _ovAct = overlayHTML;
overlayHTML = () => { let h = _ovAct();
  const sh = (inner, label) => `<div class="scrim ${S.sheetAnim?'anim':''}" data-act="actSheetX"></div><div class="sheet gx-sheet ${S.sheetAnim?'anim':''}" role="dialog" aria-label="${label}"><div class="grab" aria-hidden="true"></div>${inner}</div>`;
  if (S.sheet === 'actKyc') h += sh(`<div class="act-kyc"><span class="apgate-ic">${ic('verify')}</span><p class="sh-t">Verify your identity first</p><p class="sh-s">Badge Verification is needed to create an activity. It takes about 2 minutes.</p>${btn('Start Badge Verification','actKycGo')}<button class="act-later" data-act="actSheetX">Not now</button></div>`, 'Verify your identity');
  if (S.sheet === 'actJoinS') { const e = expById(S.exp); const ss = sessOf(e.id); const sel = S.actSess || (ss.find(s=>s[3]>0)||ss[0])[0]; const s = ss.find(x=>x[0]===sel); const maxP = Math.max(0,s[3]); const pax = Math.min(S.actPax||1, maxP);
    h += sh(`<p class="sh-t">Request to Join</p><p class="sh-s">The owner reviews your request. It stays open until they answer.</p>
      <p class="gx-sl" style="margin-left:4px">Choose a session</p><div class="gx-sg">${ss.map(([id,d,t,left])=>`<button class="act-ss ${id===sel?'on':''}" data-act="actSess" data-id="${id}" ${left?'':'disabled'}><span><b>${d}</b><small>${t}</small></span><em>${left?left+' spots left':'Full'}</em><i class="act-rad"></i></button>`).join('')}</div>
      <p class="gx-sl" style="margin-left:4px">How many people</p><div class="act-pax"><span><b>${pax} ${pax>1?'people':'person'}</b><small>Up to ${maxP} for this session</small></span><span class="act-step"><button data-act="actPax" data-d="-1" ${pax<=1?'disabled':''} aria-label="Fewer">−</button><b>${pax}</b><button data-act="actPax" data-d="1" ${pax>=maxP?'disabled':''} aria-label="More">+</button></span></div>
      <div style="margin-top:16px">${btn('Send request','actJoinGo',{disabled:maxP===0})}</div>`, 'Request to Join'); }
  if (S.dialog === 'actLock') h += gModal('alert', 'Not available yet', esc(S.actLock||''), ['Okay','closeDialog']);
  if (S.dialog === 'actConfirm') h += gModal('edit', S.cx && S.cx.editId ? 'Resubmit activity?' : 'Create activity?', S.cx && S.cx.editId ? 'Your changes go to admin review. The activity is hidden until it’s approved again.' : 'Please check the details. Your activity goes to admin review before people can see it.', [S.cx && S.cx.editId ? 'Resubmit' : 'Create', 'actCreateOk'], ['Cancel','closeDialog']);
  if (S.dialog === 'actDone') h += gModal('check', S.actDoneEdit ? 'Changes submitted!' : 'Activity created!', `“${esc(S.actDoneName||'')}” is now in review. We’ll notify you once it’s approved, usually within 24 hours. The group chat is created after approval.`, ['View activity','actDoneView'], ['Back to My Activities','closeDialog']);
  if (S.dialog === 'actDel') { const a = cur(); const g = a && a.gid && findGroup(a.gid);
    h += g ? `<div class="scrim anim"></div><div class="dialog anim gm8" role="alertdialog" aria-labelledby="actDelT"><div class="gm8-top"><span class="gm8-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GMI.trash}</svg></span></div>
        <div class="gm8-body"><h2 id="actDelT">Delete activity?</h2><p>This activity has a group chat with ${g.mem.length} member${g.mem.length>1?'s':''}. What should happen to it?</p></div>
        <div class="gm8-acts"><button class="gm8-pri" data-act="actDelOk" data-g="del">Delete activity and group</button><button class="gm8-pri act-alt" data-act="actDelOk" data-g="keep">Delete activity, keep the group</button><button class="gm8-sec" data-act="closeDialog">Cancel</button></div></div>`
      : gModal('trash', 'Delete activity?', `“${esc(a.title)}” will be removed for good.`, ['Delete','actDelOk'], ['Cancel','closeDialog']); }
  if (S.dialog === 'actWd') h += gModal('alert', 'Withdraw request?', 'The owner won’t see your request anymore. You can send a new one later.', ['Withdraw','actWithdrawOk'], ['Keep request','closeDialog']);
  return h; };
const _actGroupOverlay = overlayHTML;
overlayHTML = () => {
  let h = _actGroupOverlay();
  if (S.sheet !== 'gMem') return h;
  const g = grp();
  if (g && activityMemberCannotBeRemoved(g,S.gmk))
    h = h.replace(/<button\b(?=[^>]*data-act="gMemAct")(?=[^>]*data-a="remove")[^>]*>[\s\S]*?<\/button>/, '');
  return h;
};

/* ---------- actions ---------- */
Object.assign(A, {
  actMine: () => { S.actTab = S.actTab || 'created'; go('actmine'); },
  actTab: el => { S.actTab = el.dataset.k; render(); },
  actOpen: el => { S.actId = el.dataset.id; go('actd'); },
  actCreate: () => actGate(() => { const now = new Date(); S.cx = {step:1, act:true, cat:'', sub:'', title:'', desc:'', photos:[], acts:[{img:'', t:'', d:''}], loc:null, sched:{}, min:1, maxOn:true, max:10, price:'0', priceErr:false}; S.cxMon=now.getMonth(); S.cxYear=now.getFullYear(); S.cxDate=null; go('cexp'); }),
  actKycGo: () => { S.sheet = null; A.kycGate({dataset:{from:'activity'}}); },
  actSheetX: () => { S.sheet = null; render(); },
  actSubmit: () => { if (!cxValid(7)) { toast('Check the participant numbers.','err'); return; } S.dialog = 'actConfirm'; render(); },
  actCreateOk: () => { const c = S.cx; S.dialog = null;
    if (scen.network==='offline') { toast('No internet connection. Your answers are kept, try again.','err'); render(); return; }
    const sess = []; Object.entries(c.sched).forEach(([k, arr]) => { const [y,m,d] = k.split('-').map(Number); const dt = new Date(y, m-1, d); arr.forEach(([s,e2], i) => sess.push([k+'-'+i, dt.toLocaleDateString('en-GB',{weekday:'short', day:'numeric', month:'short', year:'numeric'}), `${hh(s)} - ${hh(e2)}`])); });
    let a;
    if (c.editId) { a = mineById(c.editId); Object.assign(a, {title:c.title, desc:c.desc, img:c.photos[0]||a.img, photos:c.photos, cat:c.cat, sub:c.sub, loc:c.loc||a.loc, min:c.min, maxOn:c.maxOn, max:c.max, acts:c.acts.map(x=>({...x})), sess:sess.length?sess:a.sess, status:'review', ended:false, note:null}); }
    else { a = {id:'a'+(++AV.seq), title:c.title, img:c.photos[0]||'act1', photos:c.photos, cat:c.cat, sub:c.sub, desc:c.desc, acts:c.acts.map(x=>({...x})), loc:c.loc||['Meeting point',''], min:c.min, maxOn:c.maxOn, max:c.max, status:'review', ended:false, listed:true, sess, appl:[]}; AV.mine.unshift(a); }
    S.actId = a.id; S.actDoneName = a.title; S.actDoneEdit = !!c.editId; S.cx = null;
    const i = S.hist.lastIndexOf('actmine'); if (i >= 0) S.hist = S.hist.slice(0, i); else S.hist = S.hist.filter(x => x !== 'cexp' && x !== 'actd');
    S.actTab = 'created'; go('actmine', {replace:true}); S.dialog = 'actDone'; render(); },
  actDoneView: () => { S.dialog = null; go('actd'); },
  actAppl: el => { S.actAt = (el && el.dataset && el.dataset.t) || 'new'; go('actappl'); },
  actAt: el => { S.actAt = el.dataset.k; render(); },
  actApplAct: el => { const a = cur(); const x = a.appl.find(y=>y.id===el.dataset.id); x.st = el.dataset.a; const p = who2(x.k);
    if (x.st === 'accepted') { x.joinedAt = ++AV.joinSeq; const g = a.gid && findGroup(a.gid); if (g && !g.mem.some(m=>m.k===x.k)) { g.mem.push({k:x.k, role:'member', joinedAt:x.joinedAt}); gMsg(g, `<b>${esc(p.n)}</b> joined group`); } toast(`${p.n} accepted and added to the group chat.`); }
    else toast(`${p.n}’s request was rejected.`);
    render(); },
  actGroup: () => { const a = cur(); if (!a.gid) return; S.conv = a.gid; S.gid = a.gid; go('chat'); setTimeout(scrollChat, 20); },
  actEditSection: el => { const stage = +el.dataset.stage; const step = CX_ACT_EDIT_ORDER.indexOf(stage)+1;
    if (!step) { toast('This edit section is unavailable.','err'); return; }
    S.cx.step = step; S.cx.editSection = true; go('cexp'); },
  actEditSectionBack: () => { S.cx.editSection = false; back(); },
  actEdit: () => { const a = cur(); if (isActive(a) && accPax(a) > 0) { lock('edit'); return; }
    const sched = {};
    for (const [, dateLabel, timeRange] of a.sess) {
      const date = new Date(dateLabel); const times = timeRange.split(/\s+-\s+/);
      const hour = value => { const m = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i); if (!m || Number(m[1])<1 || Number(m[1])>12 || Number(m[2])>59) return null; return Number(m[1])%12 + (m[3].toUpperCase()==='PM'?12:0) + Number(m[2])/60; };
      const hours = times.map(hour);
      if (Number.isNaN(date.getTime()) || times.length!==2 || hours.some(h=>h===null)) { toast('Activity sessions could not be loaded for editing.','err'); return; }
      const key = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
      if (!sched[key]) sched[key] = [];
      sched[key].push(hours);
    }
    const acts = a.acts && a.acts.length ? a.acts.map(x=>({...x})) : [{img:'', t:a.title, d:a.desc||''}];
    S.cx = {step:1, act:true, editId:a.id, cat:a.cat, sub:a.sub, title:a.title, desc:a.desc, photos:[...a.photos], acts, loc:a.loc, sched, min:a.min, maxOn:a.maxOn, max:a.max, price:'0', priceErr:false};
    const firstDate = Object.keys(sched).sort()[0] || null;
    const now = new Date(); S.cxMon = firstDate ? Number(firstDate.split('-')[1])-1 : now.getMonth(); S.cxYear = firstDate ? Number(firstDate.split('-')[0]) : now.getFullYear(); S.cxDate=firstDate; go('actedit'); },
  actUnlist: () => { const a = cur(); if (isActive(a)) { lock('unlist'); return; } a.listed = !a.listed; render(); toast(a.listed ? 'Activity is listed again.' : 'Activity unlisted. The group chat stays active.'); },
  actDelete: () => { const a = cur(); if (isActive(a)) { lock('delete'); return; } S.dialog = 'actDel'; render(); },
  actDelOk: el => { const a = cur(); const g = a.gid && findGroup(a.gid); const mode = el.dataset.g; S.dialog = null;
    if (g && mode === 'del') { const c = C6(); c.convs = c.convs.filter(v => v !== g); }
    if (g && mode === 'keep') { g.name = g.name.replace(/^Activity:\s*/, ''); delete g.actId; g.bio = ''; gMsg(g, 'The activity was deleted. This is now a regular group.'); }
    AV.mine = AV.mine.filter(x => x !== a); back(); toast(g ? (mode==='del' ? 'Activity and group deleted.' : 'Activity deleted. The group is now a regular group.') : 'Activity deleted.'); },
  /* participant */
  actJoin: el => { if (S.session !== 'user') { if (A.g7Login) A.g7Login(); else openSheet('login'); return; }
    const e = expById(el.dataset.id); const ss = sessOf(e.id);
    if (e.full || AV.req[e.id] || !ss.some(s=>s[3]>0) || sessionsEnded(ss) || e.country!==userCountry()) return;
    S.exp = e.id; S.actSess = null; S.actPax = 1; openSheet('actJoinS'); },
  actSess: el => { S.actSess = el.dataset.id; S.actPax = 1; S.sheetAnim = false; render(); },
  actPax: el => { S.actPax = Math.max(1, (S.actPax||1) + (+el.dataset.d)); S.sheetAnim = false; render(); },
  actJoinGo: () => { const e = expById(S.exp); const ss = sessOf(e.id); const sel = S.actSess || (ss.find(s=>s[3]>0)||ss[0])[0]; const s = ss.find(x=>x[0]===sel);
    if (!s || s[3] <= 0 || e.full || AV.req[e.id] || e.country!==userCountry() || sessionsEnded(ss)) { S.sheet=null; render(); toast('This session is no longer available.','err'); return; }
    const pax = Math.min(S.actPax||1, s[3]); AV.req[e.id] = {st:'pending', sess:sel, pax, at:'Now'}; s[3] -= pax; S.sheet = null;
    render(); toast('Request sent. The owner will review it.'); },
  actWithdraw: el => { S.actWdId = el.dataset.id; S.dialog = 'actWd'; render(); },
  actWithdrawOk: () => { const r = AV.req[S.actWdId]; if (r) { const s = sessOf(S.actWdId).find(x=>x[0]===r.sess); if (s) s[3] += r.pax; } delete AV.req[S.actWdId]; S.dialog = null; render(); toast('Request withdrawn.'); },
  actOpenExpGroup: el => { const e = expById(el.dataset.id); const g = joinExpGroup(e); S.conv = g.id; S.gid = g.id; go('chat'); setTimeout(scrollChat, 20); },
  actManageOwn: el => { C6(); const a = AV.mine.find(x => x.expId === el.dataset.id); if (a) { S.actId = a.id; go('actd'); } else A.actMine(); },
  actNewSvc: () => A.newSvc(),
  actExplore: () => { S.htab = 'discover'; S.seg = 'activities'; S.hist = []; S.sheet = null; go('discover', {replace:true}); const sc = document.querySelector('#phone .scroll'); if (sc) sc.scrollTop = 0; },
});

/* group: lock leave while the activity runs; owner hand-over after it ends */
const groupRunning = g => { if (!g) return false; if (g.actId) { const a = mineById(g.actId); return !!(a && isActive(a)); } if (g.expId) return !AV.expEnded && !sessionsEnded(sessOf(g.expId)); return false; };
A.gLeave = (orig => el => { const g = grp(); if (groupRunning(g)) { lock('leave'); return; } orig(el); })(A.gLeave);
A.gMemAct = (orig => el => { const g = grp(); if (el.dataset.a==='remove' && activityMemberCannotBeRemoved(g,S.gmk)) { S.sheet=null; toast('Accepted participants can’t be removed from an activity group.','err'); render(); return; } orig(el); })(A.gMemAct);
A.gDlgOk = (orig => el => { const g = grp(); if (S.gDlg==='remove' && activityMemberCannotBeRemoved(g,S.gmk)) { S.dialog=null; toast('Accepted participants can’t be removed from an activity group.','err'); render(); return; }
  if (S.gDlg === 'leave' && g && (g.actId || g.expId) && myRole(g) === 'owner') {
    const others = g.mem.filter(m => m.k !== 'me');
    if (!others.length) { S.dialog = null; const c = C6(); c.convs = c.convs.filter(v => v !== g); gHome(); toast('You were the last member, so the group was closed.'); return; }
    const next = others.reduce((old,m) => !old || (m.joinedAt!=null && (old.joinedAt==null || m.joinedAt<old.joinedAt)) ? m : old, null); next.role = 'owner'; gMsg(g, `<b>${esc(who2(next.k).n)}</b> is now the group admin`); orig(el); setTimeout(() => toast(`You left. ${who2(next.k).n} is now the group admin.`), 50); return; }
  orig(el); })(A.gDlgOk);

/* group info: linked activity data for other modules */
window.__actLinkOf = g => { if (!g || !(g.actId || g.expId)) return null; const a = g.actId ? mineById(g.actId) : null; const e = g.expId ? expById(g.expId) : null; if (!a && !e) return null;
  return {act: a ? 'actOpen' : 'openExp', id: a ? a.id : e.id, title: a ? a.title : e.title, img: a ? a.img : e.img, run: groupRunning(g)}; };
/* group info: linked activity card */
const _gi = V.ginfo;
V.ginfo = () => { let h = _gi(); const g = grp(); if (!g || !(g.actId || g.expId)) return h;
  const a = g.actId ? mineById(g.actId) : null; const e = g.expId ? expById(g.expId) : null; const t = a ? a.title : e.title; const im = a ? a.img : e.img;
  const run = groupRunning(g);
  const card = `<button class="act-link" data-act="${a?'actOpen':'openExp'}" data-id="${a?a.id:e.id}">${img(im, t, 'act-th')}<span><small>Linked activity</small><b>${esc(t)}</b><em>${run?'Running · leave locked until it ends':'All sessions ended'}</em></span>${ic('chev')}</button>`;
  return h.includes('<div class="gi-acts') ? h.replace('<div class="gi-acts', card + '<div class="gi-acts') : h.replace('<div class="gsheet">', '<div class="gsheet">' + card); };

/* naming: Discover tabs Hosts / Activities / Cashback, nav + chat title Hosts */
const _rgAct = render;
render = function(){ _rgAct(); const ph = document.getElementById('phone'); if (!ph) return;
  ph.querySelectorAll('.seg [data-act="seg"]').forEach(b => { if (b.dataset.k==='locals') b.textContent = 'Hosts'; if (b.dataset.k==='merchants') b.textContent = 'Cashback'; });
  if (S.screen === 'chats') ph.querySelectorAll('.topbar .t-headline, .g7top .t-headline').forEach(t => { if (t.textContent.trim()==='Locals') t.textContent = 'Hosts'; });
  if (S.screen === 'chats') ph.querySelectorAll('.kicker3').forEach(k => { if (k.textContent.trim()==='Locals' || k.textContent.trim()==='Hosts') k.remove(); });
  if (S.screen === 'discover') ph.querySelectorAll('[data-act="openSearch"]').forEach(b => { if (S.seg==='locals' || !S.seg) b.innerHTML = b.innerHTML.replace('Search locals','Search hosts'); });
  ph.classList.toggle('gxs', ph.classList.contains('gxs') || ['actmine','actd','actedit','actappl','cexp'].includes(S.screen));
  if (['actmine','actd','actedit','actappl','cexp'].includes(S.screen)) { ph.classList.add('gx-' + S.screen); ph.querySelectorAll('[data-act="back"] .ico, [data-act="cxBack"] .ico, [data-act="actEditSectionBack"] .ico').forEach(e => { e.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'; }); }
};

/* Host dashboard: Create Activity becomes Create Service */
const _host = V.hosttab;
V.hosttab = () => _host().replace(`data-act="hCreate"><span>${ic('plus')}</span>Create Activity`, `data-act="newSvc"><span>${ic('plus')}</span>Create Service`);

/* scenario: admin review, sessions ending, owner answers to the user's requests */
function adminReview(ok){ C6(); const a = AV.mine.find(x => x.status === 'review'); if (!a) { toast('No activity is waiting for review.'); return null; }
  if (ok) { a.status = 'live'; a.listed = true; a.ended = false; mkGroup(C6(), a); push('Activity approved', `“${a.title}” is live. Its group chat is ready.`); }
  else { a.status = 'rejected'; a.note = 'The photos are unclear. Please add brighter photos of the activity.'; push('Activity not approved', `“${a.title}” needs a few changes.`); }
  S.actId = a.id; return a; }
function endSessions(){ C6(); const a = AV.mine.find(isActive); if (!a) { toast('No running activity.'); return null; } a.ended = true; S.actId = a.id; toast(`All sessions of “${a.title}” ended.`); return a; }
function ownerAnswers(ok){ const id = Object.keys(AV.req).find(k => AV.req[k].st === 'pending'); if (!id) { toast('No pending request to answer.'); return; } const r = AV.req[id]; r.st = ok ? 'accepted' : 'rejected'; const e = expById(id);
  if (ok) { r.joinedAt = ++AV.joinSeq; joinExpGroup(e); push('Request accepted', `You’re in “${e.title}”. You were added to the group chat.`); }
  else { const s = sessOf(id).find(x=>x[0]===r.sess); if (s) s[3] += r.pax; push('Request not accepted', `The owner of “${e.title}” didn’t accept this time.`); }
  render(); }
Object.assign(A, {
  actSimApprove: () => { if (adminReview(true)) { go('actd'); } },
  actSimReject: () => { if (adminReview(false)) { go('actd'); } },
  actSimEnd: () => { if (endSessions()) go('actd'); },
  actSimAccept: () => ownerAnswers(true),
  actSimDecline: () => ownerAnswers(false),
});
Object.assign(appEntryRoutes, {
  actMine(open, context) {
    S.actTab = 'created';
    return open('actmine', context);
  },
  actNewSvc(open, context) {
    open('discover', context);
    A.newSvc();
    if (!S.hist.includes('__back')) S.hist = ['__back'];
  },
  actApprove(open, context) {
    open('actmine', context);
    if (adminReview(true)) go('actd');
  },
  actReject(open, context) {
    open('actmine', context);
    if (adminReview(false)) go('actd');
  },
  actEnd(open, context) {
    open('actmine', context);
    if (endSessions()) go('actd');
  },
  actJoinDemo(open, context) {
    S.exp = 'e-batu';
    return open('exp', context);
  },
});

Object.assign(META, {
  actmine:{name:'My Activities', group:'V2 · Activity', rules:['Entry: You page › My Activities. Create Activity: guest → login, KYC not approved → Verify sheet, approved → form','Created: In review, Live, Ended, Unlisted, Rejected','Applied: requests you sent with Request to Join. Pending requests never expire; withdraw anytime']},
  actd:{name:'My activity (owner)', group:'V2 · Activity', rules:['Active = approved until the last session ends','While active: Delete and Unlist are locked; Edit is locked once someone joined. Locked rows are dimmed and explain why','Delete with a group: delete both, keep the group (it becomes a regular group), or cancel']},
  actedit:{name:'Edit activity', group:'V2 · Activity', figma:'https://www.figma.com/design/EahbSzrwt1lVMNFG4gHLbG/YouApp-3.0?node-id=1982-9978', rules:['Edit opens an overview of the existing activity before any section editor','Change opens the matching editor; Save changes returns to this overview','Save & resubmit uses the existing review confirmation flow']},
  actappl:{name:'Applicants', group:'V2 · Activity', rules:['New Request, Accepted, Rejected. Pending requests count toward the max','Accept adds the person to the group chat; accepted people can’t be removed','Free: rejecting has no refund']},
});
const _rpAct = renderPanel;
renderPanel = function(){ _rpAct(); const p = document.getElementById('panel'); if (!p) return;
  const sc = [...p.querySelectorAll('.pgroup h2')].find(x=>x.textContent==='Scenario'); const later = sc && sc.parentElement.querySelector('.later:last-child');
  if (later && !p.querySelector('[data-act="actSimApprove"]')) later.insertAdjacentHTML('beforebegin', `<div class="ctl"><span class="lab">Activity · admin review</span><div class="segp" role="group" aria-label="Admin review"><button data-act="actSimApprove">Approve</button><button data-act="actSimReject">Reject</button><button data-act="actSimEnd">End all sessions</button></div><span class="later">Acts on your latest activity in review (or running, for End). Approve creates the group chat.</span></div>
    <div class="ctl"><span class="lab">Activity · your request</span><div class="segp" role="group" aria-label="Owner answer"><button data-act="actSimAccept">Owner accepts</button><button data-act="actSimDecline">Owner declines</button></div><span class="later">Answers your oldest pending Request to Join. Accept adds you to the activity group.</span></div>`); };
try { render(); } catch(e) {}
})();

/* ===== Activity V3 · My Activities uses the old "Experiences" plans wording (Applied | My Event) ===== */
(function(){
  V.actmine = () => { C6(); const tab = (S.actTab === 'applied') ? 'applied' : 'event';
    const tabs = `<div class="gtabs n2 act-tabs" role="tablist">${[['applied','Applied'],['event','My Event']].map(([k,t])=>`<button role="tab" aria-selected="${tab===k}" data-act="actTab" data-k="${k}">${t}</button>`).join('')}</div>`;
    const ST = a => a.status==='review' ? ['In review','pend'] : a.status==='rejected' ? ['Rejected','rej'] : window.__actEnded(a) ? (a.listed?['Ended','off']:['Unlisted','off']) : a.listed ? ['Live','ok'] : ['Unlisted','off'];
    const acc = a => a.appl.filter(x=>x.st==='accepted').reduce((n,x)=>n+x.pax,0);
    let body;
    if (tab === 'event') {
      body = AV.mine.length ? `<div class="am-list">${AV.mine.map(a => { const nw = a.appl.filter(x=>x.st==='new').length; const s = ST(a); const ses = a.sess[0];
        return `<button class="am-card am-tap" data-act="actOpen" data-id="${a.id}"><div class="am-h">${img(a.img, a.title, 'am-av')}<span><b>${esc(a.title)}</b><small>${ses[1]} · ${ses[2]}</small></span>${ic('chev')}</div>
          <div class="am-b"><div class="am-row"><span>${a.status==='live' ? `${acc(a)}${a.maxOn?' of '+a.max:''} joined` : a.status==='review' ? 'Waiting for admin review' : 'Not approved'}</span><span class="am-chips">${a.status==='live' && nw ? `<i class="act-st pend">${nw} Request${nw>1?'s':''}</i>` : ''}<i class="act-st ${s[1]}">${s[0]}</i></span></div></div></button>`; }).join('')}</div>`
        : `<div class="gx-empty"><span>${ic('cal')}</span><b>No activities yet</b><small>Create an activity and invite people to join.</small></div>`;
    } else {
      const reqs = Object.entries(AV.req);
      const S2 = r => r.st==='pending' ? ['Pending','pend'] : r.st==='accepted' ? ['Accepted','ok'] : ['Rejected','rej'];
      body = reqs.length ? `<div class="am-list">${reqs.map(([id, r]) => { const e = expById(id); const ss = (window.__actSess && window.__actSess(id)) || []; const s = ss.find(x=>x[0]===r.sess) || ss[0] || ['', 'Sat, 24 Oct 2026', '04:00 PM - 09:00 PM']; const st = S2(r);
        return `<div class="am-card"><button class="am-h am-tap" data-act="openExp" data-id="${id}">${img(e.img, e.title, 'am-av')}<span><b>${esc(e.title)}</b><small>${s[1]} · ${s[2]}</small></span>${ic('chev')}</button>
          <div class="am-b"><div class="am-row"><span>${r.pax} ${r.pax>1?'people':'person'}${r.st==='pending' ? ` · <button class="am-link" data-act="actWithdraw" data-id="${id}">Withdraw</button>` : r.st==='accepted' ? ` · <button class="am-link" data-act="actOpenExpGroup" data-id="${id}">Group chat</button>` : ''}</span><i class="act-st ${st[1]}">${st[0]}</i></div></div></div>`; }).join('')}</div>
        <p class="act-note">Pending requests stay open until the owner answers.</p><button class="am-explore" data-act="actExplore">${ic('search')}Explore more activities</button>`
        : `<div class="gx-empty"><span>${ic('send')}</span><b>No activities joined</b><small>Activities you request to join show up here.</small>${btn('Explore activities','actExplore',{cls:'am-exbtn'})}</div>`;
    }
    return `<div class="screen">${statusBar()}${topBar('My Activities')}<div class="act-hd">${tabs}</div><div class="scroll" style="padding:12px 16px 24px">${body}</div>
      ${tab==='event' ? `<div class="cta">${btn('Create Activity','actCreate')}</div>` : ''}</div>`; };
  try { render(); } catch(e) {}
})();

/* ===== Activity V3 · Discover top tabs: Hosts | Activities (PRD 6.9). Cashback is not a Discover tab ===== */
(function(){
  const _disc = V.discover;
  V.discover = () => {
    if (S.seg !== 'activities') S.seg = 'locals';
    if (S.htab === 'feed') S.htab = 'discover';
    const act = S.seg === 'activities';
    let h = _disc();
    h = h.replace(/<div class="htabs" role="tablist">[\s\S]*?<\/div>/, `<div class="htabs" role="tablist" aria-label="Hosts or Activities"><button role="tab" aria-selected="${!act}" data-act="browseTab" data-k="locals">Hosts</button><button role="tab" aria-selected="${act}" data-act="browseTab" data-k="activities">Activities</button></div>`);
    /* the in-page Hosts | Activities switch moved to the header */
    h = h.replace(/<div class="seg" role="tablist">(?:<button[^>]*data-act="seg"[^>]*>[^<]*<\/button>)+<\/div>/, '');
    if (act) {
      /* Activities are free (PRD 6.5): no price on the cards, Activity naming in the empty state */
      h = h.replace(/<span class="csub">From RM[\d.]+\/pax<\/span>/g, '<span class="csub act-free">Free · owner approves</span>')
        .replace('No available experience', 'No activities yet')
        .replace(/No available experiences yet in ([^<.]+)\./, 'There are no activities in $1 yet. Try another country.');
    }
    return h; };
  /* a stale Merchants/Feed choice falls back to Hosts */
  A.browseTab = (orig => el => { const k = el.dataset.k === 'activities' ? 'activities' : 'locals'; S.htab = 'discover'; S.seg = k; S.menu = false; render(); const sc = document.querySelector('#phone .scroll'); if (sc) sc.scrollTop = 0; })(A.browseTab);
  META.discover = Object.assign({}, META.discover, {rules:['Top tabs: Hosts and Activities (PRD Activity V3 6.9). Cashback is not a Discover tab','Top-right Inbox button with unread badge, same as Trips','Activities: country picker, categories, activity cards (Free, Fully Booked)']});
  try { render(); } catch(e) {}
})();
