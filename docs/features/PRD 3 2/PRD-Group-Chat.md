# PRD: Group Chat

## 1. Overview

This PRD defines Group Chat in the YouApp mobile app: creating a group, chatting in a group, managing members and roles, group permissions, inviting people through a link, and leaving, removing, or disbanding a group.

Covered:

- Chat list tabs (All, Host, Group) and the Group list.
- Who can create a group, and the Create Group flow.
- Group chat room (messages, system messages).
- Group Info page for Owner, Admin, and Member (Members, Media, Files).
- Roles and capabilities: Owner, Admin, Member.
- Group permissions, Edit Group, Add Members, Promote and Demote, Remove from Group.
- Leave Group (with ownership transfer) and Disband Group.
- Chat list states after leaving, being removed, or disbanding.
- Invite link: Share, Join Group sheet in the app, and the invite landing page on the website.

Not covered (follow current system):

- Friend list logic (who appears and how search works).
- Direct message (DM) permission logic.
- Voice note, pin, reply, and delete behavior. These are defined in the Voice Note in Chat and Pin Message in Chat PRDs and reused in groups.
- Mute, search inside a group, mentions, invite link reset or revoke, and ban list. These are not part of this release.

Naming used in this PRD:

- “Owner” is the group creator (shown as the Owner tag in Figma).
- “Group tab” is the new tab in the chat list.
- Chat list tabs All | Host | Group replace Personal | Service | Experience.

Related PRDs: Locals Chat Additions, Voice Note in Chat, Pin Message in Chat, Other Profile, Guest Mode, Onboarding Profile Picture Crop (reused for the group photo).

Figma: Group chat flow (Create Group, Chat Group, Group as Owner, Group as Admin, Group as Member, Share Group Chat, Join Group Web, No Profile Picture, Exit Member). Visual details and states follow Figma.

## 2. Problem Statement

- Users can only chat 1:1. There is no place for a host, an Elite, or a community to talk with many people at once.
- Hosts and Elites cannot gather their guests or referred friends in one conversation.
- There is no way to invite people to a conversation with a shareable link.
- There are no roles, so nobody can moderate a shared conversation.

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Let Hosts and Elites create group conversations | No baseline data available, to be measured after release |
| Let people join a group easily through an invite link | No baseline data available, to be measured after release |
| Give group owners and admins tools to manage members | No baseline data available, to be measured after release |

## 4. User Stories

- As an active Host or Elite, I want to create a group chat, so that I can talk to many people in one place.
- As a group Owner, I want to promote members to Admin and set group permissions, so that I can share the work of managing the group.
- As an Owner or Admin, I want to add or remove members, so that I can keep the group relevant.
- As a group member, I want to share the invite link (when allowed), so that my friends can join.
- As a user with an invite link, I want to join in one tap without approval, so that I can start chatting right away.
- As a user without the app, I want the link to take me to the app store, so that I can install the app and still join the group.
- As a member, I want to leave a group when I no longer need it.
- As an Owner, I want to disband the group, so that it is removed for everyone.

## 5. App Flow

**A. Create a group (active Host or Elite)**

- Locals (Chat) > Group tab > tap the create group button.
- If the user has a friend list: select members (optional), tap Continue. If not: go straight to the form.
- Fill Group Name (required), Bio (optional), photo (optional), tap Create.
- The group chat room opens with the message “You Joined Group”.

**B. Chat in a group**

- Locals (Chat) > Group tab (or All tab) > tap the group row.
- Send messages, media, and voice notes according to the group permissions.

**C. Manage the group**

- Chat room header > Group Info.
- Owner: Edit Group, Group Permissions, Disband Group (from the “...” menu). Admin: Edit Group (from the edit icon).
- Members tab: Add Members, and the member menu (Send message, View profile, Promote, Demote, Remove).

**D. Invite and join**

- Group Info > Share > pick a recipient in “Send to” > an invite card is sent in chat.
- The recipient taps View Group (or the link) > Join Group sheet > Join Group > the group chat room opens.
- Without the app: web page > Open App or Download it now > after install, the Join Group sheet opens.

**E. Leave, removal, and disband**

