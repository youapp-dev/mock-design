/* Public entry points from the scenario panel and ?jump=. */
const YouAppPrototypeRoutes = (() => {
  const walletEntries = new Map([
    ['signup', {screen:'signup', backTo:'welcome'}],
    ['home', {screen:'home', backTo:'discover'}],
    ['scan', {screen:'scan', backTo:'discover'}],
    ['subscribe', {screen:'subscribe', backTo:'discover'}],
    ['bills', {screen:'bills', backTo:'discover'}],
    ['invite', {screen:'invite', backTo:'discover'}],
    ['settings', {screen:'settings', backTo:'discover'}],
    ['topup', {screen:'walletTopUp', backTo:'discover'}],
  ]);
  const appAliases = new Map([['start', 'restart'], ['host', 'hosttab']]);

  const screenNames = {splash:'Splash', welcome:'Welcome', discover:'Discover', guestlock:'Guest page', gate:'Badge Verification', activate:'Activate wallet', walletActive:'Wallet active',
    home:'YouPage · You', business:'YouPage · Host', scan:'Scan to Pay', confirm:'Confirm payment', done:'Payment done', scanReceipt:'Scan Payment Receipt', scanArchiveReceipt:'Receipt', scanHistory:'Wallet Transactions', walletBooking:'Booking Balance', subscribe:'Choose your plan', checkout:'Checkout', ckResult:'Upgrade result',
    wallets:'My money', walletCurrency:'Currency details', walletConnect:'Connect a wallet', walletPaymentSource:'Pay with', walletApprove:'Approve in your wallet', walletTopUp:'Top up', walletTopUpAmount:'Top up amount', walletTopUpStable:'Stablecoin top up', walletTopUpDone:'Top up complete', walletTopUpReceipt:'Top up receipt',
    bills:'Pay Bill', mreload:'Mobile Reload', billInput:'Bill number', billConfirm:'Bill payment', billDone:'Bill paid', invite:'Refer a Friend', rewards:'Rewards', signup:'Get Started', otp:'OTP', obName:'Onboarding · Name', obDob:'Onboarding · Birthday', obGender:'Onboarding · Gender', obRef:'Onboarding · Referral',
    hosttab:'Host tab (become a host)', settings:'Settings', topup:'Top Up', whist:'Transactions', chats:'Inbox', trips:'Trips', tripAdd:'Add a trip', trip:'Trip page', tpStop:'Add a stop', tpStay:'Add a stay', tpPlace:'Add a place', tpPeople:'Add people to trip', tpJoin:'Friend adds you to a trip', tpEdit:'Edit trip', tpPlan:'A plan', tpPlanChat:'Plan chat', tpPlanNew:'Start a plan', tpFriend:'What friends see', chat:'Chatroom', limits:'Limits', profedit:'Edit profile', cexp:'Create experience',
    apform:'Red Packet · Create', apconf:'Red Packet · Confirm', apdone:'Red Packet · Share', aprecv:'Red Packet · Receive', apdet:'Red Packet · Details', aplist:'My Red Packet', actmine:'My Activities', actd:'My activity', actedit:'Edit activity', actappl:'Activity applicants', products:'YouApp Products', ginvite:'Group · Invite link', gpick:'Create group · Members', gform:'Create group · Details'};

  return {
    resolve(name) {
      const wallet = walletEntries.get(name);
      if (wallet) return {renderer:'w2', ...wallet};
      return {renderer:'a30', screen:appAliases.get(name) ?? name};
    },
    label(screen) {
      return Object.hasOwn(screenNames, screen) ? screenNames[screen] : screen || '…';
    },
  };
})();
