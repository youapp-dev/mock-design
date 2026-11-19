# PRD: Group Chat

## 1. Overview

This PRD describes the Group Chat behavior represented in the YouApp 3.0 browser prototype: creating a group, chatting in a group, managing members and roles, group permissions, inviting people through a link and QR code, and leaving, removing, or deleting a group.

Prototype reference: `mock-design/app30.html`. This document records prototype behavior; native, server-side, push-notification, and web landing-page behavior is not implied unless stated below.

Covered:

- Chat list tabs (All, Host, Group) and the Group list.
- Who can create a group, and the Create Group flow.
- Group chat room (messages, system messages).
- Group Info page for Owner, Admin, and Member (member list and Media & files).
- Roles and capabilities: Owner, Admin, Member.
- Group permissions, Edit Group, Add Members, Promote and Demote, Remove from Group.
- Leave Group, remove members, and delete a group.
- Chat list states after leaving, being removed, or a group being deleted.
- Invite link and QR code, external link sharing, and the Join Group sheet in the app.

Not covered (follow current system):

- Friend list logic (who appears and how search works).
- Direct message (DM) permission logic.
- Mentions, invite-link revocation, and ban list.
- Native push delivery, server validation, and a separate web invite landing page. These are not represented in the browser prototype.

Naming used in this PRD:

- “Owner” is the group creator (shown as the Owner tag in the prototype).
- “Group tab” is the new tab in the chat list.
- Chat list tabs All | Host | Group replace Personal | Service | Experience.
- “Delete group” is the Owner action labeled “Delete group” in the Group Info menu; the prototype’s confirmation and toast still use “Disband”.

Related PRDs: Locals Chat Additions, Voice Note in Chat, Pin Message in Chat, Other Profile, Guest Mode, Onboarding Profile Picture Crop (reused for the group photo).

Figma: Group chat flow (Create Group, Chat Group, Group as Owner, Group as Admin, Group as Member, Share Group Chat, No Profile Picture, Exit Member). The browser prototype is the behavior reference for this revision.

## 2. Problem Statement

- Users can only chat 1:1. There is no place for a host, an Elite, or a community to talk with many people at once.
- Hosts and Elites cannot gather their guests or referred friends in one conversation.
- There is no way to invite people to a conversation with a shareable link.
- There are no roles, so nobody can moderate a shared conversation.

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Let eligible users create group conversations | No baseline data available, to be measured after release |
| Let people join a group easily through an invite link | No baseline data available, to be measured after release |
| Give group owners and admins tools to manage members | No baseline data available, to be measured after release |

## 4. User Stories

- As a user with approved KYC, I want to create a group chat, so that I can talk to many people in one place.
- As a group Owner, I want to promote members to Admin and set group permissions, so that I can share the work of managing the group.
- As an Owner or Admin, I want to add or remove members, so that I can keep the group relevant.
- As a group member, I want to share the invite link (when allowed), so that my friends can join.
- As a user with an invite link and approved KYC, I want to join without approval, so that I can start chatting right away.
- As a group member, I want to share a group link or QR code outside the app, so that people can open the invite in YouApp.
- As a member, I want to leave a group when I no longer need it.
- As an Owner, I want to delete the group, so that it is removed from my chat list.

## 5. App Flow

**A. Create a group (KYC approved)**

- Locals (Chat) > Group tab > tap the create group button.
- If the user has a friend list: select members (optional), then Continue. If not: the empty state offers Continue to the form.
- The user must have approved KYC to continue. Otherwise, the KYC gate opens.
- Fill Group Name (required), Description (optional), photo (optional), and optional group permissions, then tap Create.
- The group chat room opens with a “Group created” welcome card. The chat history shows “You created the group” and a “{Name} joined group” message for each selected person.

**B. Chat in a group**

- Locals (Chat) > Group tab (or All tab) > tap the group row.
- Send messages, media, voice notes, and Red Packets. Group voice and video call controls are also present in the prototype.

**C. Manage the group**

- Chat room header > Group Info.
- Group Info shows the group identity, Invite (when allowed), Red packet, Search, Mute, Media & files, and the member list.
- Owner: Edit group, Group permissions, and Delete group (from the “...” menu). Admin: Edit group. Owner and Admin can add members.
- A member’s action menu can include Send message, View profile, Promote, Demote, or Remove, depending on roles.

