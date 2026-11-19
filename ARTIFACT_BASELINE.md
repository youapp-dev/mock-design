# YouApp Claude artifact baseline

Canonical reference: <https://claude.ai/artifact/QVfDBhiCej2mLPa8gDyXYE>

Baseline captured: 2026-11-19

This repository is the working source from this point forward. The Claude
artifact is a frozen visual and behavior benchmark, not a second place to make
changes.

## Canonical startup

- The shell opens the YouApp 3.0 renderer.
- The entry flow progresses from Splash to Welcome.
- `Start over` returns to the same 3.0 entry flow.
- Wallet 2.0 is opened only for routes that were redesigned there.

## Canonical scenario state

- Identity: Approved
- Wallet: Active
- Host: Approved
- Tier: SVIP
- VIP end date: In 3 days
- Referrer: Scarlette
- First payment: Done
- Fee phase: Phase 2

The benchmark revision is stored in `youapp-artifact-benchmark`. When the
revision changes, `index.html` migrates the two renderer stores once so stale
browser data cannot change the initial state.

## Route ownership

| Area | Latest renderer |
| --- | --- |
| Entry, onboarding, Discover, Feed, Locals, chat, Settings, profile, Red Packet, activities | YouApp 3.0 (`app30.html`) |
| YouPage wallet views, account tiers, Scan to Pay, bills, referral/rewards, wallet Host tab, wallet Top Up | Wallet 2.0 (`wallet2.html`) |
| Cross-renderer routing, shared scenarios and embedded forms | Shell (`index.html`) |

## Regression checklist

- Initial load and browser refresh show the 3.0 entry flow.
- After the splash timeout, Welcome is visible.
- `Start over` produces the same result as a clean initial load.
- The outer scenario panel shows the canonical selections above.
- Switching to a Wallet 2.0 route preserves identity, wallet and host state.
- Back from a Wallet 2.0 route returns to the correct 3.0 screen.
- `Reset everything` restores this benchmark rather than legacy defaults.
- Direct changes persist until the benchmark revision changes or Reset is used.

