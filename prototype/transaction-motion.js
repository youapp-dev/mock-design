/* Present transaction motion without owning balances, settlement, or receipts. */
let transactionPreview;

function runTransactionPreview(label, complete) {
  if (transactionPreview?.session === S) return;
  const pending = {session:S, screen:S.screen, sheet:S.sheet, label};
  transactionPreview = pending;
  render();
  setTimeout(() => {
    if (transactionPreview !== pending) return;
    transactionPreview = undefined;
    if (S !== pending.session || S.screen !== pending.screen || S.sheet !== pending.sheet) return;
    complete();
  }, 650);
}

(() => {
  const walletRenderer = typeof walletScanRecord === 'function';
  const stages = {
    payment: ['Send', 'Confirmed', 'MYR', 'Paid'],
    topup: ['Send', 'Confirmed', 'MYRT', 'Landed'],
    transfer: ['Send', 'Confirmed', 'Transfer', 'Landed'],
    purchase: ['Send', 'Confirmed', 'Checking', 'Paid'],
  };
  const progress = [14, 40, 68, 92, 100];
  const flow = (type, title, options = {}) => ({type, title, ...options});
  const result = (type, title, options = {}) => flow(type, title, {outcome:'success', ...options});
  const failed = (type, title, options = {}) => flow(type, title, {outcome:'failure', ...options});
  const action = (label, act) => ({label, act});

  function scanMotion() {
    if (S.screen === 'scanReceipt' && S.scanReceiptFrom !== 'payment') return;
    const tx = ['done', 'scanReceipt'].includes(S.screen) ? walletScanRecord() : null;
    if (tx?.status === 'Failed') return failed('payment', 'Transaction failed', {
      description:`${tx.merchant} did not receive the payment.`,
      actions:[action('Try again', 'walletScanRetry'), action('Back to Wallet', 'walletScanHome')],
    });
    if (tx?.status === 'Completed') {
      if (S.screen === 'scanReceipt' && S.scanReceiptChecked !== tx.id) return;
      return result('payment', `Paid ${RM(tx.amount)}!`, {
        description:`${tx.merchant} received the payment.`,
        note:tx.cashback ? `+${RM(tx.cashback)} cashback to Rewards` : '',
        actions:[action('Done', S.screen === 'done' ? 'walletScanReceipt' : 'txShowDetails')],
      });
    }
    if (tx?.status === 'Pending') return flow('payment', 'Checking payment status', {
      step:3, description:`Waiting for confirmation from ${tx.merchant}.`,
      actions:[action('Check payment status', 'walletScanCheck'), action('Back to Wallet', 'walletScanHome')],
    });
    if (S.busy && ['confirm', 'pin', 'processing'].includes(S.screen) && S.pay) {
      const merchant = MERCH[S.pay.id];
      return flow('payment', 'Processing your payment', {
        duration:S.scanPresentationDuration,
        description:merchant ? `${RM(Number(S.pay.amt))} to ${merchant.name}` : '',
        stageCopy:[
          ['Kak Hornbill is flying it', `${RM(Number(S.pay.amt))} leaving your wallet`],
          ['Abang Utan is stacking kuih lapis', 'Confirming your payment'],
          ['Teh tarik time!', 'Preparing the ringgit payment'],
          ['Beca on the way', merchant ? `Ringgit to ${merchant.name} by DuitNow` : 'Paying by DuitNow'],
        ],
        actions:[action('Back', 'walletScanHome')],
        note:'You can leave this screen and check your payment in History.',
      });
    }
  }

  function walletMotion() {
    if (['pin', 'billConfirm'].includes(S.screen) && S.bill?.busy) {
      return flow('purchase', 'Processing your payment', {duration:1100, description:`${RM(Number(S.bill.amt))} to ${bl(S.bill.id).name}`});
    }
    const scan = scanMotion();
    if (scan) return scan;
    switch (S.screen) {
      case 'mwWait': {
        const kind = S.mwWait?.kind;
        if (['send', 'pay', 'topup'].includes(kind)) {
          const types = {send:'transfer', pay:'payment', topup:'topup'};
          return flow(types[kind], `Waiting for ${S.mwWait.app}`, {description:'Approve the transaction in your wallet to continue.', useOriginalActions:true});
        }
        break;
      }
      case 'xsProc': return flow('transfer', 'Sending your money', {
        step:S.xs?.run?.st || 0,
        description:S.xs?.run?.conf ? `${S.xs.run.conf} of 12 network confirmations` : 'Waiting for confirmation.',
        actions:[action('Back', 'xsLeave')], note:'You can leave this screen. We’ll notify you when it lands.',
      });
      case 'tuProc': return S.tuDone
        ? result('topup', 'Top up complete', {useOriginalActions:true})
        : flow('topup', 'Waiting for your top up', {
          step:S.tuConf >= 12 ? 3 : S.tuConf > 1 ? 1 : 0,
          description:`${S.tuConf || 1} of 12 network confirmations`, useOriginalActions:true,
        });
      case 'billDone': return result('purchase', 'Payment successful!', {
        description:S.bill ? `${RM(Number(S.bill.amt))} paid to ${bl(S.bill.id).name}.` : '',
        useOriginalActions:true, details:true,
      });
      case 'checkout':
        if (S.ck?.busy) return flow('purchase', 'Processing your purchase', {duration:900});
        break;
      case 'ckResult': return S.ck?.result === 'ok'
        ? result('purchase', 'Membership payment successful!', {useOriginalActions:true, details:true})
        : failed('purchase', 'Payment failed', {description:'You weren’t charged.', useOriginalActions:true});
      case 'ewConfirm':
        if (S.ewBusy) return flow('purchase', 'Processing opening fee', {duration:1200, description:'RM50.00 · Fiat Wallet'});
        break;
      case 'ewDone': return result('purchase', 'Fiat Wallet activated', {description:'RM50.00 opening fee paid.', useOriginalActions:true, details:true});
      case 'ewFail': return failed('purchase', 'Fiat Wallet activation failed', {
        description:'If the opening fee was taken, it will be returned to your wallet.',
        actions:[action('Try again', 'ewRetry'), action('Back', 'ewFinish')],
      });
      case 'xsDone': return result('transfer', 'Money sent!', {
        description:S.xs ? xsMoney(Number(S.xs.amt)) : '', useOriginalActions:true, details:true,
      });
      case 'xsFail': return failed('transfer', 'Transfer failed', {useOriginalActions:true, details:true});
      case 'tuExtDone': return result('topup', 'Top up complete!', {
        description:S.tuX ? tokAmt(S.tuX.tok, S.tuX.amt) : '', useOriginalActions:true, details:true,
      });
      case 'walletTopUpDone': {
        const topup = S.walletTopUps?.[0];
        if (topup) return result('topup', 'Top up complete!', {
          description:`${myrt(topup.units)} ${topup.key === 'MYR' ? 'MYRT' : topup.key} added to your wallet.`,
          useOriginalActions:true,
        });
        break;
      }
      case 'wdDone': return result('transfer', 'Withdrawal complete!', {useOriginalActions:true, details:true});
    }
  }

  function appMotion() {
    if (S.sheet === 'paying') return flow('purchase', 'Processing your payment', {duration:1400, description:S.payVia});
    if (S.screen === 'pay' && S.sheet === 'pin' && S.otp2State === 'ok') return flow('purchase', 'Processing your payment', {duration:500});
    if (S.screen === 'wproc' && !S.proc?.anim) return flow('purchase', S.proc?.title || 'Processing your payment', {
      step:Math.min(S.proc?.step || 0, 3), useOriginalActions:true,
    });
    if (S.screen === 'paid') return result('purchase', 'Payment successful!', {useOriginalActions:true, details:true});
    if (['wdone', 'bdone7'].includes(S.screen)) return result('purchase', 'Transaction complete!', {useOriginalActions:true, details:true});
  }

  function originalActions(phone) {
    const screen = phone.querySelector('.screen');
    const footer = screen?.querySelector('.w2foot, .cta, .wdd-ft, .ta-cta, .fix');
    return [...(footer?.querySelectorAll('[data-act]') || [])].filter(el => el.dataset.act !== 'noop'
      && !el.disabled && el.getAttribute('aria-disabled') !== 'true').map(el => ({
      act:el.dataset.act, label:el.textContent.trim() || el.getAttribute('aria-label'), data:{...el.dataset},
    })).filter(item => item.label);
  }

  let current;
  let detailKey;
  let animationTimer;

  A.txShowDetails = () => {
    detailKey = current?.key;
    render();
  };

  function updateScene(view, model, now) {
    const elapsed = now - current.started;
    const step = model.outcome === 'success' ? 4 : model.step ?? (
      model.duration ? Math.min(3, Math.floor(elapsed / model.duration * 4)) : 0
    );
    const scene = model.outcome === 'failure' ? 0 : step;
    const art = view.querySelector('.tx-art');
    if (art.dataset.scene !== String(scene)) {
      art.dataset.scene = scene;
      if (model.stageCopy) {
        const [title, description] = model.stageCopy[step];
        view.querySelector('.tx-copy h1').textContent = title;
        view.querySelector('.tx-copy p').textContent = description;
      }
      art.innerHTML = `<div class="ta sc${scene + 1}">${TA_SCENES[scene]}</div>`;
    }
    const bar = view.querySelector('.tx-progress');
    if (bar && bar.getAttribute('aria-valuenow') !== String(progress[step])) {
      bar.setAttribute('aria-valuenow', progress[step]);
      bar.firstElementChild.style.width = `${progress[step]}%`;
      const labels = view.querySelectorAll('.tx-steps li');
      labels.forEach((label, i) => {
        label.classList.toggle('tx-step-complete', i < step);
        if (i === step) label.setAttribute('aria-current', 'step');
        else label.removeAttribute('aria-current');
      });
    }
  }

  const renderScreen = render;
  render = function(...args) {
    const previous = document.querySelector('#phone > .transaction-screen');
    previous?.remove();
    const value = renderScreen.apply(this, args);
    clearInterval(animationTimer);
    const pending = transactionPreview?.session === S && transactionPreview.screen === S.screen
      && transactionPreview.sheet === S.sheet ? transactionPreview : undefined;
    const model = pending ? flow(pending.label.includes('top up') ? 'topup' : 'transfer', pending.label, {duration:650})
      : walletRenderer ? walletMotion() : appMotion();
    const phone = document.getElementById('phone');
    phone.classList.remove('tx-active');
    if (!model) {
      current = undefined;
      detailKey = undefined;
      return value;
    }

    const tx = walletRenderer && ['done', 'scanReceipt'].includes(S.screen) ? walletScanRecord() : null;
    const key = [model.type, model.outcome || 'processing', tx?.id || ''].join(':');
    if (current?.key !== key) {
      current = {key, started:performance.now()};
      detailKey = undefined;
    }
    if (key === detailKey) return value;

    const view = previous || document.createElement('section');
    const buttons = model.actions || (model.useOriginalActions ? originalActions(phone) : []);
    if (model.details && !buttons.some(button => /receipt/i.test(button.label))) {
      buttons.push(action('View details', 'txShowDetails'));
    }
    const stepLabels = stages[model.type];
    const config = JSON.stringify([model.title, model.description, model.note, model.outcome, model.stageCopy, stepLabels, buttons]);
    const icon = model.outcome === 'success' ? 'check' : model.outcome === 'failure' ? 'alert' : 'clock';
    if (view.dataset.config !== config) {
      view.className = 'screen transaction-screen';
      view.dataset.config = config;
      view.dataset.transactionStatus = model.outcome || 'processing';
      view.innerHTML = `${statusBar()}
        <div class="tx-layout">
          <header class="tx-copy" role="status"><h1>${esc(model.title)}</h1>${model.description ? `<p>${esc(model.description)}</p>` : ''}</header>
          <div class="tx-art" aria-hidden="true"></div>
          <div class="tx-static" aria-hidden="true">${ic(icon)}</div>
          ${model.outcome ? '' : `<div class="tx-timeline">
            <div class="tx-progress" role="progressbar" aria-label="Transaction progress" aria-valuemin="0" aria-valuemax="100"><span></span></div>
            <ol class="tx-steps">${stepLabels.map(label => `<li>${label}</li>`).join('')}</ol>
          </div>`}
          ${model.note ? `<p class="tx-note">${esc(model.note)}</p>` : ''}
        </div>
        <footer class="tx-actions"></footer>`;
      const footer = view.querySelector('.tx-actions');
      buttons.forEach(({label, act, data}) => {
        const button = document.createElement('button');
        button.type = 'button';
        Object.assign(button.dataset, data, {act});
        button.textContent = label;
        footer.append(button);
      });
    }
    for (const child of [...phone.children]) {
      if (child.matches('.screen, .sheet, .dialog, .scrim, .otp-card')) child.remove();
    }
    phone.classList.add('tx-active');
    phone.prepend(view);
    updateScene(view, model, performance.now());
    if (!model.outcome && model.duration) {
      animationTimer = setInterval(() => updateScene(view, model, performance.now()), 80);
    }
    return value;
  };

  render();
})();
