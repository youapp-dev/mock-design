function installPrototypeForms({win, activeRenderer, status}) {
  /* Embed Elite and Merchant registration in the shell. */
  const wvOv = document.getElementById('wvOv');
  const WV_TITLE = {elite:'Elite application', merchant:'Merchant application', 'merchant-add':'Merchant application'};
  let wvFrame = null, wvLast = null;
  function openForm(name){
    if (wvFrame) wvFrame.remove();
    wvFrame = document.createElement('iframe');
    wvFrame.dataset.webview = '1'; wvFrame.title = WV_TITLE[name];
    wvFrame.src = 'prototype/forms/index.html#' + name;
    wvOv.appendChild(wvFrame);
    document.getElementById('wvTitle').textContent = WV_TITLE[name];
    wvLast = document.activeElement; wvOv.classList.add('on');
    setTimeout(() => document.getElementById('wvX').focus(), 340);
  }
  function closeForm(){
    wvOv.classList.remove('on');
    setTimeout(() => { if (wvFrame && !wvOv.classList.contains('on')) { wvFrame.remove(); wvFrame = null; } }, 360);
    try { win(activeRenderer()).__refresh(); } catch(e){}
    try { if (wvLast) wvLast.focus(); } catch(e){}
    status();
  }
  window.__yaFormClose = closeForm;
  window.__yaFormSubmitted = function(type){
    try {
      if (type === 'elite') win('w2').__set('sh', 'pending');
      if (type === 'merchant') win('w2').__set('mreq', 'pending');
      win('a30').__refresh();
    } catch(e){}
    status();
  };
  document.getElementById('wvX').addEventListener('click', closeForm);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && wvOv.classList.contains('on')) closeForm(); });
  const FORM_CTA = [
    [/^(become (an )?elite|apply to become (an )?elite|apply as (an )?elite|contact support to become (an )?elite)$/, 'elite'],
    [/^become (a )?merchant$/, 'merchant'],
    [/^(let.?s )?add (a|another) merchant$/, 'merchant-add']
  ];
  function hookFrame(k){
    let d; try { d = win(k).document; } catch(e){ return; }
    if (!d || d.__yaFormHook) return; d.__yaFormHook = true;
    d.addEventListener('click', e => {
      const el = e.target.closest && e.target.closest('button,a,[role="button"],[onclick],[data-act],[data-go],[data-to],[data-nav],[data-a],.btn');
      if (!el) return;
      const t = (el.innerText || el.textContent || '').replace(/[›→+✓]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      for (const [re, name] of FORM_CTA) {
        if (re.test(t)) { e.preventDefault(); e.stopImmediatePropagation(); openForm(name); return; }
      }
    }, true);
  }
  return hookFrame;
}
