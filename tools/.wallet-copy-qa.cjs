const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const {spawn} = require('node:child_process');

const root = path.join(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'youapp-wallet-qa-'));
const chrome = process.argv[2] || path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe');
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml'};
const mount = '/mock-design/';
const server = http.createServer((request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname;
  if (!name.startsWith(mount)) {
    response.writeHead(404).end();
    return;
  }
  const file = path.resolve(root, name.slice(mount.length) || 'index.html');
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {'Content-Type':(types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8'});
  fs.createReadStream(file).pipe(response);
});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label) {
  for (let i = 0; i < 90; i++) {
    const value = await fn();
    if (value) return value;
    await pause(100);
  }
  throw new Error('Timed out waiting for ' + label);
}

let browser;
let ws;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = `http://127.0.0.1:${server.address().port}${mount}`;
  browser = spawn(chrome, ['--headless=new', '--disable-extensions', '--disable-background-networking', '--remote-debugging-port=0',
    `--user-data-dir=${path.join(temp, 'browser')}`, '--window-size=1440,1024', 'about:blank'], {stdio:'ignore', windowsHide:true});
  let launchError;
  browser.on('error', error => { launchError = error; });
  const port = await until(() => {
    if (launchError) throw launchError;
    const active = path.join(temp, 'browser', 'DevToolsActivePort');
    return fs.existsSync(active) && fs.readFileSync(active, 'utf8').split('\n')[0];
  }, 'Chrome');
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const {resolve, reject} = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const detail = message.params.exceptionDetails;
      errors.push(detail.exception?.description || detail.text);
    }
  });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, {resolve, reject});
    ws.send(JSON.stringify({id, method, params}));
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || expression);
    return result.result.value;
  };
  const inRenderer = (id, expression) => evaluate(`document.getElementById(${JSON.stringify(id)}).contentWindow.eval(${JSON.stringify(expression)})`);
  const wallet = expression => inRenderer('w2', expression);
  const app = expression => inRenderer('a30', expression);
  const inWallet = selector => `document.querySelector('#w2').contentDocument.querySelector(${JSON.stringify(selector)})`;
  const click = async (selector, scope = 'wallet', reveal = true) => {
    const frameId = {wallet:'w2', app:'a30'}[scope];
    const frameElement = `document.getElementById(${JSON.stringify(frameId)})`;
    const expression = `${frameId ? frameElement + '.contentDocument' : 'document'}.querySelector(${JSON.stringify(selector)})`;
    const coords = await evaluate(`(() => { const el = ${expression}; if (!el) return null;
      if (${reveal}) el.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
      const rect = el.getBoundingClientRect();
      const frame = ${frameId ? frameElement + '.getBoundingClientRect()' : '{left:0,top:0}'};
      const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
      const top = document.elementFromPoint(x + frame.left, y + frame.top);
      const unobstructed = ${frameId ? `top === ${frameElement}` : 'el.contains(top)'};
      return {x:x + frame.left, y:y + frame.top, hit:unobstructed && el.contains(el.ownerDocument.elementFromPoint(x,y))}; })()`);
    assert.ok(coords?.hit, `Visible click target ${selector}: ${JSON.stringify(coords)}`);
    const {x, y} = coords;
    await cdp('Input.dispatchMouseEvent', {type:'mousePressed', button:'left', clickCount:1, x, y});
    await cdp('Input.dispatchMouseEvent', {type:'mouseReleased', button:'left', clickCount:1, x, y});
  };
  const act = (action, extra = '') => click(`[data-act="${action}"]${extra}`);
  const appAct = (action, extra = '') => click(`[data-act="${action}"]${extra}`, 'app');
  const jump = route => click(`[data-j="${route}"]`, 'shell');
  const frame = name => until(() => evaluate(`!!${inWallet(`[data-reference="${name}"]`)}`), name);
  const state = name => until(() => wallet(`S.screen === ${JSON.stringify(name)}`), name);
  const appState = name => until(() => app(`window.__state?.().screen === ${JSON.stringify(name)}`), name);
  const assetPageRows = () => wallet(`Array.from(document.querySelectorAll('.wr-wallet-detail .wr-asset-row'), row => row.dataset.token)`);
  const checkWalletAssets = async id => {
    assert.equal(await wallet('S.wSel'), id);
    assert.ok(await wallet(`(() => {
      const content = document.querySelector('.wr-wallet-detail .wr-asset-holdings');
      return content.previousElementSibling.matches('.wr-wallet-summary') &&
        content.firstElementChild.matches('.wr-wallet-settings') &&
        Boolean(content.querySelector('[data-s="wDisc"]')) === ${id !== 'ya'} &&
        !content.querySelector('[data-act="xsOpen"], [data-act="wRecvOf"], [data-act="bills"], [data-msg*="Rename"]') &&
        content.lastElementChild.matches('.wr-asset-wallet') &&
        !/Hidden tokens/i.test(content.textContent) &&
        Array.from(content.querySelectorAll('.wr-asset-pages button'), button => button.offsetWidth >= 44 && button.offsetHeight >= 44).every(Boolean);
    })()`), 'Wallet controls precede the asset list');
    const held = await wallet(`wToks(W_ALL[${JSON.stringify(id)}]).slice(0, 4).map(([token]) => token)`);
    const rows = await assetPageRows();
    assert.equal(rows.length, 4);
    assert.deepEqual(rows.slice(0, held.length), held);
    assert.equal(await wallet(`document.querySelector('[aria-label="Previous asset page"]').disabled`), true);
  };
  const checkWalletAddress = async id => {
    const address = await wallet(`W_ALL[${JSON.stringify(id)}].addr`);
    const short = await wallet(`document.querySelector('.wr-wallet-address .wr-asset-estimate').textContent`);
    assert.ok(short.length < address.length);
    await click('[aria-label="Copy wallet address"]');
    await until(() => wallet(`S.toast?.text === 'Address copied.'`), 'clipboard confirmation');
    assert.equal(await wallet('navigator.clipboard.readText()'), address);
  };
  const screenshot = async file => {
    await until(() => wallet(`!S.toast`), 'toast to clear');
    await pause(100);
    const {data} = await cdp('Page.captureScreenshot', {format:'png'});
    fs.writeFileSync(path.join(temp, file), Buffer.from(data, 'base64'));
  };
  const checkTopUpLayout = async () => {
    const layout = await wallet(`(() => {
      const choices = document.querySelector('.wr-topup-options');
      const footer = document.querySelector('.wallet-reference > .wr-topup-footer');
      const scroll = document.querySelector('.wallet-reference > .scroll');
      const chips = [...choices.querySelectorAll('button')];
      return {
        title: choices.previousElementSibling.textContent.trim(),
        options: chips.length,
        oneRow: chips.every(chip => chip.offsetTop === chips[0].offsetTop),
        canScroll: choices.scrollWidth > choices.clientWidth && getComputedStyle(choices).overflowX === 'auto',
        hidesScrollbar: getComputedStyle(choices).scrollbarWidth === 'none',
        footerBelowScroll: scroll.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top,
      };
    })()`);
    assert.deepEqual(layout, {title:'Which money?', options:5, oneRow:true, canScroll:true, hidesScrollbar:true, footerBelowScroll:true});
  };
  const checkPlanCard = async tier => {
    const layout = await wallet(`(() => {
      const card = document.querySelector('.wr-plan-car .main');
      const benefits = [...card.querySelectorAll('li')];
      const requirement = card.querySelector('.pq').getBoundingClientRect();
      const cta = card.querySelector('.pb').getBoundingClientRect();
      const bounds = card.getBoundingClientRect();
      return {
        title: card.querySelector('.pn b').textContent,
        benefits: benefits.length,
        benefitsFit: benefits.every(row => row.getBoundingClientRect().bottom <= requirement.top),
        ctaFits: requirement.bottom <= cta.top && cta.bottom <= bounds.bottom,
        priceNoteFits: card.querySelector('.pm').offsetHeight <= 36,
      };
    })()`);
    assert.deepEqual(layout, {title:tier, benefits:4, benefitsFit:true, ctaFits:true, priceNoteFits:true});
  };

  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await cdp('Browser.grantPermissions', {origin:new URL(address).origin, permissions:['clipboardReadWrite', 'clipboardSanitizedWrite']});
  await cdp('Emulation.setDeviceMetricsOverride', {width:799,height:936,deviceScaleFactor:1,mobile:false});
  await cdp('Emulation.setEmulatedMedia', {features:[{name:'prefers-color-scheme', value:'dark'}]});
  await cdp('Page.navigate', {url:address});
  await until(() => evaluate(`!document.getElementById('loading') && !!document.getElementById('w2')?.contentWindow.__state`), 'prototype');
  await jump('home');
  await frame('youlong');
  await act('walletMoneyOpen');
  await frame('allone');
  await act('walletCurrencyOpen', '[data-key="USD"]');
  await frame('currency');
  await act('wOpen', '[data-id="ya"]');
  await frame('youappwallet');
  assert.equal(await wallet('innerWidth'), 390);
  await checkWalletAssets('ya');
  const balanceLayout = () => wallet(`(() => {
    const card = document.querySelector('.wr-wallet-summary');
    const bounds = card.getBoundingClientRect();
    return {paddingTop:getComputedStyle(card).paddingTop, top:bounds.top, height:bounds.height,
      headerInset:card.firstElementChild.getBoundingClientRect().top - bounds.top,
      scrollTop:card.closest('.scroll').scrollTop};
  })()`);
  console.log('Balance layout before Copy', await balanceLayout());
  await checkWalletAddress('ya');
  console.log('Balance layout after Copy', await balanceLayout());
  await screenshot('youapp-wallet-copy-address-390.png');
  assert.equal(await wallet(`document.querySelector('.wr-wallet-main').getAttribute('aria-disabled')`), 'true');
  await act('back');
  await frame('currency');
  await act('back');
  await frame('allone');
  await act('nav', '[data-to="walletConnect"]');
  await frame('connect');
  for (const id of ['mm','okx','cb','imtoken','tp','wc']) {
    await wallet(`wSetWl(['ya',${JSON.stringify(id)}]); render();`);
    await act('wOpen', `[data-id="${id}"]`);
    await frame('externalwallet');
    await checkWalletAssets(id);
    await checkWalletAddress(id);
    if (id === 'mm') await screenshot('metamask-copy-address-390.png');
    await act('back');
    await frame('connect');
  }
  const denyClipboard = `navigator.clipboard.writeText = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'))`;
  await act('wOpen', '[data-id="wc"]');
  await frame('externalwallet');
  await wallet(denyClipboard);
  await click('[aria-label="Copy wallet address"]');
  await until(() => wallet(`S.toast?.kind === 'err' && /couldn.t copy/i.test(S.toast.text)`), 'copy failure feedback');
  assert.deepEqual(errors, []);
  console.log(`PASS full wallet address copied for all seven wallets, including a denied clipboard check. Screenshots ${temp}`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  ws?.close();
  browser?.kill();
  server.close();
});