**D. Invite and join**

- Group Info > Invite link > copy the link, save the QR code, or share the link externally.
- Opening an invite in the app shows the Join Group sheet. Tapping Join Group opens the group chat.
- The prototype does not represent a separate web invite page or app-store handoff.

**E. Leave, removal, and deletion**

- Leave: Group Info > Exit group > confirm.
- Remove: Group Info member list > member menu > Remove from group > confirm.
- Delete: Owner Group Info menu > Delete group > confirm. The prototype removes the group from the Owner’s list and offers Undo.

## 6. Functional Requirements & Acceptance Criteria

### 6.1 Chat List: Tabs and Group Tab

- The chat list tabs are All, Host, and Group. They replace Personal, Service, and Experience.
- All shows every chat, including group chats. Host shows chats with hosts (as a buyer) and chats as a host with users. Group shows group chats only.
- The search field searches by name inside the selected tab.
- A group row shows: avatar (photo or initials), group name, last message preview, date, and unread badge. The prototype does not sort group rows by latest activity.
- The Group tab shows a create-group floating button when the list is non-empty. The button is not gated by Host or Elite status.
- Empty state: “You have no group chat yet” and “Create new group chat”.
- The Locals tab Badge Verification reminder works as in the Locals Chat Additions PRD.

### 6.2 Who Can Create a Group

- A user must have approved KYC to enter the Create Group flow. If KYC is not approved, the prototype opens the KYC gate.
- The prototype does not check Host or Elite status when showing the create-group entry point or creating a group.
- Server-side eligibility validation is not represented in the prototype.

### 6.3 Create Group Flow

- Entry: the floating button on the Group tab, or the “Create new group chat” button in the empty state.
- User with a friend list:
  - The member picker has search, Recent chats, and YouApp Friends sections.
  - Selected friends appear as avatars and can be removed.
  - Continue is available when nobody is selected; adding members is optional.
- User without a friend list: an empty state is shown and Continue opens the form with only the creator.
- Form “Create group”:
  - Group photo (placeholder icon with a pencil). Tap to pick a photo, then crop (as in Onboarding Profile Picture Crop).
  - Group name (required, maximum 40 characters).
  - Description (optional, maximum 300 characters).
  - Group Members with Add Members: the creator is shown with the Owner tag. Selected members have a remove (trash) icon.
  - Settings > Group permissions is available before creating the group.
  - The Create group action is a floating button on the form.
  - Add on the form opens the friend picker with the current selection kept.
- Tapping Create with an empty Group Name shows the error “Enter the group name”.
- The prototype does not enforce a maximum group size.
- Back from Edit group after changes shows “Discard Changes?” (Keep Editing, Discard). A discard confirmation is not shown for the new-group form.
- After Create, the group chat opens with a “Group created” welcome card. The chat history says “You created the group” and “{Name} joined group” for selected people. Push delivery is not represented.
- A group without a photo shows initials: one letter for a one-word name, or the first letters of up to two words. A generated color palette is not represented.

### 6.4 Group Chat Room

- Header: back, group avatar, group name, “{n} Members”. Tap the header to open Group Info.
- Members can send text, photo, video, document, GIF, and voice note. The Owner and Admins can always send everything.
- Own messages appear on the right (purple). Messages from others appear on the left with the sender display name and avatar. Consecutive messages from the same sender are grouped.
- Reply, voice note (record, slide to cancel, lock, pause, resume), reactions, forwarding, and message deletion use the shared chat controls. Voice and video call controls and Red Packet are also present in the group chat.
- A user can delete their own message for everyone or for themselves. Deleting another user’s message is available only for the current user.
- Pin and unpin controls are available to all roles in the prototype. No pin system message is added.
- If Send messages is OFF, the composer of a member is replaced with “Only admins can send messages in this group.”
- If all media types are OFF, the attachment button is hidden. Individual disabled media types are not hidden from the attachment options, and the voice button remains visible.
- The prototype does not show a permission-revocation toast when a member sends a type that has just been disabled.
- Group chats do not show the Experience card, Accept or Reject buttons, the verification system message, or the Host label that appear in 1:1 host chats.
- System messages (centered) are listed in 6.18.
- Unread badges are shown. Push notification delivery is not represented.

