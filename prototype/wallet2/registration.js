/* ===== V2 · Elite application webview form (new direction, 5 Nov 2026) =====
   Elite (and Merchant) registration is a simple form. Admins edit it in the admin panel;
   Kevon and Florence get an email alert for every new request. Replaces WhatsApp Contact Support for Elite. */
const EA_REF = 'EL-2611-0042', EA_SENT = '5 Nov 2026';
const EA_CITIES = ['Kuala Lumpur','Petaling Jaya','Shah Alam','Subang Jaya','Johor Bahru','Penang','Other'];
const eaInit = () => S.ea || (S.ea = {name:'Elsa Japasal', email:S.su&&S.su.email||'elsa.japasal@gmail.com', phone:'', city:'', why:'', agree:false, err:{}});
const elReviewCard = () => `<section class="sp-card"><div class="sp-h"><b>Request in review</b><span class="sp-due">${ic('clock')}Up to 48h</span></div>
  <p class="sp-st">${ic('info')}Sent ${EA_SENT} · Ref ${EA_REF}. Management reviews every request and replies within 48 hours. You’ll get a notification and an email.</p></section>`;
const eaTop = () => `<div class="ea-top"><button class="iconbtn" data-act="back" aria-label="Close">${ic('close')}</button><span class="ea-tt"><b>Elite application</b><small>${ic('lock')}youapp.ai · secure</small></span><span style="width:40px"></span></div>`;
V.elApply = () => { const f = eaInit(); const ro = scen.sh==='pending'; const e = f.err||{};
  const fld = (id, lab, inner, err, help) => `<div class="field ${err?'err':''}"><label for="${id}">${lab}</label>${inner}${err?`<span class="helper">${err}</span>`:help?`<span class="helper neutral">${help}</span>`:''}</div>`;
  const dis = ro ? 'disabled' : '';
  return `<div class="screen ea">${statusBar()}${eaTop()}
  <div class="scroll" style="padding-bottom:20px"><div class="pad16 stack" style="gap:14px">
    ${ro ? `<div class="hint warn">${ic('hourglass')}<span><b>In review.</b> Sent ${EA_SENT} · Ref ${EA_REF}. You can’t send another request while this one is in review.<button class="link ea-help" data-act="eaSupport">Need to change something? Contact Support</button></span></div>`
         : `<p class="t-body muted" style="margin:0">Tell us a bit about you. Management reviews every request within 48 hours.</p>`}
    ${fld('eaName','Full name',`<input id="eaName" class="input" data-in="eaName" value="${esc(f.name)}" autocomplete="name" ${dis}>`, e.name)}
    ${fld('eaAcc','YouApp account',`<input id="eaAcc" class="input" value="${esc(RF_ME.handle)}" readonly>`, '', 'From your account. Can’t be changed.')}
    ${fld('eaEmail','Email',`<input id="eaEmail" class="input" type="email" data-in="eaEmail" value="${esc(f.email)}" autocomplete="email" ${dis}>`, e.email)}
    ${fld('eaPhone','Phone (WhatsApp)',`<input id="eaPhone" class="input" type="tel" inputmode="tel" data-in="eaPhone" value="${esc(f.phone)}" placeholder="+60 12-345 6789" autocomplete="tel" ${dis}>`, e.phone)}
    ${fld('eaCity','City',`<select id="eaCity" class="input" data-in="eaCity" ${dis}><option value="">Choose your city</option>${EA_CITIES.map(c=>`<option ${f.city===c?'selected':''}>${c}</option>`).join('')}</select>`, e.city)}
    ${fld('eaWhy','How will you grow your network?',`<textarea id="eaWhy" class="input ea-ta" rows="3" maxlength="300" data-in="eaWhy" placeholder="For example: I run a cafe community of 200 people in PJ." ${dis}>${esc(f.why)}</textarea>`, e.why, `${f.why.length}/300`)}
    <label class="ea-agree ${e.agree?'err':''}"><input type="checkbox" id="eaAgree" data-in="eaAgree" ${f.agree||ro?'checked':''} ${dis}><span>I agree to the Elite terms</span></label>
    ${e.agree?`<span class="helper" style="margin-top:-8px; color:var(--a-error)">${e.agree}</span>`:''}
  </div></div>
  <div class="w2foot">${ro ? btn('Close','back',{kind:'btn-secondary'}) : btn('Submit request','eaSubmit',{loading:S.busy, disabled:S.busy})}</div></div>`; };
