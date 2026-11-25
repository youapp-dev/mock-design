# Wallet refresh 19 Nov

Status **Prototype review**  
Design source **Design_update_19nov**, November 19, 2026

## Redesign from the reference HTML

The prototype uses the layout, illustrations, colors, logos, and icons from `Design_update_19nov/youapp-wallet-screens/index.html`. Open **YouPage** with **KYC Approved** and **Wallet Active** to try the design. On the **Free** tier, **YouPage** shows the SVIP referral banner from the reference.

| Section | Updated screens | What to try |
| --- | --- | --- |
| 0 | YouPage | View YouWallet Balance, swipe to Booking Balance, hide balances, see referrals and the last transaction, and view the profile with interest chips. |
| 1 and 1b | Scan to Pay, Pay, Pay with, approval, Paid, Receipt, and Connect a wallet | Use open-amount or fixed-amount QR codes, choose a funding source, approve in an external wallet, test expired quotes, pending payments, failures and retries, and reopen a receipt from History. |
| 2 through 2c | Top up, card, stablecoin, My money, and Connect a wallet | Choose a currency and method, check the fee, confirm a demo top-up, view balances by currency, and filter by wallet. A **Connect a wallet** prompt appears when no external wallet is connected. |
| 3 | Choose your plan | Compare Free, VIP, and SVIP. Selecting a VIP billing period opens checkout. SVIP uses the existing application flow. |
| 4 | Rewards and Invite friends | View empty and populated states, filter referrals and cashback, check which friends have yet to verify, open the QR code, and share the link. |
| 5 | Settings | Open Transactions, Connected wallets, PIN, Limits, referrals, and Coupons. Preferences and the waitlist work within the demo session. |

The profile name, transactions, currencies, balances, and referral statistics reflect the prototype account and scenario. Annual VIP stays at RM120 to match the existing checkout. Ringgit payments from YouApp Wallet use the existing PIN rules. Booking Balance has its own card and is excluded from My money.

**Your profile** follows the order and spacing of the reference HTML. The name, username, and interests reflect Edit Profile. **My Activities** is under **Discover → Activities → Manage Activity**.

**Top up** uses the headings and order from the reference. Currency options sit in a single swipeable row with a hidden scrollbar. The deposit note sits below the scroll area and shows the selected currency. Each payment method displays its fee.

**My money** follows the reference order for balances, wallets, currencies, and transactions. Wallet filters sit in a single swipeable row with a hidden scrollbar. Selecting a wallet adds its name to the balance heading. Hiding balances also hides the chart. **Recent** lists transactions consecutively with their icons and statuses. The SVIP fee banner was removed from this screen to keep the list focused on transactions.

**Currency details** show the balance in the selected currency, an estimated value in RM, and subtotals by wallet. The list shows token icons and distinguishes token quantities from estimated RM values. Tap the subtotal or chevron in a wallet header to open that wallet. Token rows are read-only.

**Wallet details** place the wallet controls directly below the balance card. The asset list starts with the wallet's current holdings by estimated RM value, followed by the rest of the Sera token registry with zero balance. Each page shows up to four assets. The pager displays the current page and resets when the user reopens a wallet. The prototype uses the November 20, 2026 Ethereum mainnet registry snapshot and demo holdings. [Sera token registry documentation](https://docs.sera.cx/api-reference/)

**Wallet settings** contains **Set as main** on every wallet. It cannot be turned off while the wallet is the only connected wallet. Each balance card shows a shortened address beside a copy icon. The icon copies the full address and confirms when copying succeeds.

**External wallets** offer **Disconnect wallet** with confirmation. Turning off **Set as main** switches to YouApp Wallet if available, then another connected wallet. If the last wallet is external, create a YouApp Wallet before disconnecting it.

**Reconnect Wallet** is a separate scenario for an expired wallet session after identity approval. It uses the activation layout and shows the last Main wallet in a single read-only card. The button reconnects that wallet. YouApp Wallet uses the existing PIN prompt. An external Main wallet uses simulated approval in its wallet app, with Cancel and Try Again. Successful reconnection restores access and preserves the wallet list, balances, and Main setting. **Quick Scenario → Wallet → Reconnect** opens the preview. Actual session expiry and provider reauthorization require iOS and Android verification.

**Choose your plan** keeps the reference illustrations, tabs, and benefit order. Cards adapt to the screen width so all four benefits, requirements, and buttons remain readable. The **Current** label reflects the account tier. Annual VIP displays RM120 to match prototype checkout.

Wallet providers, quotes, top-ups, and payments use demo data. The stablecoin QR code is labeled as a demo. **Withdraw to bank** and **Back up wallet** open information about their flows. Preference changes apply within the prototype session. Native permissions and gateway connectivity require iOS and Android QA.

**Chrome QA** covers entry through YouPage, hiding balances, Booking Balance, single and multiple wallets, MetaMask and OKX connections, open-amount and fixed-amount QR codes, internal and external debits, quote refresh, pending payments and retries, card top-ups, stablecoin selection, opening a receipt from Settings, VIP checkout, Rewards and referral filters, preference changes, and the waitlist. At 375 px, QA checked access to the referral QR code, My money, currency selection, and the top-up keypad. Prototype controls sit outside the Wallet screen on mobile.