- Leave: Group Info > Leave > confirm.
- Remove: Members tab > member menu > Remove from group > confirm.
- Disband: Owner “...” menu > Disband Group > confirm.

## 6. Functional Requirements & Acceptance Criteria

### 6.1 Chat List: Tabs and Group Tab

- The chat list tabs are All, Host, and Group. They replace Personal, Service, and Experience.
- All shows every chat, including group chats. Host shows chats with hosts (as a buyer) and chats as a host with users. Group shows group chats only.
- The search field searches by name inside the selected tab.
- A group row shows: avatar (photo or initials), group name, last message preview (for example “You: Voice message (0:09)”), date, and unread badge. Rows are sorted by latest activity.
- The Group tab shows a create group floating button only to users who can create groups (6.2).
- Empty state: “You have no group chat yet”. Users who can create groups also see the button “Create new group chat”. Other users see the text only.
- The Locals tab Badge Verification reminder works as in the Locals Chat Additions PRD.

### 6.2 Who Can Create a Group

- A user can create a group if they are an active Host or an active Elite (one of them is enough).
- Users whose Host status is pending, rejected, suspended, or banned, and users whose Elite status is revoked, cannot create groups. They are treated as normal users.
- Existing groups are not affected when the user loses the Host or Elite role. The user stays the Owner.
- The server validates eligibility when the group is created.

### 6.3 Create Group Flow

- Entry: the floating button on the Group tab, or the “Create new group chat” button in the empty state.
- User with a friend list:
  - Screen “Create group”: search field “Search for someone to add” and a list of friends with checkboxes.
  - Selected friends appear as avatars at the top and can be removed.
  - Continue is always enabled. Selecting nobody is allowed (adding members is not mandatory).
- User without a friend list: the member selection screen is skipped. The form opens directly.
- Form “Create group”:
  - Group photo (placeholder icon with a pencil). Tap to pick a photo, then crop (as in Onboarding Profile Picture Crop).
  - Group Name * (required, maximum 50 characters).
  - Bio (optional, maximum 200 characters).
  - Group Members with Add Members: the creator is shown with the Owner tag. Selected members have a remove (trash) icon.
  - Create button.
- Add Members on the form opens the friend selection with the current selection kept. For a user without a friend list it opens the empty state “You have no friend list yet”.
- Tapping Create with an empty Group Name shows the error “Enter the group name”.
- A group can have a maximum of 100 members including the Owner. Selecting more shows a toast.
- Back from the form after the user entered data shows the modal “Discard Changes?” (Keep Editing, Discard).
- After Create, the group chat room opens. The Owner sees “You Joined Group”. Selected members receive a push notification, see the group in their list, and see “You Joined Group”.
- A group without a photo shows an initials avatar: 1 letter for a one-word name, 2 letters (first letter of the first two words) for a longer name. The color is picked from a fixed palette per group. The Group Info header shows a gradient with large initials.

### 6.4 Group Chat Room

- Header: back, group avatar, group name, “{n} Members”. Tap the header to open Group Info.
- Members can send text, photo, video, document, GIF, and voice note according to the group permissions (6.7). The Owner and Admins can always send everything.
- Own messages appear on the right (purple). Messages from others appear on the left with the sender display name and avatar. Consecutive messages from the same sender are grouped.
- Reply, voice note (record, slide to cancel, lock, pause, resume), pin, and shared media viewing follow the existing chat PRDs. Document and GIF size limits follow the current app.
- Delete message: the modal “Delete Message” with “This message will be deleted for everyone”. A member can delete their own messages. The Owner and Admins can delete any message.
- Pin message: only the Owner and Admins can pin messages. A system message “{Name} pinned a message” is shown (own pin: “You pinned a voice message” style, per message type).
- If Send messages is OFF, the composer of a member is replaced with “Only admins can send messages in this group.”
- If a media type is OFF, that type is hidden from the attachment options. If all media types are OFF, the attachment and voice buttons are hidden.
- A member whose permission changed while typing or recording and who sends a disabled type sees the toast “You don’t have permission to send this.”
- Group chats do not show the Experience card, Accept or Reject buttons, the verification system message, or the Host label that appear in 1:1 host chats.
- System messages (centered) are listed in 6.18.
- Unread badges and push notifications follow the current chat system.

