# PRD · YouApp V2: Elite 1/2/3

<aside>
📌

**Status:** Draft · **Version:** V2 · **Date:** November 12, 2026 · **Owner:** Maul
**Rule sources:** Superhost rules for tech v1 · Fee simulation, Phase 1 vs Phase 2 v1 (26 Oct 2026)
**Compared with:** YouApp Full Flow (Client) build, 29 Oct 2026 · [YouApp Full Flow (V2) prototype](https://claude.ai/artifact/QVfDBhiCej2mLPa8gDyXYE)

</aside>

## 1. Overview

- **Goal:** V2 follows the Superhost rules and the Fee simulation docs for fees, referral rewards, Elite levels and merchant cashback.
- **Naming:** the docs say Superhost and Ultrahost 1 / 2 / 3. The app says **Elite** and **Elite 1 / 2 / 3**.
- **Phase:** the docs use Phase 1 / 2 as business phases. The prototype’s old Phase 1–4 are renamed **Release 1–4**, and a new **Fee phase** switch controls Phase 1 / 2.

### Glossary

- **Volume:** settled payments by the host, their referrals and their referrals’ referrals. Settled only.
- **Fee phase:** Phase 1 = Elite only. Phase 2 adds Elite 1–3, own fee rebate and the Transaction pool. Phase 2 removes nothing.
- **Own fee rebate:** part of the payment fee given back to Elite 1–3 on their own payments (Phase 2).
- **Scheme pools:** Cashback pool and Transaction pool. Locked, display only.

## 2. Status summary

| Aligned | Partly | Still open | Backend only |
| --- | --- | --- | --- |
| 15 | 1 | 3 | 1 |
- **Aligned:** V2 matches the docs.
- **Partly:** copy matches, prototype behaviour does not yet.
- **Still open:** needs a business decision.
- **Backend only:** not shown to users.

## 3. Fees & tiers

| Item | Fee docs | Before (Client, 29 Oct) | V2 now | Status |
| --- | --- | --- | --- | --- |
| Payment fee by tier | Free 2.00% · VIP 1.85% · SVIP/hosts 1.70%; min RM1.50 Free & VIP | Same | Same | Aligned |
| Gas fee | No gas line (Phase 2: 0) | RM1.00 on Scan to Pay | Removed from Scan to Pay; Send MYRT keeps on-chain network gas | Aligned |
| “Phase” meaning | Phase 1 / 2 = business phases | Phase 1–4 = release phases | Renamed Release 1–4 + new Fee phase switch | Aligned |
| SVIP price | RM1,200 once | RM1,888 (until 31 Dec 2026) → RM8,888 | Unchanged, flagged in spec notes | Still open |
| Gateway cost & mgmt share | P1 1.1% → 0.75% after RM1M · P2 RM0.14 flat | Not modelled | Not modelled (not user-facing) | Backend only |

### Rules

- Payment fee follows the payer’s tier: Free 2.00%, VIP 1.85%, SVIP 1.70%.
- Minimum fee RM1.50 applies to Free and VIP only. SVIP and Elite have no minimum fee.
- No Gas Fee row on Scan to Pay confirm, Paid receipt or share card, for every user.
- Send MYRT keeps its on-chain network gas. It is a network fee, not the payment fee.
- Gateway cost and management share stay in the backend and are never shown in the app.

### Acceptance criteria

- **Given** a Free user paying RM20, **then** the fee is RM1.50 (minimum) and no Gas Fee row is shown.
- **Given** an SVIP user paying RM100, **then** the fee is RM1.70 and the total is RM101.70.
- **Given** Fee phase 1, **then** no Elite 1–3 level and no rebate appear anywhere.

## 4. Referral, bonus & rebate

| Item | Fee docs | Before (Client, 29 Oct) | V2 now | Status |
| --- | --- | --- | --- | --- |
| Referral reward (direct referrals) | 0.20 / 0.30 / 0.40% by referrer tier | Same | Same | Aligned |
| Elite bonus (referrals’ referrals) | By level 0.10 / 0.10 / 0.20 / 0.30% | Flat 0.1% | By level on Elite page, Rewards, benefits | Aligned |
| Own fee rebate | Level 1–3: 0.10 / 0.20 / 0.30% (Phase 2) | None | Rebate row on Confirm, receipt, share card | Aligned |
| Reversals | Claw back reward, bonus, cashback shares | Not shown | Not shown yet | Still open |

### Rules

- Direct referral reward is paid at the referrer’s tier: Free 0.20%, VIP 0.30%, SVIP 0.40%.
- Elite bonus is paid only on payments made by the Elite’s referrals’ referrals, at the Elite’s level rate.
- Own fee rebate (Phase 2, Elite 1–3) is taken off the payment total and shown as its own row.
- Example: RM100 at Elite 2 = 100 + 1.70 fee − 0.20 rebate = **RM101.50**.

### Acceptance criteria

- **Given** an Elite 2 in Phase 2 paying RM100, **then** Confirm, receipt and share card all show the −RM0.20 rebate row and a RM101.50 total.
- **Given** a reward from an indirect referral, **then** the reward detail shows the level rate it was earned at.

## 5. Elite levels & lifecycle

| Item | Fee docs | Before (Client, 29 Oct) | V2 now | Status |
| --- | --- | --- | --- | --- |
| Naming | Superhost · Ultrahost 1 / 2 / 3 | Elite (one level) | Elite · Elite 1 / 2 / 3 | Aligned |
| Becoming Elite | Application, approval within 48h | 30 referrals + RM100K in 60 days, then WhatsApp Support | No minimum. Apply with the in-app form, review within 48h | Aligned |
| First 90 days | RM100K by day 90 or leave | No check | Progress bar + day-90 date | Aligned |
| Keeping the level | RM300K / RM5M / RM25M / RM150M in 365 days | 30 referrals + RM100K, rolling 60 days | Yearly target by level, new 365 days on each change | Aligned |
| Moving up (Phase 2) | Rolling 90-day RM500K / RM2M / RM15M | No levels | Next-level bar on Elite page | Aligned |
| Missing a target | Drop one level; Elite → earlier tier | Revoke → Free | Copy says drop one level / earlier tier; demo toggle still lands on Free | Partly |
| Volume definition | Host + referrals + theirs; settled only | Referrals + theirs | Rule shown on How Elite works | Aligned |

### Elite ladder

| Level | Phase | Move up at | Keep per year | Bonus | Own fee rebate |
| --- | --- | --- | --- | --- | --- |
| Elite | Phase 1 | Approval, then RM100K in 90 days | RM300K | 0.10% | 0% |
| Elite 1 | Phase 2 | RM500K rolling 90 days | RM5M | 0.10% | 0.10% |
| Elite 2 | Phase 2 | RM2M rolling 90 days | RM25M | 0.20% | 0.20% |
| Elite 3 | Phase 2 | RM15M rolling 90 days | RM150M | 0.30% | 0.30% |
- **Before:** one level · 30 referrals + RM100K every 60 days · flat 0.1% · revoke → Free.
- **V2 now:** four levels · 90 days, then yearly volume · bonus + rebate by level · miss = drop one level.

### Rules

1. User applies with the in-app form. No referral or volume minimum. Management approves or rejects within 48 hours.
2. On approval the user becomes an Elite.
3. First 90 days: reach RM100K volume. Miss → Elite ends and the user goes back to their earlier tier.
4. After day 90 the yearly target of the current level applies (RM300K / RM5M / RM25M / RM150M in 365 days).
5. Miss the yearly target → drop one level. An Elite who misses goes back to the earlier tier.
6. Move up (Phase 2 only) the day the rolling 90-day volume reaches the next threshold.
7. Every level change starts a new 365-day period.
8. Volume counts settled payments by the host, their referrals and their referrals’ referrals.

### Acceptance criteria

- **Given** a new Elite on day 30 below RM100K, **then** the Elite page shows the progress bar and the day-90 date.
- **Given** Phase 2 and an Elite 1, **then** the Elite page shows a next-level bar toward RM2M rolling 90 days.
- **Given** an Elite 2 misses RM25M in 365 days, **then** they become Elite 1 and a new 365 days starts.
- **Given** an Elite misses the target, **then** they go back to their earlier tier, not always Free (currently Partly: demo lands on Free).

## 6. Merchant cashback & pools

| Item | Fee docs | Before (Client, 29 Oct) | V2 now | Status |
| --- | --- | --- | --- | --- |
| Cashback split | Payer 35/40/45% · host 25% · pool 20% · YouApp rest | Same | Same | Aligned |
| Scheme pool | Two pools, locked, display only | One pool + Prize pool draw | Cashback pool + Transaction pool card (Prize pool kept) | Aligned |
| Shop not signed by a host | 25% stays with YouApp | Open question | Still listed as open in spec notes | Still open |
| Withdraw & float | Withdraw from RM100 · alert below 20% | Same (+ max RM1,000) | Same | Aligned |

### Rules

- Every claimed cashback splits: payer 35 / 40 / 45% by tier, signing host 25%, scheme pool 20%, YouApp the rest.
- Scheme pools card shows Cashback pool and Transaction pool. Both locked, display only. Prize pool stays.
- Transaction pool fills for Elite 1–3 only and shows Phase 2 until it opens.
- Merchant float: withdraw from RM100; alert when the float drops below 20%.

### Acceptance criteria

- **Given** an Elite opens the Elite page, **then** the Scheme pools card shows both pools as locked with no payout action.
- **Given** a merchant float below 20%, **then** the merchant and its host get an alert.