The Chrome comparison on the Free tier checked avatar size, card corner radius, chip spacing, and profile order against the reference HTML. QA also checked banners in Free and SVIP, the name after **Save Changes**, access to wallet actions, and verification text at 320 px.

**Chrome QA passed** for the uninterrupted Recent list, **See all**, and the empty MetaMask transaction state. From **My money → US dollar**, QA opened YouApp Wallet, MetaMask, and OKX Wallet from their header buttons and confirmed that token rows had no chevrons. At 375 px, QA also opened MetaMask from its header and checked Back navigation.

Chrome QA on Windows verified that Wallet settings precede Assets for MetaMask, OKX, Coinbase, imToken, TP Wallet, and WalletConnect at 390 px. It also covered all MetaMask asset pages on desktop, keyboard pagination at 390 px, and pagination in a wallet with no holdings at 320 px.

Chrome QA checked **Reconnect Wallet** from Quick Scenario and the expired YouPage banner. The desktop run set YouApp Wallet and OKX as Main in turn and verified that each appeared as the sole wallet card. It covered PIN dismissal and confirmation, OKX cancellation and retry, and preserved wallet IDs, Main setting, and balances. At 375 px, the reconnect button stayed visible and PIN confirmation restored access.

The HTML audit corrected the position of the **Pay with** bottom sheet and restored **Top up to use** with the currency preselected. Wallet and friend filter rows keep their swipe position when the selection changes. Referral history shows initials only. Settings shows the wallet count when more than two providers are connected.

## Batch 1

The first batch made Scan to Pay easier to reach and aligned amounts across Pay and History. The notes below document the design and testing for that batch before the HTML redesign above replaced those screens.

- **YouPage** places the balance, Scan to Pay, Top Up, and Rewards above referrals and activities. The YouApp Wallet balance shows the MYRT available for payments. **View Wallets** opens the wallet list, and Booking Balance is available in **Wallet and Activities**.
- **Scan to Pay** uses the existing tier and PIN rules. Fixed-amount QR codes have no keypad. Pay shows the recipient amount, fee, any applicable rebate, and total debit separately.
- **Paid**, **Receipt**, and **History** use the same record. A pending payment holds funds until the status is updated. A failed payment releases the reserved funds and lets the user retry. Funds from a completed top-up remain available.

## Acceptance criteria

| ID | Action | Expected result |
| --- | --- | --- |
| AC-01 | Open YouPage, use **Hide Balance**, then open Booking Balance | Scan to Pay is the primary action. Amounts on YouPage are hidden. Booking Balance is separate from the payment balance. |
| AC-02 | Choose an open-amount QR code, enter RM25 on the Free tier, and pay | The recipient gets RM25.00. Pay and Receipt show the RM1.50 fee and RM26.50 total debit. History opens the same reference. |
| AC-03 | Choose a fixed-amount QR code, then tap **Back** | The amount is read-only. **Back** returns to the scanner without creating a transaction. |
| AC-04 | Pay in the **Pending Next Attempt** scenario, then select **Check Payment Status** | The status is Pending before resolution. After resolution, the reference stays the same and the balance changes only once. |
| AC-05 | Pay in the **Fail Next Attempt** scenario, then select **Try Again** | The failed attempt creates no debit. The review screen retains the recipient and amount. The next payment creates its own successful record. |
| AC-06 | Pay with a low balance or an amount that requires a PIN | **Top Up & Pay** covers the shortfall. An incorrect PIN shows feedback and allows a retry. |

## Decisions for the next batch

- Confirm the combined balance definition, funding source per transaction, supported assets, quote lifetime, and external wallet network fees.
- Confirm top-up methods by currency and country and the settlement rules.
- Finalize SVIP pricing and the limits that apply across plan selection, Settings, and payments before handoff.

## Send flow

Both versions keep crypto Send and Receive. Send starts with the recipient, then shows the source wallet, token, Ethereum network and available amount. Review shows the full address, fees and the token total. External addresses require acknowledgement. A connected wallet uses provider approval and shows how to recover when ETH is insufficient. YouApp Wallet uses its PIN.

Reference patterns were checked against [MetaMask Mobile](https://support.metamask.io/managing-my-tokens/moving-your-tokens/how-to-send-tokens-from-your-metamask-wallet/) for account, token, network and fee review, [Phantom](https://help.phantom.com/articles/5530158379539) for recipient and QR selection, and [Trust Wallet](https://trustwallet.com/blog/academy/como-enviar-e-receber-criptomoedas-na-trust-wallet) for the address, network and amount check.

## Verification coverage

Local Windows Chrome checks passed for 3.2.0 at 320 px and 3.3.0 at 375 px. Coverage included Fiat Wallet routing, address validation, simulated clipboard permission and paste, fee-aware Max, PIN and animated success, low-ETH recovery, simulated connected-wallet approval, and QR routing.

- **Passed in Chrome on desktop and at 375 px.** AC-01 through AC-06 were exercised by clicking through the prototype, including retrying an incorrect PIN successfully, using a personal QR code, testing an invalid QR image, and opening the same receipt from History in both YouPage and Settings.
- **Simulated.** The scanner, top-ups, and settlement in this flow are simulated. Payment records live in the prototype session.
- **Native builds are untested.** The camera, native PIN flow, transaction contracts, backend idempotency, and app lifecycle when returning from the gateway need verification on iOS and Android.