### 6.5 Group Info Page

- Entry: tap the header in the group chat room.
- Header: group photo as a full cover (or gradient with initials), back arrow, group name, “{n} members”.
- Top-right: Owner sees the “...” menu (Edit Group, Group Permissions, Disband Group). Admin sees the edit icon (Edit Group). Member sees nothing.
- Action buttons: Chat (returns to the chat room), Share (see 6.15), Leave.
- Bio is shown under the buttons, truncated with See more and Show less.
- Tapping the group photo opens the Group Profile viewer (full photo). Owner and Admin see “...” there with Change Photo and Delete Photo. Members see no menu.
- Tabs: Members, Media, Files.

**Members tab:**

- Title “Group Members” and the Add Members link. Owner and Admin always see it. A Member sees it only when Add other members is ON.
- The list shows the current user first, then the others by join date (earliest first). Owner and Admin have tags. Verified and host badges follow the current system.
- Every row except the current user has a “...” menu with these options:

| Viewer | Target | Options |
|---|---|---|
| Owner | Member | Send message, View profile, Promote to admin, Remove from group |
| Owner | Admin | Send message, View profile, Demote to member, Remove from group |
| Admin | Member | Send message, View profile, Remove from group |
| Admin | Admin or Owner | Send message, View profile |
| Member | Anyone | Send message, View profile |

- Send message is always shown. It opens the 1:1 chat. Whether the DM is allowed follows the current chat logic (if not allowed, the current message is shown: “Direct messages aren’t available. You can only chat with hosts you’ve booked.”).
- View profile opens the Other Profile.

**Media tab:** grid of photos, videos, and GIFs shared in the group (newest first). Tap to open the media viewer. Empty state: “No media shared”.

**Files tab:** list of documents (name, size, date and time, download icon). Empty state: “No document shared”.

Voice messages do not have their own tab.

### 6.6 Roles and Capabilities

| Capability | Owner | Admin | Member |
|---|---|---|---|
| Send text | Always | Always | If Send messages is ON |
| Send media | Always | Always | Only the allowed media types |
| Pin messages | Yes | Yes | No |
| Delete own messages | Yes | Yes | Yes |
| Delete other people’s messages | Yes | Yes | No |
| Add members | Yes | Yes | If Add other members is ON |
| Share invite link | Yes | Yes | If Invite via link is ON |
| Edit group info (name, bio, photo) | Yes | Yes | No |
| Manage group permissions | Yes | No | No |
| Promote and Demote | Yes | No | No |
| Remove members | Members and Admins | Members only | No |
| Disband group | Yes | No | No |
| Leave group | Yes | Yes | Yes |

### 6.7 Group Permissions

- Only the Owner can open Group Permissions (from the “...” menu).
- Screen “Group permissions”, title “Members can:”, with four toggles:
  - Add other members: “Members can add people from their contact”.
  - Send messages: “Members can post in the group”.
  - Send media: “Choose which media types members can send”. It expands to a list: Photo, Video, Document, GIF, Voice, with a counter (for example 4/5).
  - Invite via link: “Members can share the group invite link”.
- Defaults for a new group: all toggles ON and all 5 media types selected.
- At least 1 media type must stay selected. Unchecking the last type turns Send media OFF. Turning Send media ON again restores the previous selection.
- Save Changes is disabled until something changes. After saving, the toast “Group permissions updated” is shown.
- Back with unsaved changes shows the modal “Discard Changes?”. Back without changes leaves directly.
- Permissions apply to Members only and take effect immediately for everyone in the group. Existing messages are not affected.

### 6.8 Edit Group

- Entry: Owner “Edit Group” in the “...” menu, Admin edit icon.
- Screen “Edit group”: photo with a pencil (tap to pick a new photo and crop, or delete it), Group Name * , Bio, Save Changes. Validation is the same as Create Group (6.3).
- Deleting the photo shows the initials avatar.
- Save Changes is disabled when nothing changed. Tapping it opens the modal “Save Group Changes?” (Save, Cancel). After Save, the toast “Group info updated” is shown and the user returns to Group Info.
- Back after changes shows “Discard Changes?” (Keep Editing, Discard). Back without changes leaves directly.
- The changes are visible to everyone immediately. No system message is shown.

