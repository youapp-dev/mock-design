# PRD: Activity Flow Logic Update (Free Activity)

## 1. Overview

This PRD defines the behavior of **Activity** (formerly Experience) in the YouApp mobile app. An Activity is **free** and is different from a Service: a Service stays paid, is for Hosts only, and keeps the 30% fee. An Activity has no price, no payment, and no fee. People join an Activity by sending a request that the Activity owner approves, and every approved Activity gets its own group chat.

**Covered:**
- Where and who can create an Activity (entry point and gates).
- The 7-step Create Activity form and the submission flow.
- Activity statuses (In review, Live, Rejected, Ended) and the admin review.
- The automatic group of an Activity.
- Request to Join, My Activities, and the applicant list.
- Edit, leave, unlist, delete, and the locks during an active schedule.
- Navigation and naming (Discover tabs Hosts and Activities).

**Not covered (follow current system):**
- Service creation, Service booking, and the Service fee (unchanged).
- Group chat features not mentioned here (messages, media, permissions), which follow the Group Chat PRD.
- Review after completion (follows the existing review rules).
- Admin panel screens for approving Activities (admin approval already exists).

**Naming used in this PRD:**
- **Activity** replaces Experience in the app.
- **Owner** is the user who created the Activity.
- Discover tabs are **Hosts / Activities**. Cashback is not a Discover tab. Internal keys do not change.

**Supersedes:** where it conflicts with this PRD, the paid Experience logic in earlier PRDs (Reserve-and-Pay booking, the Price step in Create Experience, refund to Booking Wallet) no longer applies to Activity.

**Reference:** Logic Flow Activity V3 (prototype). Visual details and states follow Figma.

## 2. Problem Statement

- Experience flows were built for paid bookings, but Activity is free, so payment, price, fee, and refund logic do not apply.
- Owners need to decide who joins their Activity, because joining is free.
- Participants and the owner have no shared place to talk about an Activity.
- Actions such as leaving, unlisting, and deleting need clear rules while an Activity is running, so groups are not broken in the middle of a schedule.
- Activity and Service are mixed in naming and entry points, which confuses users.

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Separate free Activity from paid Service | No baseline data available, to be measured after release |
| Let owners approve who joins | No baseline data available, to be measured after release |
| Give every approved Activity a group chat | No baseline data available, to be measured after release |
| Keep groups stable during an active schedule | No baseline data available, to be measured after release |

## 4. User Stories

1. As a user with approved KYC, I want to create a free Activity, so that I can invite people to join.
2. As an Activity owner, I want to accept or reject join requests, so that I control who joins.
3. As a participant, I want to send a request to join with the number of people, so that the owner can approve us.
4. As a participant, I want to withdraw my pending request, so that I can free the spots if my plan changes.
5. As an accepted participant, I want to be in the Activity group chat automatically, so that I can talk to the owner and other participants.
6. As an owner, I want to unlist or delete my Activity when it is not running, so that I can manage my listings.
7. As an owner, I want to keep the group when I delete the Activity, so that the community can stay together.

## 5. App Flow

**Owner side**
1. Discover > Activities > **Manage Activity** (floating button) > My Activities > **Create Activity**.
2. Guest goes to login. Logged-in user without approved KYC sees **Verify your identity first**. User with approved KYC opens the form.
3. Fill the 7 steps and confirm on the last step. The Activity status becomes **In review**.
4. Admin approves: the Activity becomes **Live** and its group is created automatically. Admin rejects: the status becomes **Rejected**.
5. Owner reviews requests in the applicant list (New Request, Accepted, Rejected) and accepts or rejects them.
6. After the last session ends, the Activity becomes **Ended**.

**Participant side**
1. Open an Activity detail from Discover > Activities, Search, or the Media viewer.
2. Choose a session and the number of people, then tap the request button.
3. The request is sent to the owner and the button becomes **Request Sent**.
4. The owner accepts: the participant joins the group automatically. The owner rejects: nothing is added.
5. A pending participant can withdraw the request.

## 6. Functional Requirements & Acceptance Criteria

### 6.1 Access and Creation Entry
1. The only way to create an Activity is **Discover > Activities > Manage Activity > My Activities > Create Activity**.
2. The Create button on the Host dashboard is **Create Service**. It does not create Activities.
3. A Guest who taps Create Activity is taken to login (Guest Mode rules).
4. A logged-in user whose KYC is not approved sees the sheet **Verify your identity first** and is guided to Badge Verification.
5. A user whose KYC is approved opens the Create Activity form.
6. Creating an Activity does not require the Host role. A Service is still paid, only for Hosts, and keeps the 30% fee.

