# Service and Experience: chatting with the host

Status &nbsp; In Review\
Decision owner &nbsp; Maul\
PM, Designer, Engineering, QA &nbsp; Maul (PM and design), Mobile engineering, QA

## Idea and evidence

- **Source:** Maul, 27 Nov 2026: "remove prevent chat untuk flow service-experience. user bisa chat host."
- **Problem:** the booking chat for a service or experience showed a system message asking unverified users to verify ("Hi! Please verify your account to help make the meeting more trusted and secure"), with a Badge Verification button. It read as a block on talking to the host, even though typing was allowed.
- **Decision:** chatting with a host about a service or experience never asks for identity verification (KYC).

## Product definition

**Goal:** a guest can ask the host questions and coordinate a booking without being sent to verification first.

**Rules**

| # | Rule |
|---|---|
| R1 | The booking chat (service or experience) has no verification system message and no Badge Verification button, whatever the user's KYC status (Not started, Pending, Rejected, Approved). |
| R2 | The message box is always usable in a booking chat: text and send work for every KYC status. |
| R3 | Every entry point to the host chat opens the chat directly, with no verification gate: **Chat with Host** on the experience page (pending or accepted booking), **Chat** on the transaction detail, and **Chat** on the host's profile. |
| R4 | A guest who is not signed in still has to sign in first (sign-in sheet). Signing in is not KYC. |
| R5 | Other KYC rules are unchanged: paying for a reservation still needs approved KYC (Reserve › Badge Verification), and so do the Locals tab, creating a group, posting and Scan to Pay. |
| R6 | Blocking still wins: if the user blocked the host, the message box shows "You blocked [name]. Unblock to send messages." |

**Out of scope:** verification for hosts, the Locals tab gate, and the reservation payment gate.

## Design and implementation

- **Prototype:** [YouApp Full Flow (V2)](https://claude.ai/artifact/QVfDBhiCej2mLPa8gDyXYE). Book a service or experience, then open the chat from the transaction or with Chat with Host.
- **States:**
  - **Default:** booking card at the top, then "This conversation is about [title]", then the host's first message. No verification message.
  - **Offline:** the user can type and send. The message shows as failed and can be retried (same as other chats).
  - **Booking refunded or completed:** chat stays open. Completed experiences show the Give Review system message as before.
- **Existing chats:** bookings made before this change drop the verification message when the chat is shown, not only new bookings.

## Acceptance criteria and QA

| ID | Preconditions and steps | Expected result | Environment and revision or build | Result and evidence |
| --- | --- | --- | --- | --- |
| AC-01 | KYC Not started. Book a service, open its chat. | No verification message or Badge Verification button. Message box works. | Prototype, dev-claude 27 Nov | Pass (prototype; booking with an old verification message, which is hidden) |
| AC-02 | KYC Rejected. Open an experience booking chat with Chat with Host. | Chat opens directly; no verification message. | Prototype | Untested |
| AC-03 | KYC Pending. Open the host's profile, tap Chat. | Chat opens directly. | Prototype | Pass with KYC Not started; Pending untested |
| AC-04 | Not signed in. Tap Chat on a host's profile. | Sign-in sheet; after signing in, the chat opens with no KYC step. | Prototype | Untested |
| AC-05 | KYC Not started. Tap Reserve on a service and continue to payment. | Badge Verification page (unchanged). | Prototype | Untested |
| AC-06 | User blocked the host. Open the booking chat. | "You blocked [name]. Unblock to send messages." with Unblock. | Prototype | Untested |
| AC-07 | Offline. Send a message in a booking chat. | Message shows failed; retry works when back online. | Prototype | Untested |
| AC-08 (regression) | KYC Approved. Book, chat, complete the experience. | Give Review system message still appears. | Prototype | Untested |

**Risk areas for QA:** old bookings that already stored the verification message; the same chat opened from three entry points; KYC status changing while the chat is open.

## Decisions and open questions

| Date | Decision or question | Rationale or impact | Owner and follow-up |
| --- | --- | --- | --- |
| 27 Nov 2026 | No KYC check in the service and experience host chat. | Guests should be able to ask before booking and coordinate after; trust is handled by the payment gate and the host's verification. | Maul |
| 27 Nov 2026 | Should hosts be warned when the guest isn't verified (for example a small "Not verified" tag in the host's chat header)? | Keeps hosts informed without blocking the guest. | Maul to decide |
| 27 Nov 2026 | This PRD lives in the repo because the Notion PRD workspace was unavailable (payment issue) on 27 Nov. Copy it to PRD-ALL when access is back. | Keeps one source of truth. | Maul |