### 6.9 Add Members

- Owner and Admin can always add members. A Member can add members only when Add other members is ON.
- Add Members opens the friend selection (same logic as Create Group). Existing members are not shown.
- Added users join immediately. There is no approval or waiting list.
- The group member count updates. A system message “{Name} added {Name}” is shown. Added users receive a push notification and see the group in their list.
- The 100-member limit applies. A user without a friend list sees “You have no friend list yet”.

### 6.10 Promote and Demote

- Only the Owner can promote a Member to Admin or demote an Admin to Member.
- Promote to admin opens the modal “Promote to Admin” (Yes, Promote / Cancel). After confirming, the toast “{Name} promoted to admin” is shown.
- Demote to member opens the modal “Demote to Member” (Yes, Demote / Cancel). After confirming, the toast “{Name} demoted to member” is shown.
- A system message “{Name} is now Admin” or “{Name} is now Member” is shown to everyone. There is no limit on the number of Admins.

### 6.11 Remove from Group

- The Owner can remove Members and Admins. An Admin can remove Members only. Nobody can remove the Owner.
- Remove from group opens the modal “Remove from Group?” (Remove / Cancel). After confirming, the toast “{Name} removed from group” is shown.
- The remaining members see the system message “{Name} removed from group”. The member count updates.
- The removed user immediately loses access. The chat list behavior is in 6.14.
- A removed user can rejoin through the invite link (there is no ban list in this release).

### 6.12 Leave Group and Ownership Transfer

- Every role can leave a group from Group Info > Leave, which opens the modal “Leave Group?” (Leave / Cancel).
- After leaving, the user returns to the Group tab. The group row stays in the list with the status “You left the group” (see 6.14).
- The remaining members see the system message “{Name} left the group”. The member count updates.
- When the Owner leaves, ownership is transferred automatically:
  - If there are Admins, the Admin who was promoted earliest becomes the Owner.
  - If there are no Admins, the member who joined earliest becomes the Owner.
  - If there are no other members, the group is deleted.
  - The system message “{Name} is now the owner” is shown and the new Owner receives a push notification.
- A user who left cannot send messages. The composer is replaced with “You left this group”. The history stays readable, and Group Info is not accessible.
- The user can delete the row manually (swipe or long press > Delete, with a confirmation). This removes the group and its history from the user’s list.
- A user who rejoins through the invite link reactivates the same row. Messages sent while the user was away are not visible.

### 6.13 Disband Group

- Only the Owner can disband, from the “...” menu > Disband Group, which opens the modal “Disband Group” (Disband / Cancel).
- After confirming, the group is deleted for everyone together with its entire history. All members are removed and the invite link stops working.
- The Owner returns to the Group tab and the row is removed immediately. The toast “Group already disbanded” is shown (no Undo).
- Other members see the row according to 6.14.

### 6.14 Chat List States After Leave, Removal, and Disband

| Event | Who sees it | Group row | History |
|---|---|---|---|
| Member leaves (6.12) | The user who left | Stays with the status “You left the group” until the user deletes it manually | Stays readable |
| Member is removed (6.11) | The removed user | Appears once with the status “You were removed from this group”, then disappears. No access | Removed |
| Group is disbanded (6.13) | Every member except the Owner | Appears once with the status “This group has been disbanded by the owner”, then disappears. No access | Removed |

- “Appears once” means the row stays until the user taps it (the row disappears and a toast shows the same status) or until the chat list is loaded again after an app restart or pull to refresh.
- The removed user is not told who removed them.
- If a user is inside the group chat room when they are removed or the group is disbanded, they are taken back to the Group tab and the status is shown.

### 6.15 Invite Link and Share

- Every group has one invite link youapp.ai/group/{linkgroup}, created with the group. It stays the same while the group exists. There is no reset or revoke in this release. It stops working when the group is disbanded or deleted.
- The Share button on Group Info is shown to the Owner and Admins always, and to Members only when Invite via link is ON. When it is OFF, the button is hidden for Members. Links that were already shared still work.
- Share opens the “Send to” bottom sheet: search field and friends (same friend list logic). There is no sharing to external apps.
- Selecting a recipient sends an invite card in the 1:1 chat: group name, “{username} invites you to join this group on youapp”, View Group button, and the link below. Delivery follows the current chat permission logic.

