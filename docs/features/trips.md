# Trips tab (was Locals)

Source: the "YouApp Trips tab" design board (31 screens). Prototype code: [`prototype/features/trips/`](../../prototype/features/trips/).

## Status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Locals → Trips, Trips header, Inbox top right | Done (23 Nov 2026) |
| 2 | Trips list, Add a trip (4 steps), trip page | Done (23 Nov 2026) |
| 3 | Trip page content: stops, stays, places, people, Edit, Photos, transport variants | Not started |
| 4 | Plans: list, detail, Join, plan chat, Start a plan | Not started |
| 5 | Leaderboard, share card, scenario toggles, full QA | Not started |

## Phase 1 behavior

- The bottom tab reads **Trips** with a globe icon. The internal route stays `locals`, so the gate, guest and panel logic keep working.
- Trips header: avatar (YouPage), **Trips | Leaderboard** toggle, Inbox icon with an unread badge (unread chats + announcements, 0 when Content is empty).
- The Inbox icon opens the old chat list titled **Inbox** with a Back button. Bottom nav stays on Trips. Back from a chat returns to Inbox, then to Trips.
- The "Liked people" heart is removed.
- Unverified users still get Badge Verification on the tab; **Maybe later** and approval both continue to Trips. Guests get the login page titled Trips.
- The Discover top tab named **Locals** is unchanged.
- Control panel: **Trips** and **Inbox** jump buttons; the Group chats scenario opens Inbox › Group.

## Phase 2 behavior

- **Stats** count past trips only. Cities and countries count once. Miles are great-circle distances between consecutive stops, starting from home. The "#12 among your friends" rank is demo text until the Leaderboard exists.
- **Coming up** cards show the route map, stops, miles and days to go. **Past trips** show three photos, who went and the photo count. **See all** lists every past trip.
- **Empty state** (Content = empty): zero stats, "Where to next?" and Add a trip.
- **Add a trip** has four steps with a step bar:
  1. Where: From starts at the home city (tap to change: Kuala Lumpur, Singapore, Penang). Search the destination; every result shows its miles from From.
  2. How: Plane, Train, Bus, Car or Boat. Plane takes a flight number + date and fills airline, airports, times and duration (mock lookup; the same number flies every day). No flight number → pick dates instead. Other modes need only the date here.
  3. Who: Add people on YouApp, Invite people not on YouApp (WhatsApp, counts as referral), or type a phone number to invite. Skip is allowed.
  4. Name and privacy: name (defaults to "{City} trip"), cover, Public or Private. **Create trip** opens the trip straight away.
- **Trip page**: route map with Back, Edit and Share; name, dates, stops, miles; who's on the trip with Private/Public; "Trip created" note after creating; **When are you coming back?** for coming-up trips without an end date; Itinerary / Photos / Plans tabs with empty states.
- Data is kept in memory for the session and resets on Start over.

## Not yet built (later phases)

Edit trip, Add people, Next stop / Way back, stays, places, photo upload, plans and sharing show a toast naming the phase they arrive in.
