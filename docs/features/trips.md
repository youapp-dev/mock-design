# Trips tab (was Locals)

Source: the "YouApp Trips tab" design board (31 screens). Prototype code: [`prototype/features/trips/`](../../prototype/features/trips/) — `trips.js` (Phases 1–2 and shared helpers), `trips-stops.js` (Phase 3), `trips-plans.js` (Phase 4), `trips-board.js` (Phase 5), `trips.css`, `art.js`.

## Status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Locals → Trips, Trips header, Inbox top right | Done (23 Nov 2026) |
| 2 | Trips list, Add a trip (4 steps), trip page | Done (23 Nov 2026) |
| 3 | Trip page content: stops, stays, places, people, Edit, Photos, transport variants | Done (23 Nov 2026) |
| 4 | Plans: list, detail, Join, plan chat, Start a plan | Done (23 Nov 2026) |
| 5 | Leaderboard, share card, scenario toggles, full QA | Done (23 Nov 2026) |

## Phase 1 behavior

- The bottom tab reads **Trips** with a globe icon. The internal route stays `locals`, so the gate, guest and panel logic keep working.
- Trips header: avatar (YouPage), **Trips | Leaderboard** toggle, Inbox icon with an unread badge (unread chats + announcements, 0 when Content is empty).
- The Inbox icon opens the old chat list titled **Inbox** with a Back button. Bottom nav stays on Trips. Back from a chat returns to Inbox, then to Trips.
- The "Liked people" heart is removed.
- Unverified users still get Badge Verification on the tab; **Maybe later** and approval both continue to Trips. Guests get the login page titled Trips.
- The Discover top tab named **Locals** is unchanged.
- Control panel: **Trips** and **Inbox** jump buttons; the Group chats scenario opens Inbox › Group.

## Phase 2 behavior

- **Stats** count past trips only. Cities and countries count once. Miles are great-circle distances between consecutive stops, starting from home. The rank chip comes from the Friends · Cities leaderboard.
- **Coming up** cards show the route map, stops, miles and days to go. **Past trips** show three photos, who went and the photo count. **See all** lists every past trip.
- **Empty state** (Content = empty): zero stats, "Where to next?" and Add a trip.
- **Add a trip** has four steps with a step bar:
  1. Where: From starts at the home city (tap to change: Kuala Lumpur, Singapore, Penang). Search the destination; every result shows its miles from From.
  2. How: Plane, Train, Bus, Car or Boat. Plane takes a flight number + date and fills airline, airports, times and duration (mock lookup; the same number flies every day). No flight number → pick dates instead. Other modes need only the date here.
  3. Who: Add people on YouApp, Invite people not on YouApp (WhatsApp, counts as referral), or type a phone number to invite. Skip is allowed.
  4. Name and privacy: name (defaults to "{City} trip"), cover, Public or Private. **Create trip** opens the trip straight away.
- **Trip page**: route map with Back, Edit and Share; name, dates, stops, miles; who's on the trip with Private/Public; "Trip created" note after creating; **When are you coming back?** for coming-up trips without an end date; Itinerary / Photos / Plans tabs with empty states.
- Data is kept in memory for the session and resets on Start over.

## Phase 3 behavior (trip page)

- **Itinerary**: home, then each stop with its dates and miles for that leg (“from KL” for the first, “by plane / rail / road / sea” after). Under each stop: its stays (Add a stay), its places with photos and who was there (invited people tagged), and Add a place. The way back closes the list. **Add a stop** sits at the bottom.
- **Add a stop** (Next stop, Way back or Add a stop): From is the last stop; Way back preselects home. Plane takes a flight number + date (or pick dates). Train, bus and boat need the date; time and line/company are optional. Car needs the date; My car / Rental / Grab is optional. Non-plane modes show “About N h by rail · X mi”. The date can’t be before the previous stop. The way back sets the trip’s end date and removes “When are you coming back?”.
- **Add a stay**: search or name the hotel/Airbnb, check in and out (check out must be after check in), nights shown, existing stays listed. Only people on the trip see stays; never public.
- **Add a place**: search or name the place, day (time optional), photos, who was there from the people on the trip.
- **Add people**: people on YouApp are Added and must tap Join trip (Added → Joined). Contacts not on YouApp are Invited by WhatsApp with a ready message; it counts as a referral. Tap again to undo.
- **What a friend sees**: “Hafiz added you to Penang weekend” (card on Trips, or the panel). Join trip adds it to your Trips; Not me declines.
- **Edit trip**: name, From, each stop’s transport and stays, order (up/down arrows instead of drag), remove stops, people, privacy. Save keeps changes; closing with changes asks to discard; Delete trip asks to confirm.
- **Photos**: grouped by stop with counts; Add photos adds to the first stop.

## Phase 4 behavior (Plans)

- Trip › Plans: one-line explainer, Start a plan, stop chips, **Your plans** first, then **Near your hotel** (or Near you in {city}). Cards show type, time, place and distance, host and spots left; Join / Going / Full.
- A plan: host card, description, Going · n of N with empty slots, “Only ID-verified people can join. Public places only.” Join plan opens the plan chat.
- Plan chat: place and Directions pinned, messages, send.
- Start a plan: text (3+ characters), type (Food, Coffee, Drinks, Walk, Sport), day and time, where (near your hotel, anywhere, or a typed place), 2–12 people. Post plan opens it.
- Unverified users get Badge Verification before joining or starting; after approval they return to the plan.

## Phase 5 behavior (Leaderboard and sharing)

- Cities or Miles; Friends, Malaysia or Everyone; This year. Top 3 on a podium, then ranks 4–6; your row always shows (with “···” when you’re further down).
- Nudge: how your next trip moves you (e.g. “Your Japan winter trip will move you up to #9”).
- **Just you** (panel toggle): “You’re #1! …but only because you’re the only one here.” with an invite card.
- Share sheet (trip page share icon, Share your travels, Invite friends): card, youapp.me/{username} with Copy, the text, Share, referral note, and **See what friends get** (the link as a chat-app card).
- Control panel: **Trips** (Has trips / Empty), **Leaderboard** (With friends / Just you), and jumps to Add a trip, Trip page, Friend adds you, Leaderboard.

## Prototype limits

- Search results, hotels, places, plans, friends and leaderboard numbers are sample data. Flight lookup is simulated.
- Trips, plans and chats live in memory for the session and reset on Start over or reload.
- Map links, native share and the photo picker show a toast instead.
