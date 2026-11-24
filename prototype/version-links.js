const renderPrototypeVersionLinks = (() => {
  const root = new URL('../', document.currentScript.src);
  const current = new URL(document.referrer || location.href).pathname.replace(/(?:index\.html)?\/?$/, '/');
  const versions = ['3.2.0', '3.3.0'];

  return () => `<div class="pgroup"><h2>Version</h2>
    <nav class="version-links" aria-label="Prototype version">
      ${versions.map(version => {
        const url = new URL(version + '/', root);
        return `<a href="${url.pathname}" target="_top"${url.pathname === current ? ' aria-current="page"' : ''}>${version}</a>`;
      }).join('')}
    </nav>
  </div>`;
})();