### 6.5 Group Info Page

- Entry: tap the header in the group chat room.
- Group Info opens from the group chat header and shows a centered group photo or initials, group name, member count, and optional description.
- Quick actions include Invite (when allowed), Red packet, Search, and Mute. Mute toggles the group notification state; Search is a placeholder that shows a toast. The “...” menu contains role-dependent options: Edit group for Owner/Admin, Group permissions and Delete group for Owner, and Invite link when sharing is allowed. Clear history is also available.
- The member list shows the current user first, then Owner/Admin and other members. The prototype shows up to eight members initially, with See all for longer lists. Add member appears when allowed.
- The group photo opens the Group Profile viewer. Owner and Admin can open the photo options and change the photo. A Delete Photo action is not represented in the photo options.
- Media & files opens a separate screen with Media and Files tabs. Voice messages do not have a separate tab.

**Member actions:**

- Owner and Admin can always add members. A Member sees Add member only when Add other members is ON.
- Owner and Admin have role labels. The prototype does not order other members by join date.
- Other member rows open a menu with these options:

| Viewer | Target | Options |
|---|---|---|
| Owner | Member | Send message, View profile, Promote to admin, Remove from group |
| Owner | Admin | View profile, Demote to member, Remove from group |
| Admin | Member | Send message, View profile, Remove from group |
| Admin | Admin or Owner | Send message, View profile |
| Member | Anyone | Send message, View profile |

- Send message opens an existing 1:1 chat when available; otherwise the prototype shows a toast that the chat would open.
- View profile shows a prototype toast.

**Media tab:** the prototype shows seeded photos for sample groups and an empty state for other groups. It does not represent a media viewer or newest-first sorting.

**Files tab:** the prototype shows seeded documents for sample groups and an empty state for other groups. The download control displays a toast.

The prototype does not show separate Members, Media, and Files tabs on Group Info; it shows the member list on Group Info and Media & files as a separate screen.

### 6.6 Roles and Capabilities

| Capability | Owner | Admin | Member |
|---|---|---|---|
| Send text | Always | Always | If Send messages is ON |
| Send media | Always | Always | Permission toggles are shown, but individual types are not enforced in the composer |
| Pin messages | Yes | Yes | Yes |
| Delete own messages | Yes | Yes | Yes |
| Delete other people’s messages for everyone | No | No | No |
| Add members | Yes | Yes | If Add other members is ON |
| Share invite link | Yes | Yes | If Invite via link is ON |
| Edit group info (name, bio, photo) | Yes | Yes | No |
| Manage group permissions | Yes | No | No |
| Promote and Demote | Yes | No | No |
| Remove members | Members and Admins | Members only | No |
| Delete group | Yes | No | No |
| Leave group | Yes | Yes | Yes |

### 6.7 Group Permissions

- Only the Owner can open Group Permissions (from the “...” menu).
- Screen “Group permissions”, title “Members can:”, with these controls:
  - Add other members: “Members can add people from their contact”.
  - Send messages: “Members can post in the group”.
  - Send media: “Choose which media types members can send”. It expands to a list: Photo, Video, Document, GIF, Voice, with a counter (for example 4/5).
  - Invite via link: “Members can share the group invite link”.
- Defaults for a new group: Add other members OFF; Send messages ON; Send media ON with all 5 media types selected; Invite via link ON.
- The prototype allows all media types to be unchecked. Turning Send media ON after all types are off selects all 5 types.
- Save Changes is available regardless of whether a setting changed. After saving, the toast “Group permissions updated” is shown.
- Back leaves the screen without an unsaved-changes confirmation.
- Permissions apply to Members only and take effect immediately for everyone in the group. Existing messages are not affected.

### 6.8 Edit Group

- Entry: Owner “Edit Group” in the “...” menu, Admin edit icon.
- Screen “Edit group”: photo, Group name (maximum 40 characters), Description (maximum 300 characters), Save Changes. The photo control opens photo selection.
- Save Changes is available even when nothing changed. Tapping it opens the modal “Save Group Changes?” (Save, Cancel). After Save, the toast “Group info updated” is shown and the user returns to Group Info.
- Back after changes shows “Discard Changes?” (Keep Editing, Discard). Back without changes leaves directly.
- Renaming the group adds the system message “You changed the group name to ‘{Group Name}’”. Photo and description changes do not add a system message.