V.elApplyDone = () => `<div class="screen ea">${statusBar()}${eaTop()}
  <div class="scroll"><div class="pad16 stack" style="gap:14px; align-items:center; text-align:center; padding-top:48px">
    ${cele()}<h1 class="t-title" style="margin:0">Request sent</h1>
    <p class="t-body muted" style="margin:0">We’ll review it within 48 hours and let you know in the app and by email.</p>
    <span class="tag">Ref ${EA_REF}</span></div></div>
  <div class="w2foot">${btn('Back to YouApp','back')}</div></div>`;
SHEETS.shJoin = () => `<button class="tm-x" data-act="closeSheet" aria-label="Close">${ic('close')}</button>
  <div class="tm-hd"><span class="tm-crown sj-crown">${ic('crown')}</span><h2>Become an Elite</h2><p>Join and work closely with the YouApp team.</p></div>
  <p class="sj-lead">You’ll be eligible for</p>
  <ul class="sj-list">${['Up to 25% cashback from the merchants you bring in','A one-time free SVIP upgrade','A spot in our special prize pool','Earning extra referrals bonus'].map(t=>`<li><span class="sj-ck">${ic('check')}</span><span>${t}</span></li>`).join('')}</ul>
  ${btn('Apply now','elApplyOpen')}<p class="t-caption subtle" style="margin:8px 0 0; text-align:center">A short form. We reply within 48 hours.</p>`;
const _contactAdmin = A.contactAdmin;
Object.assign(A, {
  elApplyOpen: () => { S.sheet = null; eaInit(); go('elApply'); },
  eaSupport: () => toast(`Opening WhatsApp: “Hi YouApp Support, I have a question about my Elite request ${EA_REF}.”`),
  shJoinGo: () => A.elApplyOpen(),
  contactAdmin: el => el.dataset.k==='Elite' ? A.elApplyOpen() : _contactAdmin(el),
  eaSubmit: () => { const f = eaInit(); const e = {};
    if (!f.name.trim()) e.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address, like name@example.com.';
    if (f.phone.replace(/\D/g,'').length < 9) e.phone = 'Enter a phone number with at least 9 digits.';
    if (!f.city) e.city = 'Choose your city.';
    if (f.why.trim().length < 10) e.why = 'Write at least 10 characters.';
    if (!f.agree) e.agree = 'Tick the box to agree to the Elite terms.';
    f.err = e; if (Object.keys(e).length) { render(); return; }
    S.busy = true; render();
    setTimeout(() => { S.busy = false; scen.sh = 'pending'; saveScen(); go('elApplyDone', {replace:true}); }, 700); },
});
document.addEventListener('input', ev => { const k = ev.target.dataset && ev.target.dataset.in; if (!k || k.slice(0,2)!=='ea') return; const f = eaInit(); const t = ev.target;
  const map = {eaName:'name', eaEmail:'email', eaPhone:'phone', eaCity:'city', eaWhy:'why', eaAgree:'agree'}; const key = map[k]; if (!key) return;
  f[key] = key==='agree' ? t.checked : t.value; if (f.err && f.err[key]) { delete f.err[key]; reRender(ev); }
  else if (key==='why' || key==='city' || key==='agree') reRender(ev); });
META.elApply = {name:'Elite application (webview)', ph:3, rules:['Opens from every Elite apply entry: Host tab card and pop-up, Elite page, criteria sheet, Become an Elite, Business › Elite.','Prefilled: full name, YouApp account (locked), email. User adds phone, city and one short answer, then agrees to the terms.','Submit sets the request to In review. One request at a time: while in review, the same entries open this form read-only.','In review banner has a text button “Need to change something? Contact Support”. It opens WhatsApp with YouApp Support, prefilled with the request reference.','Back office: each new request sends an email alert to Kevon and Florence. They review and can edit it in the admin panel; approve turns on Elite, reject shows the reason in the app.'], open:['Merchant registration should use the same form pattern; not built yet.','Final field list to confirm with the team.']};
META.elApplyDone = {name:'Elite application · Sent', ph:3, rules:['Success with the reference number. Back to YouApp closes the webview and returns to where the user started.']};
try { render(); } catch(e) {}

/* ===== V2 · Merchant application webview form (same pattern as Elite, 5 Nov 2026) =====
   Two modes: self = Business › Merchant · Become Merchant; elite = Elite › Registered Merchant · Add a Merchant.
   Admins review and edit in the admin panel; Kevon and Florence get an email alert for every new request. */
