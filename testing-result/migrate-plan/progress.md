# Migration comparison progress

Inventory started on 2026-11-25. The user directs scope and account access. Product and design decisions that affect implementation remain open until the responsible owner confirms them.

| Step | Status | Evidence or remaining work |
| --- | --- | --- |
| Identify comparison baselines | Complete | The root HTML entry opens 3.2.0. The version selector also exposes 3.3.0. The running Android package is 3.1.0 staging, version code 280. |
| Enumerate prototype screens | In progress | Both browser renderer registries are recorded. Resolve cross-renderer duplicates, unreachable or placeholder views, in-view full-screen steps, and embedded forms through normal navigation. |
| Enumerate Android screens | In progress | 23 full-screen destinations verified so far. The verified account opened wallet history, receipt, bank list, balance, currency details, wallet provider selection, Top Up, search, and Rewards. |
| Map screens | In progress | First observed pairs are in the inventory. Trace by task and entry path, including Back behavior and access gates. Record a source-only candidate separately until exercised on this build. |
| Compare visual and interaction details | Pending | After mapping, test matching account, content, language, and viewport conditions. Record text, typography, padding, spacing, illustration, icons, and interaction differences with evidence. |

## Access and completion

- Signed in with the user-approved new staging account. Created the profile with the display name YouApp HTML Test and skipped the optional date of birth, gender, and referrer steps. Then logged out through Settings and signed into the user-approved existing staging account. The emulator is on Rewards.
- The existing account passed the identity gate and reached Reconnect Wallet. Tapping Reconnect Wallet displayed ?Wallet connection isn't available in this build yet.? No email code prompt appeared. After returning to YouPage, the balance and wallet actions became available. The reconnect action and downstream transaction completion remain unverified.
- Continue with chat access, activity and merchant details, and the remaining account actions. Finish the inventory by walking each available flow and reconciling route IDs with distinct product destinations. Record each remaining gate with the screen and access condition.
- Report the installed build and source revision independently. The current checkout has not been tied to the installed APK.

See [the inventory](page-inventory.md), [prototype routing](../../docs/prototype-architecture.md), and [the version decision](../../docs/features/trips.md).
