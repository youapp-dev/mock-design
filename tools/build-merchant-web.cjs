#!/usr/bin/env node
/* Build the data and photos for the merchant web app (share/merchant/*.html, active merchants).
   Reads the sample data the app uses (merchants.js and runtime.js) and writes:
   - share/merchant/web/merchant-data.js  (window.YouAppMerchantWeb)
   - share/merchant/web/img/<key>.<ext>   (photos and avatars, original quality)
   Run after tools/build-merchant-share.py:  node tools/build-merchant-web.cjs */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'share/merchant/web');
const IMG_OUT = path.join(OUT, 'img');
const MX = fs.readFileSync(path.join(ROOT, 'prototype/features/merchants/merchants.js'), 'utf8');
const RT = fs.readFileSync(path.join(ROOT, 'prototype/app30/runtime.js'), 'utf8');

const block = (src, name, open, close) => {
  const start = src.indexOf(`const ${name} = ${open}`);
  if (start < 0) throw new Error(`${name} not found`);
  const end = src.indexOf(`\n${close};`, start);
  return vm.runInNewContext(`(${src.slice(start + `const ${name} = `.length, end + close.length + 1)})`);
};
const PPL = block(MX, 'PPL', '{', '}');
const PLACES = block(MX, 'PLACES', '[', ']');
const MERCHANTS = block(RT, 'MERCHANTS', '[', ']');
const AGE = vm.runInNewContext(MX.match(/const AGE = (\[.*\]);/)[1]);
const GENDER = vm.runInNewContext(MX.match(/const GENDER = (\[.*\]);/)[1]);
const MORE = block(MX, 'MORE', '[', ']');
const one = name => vm.runInNewContext(MX.match(new RegExp(`const ${name} = (\\[.*\\]);`))[1]);
const GNAMES = one('GNAMES'), GTEXT = one('GTEXT'), YTEXT = one('YTEXT'), AGOS = one('AGOS');

/* same mapping the app uses for older merchants (merchants.js fromOld) */
const fromOld = m => ({id:m.id, name:m.name, type:m.cat || (m.tags || [])[0] || 'Merchant', price:'', addr:m.addr, full:m.addr,
  open:!/clos/i.test(m.openLabel || ''), close:((m.openLabel || '').match(/Closes (.+)$/) || [])[1] || '', rating:m.rating, rev:m.ratingCount || m.checkins || 0,
  cb:m.cb || 0, img:m.img, today:Math.round((m.checkins || 20) / 20), total:m.checkins || 0, phone:'03-5631 2299', photos:12,
  board:[['aiko', Math.max(5, Math.round((m.checkins || 40) / 7))], ['hafiz', Math.max(3, Math.round((m.checkins || 40) / 10))], ['mei', Math.max(2, Math.round((m.checkins || 40) / 16))]], old:true});

