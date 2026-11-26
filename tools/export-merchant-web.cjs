const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'prototype/app30/runtime.js'), 'utf8');
const merchants = fs.readFileSync(path.join(root, 'prototype/features/merchants/merchants.js'), 'utf8');
const legacy = vm.runInNewContext(runtime.match(/const MERCHANTS = (\[[\s\S]*?\n\]);/)[1]);
const noop = () => {};
const context = {
  window:{addEventListener:noop},
  document:{addEventListener:noop, head:{insertAdjacentHTML:noop}},
  IMG:{}, META:{}, V:{}, A:{}, appEntryRoutes:{}, C6:noop, overlayHTML:noop, render:noop, guard:fn => fn,
  merById:id => legacy.find(place => place.id === id && !place.hidden),
};
vm.runInNewContext(merchants, context, {filename:'merchants.js'});
const ids = [...merchants.matchAll(/^\s*\{id:'(px-[^']+)'/gm)].map(match => match[1]);
ids.push(...legacy.filter(place => !place.hidden).map(place => place.id));
const snapshots = Object.fromEntries(ids.map(id => [id, context.window.MX.publicSnapshot(id)]));
process.stdout.write(JSON.stringify(snapshots));