### 6.9 Add Members

- Owner and Admin can always add members. A Member can add members only when Add other members is ON.
- Add Members opens the friend selection (same logic as Create Group). Existing members are not shown.
- Added users join immediately. There is no approval or waiting list.
- The group member count updates. A system message “You added {Name}” is shown. Push delivery is not represented.
- The prototype does not enforce a member limit.

### 6.10 Promote and Demote

- Only the Owner can promote a Member to Admin or demote an Admin to Member.
- Promote to admin opens the modal “Promote to Admin” (Yes, Promote / Cancel). After confirming, the toast “{Name} promoted to admin” and the system message “You made {Name} a group admin” are shown.
- Demote to member opens the modal “Demote to Member” (Yes, Demote / Cancel). After confirming, the toast “{Name} demoted to member” is shown. No system message is added.
- The prototype does not enforce a limit on the number of Admins.

### 6.11 Remove from Group

- The Owner can remove Members and Admins. An Admin can remove Members only. Nobody can remove the Owner.
- Remove from group opens the modal “Remove from Group?” (Remove / Cancel). After confirming, the toast “{Name} removed from group” is shown.
- The remaining group history gets the system message “{Name} removed from group”. The member count updates.
- The removed-user state is simulated by a chat-list status row. The prototype does not model server-side access revocation.
- Rejoining after removal is not represented. If the existing group is still present in prototype state, opening its invite routes to that group as an existing member.

### 6.12 Leave Group

- Every role can leave a group from Group Info > Exit group, which opens the modal “Leave Group?” (Leave / Cancel).
- After leaving, the user returns to the Group tab. The group row stays in the list with the status “You left the group” (see 6.14).
- The local group history gets the status message “You left the group”.
- In a regular group, the prototype does not transfer ownership when the Owner leaves.
- During a linked activity, the prototype can lock the Owner’s leave action until the activity ends. After it ends, the Owner leave flow can assign another member the group-admin role; it does not use the regular group’s Owner-transfer rules.
- A user who left sees a read-only chat state and cannot open Group Info from the chat header. The history remains readable.
- A manual delete-row action and a rejoin-to-reactivate flow are not represented.

### 6.13 Delete Group

- Only the Owner can delete the group, from Group Info > “...” menu > Delete group. The confirmation modal is titled “Disband Group” and has Disband / Cancel actions.
- After confirming, the group is removed from the current Owner’s chat list. The prototype does not delete the group or its history for other members.
- The Owner returns to the Group tab and sees the toast “Group already disbanded” with an Undo action.
- Other-member status is represented by the Group event scenario and follows 6.14.

### 6.14 Chat List States After Leave, Removal, and Disband

| Event | Who sees it | Group row | History |
|---|---|---|---|
| Member leaves (6.12) | The user who left | Stays with the status “You left the group” | Stays readable |
| Member is removed (6.11) | Simulated removed user | Shows “{Owner name} removed you” | Stays in the local prototype state |
| Group is deleted (6.13) | Simulated other member | Shows “This group has been disbanded by the owner” | Stays in the local prototype state |

- These status rows remain in the prototype when opened; one-time display and removal on refresh are not represented.
- The removal status identifies the Owner by name.
- The Group event scenario applies the removed or deleted state when the chat list is opened. Immediate navigation from an active chat is not represented.

### 6.15 Invite Link and Share

- The prototype creates a link in the form `youapp.ai/g/{slug}-{token}` and displays a QR code.
- Invite is available to Owner and Admin, and to Members when Invite via link is ON. The invite screen supports copying the link, saving the QR code, and external sharing.
- Owner and Admin can reset the link. Resetting changes the token and shows “New link created. The old one no longer works.”
- The prototype does not represent a “Send to” recipient sheet or group invitation card as the primary invite flow.

### 6.16 Join Group (in app)

- Opening a supported invite in the app opens the Join Group bottom sheet: initials avatar, group name, member count, bio (See more and See less), up to 4 member avatars with display names and “+N Others”, and the Join Group button.
- Join Group adds the user immediately in the prototype and opens the group chat. The joiner sees “You joined group”.
- KYC approval is required by the prototype before joining.
- A user who is already a member goes directly to the group chat room.
- Guest-specific handling, the full-group state, invalid-link state, and rejoin behavior are not represented.

