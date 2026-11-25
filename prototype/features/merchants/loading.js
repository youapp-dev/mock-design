/* Simulated loading for Merchant discovery and its customer-facing screens. */
(() => {
  const DEFAULT_SECONDS = 1;
  const maxTimer = 2147483647;
  const shape = kind => `<span class="mx-sk-shape mx-sk-${kind}"></span>`;
  const lines = () => `<div class="mx-sk-lines">${shape('title')}${shape('line')}${shape('short')}</div>`;
  const rows = (count, avatar = false) => Array.from({length:count}, () =>
    `<div class="mx-sk-row">${avatar ? shape('avatar') : ''}${lines()}</div>`).join('');
  const chips = () => `<div class="mx-sk-chips">${shape('chip')}${shape('chip')}${shape('chip')}</div>`;
  const card = () => `<div class="mx-sk-card">${shape('cover')}${lines()}</div>`;
  const centered = () => `<div class="mx-sk-center">${shape('portrait')}${lines()}</div>`;

  const views = {
    discover: ['Merchants', () => shape('field') + chips() + card() + card()],
    search: ['Search merchants', () => shape('field') + rows(5, true)],
    merArea: ['Choose area', () => shape('field') + shape('map') + lines() + chips() + rows(2)],
    mer: ['Merchant', () => shape('hero') + lines() + chips() + rows(2), true],
    merPhotos: ['Photos', () => shape('photo') + chips()],
    merBoard: ['Leaderboard', () => chips() + centered() + rows(4, true)],
    merDone: ['Check-in', () => centered() + chips() + shape('field'), true],
    merReviews: ['Reviews', () => shape('rating') + chips() + rows(4, true), true],
    merRev: ['Write a review', () => rows(1, true) + chips() + shape('map'), true],
    merPeople: ['Checked in here', () => chips() + rows(5, true)],
    merWho: ['Who checks in here', () => lines() + shape('rating') + rows(2)],
  };

  function keyForScreen(){
    if (S.screen === 'discover') return S.htab !== 'feed' && S.seg === 'merchants' ? 'discover' : null;
    if (S.screen === 'search') return S.sk === 'merchants' ? 'search' : null;
    return Object.hasOwn(views, S.screen) ? `${S.screen}:${S.mer || ''}` : null;
  }

  const seconds = () => scen.merchantLoadSeconds ?? DEFAULT_SECONDS;
  let loading;
  let timer;

  function schedule(){
    clearTimeout(timer);
    if (!loading) return;
    const current = loading;
    const remaining = Math.min(seconds() * 1000, maxTimer) - (performance.now() - current.started);
    current.pending = remaining > 0;
    if (!current.pending) return;
    timer = setTimeout(() => {
      if (loading !== current || keyForScreen() !== current.key) return;
      current.pending = false;
      render();
    }, remaining);
  }

  const originalRender = render;
  render = function(...args){
    const key = keyForScreen();
    if (key !== (loading?.key ?? null)) {
      loading = key ? {key, started:performance.now()} : null;
      schedule();
    }
    return originalRender.apply(this, args);
  };

  function placeholder(screen, content){
    return `<span class="mx-sk-status" role="status">Loading ${views[screen][0].toLowerCase()}?</span>
      <div class="mx-skeleton mx-skeleton-${screen}" data-merchant-skeleton="${screen}" aria-hidden="true">${content()}</div>`;
  }

  for (const [screen, [title, content, footer]] of Object.entries(views)) {
    const originalView = V[screen];
    V[screen] = function(...args){
      if (!loading?.pending || keyForScreen() !== loading.key) return originalView.apply(this, args);
      const layout = placeholder(screen, content);
      if (screen === 'discover') {
        const template = document.createElement('template');
        template.innerHTML = originalView.apply(this, args);
        const scroll = template.content.querySelector('#mainScroll');
        if (!scroll) return template.innerHTML;
        scroll.innerHTML = layout;
        return template.innerHTML;
      }
      return `<div class="screen mx-loading-page ${screen === 'merPhotos' ? 'mx-loading-viewer' : ''}">${statusBar()}${topBar(title)}
        <div class="scroll">${layout}</div>
        ${footer ? `<div class="mx-sk-footer" aria-hidden="true">${shape('field')}</div>` : ''}</div>`;
    };
  }

  const setScenario = window.__set;
  window.__set = (key, value) => {
    if (key !== 'merchantLoadSeconds') return setScenario(key, value);
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return;
    scen.merchantLoadSeconds = value;
    saveScen();
    if (loading?.pending) {
      schedule();
      if (!loading.pending) render();
    }
  };
  const getState = window.__state;
  window.__state = () => ({...getState(), merchantLoadSeconds:seconds()});
})();
