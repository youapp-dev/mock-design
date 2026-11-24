# YouApp prototype architecture

Run the prototype through `index.html` on a static HTTP server. The GitHub Pages entry point at `/mock-design/` redirects to the default version at `/mock-design/3.2.0/`, preserving query parameters and fragments. The [3.2.0 shell](../3.2.0/index.html) opens the App 3.0 and Wallet 2.0 pages under `prototype/`. The [3.3.0 shell](../3.3.0/index.html) preserves Trips and Inbox. The 3.2.0 shell selects the original Locals messaging flow through the App 3.0 iframe URL. Both shells resolve shared scripts and renderer URLs from the repository base. The Version section above Jump to in the main controls and both screen scenario helpers switches the whole prototype between versions. Each renderer resolves its own scripts and assets relative to its HTML document.

## Ownership

| Area | Start here | Contract |
| --- | --- | --- |
| Startup and demo scenarios | [`prototype/benchmark.js`](../prototype/benchmark.js), [`prototype/shell.js`](../prototype/shell.js) | The benchmark seeds the existing browser keys once per revision. The shell coordinates scenario selections, iframe readiness, and Reset. |
| Navigation | [`prototype/routes.js`](../prototype/routes.js), [`prototype/shell.js`](../prototype/shell.js) | The route table covers the scenario panel and `?app=app30&jump=…` links. Renderer-specific entry actions register with `appEntryRoutes` or `walletEntryRoutes`. `__bridge` forwards in-app transitions and Back between frames. |
| App 3.0 | [`prototype/app30/runtime.js`](../prototype/app30/runtime.js) | Owns the main app runtime, including startup, Discover, onboarding, user profile, and the original app views. [Groups](../prototype/features/group-chat/groups.js), [messaging](../prototype/features/group-chat/messaging.js), and [Activities](../prototype/features/activities/activities.js) extend that runtime through its existing actions and views. |
| Red Packet | [`prototype/features/red-packet/store.js`](../prototype/features/red-packet/store.js), [`prototype/features/red-packet/screens.js`](../prototype/features/red-packet/screens.js) | The store owns packet creation, claims, expiry, refunds, and wallet movements in cents. The screens own forms, PIN and chat integration, and demo fixtures. [rates](../prototype/features/red-packet/rates.js) owns prize rate validation and snapshots. |
| Wallet 2.0 | [`prototype/wallet2/`](../prototype/wallet2/), [reference UI](../prototype/wallet2/reference/ui.js) | Wallet 2.0 owns the payment and wallet routes, plans, rewards, billing, and account settings used by the current prototype. The wallet reference layer owns the current reference-driven screens and interactions it overrides. Its generated frames come from [`tools/import-wallet-reference.cjs`](../tools/import-wallet-reference.cjs). |
| Transaction motion | [Shared presentation](../prototype/transaction-motion.js) | Both renderers use one full-screen view for the transaction lifecycle. The view changes artwork and progress in place using the existing Figma 3.1 assets. Transaction state and receipt actions stay with their existing renderer. Reduced motion uses a static status. |
| Forms | [standalone forms](../prototype/forms/index.html), [`prototype/forms-webview.js`](../prototype/forms-webview.js) | Forms owns field validation and submission. The shell embeds the form and applies its submission result to the Wallet 2.0 demo scenario. |
| Design system | [`design-system/`](../design-system/) | Owns tokens, component bundles, and brand assets. |

## Integration rules

- Register a new scenario panel route with its owning renderer. Add a shell route mapping when the entry needs a Wallet 2.0 screen, an alias, or a specific destination for Back.
- Keep renderer script order explicit. Existing view, overlay, and action extensions still compose in that order. When replacing an extension, verify the entry points it shares with other features before retiring it.
- Red Packet writes each wallet movement when a transition succeeds. Wallet 2.0 reads the base balance and the committed delta through the shell. Scheduled expiry refreshes the active wallet if the refund changed its balance. Movement data is a browser-session simulation.
- Keep product decisions and handoff rules in the feature specs. See the [artifact baseline](../ARTIFACT_BASELINE.md) for startup and scenario decisions and the [Lucky draw spec](features/red-packet-lucky-draw.md) for claim and payout rules.

## Transaction presentation QA

Local Windows Chrome at 430 px (3.2.0), 320 px (3.3.0), and 375 px with reduced motion (3.3.0) passed the Scan to Pay progress, pending, success, failure, retry, and receipt checks. Each transaction screen showed one full-screen artwork slot with the heading and actions inside the viewport. Bill payment, card top-up, and membership presentation were also exercised. Scan to Pay success was visually checked against the available Malaysia Figma frame at phone size. Current Figma export limits prevented a fresh export and a frame-by-frame comparison across country variants.

## Regression checks

Run `node tools/qa-wallet-reference.cjs` with Node.js and Chrome. The optional first argument is the Chrome executable path. The harness serves `/mock-design/` locally, exercises the shell and both renderers, and saves wallet screenshots to the output directory it prints.

- Desktop checks cover Splash and Welcome, Start over, refresh, Reset, direct links, and Back across renderers. They also cover group voice playback and scroll, video calls, Activity entry points, Red Packet send, claim, and refund, and the wallet flows.
- The 375 px checks cover wallet controls, scrolling and selecting Top up currencies, and opening Settings from the scenario panel. The harness also switches between the standalone Elite and Merchant forms.
- The refactor branch starts at `4d300b3`, the pre-refactor revision used to check the moved HTML styles and the wallet baseline.