### 6.16 Join Group (in app)

- Tapping View Group or opening the link in the app opens the Join Group bottom sheet: group avatar, group name, “{n} members”, bio (See more and See less), up to 5 member avatars with display names and “+N Others”, and the Join Group button.
- Join Group adds the user immediately. There is no approval or waiting list. The group chat room opens. The user sees “You Joined Group” and the others see “{Name} Joined Group”.
- KYC is not required to join or chat.
- A user who is already a member goes directly to the group chat room.
- A Guest (Guest Mode) sees the login sheet. The action is not resumed automatically after login (see Guest Mode PRD).
- A group that already has 100 members shows the toast “This group is full.” A disbanded or invalid link shows “This group is no longer available.”
- Users who left or were removed can join again.

### 6.17 Web Invite Page

- URL: youapp.ai/group/{linkgroup} on the YouApp website (all current header, banner, and footer elements stay).
- Card: initials avatar, {Group Name}, “Group chat invite”, Open App button, “Don’t have the app? Download it now”, and Follow Us icons.
- The web page shows only the group name and initials. It does not show the group photo, member count, or bio.
- Open App opens the app (deep link) on the Join Group sheet. If the app is not installed, the user goes to the App Store, Google Play, or AppGallery. After install and first open, the Join Group sheet opens (the link code is kept, as for referral links).
- A disbanded or invalid link shows “This group is no longer available.”

### 6.18 System Messages and Notifications

| Event | System message in chat | Push notification |
|---|---|---|
| Creator opens a new group | You Joined Group | No |
| User joins (link) | You Joined Group / {Name} Joined Group | No |
| Added by Owner, Admin, or Member | {Name} added {Name} | To the added user: “You were added to {Group Name}” |
| Member leaves | {Name} left the group | No |
| Member removed | {Name} removed from group | No |
| Promoted | {Name} is now Admin | No |
| Demoted | {Name} is now Member | No |
| Ownership transferred | {Name} is now the owner | To the new Owner: “You are now the owner of {Group Name}” |
| Message pinned | {Name} pinned a message | No |
| Group disbanded | Not applicable | To members: “{Group Name} has been disbanded” |
| New group message | Not applicable | Title: group name. Body: “{Sender}: {message}” |

### 6.19 Wording

| Type | Title | Wording | Behavior |
|---|---|---|---|
| Modal | Leave Group? | Are you sure you want to leave this group? | Leave / Cancel |
| Modal | Remove from Group? | Are you sure you want to remove [Name] from this group? They will no longer have access to this chat. | Remove / Cancel |
| Modal | Promote to Admin | Are you sure you want to promote {username} to Group Admin? | Yes, Promote / Cancel |
| Modal | Demote to Member | Are you sure you want to demote {username} to member again? | Yes, Demote / Cancel |
| Modal | Disband Group | Are you sure you want to disband {Group Name} chat group? This will remove all members from this group also. | Disband / Cancel |
| Modal | Save Group Changes? | Are you sure you want to save these changes to your group? | Save / Cancel |
| Modal | Discard Changes? | Are you sure you want to go back? Your changes will not be saved. | Keep Editing / Discard |
| Modal | Delete Message | This message will be deleted for everyone. Are you sure you want to delete this message? | Delete / Cancel |
| Modal ⚠️ | Delete Chat? | This will remove the group and its history from your list. | Delete / Cancel |
| Toast | Removed | {Name} removed from group | Success toast |
| Toast | Promoted | {Name} promoted to admin | Success toast |
| Toast | Demoted | {Name} demoted to member | Success toast |
| Toast | Group info | Group info updated | Success toast |
| Toast | Permissions | Group permissions updated | Success toast |
| Toast | Disband | Group already disbanded | Success toast, no Undo |
| Field error | Group Name | Enter the group name | Under the field |
| Toast ⚠️ | Member limit | You can add up to 100 members. | Error toast |
| Toast ⚠️ | Full group | This group is full. | Error toast |
| Toast ⚠️ | Permission | You don’t have permission to send this. | Error toast |
| Text ⚠️ | Composer, messages off | Only admins can send messages in this group. | Replaces the composer |
| Text ⚠️ | Composer, left | You left this group | Replaces the composer |
| Text ⚠️ | Invalid link | This group is no longer available. | Sheet, toast, and web page |
| Status | Left | You left the group | Group row |
| Status ⚠️ | Removed | You were removed from this group | Group row |
| Status | Disbanded | This group has been disbanded by the owner | Group row |
| Empty | Group tab | You have no group chat yet | Button “Create new group chat” for eligible users |
| Empty | Friend list | You have no friend list yet | Empty state |
| Empty | Media | No media shared | Media tab |
| Empty | Files | No document shared | Files tab |