### 6.17 Web Invite Page

- A separate web invite page, deep link, and app-store handoff are not represented in the browser prototype.

### 6.18 System Messages and Notifications

| Event | System message in chat | Push notification |
|---|---|---|
| Creator opens a new group | You created the group | Not represented |
| User joins (link) | You joined group | Not represented |
| Added by Owner, Admin, or Member | You added {Name} | Not represented |
| Member leaves | You left the group (local status message) | Not represented |
| Member removed | {Name} removed from group (in the remaining group history) | Not represented |
| Promoted | You made {Name} a group admin | Not represented |
| Demoted | No system message; toast only | Not represented |
| Ownership transferred | Not represented for regular groups; linked activity groups may show “{Name} is now the group admin” | Not represented |
| Message pinned | No system message | Not represented |
| Group deleted | No system message in the current Owner’s chat | Not represented |
| New group message | Not represented | Not represented |

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
| Modal | Delete message? | Delete it for everyone in this chat, or only for you. | Delete for everyone / Delete for me / Cancel (own message); Delete for me / Cancel (another user’s message) |
| Menu | Delete group | Not applicable | Owner-only Group Info menu item; opens the Disband Group modal |
| Toast | Removed | {Name} removed from group | Success toast |
| Toast | Promoted | {Name} promoted to admin | Success toast |
| Toast | Demoted | {Name} demoted to member | Success toast |
| Toast | Group info | Group info updated | Success toast |
| Toast | Permissions | Group permissions updated | Success toast |
| Toast | Disband | Group already disbanded | Success toast with Undo |
| Field error | Group Name | Enter the group name | Under the field |
| Text | Composer, messages off | Only admins can send messages in this group. | Replaces the composer |
| Text | Former member | You’re no longer a member of this group. | Read-only chat composer |
| Status | Left | You left the group | Group row |
| Status | Removed | {Owner name} removed you | Group row |
| Status | Disbanded | This group has been disbanded by the owner | Group row |
| Empty | Group tab | You have no group chat yet | Button “Create new group chat” |
| Empty | Friend list | You have no friend list yet | Continue lets the user create a group with only themselves |
| Empty | Media | No media shared yet | Media & files screen |
| Empty | Files | No files shared yet | Media & files screen |

Push-notification wording is not specified because push delivery is not represented in the prototype. Wording for other languages follows Google Translate until localization is final.

### 6.20 Behavior Retention and Platform Coverage

- Voice notes, reply, reactions, forwarding, message deletion, calls, and Red Packet controls reuse or extend the browser chat prototype.
- Friend-list content and direct-message permission logic follow the current prototype system.
- This artifact is a browser simulation. iOS, Android, Huawei, server, push, and web behavior require separate verification and are not established by this PRD revision.

## 7. Prototype Edge Cases

| # | Scenario | Expected Behavior |
|---|---|---|
| 1 | KYC is not approved when the user starts Create Group or Join Group | The KYC gate opens |
| 2 | The user has no friend list while creating a group | The empty state is shown; Continue opens the form with only the creator |
| 3 | The user creates a group with an empty name | The field shows “Enter the group name” |
| 4 | The user turns Send messages OFF | The member composer is replaced with “Only admins can send messages in this group.” |
| 5 | The user turns all media types OFF | The attachment button is hidden; the voice button remains visible |
| 6 | The Owner leaves a group | The Owner sees the “You left the group” row; ownership is not transferred |
| 7 | A removal event is selected in the scenario panel | The removed-user row shows “{Owner name} removed you”; the local history remains |
| 8 | The Owner deletes a group | The Owner’s row is removed and “Group already disbanded” is shown with Undo |
| 9 | An existing member opens an invite to their group | The group chat opens directly |
| 10 | The Owner or Admin resets the invite link | The token changes and the prototype shows “New link created. The old one no longer works.” |
| 11 | A group has no shared media or files | Media & files shows the corresponding empty state |
| 12 | A web invite, invalid link, full group, or push notification is needed | The behavior is not represented in the browser prototype |
