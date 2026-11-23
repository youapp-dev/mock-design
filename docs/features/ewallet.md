# eWallet (MYR e-money account)

**Status:** Prototype on `dev-claude`, 23 Nov 2026. Built while waiting for Kevon's answers (see Open questions).
**Renderer:** Wallet 2.0, `prototype/wallet2/ewallet.js`.

## Problem

Receive (in ringgit), Bill payment and Mobile reload run on MYR rails. YouApp needs to burn the user's MYRT and credit ringgit to an eWallet in the user's name at the moment of use. Opening that eWallet costs RM50. Most users only scan and pay, so they should never be asked to open it or pay for it.

## Decisions

| Topic | Decision | Source |
| --- | --- | --- |
| When to activate | Only when the user wants Receive (to the eWallet), Bill payment or Mobile reload. Scan to Pay and wallet activation are unchanged | Douglas, 24 Nov chat |
| RM50 | One-time **account opening fee**. Not added to the eWallet balance. History shows "−RM50.00 · eWallet account opening fee" | Kevon, 24 Nov chat; Maul |
| Paying (fee, bills, reload) | MYRT first (burned 1:1 into the eWallet). If MYRT is short, the user picks another payment option available in the app | Maul |
| Receive | Every wallet detail screen has Receive. Crypto wallets (YouApp Wallet, connected MetaMask/OKX) show their address and QR with no eWallet needed. The eWallet shows its DuitNow QR and account number and needs activation | Maul |
| KYC | Existing KYC covers the eWallet. No extra screens | Maul |
| Name | eWallet | Maul |

## Flow

1. YouPage: **Bill payment** and **Mobile reload** tiles sit below Top up and Rewards.
2. Tapping Bill payment, Mobile reload or eWallet Receive while the eWallet is not active opens the **Activate your eWallet** sheet: illustration, why, one-time RM50 opening fee, identity already verified. Below RM50 of MYRT it adds "Your MYRT is RM{x}. You can top up the rest on the next step." Buttons: Continue, Not now.
3. **Activate eWallet** screen: illustration, the three things it unlocks, fee summary, Pay from YouWallet · MYRT. Button: "Pay RM50.00 & activate". If MYRT is below RM50, a "RM{x} short" warning and the top-up picker (Debit or Credit Card; Stablecoins MYRT, USDT, USDC) appear, a line above the button says "Uses MYRT {a} and tops up RM{x} with {method}", and the button reads **"Top up & pay RM50.00"**.
4. **eWallet activated**: −RM50.00 account opening fee, account number (copy), paid with, reference, date. The primary button continues into the flow the user started (Pay bills, Reload a number, Receive money). Done returns to where they were.
5. Bills and Mobile reload follow the existing W6 flows (biller or network, number, fetched or chosen amount, PIN at RM100+, Paid, Receipt). The confirm screen and receipt show "Paid through eWallet, funded from YouWallet · MYRT".
6. **My money** has an eWallet section under the currencies. Off: "Receive, pay bills and reload" with Activate. On: the eWallet balance, opening **eWallet** details (balance, account number and name, Receive, Pay bills, history).
7. **Receive to eWallet**: DuitNow QR, account number with Copy, Share QR.

## States

| State | Behavior |
| --- | --- |
| Not activated | Section shows Activate. Bills, Reload and eWallet Receive open the activation sheet |
| Activating | Button shows "Opening your eWallet…" and is disabled |
| Active | Section shows the balance. Bills and Reload open directly |
| Opening failed | "We couldn't open your eWallet". The fee goes back automatically. Try again or Not now |
| MYRT short | Warning plus card top-up on the activation screen; Top Up & Pay on bills (existing) |

## Edge cases

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | User only uses Scan to Pay | Never sees the activation sheet or the fee |
| 2 | User taps Not now | Sheet closes, nothing charged, stays on the same screen |
| 3 | MYRT below RM50 | Short amount shown, user chooses a top-up method, then activates |
| 4 | Opening fails | No eWallet, fee refunded, retry available |
| 5 | Activation started from Bills | After success, Pay bills opens the biller list |
| 6 | Receive from a crypto wallet | Opens that wallet's address QR, no eWallet gate |
| 7 | Rapid taps on Pay & activate | Only one activation runs |
| 8 | User outside Malaysia | Not built yet. W6 says Bills and Reload are Malaysia only; the eWallet section and tiles should follow |

## Open questions (Kevon) — prototype assumptions

| # | Question | Assumption used |
| --- | --- | --- |
| 1 | Is opening instant? | Instant. If not, add a Pending state and a notification when ready |
| 2 | What are the account details (DuitNow ID, account number, DuitNow QR)? | Account number plus DuitNow QR |
| 3 | Is the fee refunded if opening fails? | Refunded automatically |
| 4 | Where does received MYR go, and does it pay bills directly? | Stays as eWallet balance and is used before MYRT |

## Conflicts with earlier PRDs

- Wallet 2.0 W6 had Bills and Reload paid straight from Travel Balance (MYRT). They now run through the eWallet, with MYRT burned at the moment of use.
- Wallet 2.0 T3 Receive MYRT is unchanged for crypto wallets. Receiving ringgit is new and needs the eWallet.

## Prototype controls

eWallet: Not activated / Active / Fails next. MYRT balance: RM50 or more / Below RM50 (RM12.40). Jumps: Mobile reload, eWallet (activation screen).

## QA

- `node tools/qa-wallet-reference.cjs` passes all 7 groups, including a new check: Bill payment opens the activation sheet, activation succeeds, the −RM50 fee appears in history, and Continue opens Bills.
- Manual run at 375 and 320: YouPage tiles, activation sheet, activation (MYRT enough and short), activated, Bills confirm, PIN, paid, receipt, My money (off and on), eWallet details, Receive to eWallet, YouApp Wallet and MetaMask details with Receive, opening failed.

## Payment methods (23 Nov 2026, app-wide)

Apple Pay, DuitNow Transfer and Online Banking (FPX) are removed as payment and top-up methods in both renderers. Bank and card methods are **Debit or Credit Card** only. Stablecoins stay. E-wallet and Other ways stay on the Top up screen, and E-wallet stays on booking checkout, pending confirmation. DuitNow QR (Scan to Pay) and DuitNow receiving into the eWallet are rails, not payment methods, and stay.
