const RED_PACKET_MIN_CENTS = 100;
const isLucky = packet => packet.type === 'lucky';

function redPacketAmountLeft(packet) {
  const paid = packet.slots.reduce((total, slot) => total + (slot.by ? slot.amt : 0), 0);
  return packet.total - paid;
}

function createRedPacketStore({rates, onMovement, onExpiry, onScheduledExpiry}) {
  const packets = [];
  const sent = new Map();
  const movements = [];
  let order = 0;
  let expiryTimer;

  function randomIndex(max) {
    if (max <= 0) return 0;
    return crypto.getRandomValues(new Uint32Array(1))[0] % (max + 1);
  }

  function token() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const values = crypto.getRandomValues(new Uint32Array(16));
    return Array.from(values, value => alphabet[value % alphabet.length]).join('');
  }

  function split(total, count, type, per) {
    if (type === 'equal') return Array.from({length:count}, () => per);
    const extra = total - count * RED_PACKET_MIN_CENTS;
    const maximum = Math.floor(3 * total / count);
    let slots;
    for (let attempt = 0; attempt < 20; attempt++) {
      const cuts = Array.from({length:count - 1}, () => randomIndex(extra)).sort((a, b) => a - b);
      const points = [0, ...cuts, extra];
      slots = Array.from({length:count}, (_, i) => RED_PACKET_MIN_CENTS + points[i + 1] - points[i]);
      if (slots.every(amount => amount <= maximum)) break;
    }
    let overflow = 0;
    slots = slots.map(amount => {
      overflow += Math.max(0, amount - maximum);
      return Math.min(amount, maximum);
    });
    while (overflow > 0) {
      const available = slots.map((amount, i) => amount < maximum ? i : -1).filter(i => i >= 0);
      const i = available[randomIndex(available.length - 1)];
      const added = Math.min(overflow, maximum - slots[i], Math.ceil(overflow / available.length));
      slots[i] += added;
      overflow -= added;
    }
    for (let i = slots.length - 1; i > 0; i--) {
      const j = randomIndex(i);
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    return slots;
  }

  function exhausted(packet) {
    return redPacketAmountLeft(packet) < (isLucky(packet) ? RED_PACKET_MIN_CENTS : 1);
  }

  function scheduleExpiry() {
    clearTimeout(expiryTimer);
    const due = packets.reduce((next, packet) => packet.status === 'ACTIVE' && packet.expiresAt
      ? Math.min(next, packet.expiresAt) : next, Infinity);
    if (due === Infinity) return;
    expiryTimer = setTimeout(() => {
      const previous = movements.length;
      for (const packet of packets) settle(packet);
      scheduleExpiry();
      if (movements.length !== previous) onScheduledExpiry();
    }, Math.min(2147483647, Math.max(0, due - Date.now())));
  }

  function create(options) {
    const lucky = isLucky(options);
    const total = options.type === 'equal' ? options.per * options.count : options.total;
    const slots = lucky ? [] : split(total, options.count, options.type, options.per)
      .map(amt => ({amt, by:null, at:null}));
    const packet = {
      id:'ap' + (packets.length + 1), token:options.token || token(), creator:options.creator,
      type:options.type, total, per:options.per || 0, fee:options.fee || 0, count:lucky ? null : options.count,
      msg:options.msg || '', status:'ACTIVE', expiresAt:options.expiresAt || null,
      expLbl:options.expLbl || 'Never expires', createdAt:options.createdAt || Date.now(),
      refunded:0, historical:!!options.historical, slots, sentTo:[], theme:options.theme,
    };
    if (lucky) packet.luckyRates = options.luckyRates || rates.current();
    (options.claimed || []).forEach((by, i) => {
      Object.assign(slots[i], {by, at:options.at || '09:3' + i, ord:++order});
    });
    if (exhausted(packet)) packet.status = 'FULLY_CLAIMED';
    packets.push(packet);
    if (packet.expiresAt && packet.status === 'ACTIVE') scheduleExpiry();
    return packet;
  }

  function record(kind, packet, cents, reason) {
    const movement = {kind, packet, cents, reason, at:new Date()};
    movements.push(movement);
    onMovement(movement);
  }

  function send(options, key) {
    if (sent.has(key)) return sent.get(key);
    const packet = create({...options, creator:'me'});
    if (key !== undefined) sent.set(key, packet);
    record('send', packet, -(packet.total + packet.fee));
    return packet;
  }

  function close(packet, status) {
    if (!packet || packet.status !== 'ACTIVE') return false;
    const left = redPacketAmountLeft(packet);
    packet.status = status;
    packet.refunded = left;
    packet.endedAt = Date.now();
    if (packet.expiresAt) scheduleExpiry();
    if (packet.creator !== 'me' || packet.historical || !left) return true;
    const reason = {EXPIRED:'expired', CANCELLED:'cancelled', FULLY_CLAIMED:'unused budget'}[status];
    record('refund', packet, left, reason);
    if (status === 'EXPIRED') onExpiry(left);
    return true;
  }

  function settle(packet) {
    if (packet?.status !== 'ACTIVE') return;
    if (packet.expiresAt && Date.now() >= packet.expiresAt) close(packet, 'EXPIRED');
    else if (exhausted(packet)) close(packet, 'FULLY_CLAIMED');
  }

  function receiveState(packet, by) {
    if (!packet) return 'notfound';
    settle(packet);
    if (packet.status === 'CANCELLED' || packet.status === 'EXPIRED') return 'ended';
    if (packet.creator === by) return 'own';
    if (packet.slots.some(slot => slot.by === by)) return 'claimed';
    if (packet.status === 'FULLY_CLAIMED') return 'full';
    return 'ready';
  }

  function claim(packet, by) {
    if (receiveState(packet, by) !== 'ready') return null;
    const stamp = {by, at:'Now', ord:++order};
    let slot;
    if (isLucky(packet)) {
      const amt = rates.draw(packet.luckyRates || rates.baseline, redPacketAmountLeft(packet));
      slot = {amt, ...stamp};
      packet.slots.push(slot);
    } else {
      const available = packet.slots.filter(item => !item.by);
      slot = Object.assign(available[randomIndex(available.length - 1)], stamp);
    }
    if (by === 'me' && slot.amt) record('claim', packet, slot.amt);
    settle(packet);
    return slot;
  }

  return {
    packets,
    create,
    send,
    claim,
    receiveState,
    close,
    settle,
    movements,
    sentWithKey: key => sent.get(key),
    balanceDelta: () => movements.reduce((total, movement) => total + movement.cents, 0),
  };
}