### 6.2 Create Activity Form
1. The form has 7 steps:
   - **Step 1:** Category and subcategory.
   - **Step 2:** Title (maximum 120 characters) and description (maximum 500 characters).
   - **Step 3:** Photos (minimum 3).
   - **Step 4:** Activities (1 to 5 items).
   - **Step 5:** Location.
   - **Step 6:** Schedule and sessions.
   - **Step 7:** Minimum and maximum participants.
2. Schedule and sessions: sessions cannot overlap and cannot start in the past.
3. Participants: the maximum can be turned off. An Activity without a maximum never becomes Fully Booked.
4. Category and subcategory options, the fields of each activity item, the limits of the location, and the minimum and maximum validation follow the current system.
5. There is **no** price step, payment, PIN, promo, fee, or draft.
6. Leaving the form at any step shows the modal **Leave without saving?**.
7. After the user confirms the last step, the Activity is submitted and its status becomes **In review**.

### 6.3 Status and Active Period
1. Status flow: Submit > **In review** > (Approve > **Live**) or (Reject > **Rejected**).
2. An Activity is active from the moment admin approves it until the end time of its last session. After that its status becomes **Ended**. This period is called the **active schedule** in this PRD.
3. An Activity that is **In review** or **Rejected** does not have a group yet.
4. An In review or Rejected Activity can be deleted without the group dialog.
5. Unlist and List again follow the rules in 6.8. An unlisted Activity keeps its group.

### 6.4 Activity Group
1. When admin approves an Activity, its group is created automatically.
2. The owner becomes the admin of the group.
3. The group name uses the prefix **`Activity:`** and the group bio links the group to the Activity.
4. When the owner accepts a request, the participant joins the group automatically.
5. A request that is pending or rejected does not add the participant to the group.
6. The group behaves as a group chat as defined in the Group Chat PRD, except for the rules in this PRD (6.7).

### 6.5 Activity Details and Request to Join
1. An Activity detail can be opened from Discover > Activities, Search, or the Media viewer.
2. The detail shows **Free · owner approves**. There is no payment.
3. The participant chooses a session and the number of people. The number cannot be more than the remaining slots of that session.
4. After the participant taps the request button, the request is sent directly to the owner and the button becomes **Request Sent**.
5. The request button is disabled when the Activity is Fully Booked, when the Activity is in another country, or when the participant has already sent a request.
6. A participant with a pending request can **withdraw** it. The spots are released.
7. Joining requires login. A Guest who taps the request button goes to login (Guest Mode rules).
8. The KYC gate only applies to creating an Activity. A participant who requests to join does not see a KYC gate.

### 6.6 My Activities
1. My Activities shows the Activities the user created and the requests the user sent.
2. The entry point is the **Manage Activity** floating button on Discover > Activities. It is shown to logged-in users, with or without the Host role, and hidden for Guests. It is not shown on the Hosts tab.
3. Create Activity is available from My Activities (6.1).

### 6.7 Applicant List, Capacity, and Group Rules
1. The owner's applicant list has the tabs **New Request**, **Accepted**, and **Rejected**.
2. Pending requests count toward the maximum number of participants. A rejected request releases the spots. No refund is needed because the Activity is free.
3. An accepted participant cannot be removed from the group by the owner.
4. **During the active schedule:**
   - A member cannot leave the group or cancel participation.
   - The owner cannot leave the group, delete the Activity, unlist it, or list it again.
   - These actions are shown dimmed and a reason is shown when the user taps them.
5. **After the last session ends:**
   - A member may leave the group.
   - The owner may leave the group. The admin role moves to the member who has been in the group the longest.
   - If the owner is the last member, the group is disbanded.

### 6.8 Edit, Unlist, and Delete
1. **Edit:** editing is locked during the active schedule if the Activity already has accepted participants. A saved change is sent back to admin review.
2. **Unlist:** unlisting does not delete or disconnect the group. The group stays active and connected. Unlist and List again are not available during the active schedule (6.7).
3. **Delete:** Delete is only available outside the active schedule.
   - Activity without a group (In review or Rejected): a normal delete confirmation.
   - Activity with a group: a dialog with three options: **Delete activity and group**, **Delete activity, keep the group**, and **Cancel**.
4. If the group is kept: the `Activity:` prefix and the Activity link are removed from the group, and a system message explains that the group becomes a regular group.

### 6.9 Navigation and Naming
1. The Discover tabs at the top of the screen are **Hosts / Activities**. Cashback is not a Discover tab. Internal keys do not change.
2. The bottom navigation and the chat list title follow the Trips spec (**Trips** tab, **Inbox** title).
3. "Experience" is replaced by "Activity" in the app (menus, buttons, and statuses).
4. Review after the Activity is completed follows the existing review rules.

