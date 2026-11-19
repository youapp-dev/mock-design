(() => {
  const rates = window.YouAppLuckyDraw;
  const form = document.getElementById('luckyRateForm');
  const maximum = document.getElementById('luckyRateMaximum');
  const rows = document.getElementById('luckyRateRows');
  const version = document.getElementById('luckyRateVersion');
  const preview = document.getElementById('luckyRatePreview');
  const status = document.getElementById('luckyRateStatus');
  const history = document.getElementById('luckyRateHistory');
  const publish = form.querySelector('[type="submit"]');
  let draftVersion;
  let saving = false;

  function labelRows() {
    [...rows.children].forEach((row, index) => {
      const number = index + 1;
      row.querySelector('[data-prize]').setAttribute('aria-label', `Prize ${number} in MYRT`);
      row.querySelector('[data-chance]').setAttribute('aria-label', `Chance for prize ${number} in percent`);
      row.querySelector('button').setAttribute('aria-label', `Remove prize ${number}`);
    });
  }

  function addPrize(amount = '', chance = '') {
    const row = document.createElement('div');
    row.className = 'lucky-rate-grid';
    row.innerHTML = `<input type="number" min="1" step="1" inputmode="numeric" data-prize>
      <input type="number" min="0.01" max="100" step="0.01" inputmode="decimal" data-chance>
      <button type="button" class="lucky-rate-remove" data-remove>×</button>`;
    const input = row.querySelector('[data-prize]');
    input.value = amount;
    row.querySelector('[data-chance]').value = chance;
    rows.append(row);
    return input;
  }

  function readPrizes() {
    return [...rows.children].map(row => {
      const percent = row.querySelector('[data-chance]').value;
      return {
        amount:row.querySelector('[data-prize]').valueAsNumber,
        weight:/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(percent) ? Math.round(Number(percent) * 100) : NaN,
      };
    });
  }

  function updatePreview() {
    const prizes = readPrizes();
    const error = rates.validate(maximum.valueAsNumber, prizes);
    preview.textContent = error || `100% total · Average ${rates.average(prizes).toFixed(2)} MYRT`;
    publish.disabled = Boolean(error) || saving;
    return prizes;
  }

  function loadPublished() {
    const entries = rates.history();
    const active = entries.at(-1);
    draftVersion = active.version;
    maximum.value = active.maximum;
    version.textContent = `Version ${active.version} · Applies to new packets`;
    rows.replaceChildren();
    active.prizes.forEach(({amount, weight}) => addPrize(amount, weight / 100));
    labelRows();
    history.replaceChildren(...entries.reverse().map(entry => {
      const item = document.createElement('li');
      const date = entry.publishedAt ? new Date(entry.publishedAt).toLocaleString() : 'Default';
      item.textContent = `V${entry.version} · ${date} · Max ${entry.maximum} MYRT · Avg ${rates.average(entry.prizes).toFixed(2)} MYRT`;
      return item;
    }));
    updatePreview();
  }

  form.addEventListener('input', () => { status.textContent = ''; updatePreview(); });
  rows.addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const row = button.parentElement;
    const nextInput = (row.nextElementSibling || row.previousElementSibling)?.querySelector('[data-prize]');
    row.remove();
    labelRows();
    updatePreview();
    (nextInput || document.getElementById('luckyRateAdd')).focus();
  });
  document.getElementById('luckyRateAdd').addEventListener('click', () => {
    const input = addPrize();
    labelRows();
    updatePreview();
    input.focus();
  });
  document.getElementById('luckyRateReload').addEventListener('click', () => {
    loadPublished();
    status.textContent = 'Published rates loaded.';
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const prizes = updatePreview();
    if (publish.disabled) return;
    saving = true;
    publish.disabled = true;
    status.textContent = 'Publishing rates…';
    try {
      const saved = await rates.publish(maximum.valueAsNumber, prizes, draftVersion);
      loadPublished();
      status.textContent = `Version ${saved.version} published for new packets.`;
    } catch (error) {
      status.textContent = error.message;
    } finally {
      saving = false;
      updatePreview();
    }
  });
  loadPublished();
})();
