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
        Boolean(document.querySelector('.wr-wallet-summary [data-act="ewCryptoRecv"]')) &&
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
  await cdp('Page.navigate', {url:address});
  const ready = () => until(() => evaluate(`!document.getElementById('loading') && !!document.getElementById('w2')?.contentWindow.__state`), 'prototype');
  await ready();
  await appState('welcome');
  assert.equal(await evaluate(`document.querySelector('iframe.on').id`), 'a30');
  await click('[data-s="kyc"][data-v="rejected"]', 'shell');
  assert.equal(await wallet('__state().kyc'), 'rejected');
  await jump('start');
  await appState('splash');
  await appState('welcome');
  let timeOrigin = await evaluate('performance.timeOrigin');
  await cdp('Page.reload');
  await until(() => evaluate(`performance.timeOrigin !== ${timeOrigin}`), 'new document after refresh');
  await ready();
  await appState('welcome');
  assert.equal(await app('__state().kyc'), 'rejected');
  timeOrigin = await evaluate('performance.timeOrigin');
  await click('#resetAll', 'shell');
  await until(() => evaluate(`performance.timeOrigin !== ${timeOrigin}`), 'new document after Reset');
  await ready();
  await appState('welcome');
  assert.equal(await app('__state().kyc'), 'approved');
  assert.equal(await wallet('__state().tier'), 'svip');
  await cdp('Page.navigate', {url:address + '?app=app30&jump=apHistory:empty'});
  await ready();
  await appState('aplist');
  assert.equal(await app('S.apHideHistorySamples'), true);

  await jump('topup');
  await state('walletTopUp');
  await act('back');
  await until(() => evaluate(`document.querySelector('iframe.on').id === 'a30'`), 'Back to App 3.0');
  await appState('discover');
  await jump('gInvite');
  await appState('ginvite');
  await jump('products');
  await appState('chat');
  assert.equal(await app('S.conv'), 'g-products');
  await until(() => app(`(() => {
    const scroll = document.getElementById('chatScroll');
    return scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop < 2;
  })()`), 'initial chat scroll');
  const voice = '[data-act="vPlay"][data-id="yp-voice"]';
  await app(`document.querySelector(${JSON.stringify(voice)}).scrollIntoView({block:'center'})`);
  const top = await app(`document.getElementById('chatScroll').scrollTop`);
  assert.ok(top > 0, 'voice note is viewed below the top of the chat');
  await click(voice, 'app', false);
  await until(() => app(`S.vplay?.p > 0 && !S.vplay.paused`), 'voice playback');
  assert.equal(await app(`document.getElementById('chatScroll').scrollTop`), top);
  await click(voice, 'app', false);
  assert.equal(await app('S.vplay.paused'), true);
  await click(voice, 'app', false);
  await pause(180);
  assert.equal(await app('S.vplay.paused'), false);
  assert.equal(await app(`document.getElementById('chatScroll').scrollTop`), top);
  await app('clearInterval(timers.vp); S.vplay = null;');
  await appAct('chatMenu');
  await appAct('cmVideo');
  await until(() => app(`S.call?.kind === 'video'`), 'group video call');
  await appAct('cxCallEnd');
  assert.equal(await app('Boolean(S.call)'), false);

  await jump('actMine');
  await appState('actmine');
  await jump('actJoinDemo');
  await appState('exp');
  await click('[data-s="wallet"][data-v="off"]', 'shell');
  await jump('apChat');
  await appState('chat');
  const openChatPacketForm = async () => {
    await appAct('cAttach');
    await appAct('apAttach');
    await appAct('apNewCtx');
  };
  await openChatPacketForm();
  await appState('activate');
  assert.match(await app(`document.querySelector('.actcs').textContent`), /Create YouApp wallet/);
  await appAct('back', '[aria-label="Back"]');
  await appState('chat');
  assert.equal(await app('S.conv'), 'c-lara');
  await openChatPacketForm();
  await appState('activate');
  await appAct('actPickGo');
  for (const digit of '123456') await appAct('key2', `[data-k="${digit}"]`);
  await appState('walletActive');
  await appAct('walletDone', '[aria-label="Back"]');
  await appState('apform');
  assert.match(await app(`document.querySelector('.rp20-title').innerText`), /To Lara/);

  await click('[data-s="wallet"][data-v="reconnect"]', 'shell');
  await jump('apChat');
  await appState('chat');
  assert.ok(await app(`!!document.querySelector('.cbar2 [data-act="recStart"]')`));
  assert.equal(await app(`!!document.querySelector('.cbar2 [data-act="apNewCtx"]')`), false);
  const walletStart = await wallet('bal()');
  await appAct('apTap', '[data-tok="apLaraLucky"]');
  await appState('activate');
  assert.equal(await app(`document.querySelector('#phone h1').textContent`), 'Wallet Session Expired');
  await appAct('actPickGo');
  for (const digit of '123456') await appAct('key2', `[data-k="${digit}"]`);
  await appAct('pin7Confirm');
  await appState('aprecv');
  assert.equal(await app('S.apTok'), 'apLaraLucky');
  await appAct('apOpenIt');
  assert.equal(await app(`document.querySelector('[data-act="apOpenIt"]')?.disabled`), true);
  assert.ok(await app(`document.querySelector('.rp20-opened')?.src.endsWith('red-opening.svg')`));
  await app('A.apOpenIt()');
  await until(() => app(`!!document.querySelector('.apreceive-result')`), 'Lara red packet claim');
  const balanceDelta = () => evaluate('YouAppPrototypeWallet.redPacketDelta()');
  const prize = await balanceDelta();
  assert.ok(prize >= 100 && prize <= 1000 && prize % 100 === 0);
  assert.equal(await wallet('bal()'), (Math.round(walletStart * 100) + prize) / 100);
  await until(() => app(`document.querySelector('[data-ap-payout]').textContent === (${prize} / 100).toFixed(2)`), 'final payout after the count-up');
  const messagesBeforeThanks = await app(`C6().convs.find(c => c.id === 'c-lara').msgs.length`);
  await appAct('apThanks');
  await appState('chat');
  assert.match(await app('S.ctext'), /Thank you for the red packet/);
  assert.equal(await app(`C6().convs.find(c => c.id === 'c-lara').msgs.length`), messagesBeforeThanks);
  await jump('apRecv:lucky');
  await appState('aprecv');
  assert.equal(await app(`!!document.querySelector('[data-act="apOpenIt"]')`), false);
  assert.equal(await balanceDelta(), prize);
  await appAct('apReturnGift');
  await appState('apform');
  assert.match(await app(`document.querySelector('.rp20-title').textContent`), /To Lara/);

  await jump('apNew');
  await appState('apform');
  assert.equal(await app('S.apf.type'), 'lucky');
  assert.equal(await app(`document.querySelector('label[for="apAmt"]').textContent`), 'Total');
  assert.match(await app(`document.querySelector('.rp20-wallet').innerText`), /YouWallet · RM[\d,.]+/);
  const connectedWallets = await wallet('scen.wl');
  await wallet("scen.wl = 'ya,mm'");
  await appAct('apChangeWallet');
  assert.match(await app(`document.querySelector('.rp20-wallet-option:disabled').innerText`), /MetaMask[\s\S]*Unavailable for Red Packet/);
  await appAct('apWalletDone', '.rp20-wallet-option');
  assert.equal(await app('S.sheet'), null);
  await wallet(`scen.wl = ${JSON.stringify(connectedWallets ?? 'ya')}`);
  await click('#apAmt', 'app');
  await cdp('Input.insertText', {text:'10'});
  await appAct('apMessage', '[data-v="0"]');
  const themeColors = new Set();
  for (const theme of ['raya', 'deepavali', 'birthday', 'youapp', 'red']) {
    await appAct('apTheme', `[data-v="${theme}"]`);
    await until(() => app(`document.querySelector('.rp20-preview .rp20-packet')?.naturalWidth > 0`), `${theme} envelope artwork`);
    assert.ok(await app(`document.querySelector('.rp20-preview .rp20-packet').src.endsWith('${theme}-packet.svg')`));
    assert.equal(await app(`document.querySelector('[data-act="apTheme"][aria-pressed="true"]').dataset.v`), theme);
    const colors = await app(`(() => {
      const style = selector => getComputedStyle(document.querySelector(selector));
      return [style('.ap-modes [aria-pressed="true"]').backgroundImage,
        style('.rp20-presets [aria-pressed="true"]').backgroundImage,
        style('.rp20-presets [aria-pressed="false"]').backgroundColor,
        style('.ap-modes').backgroundColor, style('[data-act="apNext"]').backgroundImage];
    })()`);
    assert.match(colors[0], /^linear-gradient/);
    assert.equal(colors[0], colors[1]);
    assert.equal(colors[0], colors[4]);
    assert.equal(colors[2], colors[3]);
    themeColors.add(colors[0]);
  }
  assert.equal(themeColors.size, 5);
  for (const mode of ['random', 'equal', 'lucky']) {
    await appAct('apType', `[data-v="${mode}"]`);
    assert.equal(await app(`!!document.getElementById('apCount')`), mode !== 'lucky');
    assert.equal(await app(`document.getElementById('apAmtCurrency').textContent`), 'RM');
  }
  await click('#apAmt', 'app');
  await cdp('Input.insertText', {text:'10'});
  await appAct('apEditMessage');
  await app(`window.qaMessageField = document.getElementById('apMsg'); true`);
  await app(`window.qaMessageField.select()`);
  await cdp('Input.insertText', {text:'See you on Friday!'});
  await app(`window.qaMessageField.setSelectionRange(11, 11); true`);
  await cdp('Input.insertText', {text:'a sunny '});
  const draft = 'See you on a sunny Friday!';
  assert.deepEqual(await app(`(() => {
    const field = document.getElementById('apMsg');
    return [field === window.qaMessageField, field === document.activeElement, field.selectionStart, field.value, document.getElementById('apMsgCount').textContent];
  })()`), [true, true, 19, draft, draft.length + '/50']);
  await appAct('apEditMessage');
  assert.equal(await app(`document.querySelector('.rp20-message-draft').textContent`), draft);
  await appAct('apEditMessage');
  assert.equal(await app(`document.activeElement.value`), draft);
  await cdp('Input.dispatchKeyEvent', {type:'keyDown', key:'Enter', code:'Enter', windowsVirtualKeyCode:13});
  await cdp('Input.dispatchKeyEvent', {type:'keyUp', key:'Enter', code:'Enter', windowsVirtualKeyCode:13});
  assert.equal(await app(`document.activeElement.textContent`), 'Edit message');
  await appAct('apMessage', '[data-v="1"]');
  assert.equal(await app(`document.getElementById('apMsg').value`), '恭喜发财');
  assert.equal(await app(`document.querySelector('[data-act="apMessage"][data-v="1"]').getAttribute('aria-pressed')`), 'true');
  await appAct('apExpiryOptions');
  await appAct('apForever');
  await appAct('apDur', '[data-v="custom"]');
  await click('#apDays', 'app');
  await cdp('Input.insertText', {text:'3'});
  assert.match(await app(`document.querySelector('[data-act="apExpiryOptions"]').innerText`), /after 3 days/);
  await appAct('apExpUnit', '[data-v="hours"]');
  await click('#apDays', 'app');
  await cdp('Input.insertText', {text:'2'});
  assert.match(await app(`document.querySelector('[data-act="apExpiryOptions"]').innerText`), /after 2 hours/);
  await appAct('apNext');
  assert.match(await app(`document.querySelector('.ap2-pin').innerText`), /2 hours/);
  for (const digit of '123456') await appAct('key2', `[data-k="${digit}"]`);
  await appAct('pin7Confirm');
  await appState('apdone');
  assert.equal(await balanceDelta(), prize - 1000);
  await appAct('apDetail');
  await appState('apdet');
  await appAct('apCancelAsk');
  await appAct('apCancelOk');
  assert.equal(await balanceDelta(), prize);
  assert.equal(await wallet('bal()'), (Math.round(walletStart * 100) + prize) / 100);

  await jump('products');
  await appState('chat');
  assert.equal(await app(`!!document.querySelector('.cbar2 [data-act="apNewCtx"]')`), false);
  await appAct('cAttach');
  await appAct('apAttach');
  await appAct('apNewCtx');
  await appState('apform');
  assert.equal(await app(`document.querySelector('.rp20-title b').textContent`), 'Create packet');
  assert.equal(await app(`document.querySelector('.rp20-recipient-name').textContent`), 'To YouApp Products');
  assert.equal(await app(`document.querySelector('.rp20-recipient-count').textContent`), '3 recipients');
  assert.equal(await app(`!!document.getElementById('apCount')`), false);
  await appAct('apTheme', '[data-v="raya"]');
  await appAct('apType', '[data-v="random"]');
  assert.equal(await app(`document.getElementById('apCount').value`), '3');
  assert.equal(await app(`document.querySelector('[data-act="apStep"][data-d="1"]').getAttribute('aria-disabled')`), 'true');
  await click('#apCount', 'app');
  await app(`document.getElementById('apCount').select()`);
  await cdp('Input.insertText', {text:'4'});
  assert.match(await app(`document.getElementById('apCountError').innerText`), /3 people/);
  await click('#apCount', 'app');
  await app(`document.getElementById('apCount').select()`);
  await cdp('Input.insertText', {text:'3'});
  await appAct('apType', '[data-v="equal"]');
  await appAct('apStep', '[data-d="-1"]');
  assert.equal(await app(`document.querySelector('.rp20-recipient-count').textContent`), '2 recipients');
  await click('#apAmt', 'app');
  await cdp('Input.insertText', {text:'4'});
  assert.match(await app(`document.querySelector('[data-act="apNext"]').innerText`), /8\.00 MYRT/);
  await appAct('apNext');
  assert.match(await app(`document.querySelector('.ap2-pin').innerText`), /To YouApp Products[\s\S]*Equal split · 2 people/);
  for (const digit of '123456') await appAct('key2', `[data-k="${digit}"]`);
  await appAct('pin7Confirm');
  await appState('apsending');
  await appState('chat');
  assert.equal(await app('S.conv'), 'g-products');
  assert.equal(await app(`document.querySelectorAll('.rp-chat-card[data-tok="' + S.apTok + '"]').length`), 1);
  assert.ok(await app(`document.querySelector('.rp-chat-card[data-tok="' + S.apTok + '"] img')?.src.endsWith('raya-packet.svg')`));
  assert.equal(await balanceDelta(), prize - 800);
  await jump('apHistory');
  await appState('aplist');
  await appAct('apDetail', '[data-tok="apMineRandomFull"]');
  assert.ok(await app(`!!document.querySelector('.rp20-winner img[alt="Luckiest"]')`));
  for (const [scenario, title] of [['notfound', 'not found'], ['ended', 'expired'], ['full', 'fully claimed']]) {
    const route = 'apRecv:' + scenario;
    await cdp('Page.navigate', {url:address + '?app=app30&jump=' + route});
    await until(() => evaluate(`new URLSearchParams(location.search).get('jump') === ${JSON.stringify(route)}`), route);
    await ready();
    await appState('aprecv');
    assert.match(await app(`document.querySelector('.rp20-state-card h2').textContent`), new RegExp(title));
    assert.equal(await balanceDelta(), 0);
  }
  console.log('PASS startup, routing, chat and Activity checks, five Red Packet themes, custom expiry, group delivery, claim and refund');

  await cdp('Page.navigate', {url:address});
  await ready();
  await appState('welcome');
  await click('[data-s="kyc"][data-v="approved"]', 'shell');
  await click('[data-s="wallet"][data-v="active"]', 'shell');
  await click('[data-s="tier"][data-v="free"]', 'shell');
  await click('[data-j="home"]', 'shell');
  await frame('youlong');
  assert.match(await wallet(`document.getElementById('phone').innerText`), /YouWallet Balance/);
  assert.equal(await wallet(`getComputedStyle(document.querySelector('.wr-currency-stack')).flexDirection`), 'row');
  assert.equal(await wallet(`getComputedStyle(document.querySelector('.ist b')).color`), 'rgb(30, 16, 80)');
  const profileLayout = await wallet(`(() => {
    const card = document.querySelector('.prof');
    const interests = card.nextElementSibling;
    return {
      belowCard: interests?.matches('.pas') && !interests.nextElementSibling,
      interests: [...interests?.querySelectorAll('span') || []].map(chip => chip.textContent),
      source: window.parent.document.getElementById('a30').contentWindow.__walletProfile().interests,
      hasBadge: !!card.querySelector('.wr-profile-name + svg'),
      hasPaidCheck: !!document.querySelector('.tx .rt small svg'),
    };
  })()`);
  assert.ok(profileLayout.belowCard && profileLayout.hasBadge && profileLayout.hasPaidCheck);
  assert.ok(profileLayout.interests.length);
  assert.deepEqual(profileLayout.interests, profileLayout.source);
  await screenshot('you-page.png');
  await act('balEye');
  assert.equal(await wallet(`document.querySelector('.bal .amt b').textContent`), '••••');
  await act('balEye');
  await click('.wr-booking [data-act="walletBooking"]');
  await state('walletBooking');
  await act('back');
  await act('walletMoneyOpen');
  await frame('allone');
  assert.equal(await wallet(`document.querySelector('.wr-money .adrow')`), null);
  await click('.wr-money .sec [data-act="walletScanHistory"]');
  await state('scanHistory');
  await act('back');
  await frame('allone');
  await act('walletCurrencyOpen', '[data-key="USD"]');
  await state('walletCurrency');
  await frame('currency');
  assert.equal(await wallet(`document.querySelector('.wr-asset-total').textContent`), 'US$82.00');
  assert.equal(await wallet(`document.querySelector('.wr-asset-wallet h2').textContent`), 'YouApp Wallet');
  assert.equal(await wallet(`document.querySelector('.wr-asset-row[data-token="USDT"] .wr-asset-value b').textContent`), '57.00 USDT');
  await click('.wr-asset-wallet header button[data-id="ya"]');
  await frame('youappwallet');
  assert.equal(await wallet(`document.querySelector('.wr-wallet-detail .ttl').textContent`), 'YouApp Wallet');
  assert.match(await wallet(`document.querySelector('.wr-wallet-summary .wr-asset-summary-top > span').textContent`), /Main/);
  assert.equal(await wallet(`document.querySelector('.wr-wallet-summary .wr-asset-total').textContent`), await wallet(`RM(wRM(W_ALL.ya))`));
  await checkWalletAssets('ya');
  assert.equal(await wallet(`document.querySelector('.wr-wallet-main').getAttribute('aria-disabled')`), 'true');
  await checkWalletAddress('ya');
  await screenshot('youapp-wallet-details.png');
  const ewKeep = await wallet(`JSON.stringify({screen:S.screen, hist:S.hist, ew:scen.ew||'off', bal:scen.bal, cents:S.scanTopUpCents||0})`);
  assert.equal(await wallet(`(scen.ew='off', scen.bal='enough', S.sheet=null, S.hist=['home'], S.screen='home', render(), A.bills(), S.sheet)`), 'ewGate');
  assert.equal(await wallet(`(A.ewStart(), S.screen)`), 'ewConfirm');
  await wallet(`(A.ewPay(), 1)`);
  await until(() => wallet(`S.screen === 'ewDone'`), 'eWallet activated');
  assert.equal(await wallet('scen.ew'), 'on');
  assert.ok(await wallet(`walletScanHistory().some(t => t.id === 'ew-fee' && t.v === -50)`), 'Opening fee in history');
  assert.equal(await wallet(`(A.ewResume(), S.screen)`), 'bills');
  await wallet(`(() => { const k = ${ewKeep}; scen.ew = k.ew; scen.bal = k.bal; S.scanTopUpCents = k.cents; S.ewFeeAt = null; S.ewTx = []; S.sheet = null; S.hist = k.hist; S.screen = k.screen; saveScen(); render(); return 1; })()`);
  await act('back');
  await act('back');
  await act('nav', '[data-to="walletConnect"]');
  await frame('connect');
  await act('walletConnectProvider', '[data-id="mm"]');
  await state('mwWait');
  await act('mwApprove');
  await state('wVerify');
  await act('wSign');
  await act('mwApprove');
  await state('wConnected');
  await act('wConnDone');
  await frame('connect');
  await act('back');
  await frame('all');
  assert.deepEqual(await wallet(`(() => {
    const rail = document.querySelector('.wx');
    const topUp = document.querySelector('.tx[data-id="t1"]');
    return {
      scrolls: getComputedStyle(rail).overflowX === 'auto',
      hidesScrollbar: getComputedStyle(rail).scrollbarWidth === 'none',
      topUpIcon: !!topUp.querySelector('.wr-transaction-icon svg'),
      topUpCredit: topUp.querySelector('.rt b').classList.contains('pos'),
      nextTransaction: topUp.nextElementSibling?.dataset.id,
      hasBanner: !!document.querySelector('.wr-money .adrow'),
    };
  })()`), {scrolls:true, hidesScrollbar:true, topUpIcon:true, topUpCredit:true, nextTransaction:'t2', hasBanner:false});
  await act('walletMoneyFilter', '[data-id="mm"]');
  assert.equal(await wallet(`document.querySelector('.tot2 small').textContent`), 'MetaMask balance');
  assert.match(await wallet(`document.querySelector('.lst').textContent`), /US dollar/);
  assert.match(await wallet(`document.querySelector('.wr-money .wr-empty').textContent`), /No transactions in this wallet yet/);
  assert.equal(await wallet(`document.querySelector('.wr-money .adrow')`), null);
  await screenshot('my-money.png');
  await act('walletCurrencyOpen', '[data-key="USD"]');
  await frame('currency');
  await click('.wr-asset-wallet header button[data-id="mm"]');
  await frame('externalwallet');
  await checkWalletAssets('mm');
  await checkWalletAddress('mm');
  await screenshot('metamask-wallet-details.png');
  const discoveredAssets = await assetPageRows();
  const nextAssetPage = '[aria-label="Next asset page"]';
  const previousAssetPage = '[aria-label="Previous asset page"]';
  await until(async () => {
    if (await wallet(`document.querySelector(${JSON.stringify(nextAssetPage)}).disabled`)) return true;
    await click(nextAssetPage);
    discoveredAssets.push(...await assetPageRows());
    return false;
  }, 'last wallet asset page');
  const registry = await wallet('Object.keys(seraTokenCurrencies)');
  assert.equal(registry.length, 40);
  assert.deepEqual(discoveredAssets, [...new Set(['USDC', 'USDT', 'PYUSD', 'MYRT', ...registry])]);
  assert.match(await wallet(`document.querySelector('#wr-asset-page').textContent`), /^Page (\d+) of \1$/);
  await click(previousAssetPage);
  assert.equal((await assetPageRows()).length, 4);
  assert.equal(await wallet(`document.querySelector('[data-reference="externalwallet"]').querySelector('[data-act="xsOpen"], [data-act="wRecvOf"]')`), null);
  await act('walletMainToggle');
  assert.equal(await wallet('wMain().id'), 'mm');
  assert.equal(await wallet(`document.querySelector('[role="switch"]').getAttribute('aria-checked')`), 'true');
  await act('walletDetailSheet', '[data-s="wDisc"]');
  await act('walletSheetClose');
  assert.equal(await wallet(`wIds().includes('mm')`), true);
  await act('walletMainToggle');
  assert.equal(await wallet('wMain().id'), 'ya');
  await act('back');
  await frame('currency');
  await act('back');
  await frame('all');
  await act('back');
  await act('nav', '[data-to="scan"]');
  await frame('scan');
  await act('scanFlash');
  await act('sheet', '[data-s="scanSim"]');
  await act('scanAs', '[data-k="duit"]');
  await frame('pay');
  const initial = await wallet('bal()');
  await act('kp', '[data-k="2"]');
  await act('kp', '[data-k="5"]');
  assert.match(await wallet(`document.querySelector('.paybtn').textContent`), /26\.50/);
  await act('walletPaymentGo');
  await frame('celeb');
  await act('walletScanReceipt');
  await frame('done');
  assert.equal(await wallet('bal()'), initial - 26.5);
  await act('walletScanClose', '[aria-label="Back"]');
  await frame('youlong');
  await act('nav', '[data-to="scan"]');
  await act('sheet', '[data-s="scanSim"]');
  await act('scanAs', '[data-k="duitFixed"]');
  await frame('pay');
  assert.equal(await wallet(`document.querySelectorAll('.keys').length`), 0);
  await act('walletPaymentPick');
  await frame('coins');
  assert.ok(await wallet(`(() => {
    const view = document.querySelector('.wallet-reference > .scroll').getBoundingClientRect();
    const sheet = document.querySelector('.wr-sheet-screen .sheet').getBoundingClientRect();
    return Math.abs(sheet.bottom - view.bottom) < 1;
  })()`), 'Pay with sheet sits at the bottom of the phone');
  assert.match(await wallet(`document.querySelector('.wr-sheet-screen .sheet').innerText`), /Top up to use/i);
  await act('walletReferenceTopUp', '[data-key="JPY"]');
  await frame('topup');
  assert.equal(await wallet(`document.querySelector('.wr-topup-options [aria-pressed="true"]').dataset.key`), 'JPY');
  await act('back');
  await frame('coins');
  await act('walletPaymentWallet', '[data-id="mm"]');
  await frame('coinsmm');
  await act('walletPaymentSelect', '[data-key="USD"]');
  await frame('payu');
  await act('walletPaymentGo');
  await frame('approve');
  await wallet(`S.walletQuote.expires = Date.now() - 10`);
  await act('walletApprovalPrompt');
  await act('walletQuoteRefresh');
  await act('walletApprovalPrompt');
  await act('walletApprovalConfirm');
  await frame('celeb');
  await act('walletScanReceipt');
  await frame('done');
  assert.match(await wallet(`document.querySelector('.rcp').textContent`), /MetaMask/);
  assert.equal(await wallet('bal()'), initial - 26.5);
  await act('walletScanClose', '[aria-label="Back"]');
  await act('walletReferenceTopUp');
  await frame('topup');
  await checkTopUpLayout();
  await act('walletTopUpMethod', '[data-method="stable"]');
  await frame('add');
  await act('walletTopUpToken', '[data-key="USDT"]');
  assert.match(await wallet(`document.querySelector('.qrc small').textContent`), /USDT/);
  await act('back');
  await act('walletTopUpMethod', '[data-method="card"]');
  await frame('topcard');
  for (const key of '100') await act('walletTopUpKey', `[data-k="${key}"]`);
  assert.match(await wallet(`document.querySelector('.paybtn').textContent`), /102\.00/);
  await act('sheet', '[data-s="walletTopUpConfirm"]');
  await act('walletTopUpConfirm');
  await state('walletTopUpDone');
  assert.equal(await wallet('bal()'), initial + 73.5);
  await act('walletReferenceTopUpDone');
  await frame('youlong');
  await act('walletReferencePlan', '[data-key="svip"]');
  await frame('plans');
  await checkPlanCard('SVIP');
  await click('.seg2 [data-key="free"]');
  await frame('plansfree');
  await checkPlanCard('Free');
  await click('.wr-plan-dots [data-key="vip"]');
  await frame('plansvip');
  await checkPlanCard('VIP');
  await act('sheet', '[data-s="walletVipPeriod"]');
  await act('walletVipPeriod', '[data-period="y"]');
  await state('checkout');
  await act('back');
  await frame('plansvip');
  await act('back');
  await act('rewards');
  await frame('rew1');
  await act('walletRewardFilter', '[data-key="referrals"]');
  const referralNames = await wallet(`Array.from(document.querySelectorAll('[data-reference="rew1"] .tx b:first-child')).map(el => el.textContent).filter(name => name.startsWith('Referral · '))`);
  assert.ok(referralNames.length && referralNames.every(name => /^Referral · .•••$/u.test(name)));
  await act('walletRewardFilter', '[data-key="cashback"]');
  assert.match(await wallet(`document.querySelector('[data-reference="rew1"]').innerText`), /Cashback ·/);
  await act('nav', '[data-to="invite"]');
  await frame('refer');
  await act('walletReferralFilter', '[data-key="unverified"]');
  await act('back');
  await act('back');
  await act('nav', '[data-to="settings"]');
  await frame('settingslong');
  await act('walletPreference', '[data-key="language"]');
  await act('walletPreferenceSet', '[data-value="Bahasa Melayu"]');
  assert.equal(await wallet(`S.walletPreferences.language`), 'Bahasa Melayu');
  await act('walletSettingInfo', '[data-key="travel"]');
  await act('walletTravelWaitlist');
  await act('walletScanHistory');
  await state('scanHistory');
  await act('txOpen', '[data-id^="scan-topup-"]');
  await state('walletTopUpReceipt');
  await act('back');
  await act('back');
  await frame('settingslong');
  await screenshot('settings.png');
  await act('back');
  await frame('youlong');
  const selectAmount = async () => {
    await act('nav', '[data-to="scan"]');
    await act('sheet', '[data-s="scanSim"]');
    await act('scanAs', '[data-k="duit"]');
    for (const key of '25') await act('kp', `[data-k="${key}"]`);
  };
  const beforeRetry = await wallet('bal()');
  await wallet(`scen.scanResult = 'fail'`);
  await selectAmount();
  await act('walletPaymentGo');
  await state('scanReceipt');
  assert.equal(await wallet(`walletScanRecord().status`), 'Failed');
  assert.equal(await wallet('bal()'), beforeRetry);
  await wallet(`scen.scanResult = 'pending'`);
  await act('walletScanRetry');
  await act('walletPaymentGo');
  await state('scanReceipt');
  assert.equal(await wallet(`walletScanRecord().status`), 'Pending');
  assert.equal(await wallet('bal()'), beforeRetry - 26.5);
  await act('walletScanCheck');
  await frame('done');
  assert.equal(await wallet('bal()'), beforeRetry - 26.5);
  await act('walletScanClose', '[aria-label="Back"]');
  await frame('youlong');
  await act('walletMoneyOpen');
  await act('nav', '[data-to="walletConnect"]');
  await frame('connect');
  await act('walletConnectProvider', '[data-id="okx"]');
  await act('mwApprove');
  assert.match(await wallet(`document.getElementById('phone').innerText`), /OKX Wallet/);
  await act('wSign');
  await act('mwApprove');
  await act('wConnDone');
  await frame('connect');
  assert.equal(await wallet(`wIds().includes('okx')`), true);
  await screenshot('connect-wallet.png');
  await act('back');
  await act('back');
  await frame('youlong');
  await click('[data-s="tier"][data-v="vip"]', 'shell');
  await act('walletMoneyOpen');
  await frame('all');
  assert.equal(await wallet(`document.querySelector('.wr-money .adrow')`), null);
  await screenshot('my-money-recent.png');
  await act('walletCurrencyOpen', '[data-key="USD"]');
  await frame('currency');
  assert.deepEqual(await wallet(`(() => {
    const cards = [...document.querySelectorAll('.wr-asset-wallet')];
    return cards.map(card => {
      const buttons = card.querySelectorAll('button');
      const button = buttons[0];
      return {
        id: button.dataset.id,
        headerAction: buttons.length === 1 && button.parentElement.matches('header') && !!button.querySelector('strong + .ico svg'),
        targetSize: button.offsetWidth >= 44 && button.offsetHeight >= 44,
        rowsReadOnly: !card.querySelector('ul [data-act], ul .wr-asset-row > .ico'),
      };
    });
  })()`), ['ya', 'mm', 'okx'].map(id => ({id, headerAction:true, targetSize:true, rowsReadOnly:true})));
  await screenshot('wallet-us-dollar.png');
  await click('.wr-asset-wallet header button[data-id="okx"]');
  await frame('externalwallet');
  await checkWalletAssets('okx');
  await checkWalletAddress('okx');
  await screenshot('okx-wallet-details.png');
  await act('walletMainToggle');
  await act('back');
  await frame('currency');
  await click('.wr-asset-wallet header button[data-id="ya"]');
  await frame('youappwallet');
  await act('walletMainToggle');
  assert.equal(await wallet('wMain().id'), 'ya');
  await act('back');
  await frame('currency');
  await act('back');
  await act('back');
  await frame('youlong');
  const walletScenario = value => click(`[data-s="wallet"][data-v="${value}"]`, 'shell');
  const walletInventory = () => wallet('[wIds(), wMain().id, wList().map(wRM)]');
  const checkReconnectWallet = async name => {
    assert.deepEqual(await app(`Array.from(document.querySelectorAll('.actc .actc-h b'), title => title.textContent)`), [name]);
    assert.equal(await app(`document.querySelector('.actc .okchip').textContent`), 'Main wallet');
    assert.equal(await app(`document.querySelector('button.actc, [data-act="actPick"]')`), null);
  };
  const linkedWallets = await walletInventory();
  await walletScenario('off');
  await jump('home');
  await act('kycStart');
  await appState('activate');
  assert.match(await app(`document.querySelector('.actcs').textContent`), /Create YouApp wallet/);
  await walletScenario('reconnect');
  assert.equal(await app('__state().kyc'), 'approved');
  assert.equal(await app(`document.querySelector('h1').textContent`), 'Wallet Session Expired');
  await checkReconnectWallet('YouApp Wallet');
  await screenshot('wallet-reconnect.png');
  await appAct('actPickGo');
  await appAct('closeOtp2');
  assert.equal(await app('__state().wallet'), 'reconnect');
  const confirmReconnectPin = async () => {
    await appAct('actPickGo');
    for (const digit of '123456') await appAct('key2', `[data-k="${digit}"]`);
    await appAct('pin7Confirm');
    await frame('youlong');
    assert.equal(await app('__state().wallet'), 'active');
  };
  await confirmReconnectPin();
  assert.deepEqual(await walletInventory(), linkedWallets);

  await act('walletMoneyOpen');
  await frame('all');
  await act('walletCurrencyOpen', '[data-key="USD"]');
  await frame('currency');
  await click('.wr-asset-wallet header button[data-id="okx"]');
  await frame('externalwallet');
  await act('walletMainToggle');
  assert.equal(await wallet(`JSON.parse(localStorage.getItem('w2scen')).mainW`), 'okx');
  const externalMainInventory = await walletInventory();
  await walletScenario('reconnect');
  await jump('home');
  assert.match(await wallet(`document.querySelector('.yl-ban').textContent`), /Reconnect your wallet/);
  await act('kycStart');
  await appState('activate');
  await checkReconnectWallet('OKX Wallet');
  await screenshot('wallet-reconnect-okx.png');
  await appAct('actPickGo');
  await state('mwWait');
  assert.equal(await wallet('S.mwWait.app'), 'OKX Wallet');
  await act('mwCancel');
  await state('mwCancelled');
  assert.equal(await app('__state().wallet'), 'reconnect');
  await act('mwClose');
  await until(() => evaluate(`document.querySelector('iframe.on').id === 'a30'`), 'return to reconnect');
  await appAct('actPickGo');
  await state('mwWait');
  await act('mwCancel');
  await state('mwCancelled');
  await act('mwRetry');
  await state('mwWait');
  await act('mwApprove');
  await frame('youlong');
  assert.equal(await app('__state().wallet'), 'active');
  assert.deepEqual(await walletInventory(), externalMainInventory);
  await act('walletMoneyOpen');
  await frame('all');
  await act('walletCurrencyOpen', '[data-key="USD"]');
  await frame('currency');
  await click('.wr-asset-wallet header button[data-id="ya"]');
  await frame('youappwallet');
  await act('walletMainToggle');
  await act('back');
  await frame('currency');
  await act('back');
  await frame('all');
  await act('back');
  await frame('youlong');
  assert.deepEqual(errors, []);
  console.log(`PASS desktop wallet flows. Screenshots ${temp}`);

  await cdp('Emulation.setDeviceMetricsOverride', {width:375, height:780, deviceScaleFactor:1, mobile:true});
  await frame('youlong');
  await screenshot('mobile.png');
  await act('walletReferenceReferralQr');
  await frame('refer');
  await act('back');
  await frame('youlong');
  await act('walletMoneyOpen');
  await frame('all');
  await act('walletCurrencyOpen', '[data-key="USD"]');
  await frame('currency');
  await click('.wr-asset-wallet header button[data-id="ya"]');
  await frame('youappwallet');
  assert.ok(await wallet(`(() => {
    const screen = document.querySelector('.wr-wallet-detail');
    const buttons = [...screen.querySelectorAll('.wr-wallet-settings button, .wr-wallet-address button')];
    const contentBottom = screen.parentElement.getBoundingClientRect().bottom;
    return screen.scrollWidth <= screen.clientWidth && buttons.length === 2 &&
      buttons.every(button => button.offsetHeight >= 44 && button.offsetWidth >= button.scrollWidth &&
        button.getBoundingClientRect().bottom <= contentBottom);
  })()`), 'YouApp Wallet settings and address copy fit at 375px');
  await screenshot('youapp-wallet-details-375.png');
  await act('back');
  await frame('currency');
  await click('.wr-asset-wallet header button[data-id="mm"]');
  await frame('externalwallet');
  await checkWalletAssets('mm');
  await click(nextAssetPage);
  assert.match(await wallet(`document.querySelector('#wr-asset-page').textContent`), /^Page 2 of /);
  await act('back');
  await frame('currency');
  await act('back');
  await frame('all');
  await act('walletReferenceTopUp');
  await frame('topup');
  await checkTopUpLayout();
  await screenshot('mobile-top-up.png');
  const {x, y, distance} = await evaluate(`(() => {
    const iframe = document.querySelector('#w2');
    const row = iframe.contentDocument.querySelector('.wr-topup-options');
    const bounds = row.getBoundingClientRect();
    const host = iframe.getBoundingClientRect();
    return {x:host.left + bounds.right - 18, y:host.top + bounds.top + bounds.height / 2, distance:bounds.width - 40};
  })()`);
  await cdp('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x,y}]});
  for (let step = 1; step <= 6; step++) {
    await cdp('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x:x - distance * step / 6,y}]});
    await pause(20);
  }
  await cdp('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
  await until(() => wallet(`(() => {
    const row = document.querySelector('.wr-topup-options');
    const pound = row.querySelector('[data-key="GBP"]');
    return row.scrollLeft > 0 && pound.getBoundingClientRect().right <= row.getBoundingClientRect().right;
  })()`), 'swipe to British pound');
  await act('walletTopUpCurrency', '[data-key="GBP"]');
  assert.ok(await wallet(`document.querySelector('.wr-topup-options').scrollLeft > 0`), 'currency selection keeps swipe position');
  await act('walletTopUpMethod', '[data-method="card"]');
  await frame('topcard');
  await act('walletTopUpKey', '[data-k="5"]');
  assert.match(await wallet(`document.querySelector('.tcs').textContent`), /£5\.00/);
  assert.equal(await evaluate(`getComputedStyle(document.getElementById('panel')).visibility`), 'hidden');
  await click('#fab', 'shell');
  await until(() => evaluate(`document.getElementById('panel').classList.contains('open')`), 'prototype controls');
  await pause(275);
  await click('[data-j="settings"]', 'shell');
  await frame('settingslong');
  console.log('PASS mobile 375px click targets, top up currency, and prototype controls');

  await click('#fab', 'shell');
  await until(() => evaluate(`(() => {
    const panel = document.getElementById('panel');
    return panel.classList.contains('open') && panel.getBoundingClientRect().bottom <= innerHeight + 1;
  })()`), 'prototype controls visible');
  await walletScenario('reconnect');
  await appState('activate');
  await checkReconnectWallet('YouApp Wallet');
  assert.ok(await app(`(() => {
    const button = document.querySelector('[data-act="actPickGo"]');
    return button.offsetHeight >= 44 && button.getBoundingClientRect().bottom <= innerHeight;
  })()`), 'Reconnect Wallet action fits at 375px');
  await screenshot('wallet-reconnect-375.png');
  await confirmReconnectPin();
  console.log('PASS embedded and external wallet reconnection, cancel and retry, desktop and 375px');

  for (const width of [390, 375, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', {width, height:844, deviceScaleFactor:1, mobile:true});
    await cdp('Page.navigate', {url:address + '?app=app30&jump=apNew'});
    await ready();
    await appState('apform');
    await until(() => app(`[...document.querySelectorAll('.rp20-fields img')].every(img => img.naturalWidth > 0)`), 'Red Packet theme assets');
    assert.ok(await app(`(() => {
      const form = document.getElementById('apScroll');
      const footer = document.querySelector('.rp20-footer');
      const top = [...form.querySelectorAll('.ap-modes button')].map(button => button.getBoundingClientRect().top);
      const expiry = form.querySelector('[data-act="apExpiryOptions"]');
      const [clock, copy, arrow] = [...expiry.children].map(element => element.getBoundingClientRect());
      const button = expiry.getBoundingClientRect();
      return form.scrollWidth <= form.clientWidth && footer.getBoundingClientRect().bottom <= innerHeight + 1 && new Set(top).size === 1
        && clock.left - button.left === 12 && arrow.width === 14 && copy.height <= 36
        && getComputedStyle(form.querySelector('.rp20-packet')).animationName === 'rp20Wobble';
    })()`), `Red Packet fits ${width}px`);
    await screenshot(`red-packet-create-${width}.png`);
    await cdp('Emulation.setEmulatedMedia', {features:[{name:'prefers-color-scheme', value:'dark'}]});
    await appAct('apEditMessage');
    await cdp('Input.insertText', {text:'0123456789'.repeat(6)});
    assert.ok(await app(`(() => {
      const editor = document.getElementById('apMessageEditor');
      const field = document.getElementById('apMsg');
      const form = document.getElementById('apScroll');
      const section = editor.closest('.rp20-message').getBoundingClientRect();
      return section.bottom <= form.getBoundingClientRect().bottom + 1
        && field.value.length === 50 && document.getElementById('apMsgCount').textContent === '50/50'
        && getComputedStyle(editor).backgroundColor === 'rgb(255, 255, 255)'
        && getComputedStyle(editor).colorScheme === 'light'
        && getComputedStyle(editor).boxShadow !== 'none'
        && getComputedStyle(field).backgroundColor === 'rgba(0, 0, 0, 0)'
        && getComputedStyle(field).borderTopWidth === '0px'
        && form.scrollWidth === form.clientWidth;
    })()`), `Red Packet message editor fits ${width}px with dark appearance and a full message`);
    await screenshot(`red-packet-message-${width}.png`);
    await cdp('Emulation.setEmulatedMedia', {features:[]});
  }
  await cdp('Emulation.setDeviceMetricsOverride', {width:390, height:844, deviceScaleFactor:1, mobile:true});
  await cdp('Page.navigate', {url:address + '?app=app30&jump=apRecv:ready'});
  await ready();
  await appState('aprecv');
  await until(() => app(`document.querySelector('.rp20-scene')?.naturalWidth > 0`), 'unopened Red Packet artwork');
  assert.ok(await app(`Math.abs(document.querySelector('.rp20-receive').getBoundingClientRect().bottom - innerHeight) < 2`));
  await screenshot('red-packet-unopened-390.png');
  await cdp('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await appAct('apOpenIt');
  await until(() => app(`!!document.querySelector('[data-ap-payout]')`), 'Red Packet with reduced motion');
  assert.equal(await app(`getComputedStyle(document.querySelector('.rp20-result')).animationName`), 'none');
  await screenshot('red-packet-opened-390.png');
  await cdp('Emulation.setEmulatedMedia', {features:[]});
  console.log('PASS 390, 375 and 320px Red Packet layout and reduced-motion claim');

  await cdp('Page.navigate', {url:address + 'prototype/forms/index.html'});
  await until(() => evaluate(`document.readyState === 'complete' && !!document.querySelector('#tabs [data-f="merchant"]')`), 'registration forms');
  await click('#tabs [data-f="merchant"]', 'shell');
  assert.ok(await evaluate(`document.getElementById('mMode').getBoundingClientRect().height > 0`));
  await click('#tabs [data-f="elite"]', 'shell');
  assert.ok(await evaluate(`document.getElementById('e2').classList.contains('hide')`));
  console.log('PASS standalone Elite and Merchant registration');

  await cdp('Emulation.clearDeviceMetricsOverride');
  await cdp('Page.navigate', {url:address + '?app=app30&jump=gate'});
  await ready();
  await appState('gate');
  assert.equal(await app('__state().kyc'), 'none');
  assert.match(await app(`document.querySelector('.wv-table').innerText`), /Now\s+Verified/);
  await appAct('kycStart');
  assert.ok(await app(`S.screen === 'phone' || S.sheet === 'prepare'`));

  await jump('discover');
  await appState('discover');
  assert.deepEqual(JSON.parse(await app(`JSON.stringify([...document.querySelectorAll('.appbar .htabs button')].map(b => b.textContent))`)), ['Hosts', 'Activities']);
  assert.equal(await app(`!!document.querySelector('.seg [data-act="seg"]')`), false);
  await appAct('browseTab', '[data-k="activities"]');
  assert.equal(await app('S.seg'), 'activities');
  await until(() => app(`!!document.querySelector('[data-act="openExp"]')`), 'Activity card');
  assert.match(await app(`document.querySelector('[data-act="openExp"]').innerText`), /Free/);
  assert.equal(await app(`document.querySelector('.act-fab')?.textContent.trim()`), 'Manage Activity');
  await appAct('actManage');
  await appState('actmine');
  assert.equal(await app(`document.querySelector('.act-tabs [aria-selected="true"]').textContent`), 'My Event');
  await appAct('back');
  await appState('discover');
  await appAct('browseTab', '[data-k="locals"]');
  assert.equal(await app(`!!document.querySelector('.act-fab')`), false);
  await appAct('browseTab', '[data-k="activities"]');
  await app(`A.startCx()`);
  await appState('actmine');
  await appAct('back');
  await appState('discover');
  assert.equal(await app(`[...document.querySelectorAll('#phone *')].some(e => !e.children.length && /\\bExperiences?\\b/.test(e.textContent) && !/life like a local/.test(e.textContent))`), false);
  await appAct('openExp');
  await appState('exp');
  await appAct('back');
  await appState('discover');
  assert.equal(await app(`!!document.querySelector('.appbar [data-act="menu"]')`), false);
  await appAct('tpInbox');
  await appState('chats');
  await appAct('tpInboxBack');
  await appState('discover');
  await appAct('browseTab', '[data-k="locals"]');
  assert.equal(await app('S.seg'), 'locals');

  await jump('signup');
  await state('signup');
  await act('socLogin', '[data-k="Google"]');
  await state('obName');
  await click('#obName');
  await cdp('Input.insertText', {text:'Test User'});
  await act('obNameGo');
  await state('obDob');
  await act('obSkip');
  await state('obGender');
  await act('obSkip');
  await state('obRef');
  await until(() => wallet(`performance.getEntriesByName(new URL(document.querySelector('.ob-ref-hero img').getAttribute('src'), location.href).href).some(entry => entry.decodedBodySize > 0)`), 'referral onboarding artwork');
  await click('#obRef');
  await cdp('Input.insertText', {text:'SCAR88'});
  assert.match(await wallet(`document.querySelector('.ob-ref-legacy').textContent`), /referral code/);
  await wallet(`document.querySelector('#obRef').select()`);
  await cdp('Input.insertText', {text:'@mei.ling'});
  await act('obRefSelect', '[data-id="mei-ling"]');
  assert.equal(await wallet(`document.querySelector('.ob-ref-value').textContent`), 'mei.ling');
  await act('obRefGo');
  await appState('discover');
  assert.equal(await wallet('scen.refUsername'), '@mei.ling');
  assert.deepEqual(errors, []);
  console.log('PASS Badge Verification deep link, Discover Hosts and Activities tabs and Inbox, and username referral onboarding');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  ws?.close();
  browser?.kill();
  server.close();
});