const MC_REF = 'MC-2611-0007', MC_SENT = '5 Nov 2026';
const MC_CATS = ['F&B','Retail','Services','Health & beauty','Others'];
const MC_SALES = ['Under RM10k','RM10k – RM50k','RM50k – RM200k','Over RM200k'];
const mcInit = mode => { if (!S.mc || (mode && S.mc.mode!==mode)) S.mc = {mode:mode||'self', biz:'', cat:'', addr:'', city:'', ssm:'', qr:false, rate:'5', sales:'',
  name:'Elsa Japasal', email:(S.su&&S.su.email)||'elsa.japasal@gmail.com', phone:'', eliteRef:'', ownName:'', ownPhone:'', ownEmail:'', ownAcc:'', agree:false, err:{}}; return S.mc; };
const mcRO = () => S.mc && (S.mc.mode==='self' ? scen.mreq==='pending' : !!S.mcView);
V.mcApply = () => { const f = mcInit(); const ro = mcRO(); const e = f.err||{}; const dis = ro ? 'disabled' : ''; const el = f.mode==='elite';
  const fld = (id, lab, inner, err, help) => `<div class="field ${err?'err':''}"><label for="${id}">${lab}</label>${inner}${err?`<span class="helper">${err}</span>`:help?`<span class="helper neutral">${help}</span>`:''}</div>`;
  const inp = (id, k, ph='', type='text', extra='') => `<input id="${id}" class="input" type="${type}" data-in="${id}" value="${esc(f[k])}" placeholder="${ph}" ${extra} ${dis}>`;
  const sel = (id, k, opts, ph) => `<select id="${id}" class="input" data-in="${id}" ${dis}><option value="">${ph}</option>${opts.map(o=>`<option ${f[k]===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
  const noKyc = !el && !kycOk() && !ro;
  const top = `<div class="ea-top"><button class="iconbtn" data-act="mcClose" aria-label="Close">${ic('close')}</button><span class="ea-tt"><b>${el?'Add a merchant':'Merchant application'}</b><small>${ic('lock')}youapp.ai · secure</small></span><span style="width:40px"></span></div>`;
  return `<div class="screen ea">${statusBar()}${top}
  <div class="scroll" style="padding-bottom:20px"><div class="pad16 stack" style="gap:14px">
    ${ro ? `<div class="hint warn">${ic('hourglass')}<span><b>In review.</b> Sent ${MC_SENT} · Ref ${MC_REF}. ${el?'We’ll contact the owner to verify the shop.':'You can’t send another request while this one is in review.'}<button class="link ea-help" data-act="mcSupport">Need to change something? Contact Support</button></span></div>`
      : noKyc ? `<div class="hint warn">${ic('alert')}<span><b>Verify your identity first.</b> Merchant payouts go to your wallet, so we need your KYC before you apply. <button class="link ea-help" data-act="nav" data-to="kyc">Verify identity</button></span></div>`
      : `<p class="t-body muted" style="margin:0">${el?'Tell us about the shop you’re bringing in. You’re its signing Elite and earn 25% of its cashback.':'Tell us about your business. We review every request within 48 hours.'}</p>`}
    <h2 class="ea-sec">The business</h2>
    ${fld('mcBiz','Business name', inp('mcBiz','biz','e.g. Kopitiam Ah Seng'), e.biz, 'Shown to customers when they pay.')}
    ${fld('mcCat','Category', sel('mcCat','cat',MC_CATS,'Choose a category'), e.cat)}
    ${fld('mcAddr','Business address', inp('mcAddr','addr','Street, building, postcode'), e.addr)}
    ${fld('mcCity','City', sel('mcCity','city',EA_CITIES,'Choose a city'), e.city)}
    ${fld('mcSsm','SSM registration number (optional)', inp('mcSsm','ssm','e.g. 202301012345'), '', 'Leave empty if the business isn’t registered.')}
    <div class="field"><label>DuitNow QR (optional)</label>${f.qr ? `<div class="ea-file">${ic('check')}<span>duitnow-qr.jpg</span>${ro?'':'<button class="link" data-act="mcQr">Remove</button>'}</div>` : `<button class="btn btn-secondary" data-act="mcQr" ${dis}>Upload a photo of your QR</button>`}<span class="helper neutral">No DuitNow QR yet? Leave it. We’ll help you set one up.</span></div>
    ${fld('mcRate','Cashback you’d like to offer (%)', inp('mcRate','rate','5','text','inputmode="decimal"'), e.rate, 'Minimum 5%. We confirm the final rate when we approve.')}
    ${fld('mcSales','Monthly sales, estimate (optional)', sel('mcSales','sales',MC_SALES,'Choose a range'), '')}
    <h2 class="ea-sec">${el?'Shop owner':'Contact'}</h2>
    ${el ? `
      ${fld('mcOwnName','Owner name', inp('mcOwnName','ownName','Full name'), e.ownName)}
      ${fld('mcOwnPhone','Owner phone (WhatsApp)', inp('mcOwnPhone','ownPhone','+60 12-345 6789','tel','inputmode="tel"'), e.ownPhone, 'We contact the owner to verify the shop.')}
      ${fld('mcOwnEmail','Owner email (optional)', inp('mcOwnEmail','ownEmail','name@example.com','email'), e.ownEmail)}
      ${fld('mcOwnAcc','Owner’s YouApp account (optional)', inp('mcOwnAcc','ownAcc','@handle'), '', 'If the owner has YouApp, the Merchant role goes on that account.')}
      ${fld('mcSign','Signing Elite', `<input id="mcSign" class="input" value="${esc(RF_ME.handle)} (you)" readonly>`, '', 'You get 25% of this shop’s merchant cashback.')}`
    : `
      ${fld('mcName','Your name', inp('mcName','name','Full name','text','autocomplete="name"'), e.name)}
      ${fld('mcAcc','YouApp account', `<input id="mcAcc" class="input" value="${esc(RF_ME.handle)}" readonly>`, '', 'From your account. Can’t be changed.')}
      ${fld('mcEmail','Email', inp('mcEmail','email','name@example.com','email'), e.email)}
      ${fld('mcPhone','Phone (WhatsApp)', inp('mcPhone','phone','+60 12-345 6789','tel','inputmode="tel"'), e.phone)}
      ${fld('mcRef','Elite who referred you (optional)', inp('mcRef','eliteRef','@handle'), '', 'That Elite becomes your shop’s signing Elite.')}`}
    <label class="ea-agree ${e.agree?'err':''}"><input type="checkbox" id="mcAgree" data-in="mcAgree" ${f.agree||ro?'checked':''} ${dis}><span>${el?'The owner agreed to join YouApp as a merchant':'I agree to the Merchant terms'}</span></label>
    ${e.agree?`<span class="helper" style="margin-top:-8px; color:var(--a-error)">${e.agree}</span>`:''}
  </div></div>
  <div class="w2foot">${ro ? btn('Close','mcClose',{kind:'btn-secondary'}) : btn('Submit request','mcSubmit',{loading:S.busy, disabled:S.busy||noKyc})}</div></div>`; };
V.mcApplyDone = () => { const el = S.mc && S.mc.mode==='elite';
  return `<div class="screen ea">${statusBar()}<div class="ea-top"><button class="iconbtn" data-act="back" aria-label="Close">${ic('close')}</button><span class="ea-tt"><b>${el?'Add a merchant':'Merchant application'}</b><small>${ic('lock')}youapp.ai · secure</small></span><span style="width:40px"></span></div>
  <div class="scroll"><div class="pad16 stack" style="gap:14px; align-items:center; text-align:center; padding-top:48px">
    ${cele()}<h1 class="t-title" style="margin:0">Request sent</h1>
    <p class="t-body muted" style="margin:0">${el?`We’ll contact ${esc(S.mc.ownName||'the owner')} and review ${esc(S.mc.biz||'the shop')} within 48 hours. It shows as In review in Registered Merchant.`:'We’ll review it within 48 hours and let you know in the app and by email.'}</p>
    <span class="tag">Ref ${MC_REF}</span></div></div>
  <div class="w2foot">${btn('Back to YouApp','back')}</div></div>`; };
const _regMerchants = V.regMerchants;
V.regMerchants = () => { if (!S.mcE) return _regMerchants();
  const card = `<button class="rg-card mc-pend" data-act="mcPendOpen"><span class="mc-pi">${ic('store')}</span><em class="rg-st off">In review</em><b>${esc(S.mcE.biz)}</b><small>Sent ${MC_SENT} · Ref ${MC_REF}</small></button>`;
  const ms = hsList();
  if (!ms.length) return `<div class="screen bz hs">${statusBar()}${topBar('Registered Merchant')}<div class="scroll" style="padding-bottom:110px"><div class="pad16 rg-list">${card}</div></div>
    <div class="w2foot"><button class="btn btn-secondary bz-cta" data-act="mcApplyOpen" data-mode="elite">Add another merchant</button></div></div>`;
  return _regMerchants().replace('<div class="pad16 rg-list">', '<div class="pad16 rg-list">'+card); };
Object.assign(A, {
  mcApplyOpen: el => { const mode = el && el.dataset && el.dataset.mode || 'self'; S.sheet = null;
    if (mode==='elite') { S.mcView = false; S.mc = null; } mcInit(mode); go('mcApply'); },
  mcPendOpen: () => { S.mc = Object.assign(mcInit('elite'), S.mcE.data); S.mcView = true; go('mcApply'); },
  mcClose: () => { S.mcView = false; A.back ? A.back() : history.back(); },
  mcQr: () => { const f = mcInit(); f.qr = !f.qr; render(); },
  mcSupport: () => toast(`Opening WhatsApp: “Hi YouApp Support, I have a question about my merchant request ${MC_REF}.”`),
  mcSubmit: () => { const f = mcInit(); const e = {}; const el = f.mode==='elite';
    if (!f.biz.trim()) e.biz = 'Enter the business name.';
    if (!f.cat) e.cat = 'Choose a category.';
    if (f.addr.trim().length < 8) e.addr = 'Enter the full address.';
    if (!f.city) e.city = 'Choose a city.';
    if (!(+f.rate >= 5)) e.rate = 'Cashback must be at least 5%.';
    if (el) { if (!f.ownName.trim()) e.ownName = 'Enter the owner’s name.'; if (f.ownPhone.replace(/\D/g,'').length < 9) e.ownPhone = 'Enter a phone number with at least 9 digits.'; if (f.ownEmail && !/^\S+@\S+\.\S+$/.test(f.ownEmail)) e.ownEmail = 'Enter a valid email address, like name@example.com.'; }
    else { if (!f.name.trim()) e.name = 'Enter your name.'; if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address, like name@example.com.'; if (f.phone.replace(/\D/g,'').length < 9) e.phone = 'Enter a phone number with at least 9 digits.'; }
    if (!f.agree) e.agree = el ? 'Tick the box to confirm the owner agreed.' : 'Tick the box to agree to the Merchant terms.';
    f.err = e; if (Object.keys(e).length) { render(); const first = document.querySelector('.ea .field.err, .ea .ea-agree.err'); first && first.scrollIntoView({block:'center'}); return; }
    S.busy = true; render();
    setTimeout(() => { S.busy = false; if (el) S.mcE = {biz:f.biz, data:JSON.parse(JSON.stringify(f))}; else { scen.mreq = 'pending'; saveScen(); } go('mcApplyDone', {replace:true}); }, 700); },
});
document.addEventListener('input', ev => { const id = ev.target.id; if (!id || id.slice(0,2)!=='mc' || !S.mc) return; const f = S.mc;
  const map = {mcBiz:'biz', mcCat:'cat', mcAddr:'addr', mcCity:'city', mcSsm:'ssm', mcRate:'rate', mcSales:'sales', mcName:'name', mcEmail:'email', mcPhone:'phone', mcRef:'eliteRef', mcOwnName:'ownName', mcOwnPhone:'ownPhone', mcOwnEmail:'ownEmail', mcOwnAcc:'ownAcc', mcAgree:'agree'};
  const k = map[id]; if (!k) return; f[k] = k==='agree' ? ev.target.checked : ev.target.value;
  if (f.err && f.err[k]) { delete f.err[k]; reRender(ev); } else if (['cat','city','sales','agree'].includes(k)) reRender(ev); });
META.mcApply = {name:'Merchant application (webview)', ph:4, rules:['Two entries, one form. Business › Merchant · Become Merchant (self) and Elite › Registered Merchant · Add a Merchant (an Elite registers a shop they bring in).','The business: name, category, address, city required; SSM number, DuitNow QR photo and monthly sales optional; cashback rate (minimum 5%, final rate confirmed on approval).','Self: name, YouApp account (locked), email, phone required; Elite who referred you optional (becomes the signing Elite). Self needs KYC passed first.','Elite mode: owner name and phone required, owner email and YouApp account optional; signing Elite = the Elite filling it in (locked).','Submit sets the request to In review (self: Business › Merchant shows View my request; Elite: the shop shows In review in Registered Merchant). Read-only while in review, with “Need to change something? Contact Support”.','Back office: each new request sends an email alert to Kevon and Florence. They review and can edit it in the admin panel. Approve turns on the Merchant role, then the owner confirms the cashback rate and funds the float as before. Reject shows the reason and Apply again.'], open:['Ask Your Elite on the merchant card is kept for now.','KYC before applying (self) is an assumption to confirm.']};
META.mcApplyDone = {name:'Merchant application · Sent', ph:4, rules:['Success with the reference number. Back to YouApp closes the webview.']};
try { render(); } catch(e) {}
