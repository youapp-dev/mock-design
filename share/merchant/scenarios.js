const previewCatalog = window.YouAppMerchantPreviews;
for (const row of document.querySelectorAll('.cases > ul > li')) {
  const preview = row.querySelector('a');
  const filename = preview.getAttribute('href');
  const item = previewCatalog.items[filename.replace(/\.html$/, '')];
  const external = new URL(filename, previewCatalog.publicBase).href;
  const actions = document.createElement('div');
  actions.className = 'case-actions';
  for (const [channel, label] of [['whatsapp', 'WhatsApp'], ['telegram', 'Telegram']]) {
    const link = document.createElement('a');
    link.href = merchantShareTarget(channel, item.title, external);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    link.setAttribute('aria-label', `Share ${item.title} to ${label}`);
    actions.append(link);
  }
  row.append(actions);
}

const directory = document.querySelector('.place-directory');
for (const [key, item] of Object.entries(previewCatalog.items)) {
  if (item.id !== key) continue;
  const row = document.createElement('li');
  const link = document.createElement('a');
  link.href = key + '.html';
  link.textContent = item.title;
  row.append(link);
  directory.append(row);
}
