# Red Packet · Lucky draw

Status **Prototype review**  
Source **Cing, November 19, 2026**, relaying Florence's request

## Product rules

- Lucky draw is the first option and is selected by default when a new form opens. The sender sets a budget starting at 1.00 MYRT without entering a recipient count. The budget is subject to the available MYRT balance and existing per-transaction and monthly limits.
- Each person gets one draw per red packet. The prize amount is calculated when the packet is opened. All links, QR codes, and chat cards for the same packet share one budget.
- The default prizes are whole amounts from 1 to 10 MYRT, each with a 10% chance. When the remaining budget is below the maximum prize, the draw includes only prizes it can cover. Eligible prizes keep their relative weights.
- The budget is held when the sender confirms. Any unpaid amount is returned exactly once if the packet is canceled or expires. If the remaining budget falls below the minimum prize of 1 MYRT, the packet closes and the remainder is returned immediately. There is no fee.
- **Luckiest** marks the largest claim so far. If two claims tie for the largest amount, the earlier claim gets the badge.
- Random and Equal split still use a recipient count. All three modes support **Never expires**, presets, and **Custom** durations in hours or days.

## November 20 design update

- Creation, chat cards, and receiving screens use the Red, Raya, Deepavali, Birthday, and YouApp artwork from the supplied November 20 reference. The selected design travels with the packet. Older packets use Red.
- **Create packet** uses the selected design’s colors for the mode tabs, message suggestions, and Send. The header shows the destination chat. In a group, Random and Equal split start with a slot for each other member, up to 100. The header updates as the sender edits the count. Lucky draw shows the other members in the group and allows one draw per person while funds last.
- In a chat, open **Attachments → Red Packet** to create or share a packet. PIN confirmation posts a new packet to that conversation and plays the send animation. Wallet and History entry points offer chat, link, and QR sharing after confirmation.
- Verified users who need wallet activation or reconnection enter the shared wallet screen. Completing it returns to the same Red Packet draft or incoming packet.
- The opening sequence lifts the envelope flap and card, plays the existing bills and coins burst, and counts up to the recorded payout in the result sheet. Reduced motion shows the settled result directly.
- **Say thanks** drafts a message in the originating chat when available. **Send one back** starts a new packet for an available conversation with the sender. Completed Random and Lucky draw packets use the winner recap, while Equal split uses a neutral summary.
- The form shows the amount input and the YouWallet balance in RM. **Change** opens the wallet picker. YouWallet funds Red Packets, and connected wallets appear as unavailable in the picker. Random distributes its configured total across the chosen slots. The compact leftover-money row opens the expiry controls and shows the applicable refund timing.
- **Write a message** opens an optional editor with a live 50-character count. **Done** keeps the note visible in the form, and **Edit message** reopens it. Choosing a preset replaces the current note.

### November 20 browser verification

Passed the Chrome prototype suite through `/mock-design/` on Windows at desktop widths and at 390, 375, and 320 px. The suite exercised all five themes, the three mode layouts, custom messaging, both expiry units, the PIN summary, delivery to a group chat, repeat-claim protection, a cancellation refund, and reduced-motion opening. It also checked the invalid, expired, and fully claimed receive screens. The 390 px Random creation and receive captures were compared with the supplied reference.

The Leftover money summary fit at 390, 375, and 320 px. At 390 px, **Change → Top up YouWallet → Back** returned to the open chat draft, and the theme preview respected reduced motion.

The custom message editor was exercised from Lara's chat in Chrome on Windows. In emulated dark appearance at 390, 375, and 320 px, the light field, focus ring, and 50-character limit held. Editing in the middle of the note kept the caret in place. Closing and reopening preserved the draft. Choosing a preset replaced it.

Desktop Chrome verified Back to chat from activation, YouWallet OTP activation returning to the sender draft, and PIN reconnection returning to the same incoming packet. At 390 px, the simulated external-wallet activation also returned to the sender draft.

## Prototype and QA

Open **Red Packet → Create → Lucky draw**. To test as a recipient, open **Lucky draw from Lara** or the **Try your luck!** card in Lara's chat. Use **KYC Approved** and **Wallet Active**.

| Scenario | Chrome result |
| --- | --- |
| Send a 100 MYRT Lucky draw with a custom duration of 2 hours | Passed. The form has no recipient count field. The duration appears on the PIN screen and is saved. The MYRT balance decreases by 100. |
| Open a new form and claim Lara's card with the lowest possible draw | Passed. Lucky draw is the first option and selected by default. The minimum prize is 1 MYRT. Opening the card again adds no credit. |
| Draw a prize and draw again to exhaust the budget | Passed. The balance, remaining budget, number of openings, and Luckiest badge update. |
| Win the minimum prize and leave less than 1 MYRT in the budget | Passed. The minimum prize is 1 MYRT, and the remainder below the minimum is returned once. |
| Cancel before any claims and let a partially paid packet expire | Passed. The refund matches the remaining budget. Rendering again does not issue a second refund. |
| Equal split of 5 MYRT × 6 and Random with 5 MYRT for 6 people | Passed. Equal split distributes 30 MYRT. The Random validation rejects the entered amount. |
| 375 px viewport | Passed. All three options are tappable. Lucky draw has no recipient count field. |
| Compact stepper on desktop and at 375 px and 320 px | Passed. The plus and minus buttons have 44 px tap targets. Manual entry and validation messages remain usable. |
| Publish custom rates and reopen the browser | Passed. The editor rejects a total of 101%, shows a mean prize of 1.25 MYRT with a 75% chance of 1 MYRT and a 25% chance of 2 MYRT, and saves the new version. |
| Create packets before and after changing the rates | Passed. The first packet keeps version 1 and its 10 MYRT maximum. The second packet uses version 2 and its 2 MYRT maximum. |
| Make two quick successive requests to open a packet with 4.20 MYRT remaining | Passed. The highest available prize is 4 MYRT. The account gets one payout, and the packet closes with 0.20 MYRT remaining. |

## Prize distribution and admin panel

Feedback from YY via Cing on November 19, 2026. With default rates, a 100 MYRT budget and 10 openings yield an average prize of 5.50 MYRT per opening and an expected payout of 55 MYRT. The chance that all ten openings yield 10 MYRT is `0.1^10`, or 1 in 10 billion. There is no recipient cap while the budget can cover a prize and the packet is active.

In the prototype panel, open **Quick scenario → Lucky draw rates**. Admins can set the maximum amount and the probability of each prize, review the average prize, and select **Publish rates**. Probabilities must total 100%, and the table must include a 1 MYRT prize. The panel shows version history. The browser stores published rates, and each packet saves the version and its table at creation.

## Handoff decisions

- The minimum prize is set to 1 MYRT. The default distribution and manually configured rates are available in the prototype for review before handoff.
- The production engine needs to enforce one claim per account and handle expiry checks, draws, budget debits, credits, and refunds on the server. The prototype keeps data in the browser session, schedules expiry, and checks elapsed packets again before a claim. The wallet reads the resulting balance movements. iOS and Android builds are untested.