const images = {};
for (const src of [MX, RT]) for (const [, key, mime, data] of src.matchAll(/["']?(\w+)["']?\s*:\s*["']data:image\/(\w+);base64,([^"']+)/g)) images[key] = [mime, data];
fs.mkdirSync(IMG_OUT, {recursive:true});
const saved = {};
const pic = key => {
  if (!key || !images[key]) return null;
  if (!saved[key]) { const [mime, data] = images[key]; const ext = mime === 'jpeg' ? 'jpg' : mime;
    fs.writeFileSync(path.join(IMG_OUT, `${key}.${ext}`), Buffer.from(data, 'base64')); saved[key] = `web/img/${key}.${ext}`; }
  return saved[key];
};

const POS = ['50% 50%', '20% 30%', '80% 40%', '40% 85%', '90% 90%', '10% 70%'];
const photosOf = p => { if (!pic(p.img)) return [];
  const base = p.id === 'px-kopi' ? [[p.img], ['mx_coffee'], ['mx_bakery'], ['mx_rest'], ['mx_cafe', '50% 80%'], ['mx_coffee', '20% 30%'], ['mx_bakery', '80% 30%'], ['mx_rest', '30% 70%']] : POS.map(o => [p.img, o]);
  return Array.from({length:p.photos}, (_, i) => { const b = base[i % base.length]; return [pic(b[0]), b[1] || POS[Math.floor(i / base.length) % POS.length]]; }); };

/* reviews: the app's sample set (REVS + allRevs), web shows up to 12 */
const firstRevs = p => p.id === 'px-kopi' || p.old ? [
  {k:'aiko', r:5, t:'My daily spot. Ask for the kopi peng kurang manis, and the kaya toast is made fresh.', ph:['mx_coffee', 'mx_cafe'], ago:'3 days ago'},
  {k:'priya', r:4, t:'Lovely place to work for a morning. Busy at 10 AM, come early for a window seat.', ago:'1 week ago'},
  {g:'Aaron Lim', r:5, t:'Great kopi and kaya toast. Gets busy around 9 AM on weekends, come early.', ago:'2 weeks ago'}] : [
  {k:p.board[0][0], r:5, t:'My regular spot. Friendly staff and it never takes long.', ago:'4 days ago'},
  {g:'Nur Aisyah', r:4, t:'Good value and easy to find. Can get crowded at lunch.', ago:'3 weeks ago'}];
const reviewsOf = p => { const yk = ['hafiz', 'mei', 'jason', 'ravi'];
  const more = Array.from({length:36}, (_, i) => { const ago = AGOS[Math.min(11, 2 + (i >> 2))];
    if (i % 3 === 1) { const [t, r, ph] = YTEXT[i % YTEXT.length]; return {k:yk[i % 4], r, t, ph, ago}; }
    const [t, r] = GTEXT[i % GTEXT.length]; return {g:GNAMES[(i + 1) % GNAMES.length], r, t, ago}; });
  return firstRevs(p).concat(more).filter(v => !v.g || p.rev).map(v => { const o = {s:v.g ? 'Google' : 'YouApp', n:v.g || PPL[v.k].n, r:v.r, t:v.t, ago:v.ago};
    if (v.k) o.k = v.k; if (v.ph && v.ph.length) o.ph = v.ph.map(pic).filter(Boolean); return o; }); };

/* all-time ranking differs from the last 30 days (regulars who came more often in the past) */
const ALL_X = [3.1, 4.4, 5.6, 6.3, 7.2];
const allTime = board => board.map(([k, n], i) => [k, Math.round(n * ALL_X[i % ALL_X.length])]).sort((a, b) => b[1] - a[1]);
/* who checked in recently: Today = the first `today` people (max 2 in the sample), This week = 4 */
const visitors = p => { const ks = [...new Set(p.board.map(r => r[0]).concat(Object.keys(PPL)))];
  return {all:ks, week:ks.slice(0, 4), today:p.today ? ks.slice(0, Math.min(2, p.today)) : []}; };

const place = p => ({
  id:p.id, name:p.name, type:p.type, price:p.price || '', addr:p.full || p.addr, open:p.open, close:p.close || '', opens:p.opens || '',
  rating:p.rating, reviews:(p.rev || 0) + 86, sourceCounts:{all:(p.rev || 0) + 86, YouApp:86, Google:p.rev || 0, photos:214},
  cb:p.cb || 0, phone:p.phone || '', map:p.full || p.addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.full || p.addr}`)}` : '',
  hero:pic(p.img), photoCount:pic(p.img) ? p.photos : 0, photos:photosOf(p),
  stars:[[5, 78], [4, 14], [3, 4], [2, 2], [1, 2]], reviewList:reviewsOf(p),
  /* no check-ins yet: empty leaderboard and visitor lists */
  board30:p.total ? p.board : [], boardAll:p.total ? allTime(p.board) : [], total:p.total, today:p.total ? p.today : 0,
  visitors:p.total ? visitors(p) : {all:[], week:[], today:[]}});

const places = {};
PLACES.forEach(p => { places[p.id] = place(p); });
MERCHANTS.filter(m => !m.hidden).forEach(m => { places[m.id] = place(fromOld(m)); });
/* scenario page without photos (px-thread-no-photo.html) */
places['px-thread-no-photo'] = {...places['px-thread'], hero:null, photoCount:0, photos:[]};

const people = {};
Object.entries(PPL).forEach(([k, u]) => { people[k] = {n:u.n, from:u.from, img:pic(u.img)}; });
const payload = {people, places, age:AGE, gender:GENDER, more:MORE};
fs.writeFileSync(path.join(OUT, 'merchant-data.js'), `// Generated by tools/build-merchant-web.cjs. Do not edit by hand.\nwindow.YouAppMerchantWeb = ${JSON.stringify(payload)};\n`);
console.log(`places ${Object.keys(places).length}, images ${Object.keys(saved).length}`);
