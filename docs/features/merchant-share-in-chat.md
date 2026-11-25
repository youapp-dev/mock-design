# Merchant Sharing in Chat

Status &nbsp; Prototype verified. Native and service implementation pending.\
Decision owner &nbsp; Merchant and Chat product owners for native handoff.

## Scope and entry points

- Open **Discover → Merchants → Kedai Kopi Lima → Share**, select one or more people, and tap Send. A single selection opens the direct chat immediately. Multiple selections receive one card each, and the first selected chat opens. Blocked contacts are excluded.
- Open **Locals → Group → YouApp Merchants** in 3.2.0 or **Inbox → Group → YouApp Merchants** in 3.3.0. Scroll through the seeded cards to inspect each state.
- The same card renders in direct and group conversations, using the chat’s sender, timestamp, and delivery patterns. Selecting **View merchant** opens the listing. Back returns to the conversation.

## Card examples

| State | Example | Expected behavior |
| --- | --- | --- |
| With cashback | Kedai Kopi Lima | Shows 5% cashback and opens the listing. |
| Standard listing | Mak Cik Noodle House | Shows merchant details without an offer. |
| Closed now | Lane Studio Salon | Shows the closed status. The listing can still open. |
| No photo | Bangsar Bread Co. | Shows a location icon in place of the photo. |
| Unrated | Boba Lab | Shows “No ratings yet.” |
| Unavailable | Thread & Co. | Keeps the merchant name and shows an unavailable message. The card has no navigation action. |
| Sent | Dim Sum Garden | Shows the outgoing card with the chat’s sent indicator. |
| Sending | Kedai Kopi Lima | Shows the outgoing card with the chat’s pending indicator. |
| Failed | Bangsar Bread Co. | Shows the standard retry action. Retry reuses the message. |

## Implementation and QA

The browser prototype stores a merchant ID and a display snapshot with the message. The snapshot provides the name, category, location, image reference, rating, review count, and cashback. The current merchant record determines whether the listing is available and whether it is closed. Native teams still need to confirm the message and merchant service contracts, snapshot freshness, and delivery reconciliation.

| ID | Scenario | Expected result | Environment and result |
| --- | --- | --- | --- |
| AC-01 | Share Kedai Kopi Lima with Aaron Lim and Lara. | Opens Aaron’s chat, creates one card in each chat, and excludes blocked contacts. | Passed in Chrome on Windows. |
| AC-02 | Open a merchant from a chat card, then tap Back. | Opens the selected listing and returns to the same chat. | Passed in Chrome on Windows. |
| AC-03 | Open YouApp Merchants and inspect its nine cards. Retry the failed outgoing card. | All variants render. An unavailable card cannot open, and retry updates the outgoing message. | Passed in Chrome on Windows. |

The browser checks covered 390 px in 3.2.0 and 3.3.0 and 320 px in 3.3.0. Chat sends and retries are simulated. Native iOS and Android are untested.