### 6.10 Wording

| Type | Title | Wording | Behavior |
|---|---|---|---|
| Sheet | Verify your identity first | Verify your identity to create an Activity. ⚠️ | Leads to Badge Verification |
| Modal | Leave without saving? | Your changes will be lost if you leave now. ⚠️ | Leave / Stay |
| Label | Detail | Free · owner approves | Shown on the Activity detail |
| Button | Request | Request Sent | Disabled after a request is sent |
| Error | Number of people ⚠️ | Only {n} spots left for this session. | Under the people selector |
| Modal ⚠️ | Withdraw request? | Your request will be cancelled and the spots will be released. | Withdraw / Cancel |
| Text ⚠️ | Locked action | This action is not available while the Activity is running. | Shown when a dimmed action is tapped |
| Dialog | Delete Activity | Delete activity and group / Delete activity, keep the group / Cancel | Only for an Activity with a group |
| System message ⚠️ | Group kept | This group is no longer linked to an Activity and is now a regular group. | Shown in the group |
| Name | Group name | Activity: {Activity title} | Created on approval |
| Button | Floating button | Manage Activity | Discover > Activities, logged-in users only. Opens My Activities |

Wording marked ⚠️ was written by Claude for review. Wording for other languages follows Google Translate until localization is final.

### 6.11 Behavior Retention and Platform Coverage
- Service remains paid, Host-only, with the 30% fee. Service booking, Service Plans, and Host Earnings do not change.
- Group chat features (messages, media, voice notes, pin, group info, permissions) follow the Group Chat PRD. The leave, removal, and owner rules in 6.7 apply to Activity groups.
- Admin review of Activities, categories, and the Guest Mode login rules follow the current system.
- Platforms: iOS and Android (including Huawei builds).

## 7. Edge Cases

| # | Scenario | Expected Behavior |
|---|---|---|
| 1 | No internet during create, submit, request, or withdraw | Error toast, input is kept, the user can retry |
| 2 | Force Update is active | Force Update flow takes priority |
| 3 | Long text or Chinese text in titles, descriptions, and buttons | Wrap or truncate as defined in Figma |
| 4 | Keyboard covers the input or the Continue button | The screen scrolls so the field and button stay visible |
| 5 | Guest taps Create Activity or the request button | Login (Guest Mode rules), the action is not resumed after login |
| 6 | User with KYC not approved taps Create Activity | "Verify your identity first" sheet |
| 7 | User without the Host role creates an Activity | Allowed when KYC is approved |
| 8 | The user leaves the form in the middle | "Leave without saving?" and nothing is saved |
| 9 | A session overlaps another session, or starts in the past | The step cannot be completed |
| 10 | The owner turns off the maximum participants | The Activity never becomes Fully Booked |
| 11 | The number of people is more than the remaining slots | The user cannot select it |
| 12 | The session becomes Fully Booked while the participant is choosing | The request is not sent and the participant sees an error |
| 13 | A participant sends a second request after one is already sent | The button is disabled (Request Sent) |
| 14 | A pending applicant withdraws | The request is cancelled and the spots are released |
| 15 | The Activity is in another country | The request button is disabled |
| 16 | The owner rejects a request | The participant is not added to the group and no refund is needed |
| 17 | The owner accepts a request | The participant joins the group automatically |
| 18 | Pending requests reach the maximum | The session is counted as Fully Booked. Only a reject releases the spots |
| 19 | The owner tries to remove an accepted participant from the group | Not allowed |
| 20 | A member or the owner taps a locked action during the active schedule | The action is dimmed and the reason is shown |
| 21 | Edit when the Activity has accepted participants during the active schedule | Locked |
| 22 | Edit saved on a Live Activity without accepted participants | The change goes back to admin review |
| 23 | Admin rejects an Activity | Status Rejected, no group, can be deleted without the group dialog |
| 24 | The last session ends | The Activity becomes Ended and members can leave |
| 25 | The owner leaves after the last session | The admin role moves to the member who has been in the group the longest |
| 26 | The owner is the last member and leaves | The group is disbanded |
| 27 | Delete an Activity with a group outside the active schedule | Three options: delete both, delete the Activity and keep the group, cancel |
| 28 | The group is kept after delete | The prefix and the Activity link are removed and a system message is shown |
| 29 | Unlist an Activity that has a group | The group stays active and connected |
| 30 | Guest opens Discover > Activities | The Manage Activity button is hidden |
| 31 | The Manage Activity button overlaps the last card | The list has enough bottom space that the last card stays fully visible |

## 8. Open Items

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Keep or remove the My Activities row on the You page now that Manage Activity is the entry point | Product | Open |
