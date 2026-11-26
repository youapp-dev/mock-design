function merchantShareTarget(channel, title, link) {
  const target = new URL(channel === 'whatsapp' ? 'https://wa.me/' : 'https://t.me/share/url');
  if (channel === 'telegram') target.searchParams.set('url', link);
  target.searchParams.set('text', channel === 'whatsapp' ? `${title}\n${link}` : title);
  return target.href;
}
