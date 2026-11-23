(function(){
  const F = {a30: document.getElementById('a30'), w2: document.getElementById('w2')};
  const launchApp30 = new URLSearchParams(location.search).get('app') === 'app30';
  const launchJump = launchApp30 ? new URLSearchParams(location.search).get('jump') : null;
  let active = 'a30';
  const loaded = new Set();
  let started = false;
  const win = k => F[k].contentWindow;
  const ready = k => { try { return !!win(k).__open; } catch(e){ return false; } };
  window.YouAppPrototypeWallet = {
    baseCents: () => win('w2').__apBal?.(),
    connectedNames: () => win('w2').__apConnectedNames?.() ?? [],
    redPacketDelta: () => win('a30').__apWalletDelta?.() ?? 0,
    refreshBalance() {
      if (active === 'w2') win('w2').__refresh?.();
    },
  };
  function show(k){ active = k; F.a30.classList.toggle('on', k==='a30'); F.w2.classList.toggle('on', k==='w2'); status(); }
  if (launchApp30) { F.a30.classList.add('on'); F.w2.classList.remove('on'); }
  window.__bridge = function(from, screen, ctx){
    const to = from==='a30' ? 'w2' : 'a30';
    show(to);
    if (screen==='__back') { try { win(to).__refresh(); } catch(e){} return; }
    setTimeout(() => { if (ready(to)) win(to).__open(screen, ctx||{}); status(); }, 0);
  };
  const ctxOf = k => { try { return win(k).__state(); } catch(e){ return {}; } };
  function jump(name) {
    const {renderer, screen, backTo} = YouAppPrototypeRoutes.resolve(name);
    if (renderer === 'w2') {
      const {kyc, wallet, host} = ctxOf('a30');
      win('a30').__open(backTo, {});
      show('w2');
      win('w2').__open(screen, {kyc, wallet, host});
      return;
    }
    if (screen === 'gate') {
      show('a30');
      win('a30').__set('kyc', 'none');
      win('a30').__open(screen, {});
      return;
    }
    if (screen !== 'restart') {
      const {kyc, wallet, host} = ctxOf('a30');
      win('w2').__open('home', {kyc, wallet, host});
    }
    show('a30');
    win('a30').__open(screen, {});
  }
  document.querySelectorAll('[data-j]').forEach(b => b.addEventListener('click', () => { if (ready('a30') && ready('w2')) { jump(b.dataset.j); closeP(); } }));
  document.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
    if (!(ready('a30') && ready('w2'))) return; const k = b.dataset.s, v = b.dataset.v;
    if (k==='gList') { win('a30').__set(k, v); show('a30'); status(); return; }
    if (k==='tpList' || k==='tpLb') { win('a30').__set(k, v); show('a30'); status(); return; }
    if (k==='kyc' || k==='wallet' || k==='host') {
      win('a30').__set(k, v);
      const a = ctxOf('a30');
      win('w2').__set('kyc', a.kyc==='approved' && a.wallet==='active' ? 'passed' : a.kyc==='rejected' ? 'rejected' : 'none');
      if (k === 'wallet' && v === 'reconnect') {
        if (active !== 'a30' || a.screen !== 'activate') win('a30').__open('activate', {reconnectPreview:true});
        show('a30');
        closeP();
      }
    } else {
      win('w2').__set(k, v);
      if (k==='lvl' && v!=='0') { win('w2').__set('fph','2'); if (ctxOf('w2').sh!=='active') win('w2').__set('sh','active'); }
      if (k==='fph' && v==='1') win('w2').__set('lvl','0');
      try { win('a30').__refresh(); } catch(e){}
    }
    status();
  }));
  document.getElementById('openScen').addEventListener('click', () => { closeP(); try { win(active).__panel(); } catch(e){} });
  document.getElementById('resetAll').addEventListener('click', () => { try { localStorage.removeItem('w2scen'); localStorage.removeItem('ya-proto-scen'); localStorage.removeItem('youapp-artifact-benchmark'); localStorage.removeItem(YouAppLuckyDraw.storageKey); } catch(e){} location.reload(); });
  const panel = document.getElementById('panel'), scrim = document.getElementById('scrim');
  const closeP = () => { panel.classList.remove('open'); scrim.classList.remove('open'); };
  document.getElementById('fab').addEventListener('click', () => { panel.classList.add('open'); scrim.classList.add('open'); });
  scrim.addEventListener('click', closeP);

  function status(){
    const st = ctxOf(active);
    document.querySelector('.stage').classList.toggle('has-preview-dock', active==='w2' || st.screen==='apform' || st.screen==='activate');
    document.getElementById('nowTag').textContent = active==='a30' ? '3.0' : 'Wallet 2.0';
    document.getElementById('nowTag').classList.toggle('w2', active==='w2');
    document.getElementById('nowName').textContent = st.screen==='activate' && st.wallet==='reconnect' ? 'Reconnect Wallet' : YouAppPrototypeRoutes.label(st.screen);
    const a = ctxOf('a30'), w = ctxOf('w2');
    const cur = {tpList:a.tpList||'has', tpLb:a.tpLb||'friends', gList:a.gList||'empty', mreq:w.mreq||'none', fph:w.fph||'1', lvl:w.lvl||'0', elChk:w.elChk||'first90', kyc:a.kyc, wallet:a.wallet, host:a.hostSt, tier:w.tier, vipEnd:w.vipEnd, sh:w.sh, ref:w.ref==='none'?'none':'scarlette', paid:w.paid||'no', criteria:w.criteria, biz:w.biz, merch:w.merch||'has', pz:w.pz||'won'};
    document.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-pressed', String(cur[b.dataset.s]===b.dataset.v)));
  }
  const hookFrame = installPrototypeForms({win, activeRenderer: () => active, status});
  function frameLoaded(key) {
    if (!ready(key)) return;
    hookFrame(key);
    loaded.add(key);
    if (started || loaded.size !== Object.keys(F).length) return;
    started = true;
    document.getElementById('loading').remove();
    status();
    if (launchJump) jump(launchJump);
  }
  Object.keys(F).forEach(key => {
    F[key].addEventListener('load', () => frameLoaded(key));
    // Both renderers look up the parent bridge when they initialize.
    F[key].src = F[key].dataset.src;
  });
  setInterval(() => { hookFrame('a30'); hookFrame('w2'); }, 800);
  setInterval(status, 600);
})();
