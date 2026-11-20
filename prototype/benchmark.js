/* Claude artifact QVfDBhiCej2mLPa8gDyXYE is the frozen import benchmark.
   This migration runs once per benchmark revision so stale prototype state cannot
   make localhost open with different screens or scenario selections. */
(function(){
  const version = 'claude-QVfDBhiCej2mLPa8gDyXYE-2026-11-19';
  const key = 'youapp-artifact-benchmark';
  if (localStorage.getItem(key) === version) return;
  localStorage.setItem('ya-proto-scen', JSON.stringify({
    account:'new', platform:'ios', network:'online', force:'off',
    kyc:'approved', wallet:'active', country:'MY', content:'normal', host:'yes'
  }));
  localStorage.setItem('w2scen', JSON.stringify({
    payRes:'ok', phase:'4', tier:'svip', kyc:'passed', bal:'enough',
    ref:'scarlette', sh:'none', criteria:'partial', svip:'none', biz:'off',
    float:'ok', merch:'has', pz:'won', xsRes:'ok', meHost:'yes', paid:'yes',
    svipP:'early', mdata:'has', fph:'2', lvl:'0', elChk:'first90', vipEnd:'soon'
  }));
  localStorage.setItem(key, version);
})();
