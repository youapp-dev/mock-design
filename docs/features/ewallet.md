# Fiat Wallet (MYR e-money account)

**Status:** Automatic opening and paid activation are available in the 3.3.0 browser prototype. Version 3.2.0 keeps Scan to Pay and crypto Send/Receive. Existing provider details remain under Open questions.
**Renderer:** Wallet 2.0, `prototype/wallet2/ewallet.js`.

## Problem

Receive (in ringgit), Bill payment and Mobile reload run on MYR rails. YouApp needs to burn the user's MYRT and credit ringgit to a Fiat Wallet in the user's name at the moment of use. Opening that account normally costs RM50. Verified users with more than RM100 in successful MYRT activity qualify for automatic free opening. Most users only scan and pay, so they should never be asked to open it or pay for it.

## Decisions

| Topic | Decision | Source |
| --- | --- | --- |
| When to activate | Only when the user wants Receive (to the Fiat Wallet), Bill payment or Mobile reload. Scan to Pay and wallet activation are unchanged | Douglas, 24 Nov chat |
| RM50 | One-time **account opening fee**. Not added to the Fiat Wallet balance. History shows "−RM50.00 · Fiat Wallet opening fee" | Kevon, 24 Nov chat; Maul |
| Paying (fee, bills, reload) | MYRT first (burned 1:1 into the Fiat Wallet). If MYRT is short, the user picks another payment option available in the app | Maul |
| Receive | Every wallet detail screen has Receive. Crypto wallets (YouApp Wallet, connected MetaMask/OKX) show their address and QR with no Fiat Wallet needed. The Fiat Wallet shows its DuitNow QR and account number and needs activation | Maul |
| KYC | Existing KYC covers the Fiat Wallet. No extra screens | Maul |
| Product name | **Fiat Wallet** across the feature. The activation page is **Activate Fiat Wallet** | Leadership feedback, confirmed by Maul |
| Automatic opening | In 3.3.0, cumulative successful MYRT activity over RM100 waives the fee. Failed, refunded, and pending activity is excluded. Use the existing verified identity and phone details without a prompt or SMS | Leadership feedback and Maul, 24 Nov 2026 |
| Phone number | Paid activation verifies a phone number by SMS code **before** the RM50 is charged, so a wrong code never costs money. Any country (default Malaysia +60): a Country field opens a full-screen Choose country list (flag, name, dial code, search), like the system phone setup. Profile and Fiat Wallet share the saved verified number. Later paid activation reuses it. Change it in Edit profile › Mobile Number with a new SMS code | Maul, 24 Nov |

## Automatic opening

On the first Bill payment, Mobile reload, Fiat Wallet Receive, or explicit wallet activation request, an inactive wallet checks eligibility. RM100.00 stays on the paid path. RM100.01 qualifies. An eligible user sees a short opening status, then continues to the biller list, network list, DuitNow Receive details, or wallet details according to the original action. Bills and reloads keep their existing payment confirmation. If automatic opening fails, Try again uses the same destination and Back returns to the previous screen. The automatic path creates no opening-fee transaction or balance deduction.

The prototype sums its simulated history and available Wallet 2.0 MYRT Scan to Pay and top-up records. Production must use authoritative transaction and account records across all supported transaction types and prevent duplicate account creation or duplicate payment on retry.

## Paid activation and follow-on flow

1. YouPage: **Bill payment** and **Mobile reload** tiles sit below Top up and Rewards.
2. Tapping Bill payment, Mobile reload or Fiat Wallet Receive while the Fiat Wallet is not active opens the **Activate Fiat Wallet** sheet: illustration, why, one-time RM50 opening fee, identity already verified, phone number verified next. Below RM50 of MYRT it adds "Your MYRT is RM{x}. You can top up the rest on the next step." Buttons: Continue, Not now. Continue opens payment directly when the profile already has a verified number.
3. **Phone number**: country code picker (search, any country, +60 default) and number. Send code is enabled once the length fits that country. A number already linked to another Fiat Wallet shows an error under the field.
4. **Verify phone number**: a modal card over the phone-number screen, like the login OTP: "Code sent" toast, 6 boxes on the number keypad, Resend Again after 30 s, Cancel back to the number. Checks automatically at 6 digits. Wrong code shows tries left; 5 wrong codes lock for 10 minutes. Resend after 30 s, Change number goes back. A correct code opens the payment step.
5. **Activate Fiat Wallet** screen: the verified phone number, illustration, the three things it unlocks, fee summary, Pay from YouWallet · MYRT. Button: "Pay RM50.00 & activate". If MYRT is below RM50, a "RM{x} short" warning and the top-up picker (Debit or Credit Card; Stablecoins MYRT, USDT, USDC) appear, a line above the button says "Uses MYRT {a} and tops up RM{x} with {method}", and the button reads **"Top up & pay RM50.00"**.
6. **Fiat Wallet activated**: RM50.00 with “Account opening fee paid.” History shows the −RM50.00 debit. Details include account number (copy), phone number, paid with, reference, date. One button: Done, which returns to where the user started (the Pay bills, Reload a number and Receive money shortcuts were removed on 25 Nov).
7. Bills and Mobile reload follow the existing W6 flows (biller or network, number, fetched or chosen amount, PIN at RM100+, Paid, Receipt). The confirm screen and receipt show "Paid through Fiat Wallet, funded from YouWallet · MYRT".
8. **My money** has a Fiat Wallet section under the currencies. Off: "Receive, pay bills and reload" with Activate. On: the Fiat Wallet balance, opening **Fiat Wallet** details (balance, account number and name, Receive, Pay bills, history).
9. **Receive to Fiat Wallet**: DuitNow QR, account number with Copy, Share QR.

