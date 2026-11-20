/* In-app webview mode: index.html#elite | #merchant | #merchant-add inside the YouApp prototype */
(function(){
  var embedded = false; try { embedded = window.parent !== window && typeof window.parent.__yaFormClose === 'function'; } catch(e) {}
  var h = (location.hash || '').slice(1);
  if (!embedded) return;
  document.documentElement.classList.add('wv');
  var tab = document.querySelector('#tabs [data-f="' + (h.indexOf('merchant') === 0 ? 'merchant' : 'elite') + '"]'); if (tab) tab.click();
  if (h === 'merchant-add') { var m = document.querySelector('#mMode [data-m="elite"]'); if (m) m.click(); }
  var mode = document.getElementById('mMode'); if (mode) mode.style.display = 'none';
  document.querySelectorAll('a.btn[href="https://youapp.ai"]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); try { window.parent.__yaFormClose(); } catch(_){} }); });
  [['e2','elite'],['m2','merchant']].forEach(function(p){ var el = document.getElementById(p[0]); if (!el) return; var sent = false;
    new MutationObserver(function(){ if (!sent && !el.classList.contains('hide')) { sent = true; try { window.parent.__yaFormSubmitted(p[1]); } catch(_){} } }).observe(el, {attributes:true, attributeFilter:['class']}); });
})();
