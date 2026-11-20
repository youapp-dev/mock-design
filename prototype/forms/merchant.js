(function(){
const $=id=>document.getElementById(id);
/* extra spot illustration: "every year" calendar */
const yr=`<svg viewBox="-40 -40 80 80" aria-hidden="true"><circle r="36" fill="#F6E6FF"/><g class="bob"><rect x="-22" y="-18" width="44" height="40" rx="7" fill="#fff" stroke="#B79BF0" stroke-width="2"/><rect x="-22" y="-18" width="44" height="11" rx="5" fill="#B79BF0"/><path d="M-12 -24v8M12 -24v8" stroke="#7A4BD6" stroke-width="3" stroke-linecap="round"/><path d="M-9 8 l6 6 l12 -14" stroke="#0F9D6E" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
document.querySelectorAll('[data-icon="year"]').forEach(e=>e.innerHTML=yr);

const T={
 en:{banner:'Welcome, future Elite!',tabE:'Become an Elite',tabM:'Merchant',h1:'Bring your people. <em>Earn from every payment.</em>',lede:'Become an Elite and earn more from every payment your referrals and your merchants make. No referral or volume minimum to apply.',
  p1:'Free SVIP, one time',p2:'Elite bonus 0.1%',p3:'25% of merchant cashback',p4:'Scheme pool',sec:'secure',t1:'Elite application',s1:'Tell us a bit about you. Management reviews every request within 48 hours.',
  lName:'Full name',lAcc:'YouApp account',locked:'Locked',lMail:'Email',lPhone:'Phone (WhatsApp)',lCity:'City',cityPick:'Choose your city',cityOther:'Other',lWhy:'How will you grow your network?',phWhy:'For example: I run a running club of 200 people in PJ and know 15 cafe owners nearby.',
  agree:'I agree to the <a href="https://youapp.ai/en-us/terms-of-service">Elite terms</a> and the <a href="https://youapp.ai/en-us/privacy-policy">Privacy Policy</a>.',b1:'Submit Request',
  t2:'Request sent',s2:"We'll review it within 48 hours and let you know in the app and by email.",refL:'Reference number',copy:'Copy',copied:'Copied',sName:'Name',sAcc:'Account',sMail:'Email',sPhone:'WhatsApp',sCity:'City',
  n1:'Management reviews your request within 48 hours.',n2:'Once approved, Elite starts right away and your free SVIP is added.',n3:'Reach RM100k volume in your first 90 days to keep Elite.',b2:'Back to YouApp',
  h1s:'Fill in a short form',h1d:'No referral or volume minimum.',h2s:'Management reviews',h2d:'Within 48 hours.',h3s:'First 90 days',h3d:'RM100k volume, or Elite ends.',h4s:'Every year',h4d:'RM300k to keep Elite. Elite 1–3 open in Phase 2.',
  wb:'If Elite ends',ws:"You go back to your earlier tier and lose the Elite bonus, pool share and free SVIP. A second free SVIP isn't given.",
  mh1:'Grow with YouApp. <em>Get paid in ringgit.</em>',mlede:'Register your shop to accept YouApp payments and offer cashback to verified customers.',mt:'Merchant form coming next',ms:'This form will use the same layout as the Elite application, with the Merchant fields from V2.',terms:'Terms',priv:'Privacy',
  eName:'Enter your full name.',eMail:'Enter a valid email.',ePhone:'Enter a Malaysian mobile number, like 12-345 6789.',eCity:'Choose your city.',eWhy:'Tell us how you will grow your network (at least 20 characters).',eAgree:'Please agree to the Elite terms first.',eAll:'Please check the highlighted fields.'},
 zh:{banner:'欢迎，未来的 Elite！',tabE:'成为 Elite',tabM:'商家',h1:'带上你的人脉，<em>每笔付款都有收益。</em>',lede:'成为 Elite，你推荐的用户和商家每付一笔款，你都能赚更多。申请无推荐人数或交易额门槛。',
  p1:'免费 SVIP（一次）',p2:'Elite 奖励 0.1%',p3:'商家回扣的 25%',p4:'奖励池',sec:'安全',t1:'Elite 申请',s1:'简单介绍一下你自己。管理团队会在 48 小时内审核每个申请。',
  lName:'全名',lAcc:'YouApp 账户',locked:'已锁定',lMail:'邮箱',lPhone:'电话（WhatsApp）',lCity:'城市',cityPick:'选择城市',cityOther:'其他',lWhy:'你打算如何扩展人脉？',phWhy:'例如：我在 PJ 经营一个 200 人的跑步俱乐部，还认识附近 15 位咖啡馆老板。',
  agree:'我同意<a href="https://youapp.ai/en-us/terms-of-service">Elite 条款</a>和<a href="https://youapp.ai/en-us/privacy-policy">隐私政策</a>。',b1:'提交申请',
  t2:'申请已提交',s2:'我们会在 48 小时内审核，并通过 App 和邮件通知你。',refL:'参考编号',copy:'复制',copied:'已复制',sName:'姓名',sAcc:'账户',sMail:'邮箱',sPhone:'WhatsApp',sCity:'城市',
  n1:'管理团队会在 48 小时内审核你的申请。',n2:'通过后 Elite 立即生效，并赠送免费 SVIP。',n3:'在前 90 天内达到 RM100k 交易额即可保留 Elite。',b2:'返回 YouApp',
  h1s:'填写简短表格',h1d:'无推荐人数或交易额门槛。',h2s:'管理团队审核',h2d:'48 小时内完成。',h3s:'前 90 天',h3d:'达到 RM100k 交易额，否则 Elite 结束。',h4s:'每年',h4d:'RM300k 即可保留 Elite。Elite 1–3 将在第二阶段开放。',
  wb:'如果 Elite 结束',ws:'你将回到原来的等级，失去 Elite 奖励、奖励池份额和免费 SVIP。免费 SVIP 不会再次赠送。',
  mh1:'与 YouApp 一起成长，<em>以令吉收款。</em>',mlede:'登记你的店铺，接受 YouApp 付款，并为实名顾客提供回扣。',mt:'商家表格即将推出',ms:'此表格将沿用 Elite 申请的版式，使用 V2 的商家字段。',terms:'条款',priv:'隐私',
  eName:'请输入全名。',eMail:'请输入正确的邮箱。',ePhone:'请输入马来西亚手机号码，例如 12-345 6789。',eCity:'请选择城市。',eWhy:'请说明你将如何扩展人脉（至少 20 个字符）。',eAgree:'请先同意 Elite 条款。',eAll:'请检查标红的栏位。'},
 ms:{banner:'Selamat datang, bakal Elite!',tabE:'Jadi Elite',tabM:'Peniaga',h1:'Bawa rangkaian anda. <em>Dapat untung setiap bayaran.</em>',lede:'Jadi Elite dan dapat lebih daripada setiap bayaran oleh rujukan dan peniaga anda. Tiada minimum rujukan atau jumlah untuk memohon.',
  p1:'SVIP percuma, sekali',p2:'Bonus Elite 0.1%',p3:'25% pulangan tunai peniaga',p4:'Kumpulan skim',sec:'selamat',t1:'Permohonan Elite',s1:'Ceritakan sedikit tentang anda. Pihak pengurusan menyemak setiap permohonan dalam 48 jam.',
  lName:'Nama penuh',lAcc:'Akaun YouApp',locked:'Dikunci',lMail:'E-mel',lPhone:'Telefon (WhatsApp)',lCity:'Bandar',cityPick:'Pilih bandar anda',cityOther:'Lain-lain',lWhy:'Bagaimana anda akan kembangkan rangkaian anda?',phWhy:'Contoh: Saya kendalikan kelab larian 200 orang di PJ dan kenal 15 pemilik kafe berdekatan.',
  agree:'Saya bersetuju dengan <a href="https://youapp.ai/en-us/terms-of-service">terma Elite</a> dan <a href="https://youapp.ai/en-us/privacy-policy">Dasar Privasi</a>.',b1:'Hantar Permohonan',
  t2:'Permohonan dihantar',s2:'Kami akan menyemaknya dalam 48 jam dan maklumkan anda dalam app dan melalui e-mel.',refL:'Nombor rujukan',copy:'Salin',copied:'Disalin',sName:'Nama',sAcc:'Akaun',sMail:'E-mel',sPhone:'WhatsApp',sCity:'Bandar',
  n1:'Pihak pengurusan menyemak permohonan anda dalam 48 jam.',n2:'Selepas diluluskan, Elite bermula serta-merta dan SVIP percuma ditambah.',n3:'Capai jumlah RM100k dalam 90 hari pertama untuk kekal Elite.',b2:'Kembali ke YouApp',
  h1s:'Isi borang ringkas',h1d:'Tiada minimum rujukan atau jumlah.',h2s:'Pengurusan menyemak',h2d:'Dalam 48 jam.',h3s:'90 hari pertama',h3d:'Jumlah RM100k, atau Elite tamat.',h4s:'Setiap tahun',h4d:'RM300k untuk kekal Elite. Elite 1–3 dibuka dalam Fasa 2.',
  wb:'Jika Elite tamat',ws:'Anda kembali ke tahap asal dan kehilangan bonus Elite, bahagian kumpulan dan SVIP percuma. SVIP percuma kali kedua tidak diberi.',
  mh1:'Berkembang bersama YouApp. <em>Terima bayaran dalam ringgit.</em>',mlede:'Daftar kedai anda untuk terima bayaran YouApp dan tawarkan pulangan tunai kepada pelanggan yang disahkan.',mt:'Borang peniaga akan datang',ms:'Borang ini akan guna susun atur yang sama dengan permohonan Elite, dengan medan Peniaga daripada V2.',terms:'Terma',priv:'Privasi',
  eName:'Masukkan nama penuh anda.',eMail:'Masukkan e-mel yang sah.',ePhone:'Masukkan nombor telefon bimbit Malaysia, contoh 12-345 6789.',eCity:'Pilih bandar anda.',eWhy:'Ceritakan cara anda akan kembangkan rangkaian (sekurang-kurangnya 20 aksara).',eAgree:'Sila setuju dengan terma Elite dahulu.',eAll:'Sila semak medan yang ditanda.'}};
let L='en',curTab='elite';
const shown={}; /* which field errors are currently shown, re-translated on language switch */
function apply(){const t=T[L];document.documentElement.lang=L==='zh'?'zh':L;
  document.querySelectorAll('[data-t]').forEach(e=>{const k=e.dataset.t;if(t[k]===undefined)return;if(/<a |<em>/.test(t[k]))e.innerHTML=t[k];else e.textContent=t[k];});
  document.querySelectorAll('[data-ph]').forEach(e=>e.placeholder=t[e.dataset.ph]);
  Object.keys(shown).forEach(k=>{if(shown[k])$(k.replace('f','er')).textContent=t[shown[k]];});
  if($('erAll').textContent)$('erAll').textContent=t.eAll;
  if(!$('e2').classList.contains('hide'))summary();
  if(window.__mApply)window.__mApply();
  window.__scene.setBanner(curTab==='merchant'?t.bannerM:t.banner);}
$('lang').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;L=b.dataset.l;[...$('lang').children].forEach(x=>x.classList.toggle('on',x===b));apply();});

/* tabs */
$('tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;[...$('tabs').children].forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b);});
  const f=b.dataset.f;curTab=f;window.__scene.setBanner(f==='merchant'?T[L].bannerM:T[L].banner);$('v-elite').classList.toggle('hide',f!=='elite');$('v-merchant').classList.toggle('hide',f!=='merchant');
  /* the illustration lives in the Elite view */
  if(f==='merchant'){const m=document.querySelector('#v-merchant .story');m.insertBefore($('art'),m.querySelector('.perks'));}
  else{const s=document.querySelector('#v-elite .story');s.insertBefore($('art'),s.querySelector('.perks'));}});

/* counter */
function count(){const n=$('eWhy').value.length;$('cnt').textContent=n+' / 300';$('cnt').classList.toggle('over',n>=300);}
$('eWhy').addEventListener('input',count);count();

/* validation */
const rules={
 fName:()=>$('eName').value.trim().length>=2?0:'eName',
 fMail:()=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('eMail').value.trim())?0:'eMail',
 fPhone:()=>{const d=$('ePhone').value.replace(/\D/g,'').replace(/^0/,'');return /^1\d{8,9}$/.test(d)?0:'ePhone';},
 fCity:()=>$('eCity').value?0:'eCity',
 fWhy:()=>$('eWhy').value.trim().length>=20?0:'eWhy'};
function check(id){const r=rules[id]();shown[id]=r;$(id).classList.toggle('bad',!!r);$(id.replace('f','er')).textContent=r?T[L][r]:'';return !r;}
Object.keys(rules).forEach(id=>{const el=$(id).querySelector('input,select,textarea');
  el.addEventListener('blur',()=>{if(el.value)check(id);});
  el.addEventListener('input',()=>{if(shown[id])check(id);});
  el.addEventListener('change',()=>{if(shown[id])check(id);});});
$('eAgree').addEventListener('change',()=>{$('fAgree').classList.remove('bad');if($('erAll').textContent===T[L].eAgree)$('erAll').textContent='';});

function summary(){const t=T[L];const c=$('eCity');const city=c.value==='other'?t.cityOther:c.options[c.selectedIndex].text;
  const rows=[[t.sName,$('eName').value.trim()],[t.sAcc,$('eAcc').value],[t.sMail,$('eMail').value.trim()],[t.sPhone,'+60 '+$('ePhone').value.trim()],[t.sCity,city]];
  $('sum').innerHTML='';rows.forEach(([k,v])=>{const d=document.createElement('div');const a=document.createElement('span');a.textContent=k;const b=document.createElement('b');b.textContent=v;d.append(a,b);$('sum').appendChild(d);});}

let busy=false;
$('e1').addEventListener('submit',e=>{e.preventDefault();if(busy)return;
  const ok=Object.keys(rules).map(check);const bad=ok.indexOf(false);
  if(bad>-1){$('erAll').textContent=T[L].eAll;$(Object.keys(rules)[bad]).querySelector('input,select,textarea').focus();return;}
  if(!$('eAgree').checked){$('fAgree').classList.add('bad');$('erAll').textContent=T[L].eAgree;$('eAgree').focus();return;}
  $('erAll').textContent='';busy=true;$('eBtn').classList.add('loading');$('eBtn').disabled=true;
  setTimeout(()=>{busy=false;$('eBtn').classList.remove('loading');$('eBtn').disabled=false;
    const d=new Date();$('refNo').textContent='EL-'+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+'-'+String(Math.floor(Math.random()*9000)+1000);
    summary();$('e1').classList.add('hide');$('e2').classList.remove('hide');window.__scene.celebrate();
    $('e2').querySelector('h2').setAttribute('tabindex','-1');$('e2').querySelector('h2').focus();},900);});

$('copyRef').addEventListener('click',()=>{const txt=$('refNo').textContent;const done=()=>{$('copyRef').textContent=T[L].copied;setTimeout(()=>$('copyRef').textContent=T[L].copy,1500);};
  try{navigator.clipboard.writeText(txt).then(done,()=>{});}catch(err){}});
/* ================= MERCHANT ================= */
Object.assign(T.en,{bannerM:'New merchant on board!',tabM:'Merchant',mh1:'Grow with YouApp. <em>Get paid in ringgit.</em>',mlede:'Accept YouApp payments from verified customers, offer cashback that brings them back, and get paid in ringgit.',mledeE:"Bring a shop you know onto YouApp. You're its signing Elite and earn 25% of its cashback.",
 mp1:'Paid in ringgit',mp2:'Verified customers',mp3:'Cashback that brings them back',mp4:'Reviewed in 48 hours',modeSelf:'My business',modeElite:'Add a merchant (Elite)',
 mt1:'Merchant application',ms1:'Fill in a short form about your business. We review every request within 48 hours.',mt1E:'Add a merchant',ms1E:"Tell us about the shop you're bringing in. You're its signing Elite and earn 25% of its cashback.",
 gBiz:'The business',lBiz:'Business name',lCat:'Category',pick:'Choose one',cat1:'Food & drinks',cat2:'Retail & shops',cat3:'Beauty & wellness',cat4:'Activities & tours',cat5:'Services',lAddr:'Business address',opt:'Optional',lSsm:'SSM number',hSsm:'12-digit registration number from your SSM certificate.',
 lQr:'DuitNow QR',upB:'Upload a photo of your DuitNow QR',upS:'JPG or PNG, up to 5 MB',remove:'Remove',lCb:'Cashback to offer',hCb:'Minimum 5%. We confirm the final rate when we approve.',lSales:'Monthly sales',range:'Choose a range',r1:'Below RM10k',r2:'RM10k – RM50k',r3:'RM50k – RM200k',r4:'Above RM200k',
 gContact:'Contact',lYour:'Your name',lRef:'Elite who referred you',hRef:'They become your signing Elite.',mAgree:'I agree to the <a href="https://youapp.ai/en-us/terms-of-service">Merchant terms</a> and the <a href="https://youapp.ai/en-us/privacy-policy">Privacy Policy</a>.',
 gOwner:'Shop owner',lOName:'Owner name',lOPhone:'Owner phone (WhatsApp)',lOMail:'Owner email',lOAcc:"Owner's YouApp account",lSign:'Signing Elite',you:'you',hSign:"You earn 25% of this shop's cashback.",oAgree:'The owner agreed to join YouApp as a merchant.',
 mn1:'We review the request within 48 hours.',mn2:'Once approved, you confirm the cashback rate.',mn3:'Fund your cashback float and start taking payments.',mn2E:'Once approved, we contact the owner to confirm the cashback rate.',mn3E:'The shop shows as In review in Registered Merchant until then.',
 mh1d:'About the business and how to reach you.',mh2s:'We review',mh3s:'Confirm cashback',mh3d:'The owner confirms the final cashback rate.',mh4s:'Fund and go live',mh4d:'Top up the cashback float and accept payments.',
 sBiz:'Business',sCat:'Category',sAddr:'Address',sCb:'Cashback',sQr:'DuitNow QR',sOwner:'Owner',sSign:'Signing Elite',sRef:'Referred by',none:'None',
 xBiz:'Enter the business name.',xCat:'Choose a category.',xAddr:'Enter the business address.',xCity:'Choose the city.',xSsm:'Enter the 12-digit SSM number, or leave it empty.',xQr:'Use a JPG or PNG under 5 MB.',xCb:'Cashback must be at least 5%.',xCb2:'Enter a number between 5 and 100.',xHandle:'Enter a YouApp handle, like @kopiahseng.',xOName:'Enter the owner name.',xOPhone:'Enter the owner mobile number, like 13-888 1234.',xOAgree:'Please confirm the owner agreed to join.',xMAgree:'Please agree to the Merchant terms first.'});
Object.assign(T.zh,{bannerM:'新商家加入啦！',tabM:'商家',mh1:'与 YouApp 一起成长，<em>以令吉收款。</em>',mlede:'接受实名顾客的 YouApp 付款，提供回扣吸引回头客，并以令吉收款。',mledeE:'把你认识的店铺带上 YouApp。你将成为签约 Elite，获得其回扣的 25%。',
 mp1:'以令吉收款',mp2:'实名顾客',mp3:'回扣带来回头客',mp4:'48 小时内审核',modeSelf:'我的店铺',modeElite:'添加商家（Elite）',
 mt1:'商家申请',ms1:'填写一份关于你店铺的简短表格。我们会在 48 小时内审核每个申请。',mt1E:'添加商家',ms1E:'介绍一下你带来的店铺。你将成为签约 Elite，获得其回扣的 25%。',
 gBiz:'店铺信息',lBiz:'店铺名称',lCat:'类别',pick:'请选择',cat1:'餐饮',cat2:'零售',cat3:'美容与养生',cat4:'活动与导览',cat5:'服务',lAddr:'店铺地址',opt:'选填',lSsm:'SSM 注册号',hSsm:'SSM 证书上的 12 位注册号。',
 lQr:'DuitNow 二维码',upB:'上传 DuitNow 二维码照片',upS:'JPG 或 PNG，最大 5 MB',remove:'移除',lCb:'提供的回扣',hCb:'最低 5%。最终比例在审核通过时确认。',lSales:'月销售额',range:'选择范围',r1:'低于 RM10k',r2:'RM10k – RM50k',r3:'RM50k – RM200k',r4:'高于 RM200k',
 gContact:'联系方式',lYour:'你的姓名',lRef:'推荐你的 Elite',hRef:'对方将成为你的签约 Elite。',mAgree:'我同意<a href="https://youapp.ai/en-us/terms-of-service">商家条款</a>和<a href="https://youapp.ai/en-us/privacy-policy">隐私政策</a>。',
 gOwner:'店主信息',lOName:'店主姓名',lOPhone:'店主电话（WhatsApp）',lOMail:'店主邮箱',lOAcc:'店主的 YouApp 账户',lSign:'签约 Elite',you:'你',hSign:'你将获得这家店回扣的 25%。',oAgree:'店主已同意以商家身份加入 YouApp。',
 mn1:'我们会在 48 小时内审核申请。',mn2:'通过后，你需确认回扣比例。',mn3:'为回扣账户充值后即可开始收款。',mn2E:'通过后，我们会联系店主确认回扣比例。',mn3E:'在此之前，该店铺在"已注册商家"中显示为审核中。',
 mh1d:'填写店铺信息和联系方式。',mh2s:'我们审核',mh3s:'确认回扣',mh3d:'店主确认最终回扣比例。',mh4s:'充值并上线',mh4d:'为回扣账户充值，开始收款。',
 sBiz:'店铺',sCat:'类别',sAddr:'地址',sCb:'回扣',sQr:'DuitNow 二维码',sOwner:'店主',sSign:'签约 Elite',sRef:'推荐人',none:'无',
 xBiz:'请输入店铺名称。',xCat:'请选择类别。',xAddr:'请输入店铺地址。',xCity:'请选择城市。',xSsm:'请输入 12 位 SSM 注册号，或留空。',xQr:'请使用 5 MB 以下的 JPG 或 PNG。',xCb:'回扣至少为 5%。',xCb2:'请输入 5 到 100 之间的数字。',xHandle:'请输入 YouApp 用户名，例如 @kopiahseng。',xOName:'请输入店主姓名。',xOPhone:'请输入店主手机号码，例如 13-888 1234。',xOAgree:'请确认店主已同意加入。',xMAgree:'请先同意商家条款。'});
Object.assign(T.ms,{bannerM:'Peniaga baharu tiba!',tabM:'Peniaga',mh1:'Berkembang bersama YouApp. <em>Terima bayaran dalam ringgit.</em>',mlede:'Terima bayaran YouApp daripada pelanggan yang disahkan, tawarkan pulangan tunai supaya mereka datang semula, dan terima bayaran dalam ringgit.',mledeE:'Bawa kedai yang anda kenal ke YouApp. Anda jadi Elite penandatangannya dan dapat 25% daripada pulangan tunainya.',
 mp1:'Dibayar dalam ringgit',mp2:'Pelanggan disahkan',mp3:'Pulangan tunai menarik pelanggan',mp4:'Disemak dalam 48 jam',modeSelf:'Perniagaan saya',modeElite:'Tambah peniaga (Elite)',
 mt1:'Permohonan peniaga',ms1:'Isi borang ringkas tentang perniagaan anda. Kami menyemak setiap permohonan dalam 48 jam.',mt1E:'Tambah peniaga',ms1E:'Ceritakan tentang kedai yang anda bawa. Anda jadi Elite penandatangannya dan dapat 25% daripada pulangan tunainya.',
 gBiz:'Perniagaan',lBiz:'Nama perniagaan',lCat:'Kategori',pick:'Pilih satu',cat1:'Makanan & minuman',cat2:'Runcit & kedai',cat3:'Kecantikan & kesihatan',cat4:'Aktiviti & lawatan',cat5:'Perkhidmatan',lAddr:'Alamat perniagaan',opt:'Pilihan',lSsm:'Nombor SSM',hSsm:'Nombor pendaftaran 12 digit daripada sijil SSM anda.',
 lQr:'QR DuitNow',upB:'Muat naik foto QR DuitNow anda',upS:'JPG atau PNG, sehingga 5 MB',remove:'Buang',lCb:'Pulangan tunai ditawarkan',hCb:'Minimum 5%. Kadar akhir disahkan semasa kelulusan.',lSales:'Jualan bulanan',range:'Pilih julat',r1:'Bawah RM10k',r2:'RM10k – RM50k',r3:'RM50k – RM200k',r4:'Atas RM200k',
 gContact:'Hubungan',lYour:'Nama anda',lRef:'Elite yang merujuk anda',hRef:'Mereka jadi Elite penandatangan anda.',mAgree:'Saya bersetuju dengan <a href="https://youapp.ai/en-us/terms-of-service">terma Peniaga</a> dan <a href="https://youapp.ai/en-us/privacy-policy">Dasar Privasi</a>.',
 gOwner:'Pemilik kedai',lOName:'Nama pemilik',lOPhone:'Telefon pemilik (WhatsApp)',lOMail:'E-mel pemilik',lOAcc:'Akaun YouApp pemilik',lSign:'Elite penandatangan',you:'anda',hSign:'Anda dapat 25% daripada pulangan tunai kedai ini.',oAgree:'Pemilik bersetuju untuk menyertai YouApp sebagai peniaga.',
 mn1:'Kami menyemak permohonan dalam 48 jam.',mn2:'Selepas diluluskan, anda sahkan kadar pulangan tunai.',mn3:'Tambah nilai dana pulangan tunai dan mula terima bayaran.',mn2E:'Selepas diluluskan, kami hubungi pemilik untuk sahkan kadar pulangan tunai.',mn3E:'Kedai dipaparkan sebagai Dalam semakan dalam Peniaga Berdaftar sehingga itu.',
 mh1d:'Tentang perniagaan dan cara menghubungi anda.',mh2s:'Kami menyemak',mh3s:'Sahkan pulangan tunai',mh3d:'Pemilik mengesahkan kadar pulangan tunai akhir.',mh4s:'Tambah nilai dan mula',mh4d:'Tambah nilai dana pulangan tunai dan terima bayaran.',
 sBiz:'Perniagaan',sCat:'Kategori',sAddr:'Alamat',sCb:'Pulangan tunai',sQr:'QR DuitNow',sOwner:'Pemilik',sSign:'Elite penandatangan',sRef:'Dirujuk oleh',none:'Tiada',
 xBiz:'Masukkan nama perniagaan.',xCat:'Pilih kategori.',xAddr:'Masukkan alamat perniagaan.',xCity:'Pilih bandar.',xSsm:'Masukkan nombor SSM 12 digit, atau biarkan kosong.',xQr:'Guna JPG atau PNG bawah 5 MB.',xCb:'Pulangan tunai mesti sekurang-kurangnya 5%.',xCb2:'Masukkan nombor antara 5 hingga 100.',xHandle:'Masukkan nama pengguna YouApp, contoh @kopiahseng.',xOName:'Masukkan nama pemilik.',xOPhone:'Masukkan nombor telefon bimbit pemilik, contoh 13-888 1234.',xOAgree:'Sila sahkan pemilik bersetuju untuk menyertai.',xMAgree:'Sila setuju dengan terma Peniaga dahulu.'});

let mMode='self';
const mShown={};
const myPhone=v=>/^1\d{8,9}$/.test(v.replace(/\D/g,'').replace(/^0/,''));
const handleOk=v=>!v.trim()||/^@?[a-z0-9._]{3,30}$/i.test(v.trim());
const emailOk=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
let qrFile=null,qrBad=false;
const mRules={
 gName:()=>$('mName').value.trim().length>=2?0:'xBiz',
 gCat:()=>$('mCat').value?0:'xCat',
 gAddr:()=>$('mAddr').value.trim().length>=5?0:'xAddr',
 gCity:()=>$('mCity').value?0:'xCity',
 gSsm:()=>{const v=$('mSsm').value.replace(/\s/g,'');return !v||/^\d{12}$/.test(v)?0:'xSsm';},
 gQr:()=>qrBad?'xQr':0,
 gCb:()=>{const v=$('mCb').value.replace(',','.').trim();const n=parseFloat(v);if(!v||isNaN(n)||!/^\d+(\.\d{1,2})?$/.test(v))return 'xCb2';if(n<5)return 'xCb';if(n>100)return 'xCb2';return 0;},
 gCName:()=>mMode!=='self'||$('cName').value.trim().length>=2?0:'eName',
 gCMail:()=>mMode!=='self'||emailOk($('cMail').value)?0:'eMail',
 gCPhone:()=>mMode!=='self'||myPhone($('cPhone').value)?0:'ePhone',
 gCRef:()=>mMode!=='self'||handleOk($('cRef').value)?0:'xHandle',
 gOName:()=>mMode!=='elite'||$('oName').value.trim().length>=2?0:'xOName',
 gOPhone:()=>mMode!=='elite'||myPhone($('oPhone').value)?0:'xOPhone',
 gOMail:()=>mMode!=='elite'||!$('oMail').value.trim()||emailOk($('oMail').value)?0:'eMail',
 gOAcc:()=>mMode!=='elite'||handleOk($('oAcc').value)?0:'xHandle'};
const xId=g=>'x'+g.slice(1);
function mCheck(g){const r=mRules[g]();mShown[g]=r;$(g).classList.toggle('bad',!!r);$(xId(g)).textContent=r?T[L][r]:'';return !r;}
Object.keys(mRules).forEach(g=>{const el=$(g).querySelector('input:not([type=file]),select');if(!el)return;
  el.addEventListener('blur',()=>{if(el.value)mCheck(g);});
  el.addEventListener('input',()=>{if(mShown[g])mCheck(g);});
  el.addEventListener('change',()=>{if(mShown[g])mCheck(g);});});
['cAgree','oAgree'].forEach(id=>$(id).addEventListener('change',()=>{$(id==='cAgree'?'gCAgree':'gOAgree').classList.remove('bad');$('xAll').textContent='';}));

/* file */
$('mQr').addEventListener('change',()=>{const f=$('mQr').files[0];if(!f)return;
  qrBad=!(/^image\/(png|jpe?g)$/.test(f.type))||f.size>5*1024*1024;qrFile=qrBad?null:f;
  if(!qrBad){$('fileName').textContent=f.name;$('fileChip').classList.remove('hide');$('upBox').classList.add('hide');}
  mCheck('gQr');$('mQr').value='';});
$('fileRm').addEventListener('click',()=>{qrFile=null;qrBad=false;$('fileChip').classList.add('hide');$('upBox').classList.remove('hide');mCheck('gQr');$('upBox').focus();});
$('upBox').tabIndex=0;$('upBox').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('mQr').click();}});

/* mode */
function mModeApply(){const t=T[L],E=mMode==='elite';
  [...$('mMode').children].forEach(b=>{const on=b.dataset.m===mMode;b.classList.toggle('on',on);b.setAttribute('aria-checked',on);});
  $('secSelf').classList.toggle('hide',E);$('secElite').classList.toggle('hide',!E);
  $('mTitle').textContent=E?t.mt1E:t.mt1;$('mSub').textContent=E?t.ms1E:t.ms1;$('mLede').textContent=E?t.mledeE:t.mlede;
  $('mn2').textContent=E?t.mn2E:t.mn2;$('mn3').textContent=E?t.mn3E:t.mn3;
  $('oElite').value='@elsaa ('+t.you+')';
  $('mRefNo').textContent;}
$('mMode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;mMode=b.dataset.m;
  Object.keys(mShown).forEach(g=>{if(mShown[g]){mShown[g]=0;$(g).classList.remove('bad');$(xId(g)).textContent='';}});$('xAll').textContent='';mModeApply();});

function mSummary(){const t=T[L],E=mMode==='elite';const sel=id=>{const s=$(id);return s.value==='other'&&id!=='mCat'?t.cityOther:s.options[s.selectedIndex].text;};
  const rows=[[t.sBiz,$('mName').value.trim()],[t.sCat,sel('mCat')],[t.sAddr,$('mAddr').value.trim()+', '+sel('mCity')],[t.sCb,$('mCb').value.trim()+'%'],[t.sQr,qrFile?qrFile.name:t.none]];
  if(E)rows.push([t.sOwner,$('oName').value.trim()+' · +60 '+$('oPhone').value.trim()],[t.sSign,'@elsaa']);
  else rows.push([t.sName,$('cName').value.trim()+' · @elsaa'],[t.sRef,$('cRef').value.trim()?'@'+$('cRef').value.trim().replace(/^@/,''):t.none]);
  $('mSum').innerHTML='';rows.forEach(([k,v])=>{const d=document.createElement('div');const a=document.createElement('span');a.textContent=k;const b=document.createElement('b');b.textContent=v;d.append(a,b);$('mSum').appendChild(d);});}

window.__mApply=()=>{const t=T[L];mModeApply();
  Object.keys(mShown).forEach(g=>{if(mShown[g])$(xId(g)).textContent=t[mShown[g]];});
  if($('xAll').dataset.k)$('xAll').textContent=t[$('xAll').dataset.k];
  if(!$('m2').classList.contains('hide'))mSummary();};

let mBusy=false;
const mErr=k=>{$('xAll').dataset.k=k;$('xAll').textContent=k?T[L][k]:'';};
$('m1').addEventListener('submit',e=>{e.preventDefault();if(mBusy)return;
  const keys=Object.keys(mRules);const res=keys.map(mCheck);const bad=res.indexOf(false);
  if(bad>-1){mErr('eAll');const el=$(keys[bad]).querySelector('input:not([type=file]),select');(el||$('upBox')).focus();return;}
  const ag=mMode==='elite'?'oAgree':'cAgree';
  if(!$(ag).checked){$(ag==='cAgree'?'gCAgree':'gOAgree').classList.add('bad');mErr(ag==='cAgree'?'xMAgree':'xOAgree');$(ag).focus();return;}
  mErr('');mBusy=true;$('mBtn').classList.add('loading');$('mBtn').disabled=true;
  setTimeout(()=>{mBusy=false;$('mBtn').classList.remove('loading');$('mBtn').disabled=false;
    const d=new Date();$('mRefNo').textContent='MC-'+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+'-'+String(Math.floor(Math.random()*9000)+1000);
    mSummary();$('m1').classList.add('hide');$('m2').classList.remove('hide');window.__scene.celebrate();
    const h=$('m2').querySelector('h2');h.setAttribute('tabindex','-1');h.focus();},900);});
$('mCopy').addEventListener('click',()=>{const done=()=>{$('mCopy').textContent=T[L].copied;setTimeout(()=>$('mCopy').textContent=T[L].copy,1500);};
  try{navigator.clipboard.writeText($('mRefNo').textContent).then(done,()=>{});}catch(err){}});

apply();
})();
