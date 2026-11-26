(() => {
  const root = document.querySelector('.place-community');
  if (!root) return;
  const key = location.pathname.split('/').pop().replace(/\.html$/, '');
  const item = window.YouAppMerchantPreviews.items[key];
  const place = window.YouAppMerchantDetails[item.id];
  const appLink = document.querySelector('[data-open-merchant]').href;
  const format = new Intl.NumberFormat('en-US');
  const number = value => format.format(value);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
  })[character]);
  const image = (photo, alt = '') => '<img loading="lazy" src="' + escape(photo) + '.jpg" alt="' + escape(alt) + '">';
  const appAction = label => '<a class="secondary" href="' + escape(appLink) + '">' + label + '</a>';
  const charts = place.charts;
  const photos = item.image === 'youapp-logo.jpg' ? [] : place.photos;
  const actions = document.querySelector('.place-actions');
  if (item.place.cashback) actions.insertAdjacentHTML('beforeend', appAction('Pay with YouApp'));
  actions.insertAdjacentHTML('beforeend', '<button class="secondary" type="button" id="copy-place">Copy share link</button><span role="status" id="copy-status"></span>');
  actions.querySelector('#copy-place').addEventListener('click', async () => {
    const url = new URL(location.href);
    url.hash = '';
    const message = window.YouAppMerchantPreviews.shareDescription + ': ' + url.href;
    const status = actions.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = 'Link copied.';
    } catch {
      status.innerHTML = '<label>Copy this message <input readonly></label>';
      const input = status.querySelector('input');
      input.value = message;
      input.select();
    }
  });
  const sections = [['visit-title', 'Details'], ['leaderboard', 'Leaderboard'], ['reviews', 'Reviews'], ['check-ins', 'Check-ins']];
  if (photos.length) sections.push(['photos', 'Photos']);
  const nav = document.querySelector('.place-jumps');
  nav.innerHTML = sections.map(([id, label]) => '<a href="#' + id + '">' + label + '</a>').join('');
  nav.hidden = false;

  if (place.price) document.querySelector('.place-identity p').append(' · ' + place.price);
  if (place.address) document.querySelector('.place-details dd').textContent = place.address;
  root.innerHTML =
    '<section class="community-panel" id="leaderboard"><div class="community-heading"><div><h2>Leaderboard</h2><p>Most check-ins in the last 30 days earns the ambassador spot.</p></div>' + appAction('Check in with YouApp') +
    '</div><div class="community-switch" role="group" aria-label="Leaderboard period"><button type="button" data-period="recent" aria-pressed="true">Last 30 days</button><button type="button" data-period="all" aria-pressed="false">All time</button></div><div class="community-board" aria-live="polite"></div></section>' +
    '<section class="community-panel" id="reviews"><div class="community-heading"><div><h2>Reviews</h2><p>★ ' + escape(item.place.rating) + ' · ' + number(place.reviewCount) + ' reviews</p></div>' + appAction('Write a review in YouApp') +
    '</div><dl class="community-rating-breakdown">' + place.ratingBreakdown.map(([stars, portion]) => '<div><dt>' + stars + ' stars</dt><dd><meter min="0" max="1" value="' + portion + '" aria-label="' + stars + '-star reviews"></meter> ' + Math.round(portion * 100) + '%</dd></div>').join('') + '</dl>' +
    '<div class="community-filters"><label>Source <select id="review-source"><option>All</option><option>YouApp</option><option>Google</option><option>With photos</option></select></label><label>Sort by <select id="review-sort"><option>Newest</option><option>Highest rating</option><option>Lowest rating</option></select></label></div><div class="community-reviews" aria-live="polite"></div><button class="secondary" type="button" id="more-reviews">Show more reviews</button></section>' +
    '<section class="community-panel" id="check-ins"><h2>Check-ins</h2><dl class="community-totals"><div><dt>All time</dt><dd>' + number(place.total) + '</dd></div><div><dt>Today</dt><dd>' + number(place.today) + '</dd></div></dl>' +
    (place.total ? '<h3>People who checked in</h3><div class="community-switch" role="group" aria-label="Visitor period"><button type="button" data-visitors="today" aria-pressed="false">Today</button><button type="button" data-visitors="week" aria-pressed="false">This week</button><button type="button" data-visitors="all" aria-pressed="true">All time</button></div><div id="community-visitors" aria-live="polite"></div>' : '<p>No check-ins yet.</p>') +
    (charts.length ? '<h3>Who checks in here</h3><p>Last 90 days</p><div class="community-charts"></div><details class="community-more-charts"><summary>Show all statistics</summary><div class="community-charts"></div></details>' : '') + '</section>' +
    (photos.length ? '<section class="community-panel" id="photos"><h2>Photos</h2><div class="community-gallery">' +
      photos.slice(0, 4).map(([photo], index) => '<button type="button" data-photo="' + index + '" aria-label="Open photo ' + (index + 1) + '">' + image(photo) + '</button>').join('') +
      '</div><button class="secondary" type="button" data-photo="0">View all ' + photos.length + ' photos</button>' +
      '<dialog class="community-viewer" aria-label="Merchant photos"><form method="dialog"><button type="submit" aria-label="Close photos">Close</button></form><img alt=""><div><button type="button" data-step="-1">Previous</button><span role="status"></span><button type="button" data-step="1">Next</button></div></dialog></section>' : '');
  root.hidden = false;

  const visitors = root.querySelector('#community-visitors');
  if (visitors) {
    const renderVisitors = period => {
      const people = period === 'today' && !place.today ? [] : place.visitors[period];
      visitors.innerHTML = people.length
        ? '<ul class="community-people">' + people.map(person => '<li>' + image(person.photo) + '<strong>' + escape(person.name) + '</strong><small>' + escape(person.origin) + '</small></li>').join('') + '</ul>'
        : '<p>No one has checked in today.</p>';
    };
    renderVisitors('all');
    const filter = root.querySelector('[aria-label="Visitor period"]');
    filter.addEventListener('click', event => {
      const period = event.target.dataset.visitors;
      if (!period) return;
      for (const button of filter.children) button.setAttribute('aria-pressed', String(button.dataset.visitors === period));
      renderVisitors(period);
    });
  }

  const board = root.querySelector('.community-board');
  function renderBoard(period) {
    const rows = place.periods[period];
    if (!rows.length || !place.total) {
      board.innerHTML = '<p>No check-ins yet.</p>';
      return;
    }
    board.innerHTML = '<table><thead><tr><th scope="col">Rank</th><th scope="col">Person</th><th scope="col">Check-ins</th></tr></thead><tbody>' +
      rows.map((person, index) => '<tr><td>' + (index + 1) + '</td><td><div class="community-person">' + image(person.photo) +
        '<div><strong>' + escape(person.name) + '</strong><small>' +
        (index === 0 && period === 'recent' ? 'Ambassador · ' : '') + escape(person.origin) +
        '</small></div></div></td><td>' + number(person.count) + '</td></tr>').join('') + '</tbody></table>';
  }
  renderBoard('recent');
  root.querySelector('.community-switch').addEventListener('click', event => {
    const period = event.target.dataset.period;
    if (!period) return;
    for (const button of event.currentTarget.children) button.setAttribute('aria-pressed', String(button.dataset.period === period));
    renderBoard(period);
  });

  const reviewSource = root.querySelector('#review-source');
  const reviewSort = root.querySelector('#review-sort');
  const moreReviews = root.querySelector('#more-reviews');
  let reviewLimit = 3;
  function renderReviews() {
    const source = reviewSource.value;
    const results = place.reviews.filter(review => source === 'All' || review.source === source ||
      (source === 'With photos' && review.photos.length));
    if (reviewSort.value === 'Highest rating') results.sort((a, b) => b.score - a.score);
    if (reviewSort.value === 'Lowest rating') results.sort((a, b) => a.score - b.score);
    root.querySelector('.community-reviews').innerHTML = results.slice(0, reviewLimit).map(review =>
      '<article><div><strong>' + escape(review.name) + '</strong><b aria-label="' + review.score + ' out of 5 stars">★ ' + review.score + '</b></div><small>' +
      escape(review.source) + ' · ' + escape(review.ago) + '</small><p>' + escape(review.text) +
      '</p>' + (photos.length && review.photos.length ? '<div class="community-review-photos">' + review.photos.map(photo => image(photo, 'Review photo')).join('') + '</div>' : '') + '</article>'
    ).join('') || '<p>No reviews match this filter.</p>';
    moreReviews.hidden = results.length <= reviewLimit;
  }
  renderReviews();
  for (const control of [reviewSource, reviewSort]) control.addEventListener('change', () => { reviewLimit = 3; renderReviews(); });
  moreReviews.addEventListener('click', () => { reviewLimit += 12; renderReviews(); });

  const chartMarkup = ([title, entries]) => {
    const total = entries.reduce((sum, entry) => sum + entry[1], 0);
    let start = 0;
    const segments = entries.map(([, count, color]) => {
      const end = start + (count / total) * 100;
      const segment = color + ' ' + start + '% ' + end + '%';
      start = end;
      return segment;
    }).join(',');
    return '<figure><div class="community-donut" aria-hidden="true" style="background:conic-gradient(' + segments + ')"></div><figcaption><strong>' + escape(title) + '</strong><ul>' +
      entries.map(([label, count, color]) => '<li><i style="background:' + color + '" aria-hidden="true"></i><span>' + escape(label) + '</span><span>' +
        Math.round(count / total * 100) + '% · ' + number(count) + '</span></li>').join('') + '</ul></figcaption></figure>';
  };
  if (charts.length) {
    const grids = root.querySelectorAll('.community-charts');
    grids[0].innerHTML = charts.slice(0, 2).map(chartMarkup).join('');
    grids[1].innerHTML = charts.slice(2).map(chartMarkup).join('');
    const disclosure = root.querySelector('.community-more-charts');
    disclosure.addEventListener('toggle', () => {
      disclosure.querySelector('summary').textContent = disclosure.open ? 'Show fewer statistics' : 'Show all statistics';
    });
  }

  const viewer = root.querySelector('.community-viewer');
  if (viewer) {
    let photoIndex = 0;
    const renderPhoto = index => {
      photoIndex = (index + photos.length) % photos.length;
      const [photo, position] = photos[photoIndex];
      const photoElement = viewer.querySelector('img');
      photoElement.src = photo + '.jpg';
      photoElement.alt = item.title + ' photo ' + (photoIndex + 1);
      photoElement.style.objectPosition = position;
      viewer.querySelector('[role="status"]').textContent = (photoIndex + 1) + ' / ' + photos.length;
    };
    for (const button of root.querySelectorAll('[data-photo]')) button.addEventListener('click', () => {
      renderPhoto(Number(button.dataset.photo));
      viewer.showModal();
    });
    viewer.addEventListener('click', event => {
      if (event.target.dataset.step) renderPhoto(photoIndex + Number(event.target.dataset.step));
    });
    viewer.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') renderPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    });
  }
})();
