const merchantDestination = document.querySelector('[data-open-merchant]');
const merchantVersion = new URLSearchParams(location.search).get('version');
if (merchantDestination && ['3.2.0', '3.3.0'].includes(merchantVersion)) {
  const destination = new URL(merchantDestination.href);
  const versioned = new URL(`../../${merchantVersion}/`, location.href);
  versioned.search = destination.search;
  merchantDestination.href = versioned.href;
}