Wording marked ⚠️ was written by Claude for review. Wording for other languages follows Google Translate until localization is final.

### 6.20 Behavior Retention and Platform Coverage

- Voice note, pin, reply, delete, and the media viewer follow the existing chat PRDs.
- DM permission logic, friend list logic, block rules, and the Locals tab Badge Verification reminder follow the current system.
- Other Profile, Guest Mode, and the website header, banner, and footer do not change.
- Platforms: iOS and Android (including Huawei builds).

## 7. Edge Cases

| # | Scenario | Expected Behavior |
|---|---|---|
| 1 | No internet during create, join, send, or any group action | Error toast, input is kept, the user can retry |
| 2 | Force Update is active | Force Update flow takes priority |
| 3 | Long group name, bio, or member names, and Chinese or other long text | Wrap or truncate as defined in Figma |
| 4 | Keyboard covers the input or the Create button | The screen scrolls so the field and button stay visible |
| 5 | Two groups with the same name | Allowed. Groups are identified by the link |
| 6 | The group reaches 100 members | Add Members and Join Group are blocked with the full group message |
| 7 | The Owner leaves and there are Admins | The Admin promoted earliest becomes the Owner |
| 8 | The Owner leaves and there are no Admins | The member who joined earliest becomes the Owner |
| 9 | The Owner leaves and nobody else is in the group | The group is deleted |
| 10 | The Owner deletes their account | Treated as the Owner leaving, with ownership transfer. Old messages show “Deleted User” |
| 11 | A member deletes their account | The member is removed from the group. Old messages show “Deleted User” |
| 12 | Two members leave at the same time and one would become Owner | The server processes them in order and picks the next eligible member |
| 13 | A member is removed while typing or recording | Sending fails and the user is taken back to the Group tab with the removed status |
| 14 | The Owner turns off a permission while a member is using it | The member sees “You don’t have permission to send this.” on the next send |
| 15 | The Owner disbands while members are in the chat room or Group Info | They are taken back to the Group tab and the disbanded status is shown |
| 16 | A member opens the invite link of a group they are already in | The group chat room opens directly |
| 17 | A user who left opens the invite link | The Join Group sheet opens. After joining, the old row is reactivated |
| 18 | A removed user opens the invite link | The Join Group sheet opens and the user can join again |
| 19 | The invite link of a disbanded group | “This group is no longer available.” on the app and web page |
| 20 | Invite link opened by a Guest | The login sheet opens. The action is not resumed after login |
| 21 | Invite link opened without the app installed | Store redirect. After install and first open, the Join Group sheet opens |
| 22 | The Owner or Admin removes a user who is mid-action in the Members tab | The list refreshes and the toast is shown once |
| 23 | An Admin tries to remove an Admin or the Owner (stale screen) | The server rejects the action and the list refreshes |
| 24 | Group photo fails to load | Show the initials avatar |
| 25 | A user loses the Host or Elite role after creating a group | The group and the Owner role stay unchanged |
| 26 | Send message from the member menu is not allowed by the current DM logic | The current “Direct messages aren’t available...” message is shown |
| 27 | Invite card sent to a recipient who cannot receive a DM | Delivery follows the current chat permission logic |
| 28 | A user is in a very large number of groups | The Group tab loads with pagination and lazy loading |
