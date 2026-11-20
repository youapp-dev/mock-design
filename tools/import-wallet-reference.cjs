const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(process.argv[2], 'utf8');
const output = path.join(__dirname, '..', 'prototype', 'wallet2', 'reference');
const screens = [
  'youlong', 'scan', 'pay', 'coins', 'coinsmm', 'payu', 'approve', 'celeb', 'done',
  'connect', 'topup', 'topcard', 'add', 'all', 'allone', 'plans', 'plansvip', 'plansfree',
  'rew0', 'rew1', 'refer', 'settingslong',
];

function phone(name) {
  const open = new RegExp(`<div class="ph[^\"]*" id="s-${name}">`).exec(source);
  if (!open) throw new Error(`Missing reference frame ${name}`);
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = open.index;
  let depth = 0;
  for (const tag of source.matchAll(tags)) {
    depth += tag[0][1] === '/' ? -1 : 1;
    if (depth === 0) {
      return source.slice(open.index, tag.index + tag[0].length)
        .replace('class="ph', 'class="wr-frame')
        .replace(/class="stack"/g, 'class="wr-currency-stack"')
        .replace(`id="s-${name}"`, `data-reference="${name}"`);
    }
  }
  throw new Error(`Unclosed reference frame ${name}`);
}

const defs = source.match(/<body>(<svg[\s\S]*?<\/defs>\s*<\/svg>)/)[1];
const svgIds = [...defs.matchAll(/\bid="([\w-]+)"/g)].map(match => match[1]);
const refs = new RegExp(`(id="|href="#|url\\(#)(${svgIds.join('|')})(?=[")])`, 'g');
const prefixSvg = markup => markup.replace(refs, '$1wr-$2');
const images = new Map();
function externalizeImages(markup) {
  return prefixSvg(markup).replace(/data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)/g, (_, type, data) => {
    if (!images.has(data)) images.set(data, `image-${images.size + 1}.${type === 'jpeg' ? 'jpg' : type}`);
    return `reference/${images.get(data)}`;
  });
}

const frames = Object.fromEntries(screens.map(name => [name, externalizeImages(phone(name))]));
const symbols = externalizeImages(defs);
const css = source.match(/<style>([\s\S]*?)<\/style>/)[1]
  .replace(':root{', ':scope{')
  .replace(/\.ph\b/g, '.wr-frame')
  .replace(/\.stack\b/g, '.wr-currency-stack')
  .replace(/body\{[^}]*\}/, '');
fs.mkdirSync(output, {recursive:true});
for (const [data, filename] of images) fs.writeFileSync(path.join(output, filename), Buffer.from(data, 'base64'));
fs.writeFileSync(path.join(output, 'frames.js'),
  `/* Wallet frames imported from Design_update_19nov/youapp-wallet-screens/index.html. */\nconst walletReferenceFrames = ${JSON.stringify(frames, null, 2)};\nconst walletReferenceSymbols = ${JSON.stringify(symbols)};\n`);
fs.writeFileSync(path.join(output, 'frames.css'),
  `/* Wallet styles imported from Design_update_19nov/youapp-wallet-screens/index.html. */\n@scope (.wallet-reference) {\n${css}\n}\n`);