## States

| State | Behavior |
| --- | --- |
| Not activated | Section shows Activate. Eligible verified users open automatically from an activation trigger. Other users see the existing activation sheet |
| Activating | Button shows "Opening your Fiat Wallet…" and is disabled |
| Active | Section shows the balance. Bills and Reload open directly |
| Opening failed | Free path: no charge, Try again or Back. Paid path: the fee goes back if taken, with Try again or Not now |
| MYRT short | Warning plus card top-up on the activation screen; Top Up & Pay on bills (existing) |

## Edge cases

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | User only uses Scan to Pay | Never sees the activation sheet or the fee |
| 2 | User taps Not now | Sheet closes, nothing charged, stays on the same screen |
| 3 | MYRT below RM50 | Short amount shown, user chooses a top-up method, then activates |
| 4 | Opening fails | No Fiat Wallet, fee refunded, retry available |
| 5 | Activation started from Bills | After success the screen has Done only; it returns to where the user started (25 Nov: the Pay bills shortcut was removed) |
| 6 | Receive from a crypto wallet | Opens that wallet's address QR, no Fiat Wallet gate |
| 7 | Rapid taps on Pay & activate | Only one activation runs |
| 9 | Phone number already linked to another Fiat Wallet | Error under the field, no code sent |
| 10 | Wrong SMS code | Error with tries left, boxes clear; 5 wrong codes lock for 10 minutes |
| 11 | Back from the payment step after verifying | Closes activation and keeps the verified number. Reopening paid activation goes straight to payment |
| 12 | Change the verified phone number | Edit profile › Mobile Number saves the new number after SMS verification. Fiat Wallet uses the updated number |
| 8 | User outside Malaysia | Not built yet. W6 says Bills and Reload are Malaysia only; the Fiat Wallet section and tiles should follow |

## Open questions (Kevon) — prototype assumptions

| # | Question | Assumption used |
| --- | --- | --- |
| 1 | Is opening instant? | Instant. If not, add a Pending state and a notification when ready |
| 2 | What are the account details (DuitNow ID, account number, DuitNow QR)? | Account number plus DuitNow QR |
| 3 | Is the fee refunded if opening fails? | Refunded automatically |
| 4 | Where does received MYR go, and does it pay bills directly? | Stays as Fiat Wallet balance and is used before MYRT |

## Conflicts with earlier PRDs

- Wallet 2.0 W6 had Bills and Reload paid straight from Travel Balance (MYRT). They now run through the Fiat Wallet, with MYRT burned at the moment of use.
- Wallet 2.0 T3 Receive MYRT is unchanged for crypto wallets. Receiving ringgit is new and needs the Fiat Wallet.

## Prototype controls

Fiat Wallet › Not activated clears the shared verified phone so the first-time verification flow can be tested again.

Fiat Wallet: Not activated / Active / Fails next. MYRT balance: RM50 or more / Below RM50 (RM12.40). Prior successful MYRT activity: None / RM100 (includes unsuccessful records to exercise exclusions) / RM100.01. Jumps: Mobile reload, Activate Fiat Wallet (paid screen preview).

## QA

- Merge verification passed in local Windows Chrome at 430 px on 3.2.0 and 3.3.0. Covered invalid and valid SMS codes, verified-number reuse after backing out, changing the shared number from Edit profile, the RM50.00 paid confirmation and single negative history debit, and free opening with no additional charge.

- 24 Nov 2026, local static server at `/mock-design/`, headless Chrome on Windows at 1440 × 1024. Passed on both 3.2.0 and 3.3.0: RM100 boundary with refunded, failed and pending activity excluded, paid phone and SMS flow, the new title, a single RM50 paid opening charge, free opening with no deduction or history entry, automatic return to Bills, failed free opening and retry into Mobile reload, and wallet details and DuitNow Receive after qualification from simulated transaction records. Provider and native iOS and Android verification are pending.

- `node tools/qa-wallet-reference.cjs` passes all 7 groups, including a new check: Bill payment opens the activation sheet, activation succeeds, the −RM50 fee appears in history, and Continue opens Bills.
- Manual run at 375 and 320: YouPage tiles, activation sheet, activation (MYRT enough and short), activated, Bills confirm, PIN, paid, receipt, My money (off and on), Fiat Wallet details, Receive to Fiat Wallet, YouApp Wallet and MetaMask details with Receive, opening failed.

## Payment methods (23 Nov 2026, app-wide)

Apple Pay, DuitNow Transfer and Online Banking (FPX) are removed as payment and top-up methods in both renderers. Bank and card methods are **Debit or Credit Card** only. Stablecoins stay. E-wallet and Other ways stay on the Top up screen, and E-wallet stays on booking checkout, pending confirmation. DuitNow QR (Scan to Pay) and DuitNow receiving into the Fiat Wallet are rails, not payment methods, and stay.
