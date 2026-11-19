/* Lucky draw rules shared by the prototype admin panel and the Red Packet flow. */
(() => {
  const STORAGE_KEY = 'youapp-lucky-draw-rates-v1';
  const TOTAL_WEIGHT = 10000;
  const baseline = Object.freeze({
    version:1,
    publishedAt:null,
    maximum:10,
    prizes:Object.freeze(Array.from({length:10}, (_, index) => Object.freeze({amount:index + 1, weight:1000}))),
  });

  function validate(maximum, prizes) {
    if (!Number.isSafeInteger(maximum * 100) || !Number.isInteger(maximum) || maximum < 1) {
      return 'Enter a whole maximum prize of at least 1 MYRT.';
    }
    const amounts = new Set();
    let total = 0;
    for (const {amount, weight} of prizes) {
      if (!Number.isInteger(amount) || amount < 1 || amount > maximum) return `Each prize must be a whole number from 1 to ${maximum} MYRT.`;
      if (amounts.has(amount)) return `Enter each prize once. ${amount} MYRT appears twice.`;
      if (!Number.isInteger(weight) || weight < 1 || weight > TOTAL_WEIGHT) return 'Enter each chance from 0.01% to 100%, with up to two decimals.';
      amounts.add(amount);
      total += weight;
    }
    if (!amounts.has(1)) return 'Include a 1 MYRT prize so a draw can still be paid when the budget runs low.';
    if (total !== TOTAL_WEIGHT) return `Chances must add up to 100%. Current total is ${(total / 100).toFixed(2)}%.`;
    return '';
  }

  function history() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(stored)) {
        return [baseline, ...stored.filter(item => Number.isSafeInteger(item?.version) && item.version > 1 &&
          Array.isArray(item.prizes) && !validate(item.maximum, item.prizes))];
      }
    } catch (error) { /* An unavailable or invalid draft store falls back to the baseline. */ }
    return [baseline];
  }

  const current = () => history().at(-1);

  async function publish(maximum, prizes, expectedVersion) {
    const error = validate(maximum, prizes);
    if (error) throw new Error(error);
    const save = () => {
      const entries = history();
      if (entries.at(-1).version !== expectedVersion) throw new Error('Another draft has been published. Reload the published rates before saving.');
      const saved = {
        version:expectedVersion + 1,
        publishedAt:new Date().toISOString(),
        maximum,
        prizes:prizes.map(({amount, weight}) => ({amount, weight})).sort((a, b) => a.amount - b.amount),
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...entries.slice(1), saved])); }
      catch (error) { throw new Error('Rates could not be saved in this browser.'); }
      return saved;
    };
    return navigator.locks?.request ? navigator.locks.request(STORAGE_KEY, save) : save();
  }

  function randomBelow(limit) {
    const value = new Uint32Array(1);
    const ceiling = 2 ** 32 - (2 ** 32 % limit);
    do { crypto.getRandomValues(value); } while (value[0] >= ceiling);
    return value[0] % limit;
  }

  function draw(rates, availableCents, random = randomBelow) {
    const eligible = rates.prizes.filter(prize => prize.amount * 100 <= availableCents);
    if (!eligible.length) return null;
    const total = eligible.reduce((sum, prize) => sum + prize.weight, 0);
    let roll = random(total);
    for (const {amount, weight} of eligible) {
      if (roll < weight) return amount * 100;
      roll -= weight;
    }
    throw new Error('Lucky draw roll exceeded the eligible weights.');
  }

  const average = prizes => prizes.reduce((sum, {amount, weight}) => sum + amount * weight, 0) / TOTAL_WEIGHT;

  window.YouAppLuckyDraw = {baseline, current, history, validate, publish, draw, average, storageKey:STORAGE_KEY};
})();
