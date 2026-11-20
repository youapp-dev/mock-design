# Activity Flow Logic V3

This document defines Activity behavior in the prototype. Activities are free. Services remain paid, are available only to Hosts, and carry a 30% fee.

## 1. Access and creation

- Create an activity through **You tab → My Activities → Create Activity**. This is the only creation path.
- The Host dashboard shows **Create Service**.
- Guests who try to create an activity are directed to log in. Signed-in users without approved KYC see the **Verify your identity first** sheet. Users with approved KYC enter the form.
- The Create Activity form has 7 steps.
  1. Category and subcategory.
  2. Title (maximum 120 characters) and description (maximum 500 characters).
  3. Photos (minimum 3).
  4. Activities (1–5 items).
  5. Location.
  6. Schedule and sessions. Sessions cannot overlap or start in the past.
  7. Minimum and maximum participants. The maximum can be turned off. An activity with no maximum never reaches **Fully Booked**.
- The form has no price, payment, PIN, promo, fee, or draft step. Leaving the form shows **Leave without saving?**.
- After the final step is confirmed, the activity changes to **In review**.

## 2. Status and groups

`Submit → In review → (Approve → Live / Reject → Rejected)`

- An activity is active from admin approval until the final session ends. It then changes to **Ended**.
- **In review** or **Rejected** activities have no group and can be deleted without a group dialog.
- Admin approval automatically creates the activity group. The owner becomes the group admin. The group name uses the `Activity:` prefix, and the bio links to the activity.
- When the owner accepts a request, the participant automatically joins the group. Pending or rejected requests do not add participants.

## 3. Request to Join

- Open activity details from **Discover → Activities**, Search, or the media viewer.
- The detail screen shows **Free · owner approves**. There is no payment.
- Participants select a session and the number of people. The count cannot exceed the session's remaining spots.
- The request goes directly to the owner, and the CTA changes to **Request Sent**.
- The CTA is disabled when the activity is **Fully Booked**, is in another country, or the participant has already sent a request. Applicants can withdraw pending requests.
- Joining requires login. KYC applies to activity creation only. Participants see no KYC prompt when requesting to join.

## 4. My Activities and editing

- **My Activities** shows created activities and submitted requests.
- The owner's applicant list has **New Request**, **Accepted**, and **Rejected** tabs.
- Pending requests count toward the maximum number of participants. Rejection requires no refund because the activity is free.
- The owner cannot remove accepted participants from the group.
- Editing is locked while the schedule is active if the activity already has accepted participants. Saved changes go back to admin review.

## 5. Groups, leaving, unlisting, and deletion

- While the schedule is active, members cannot leave or withdraw from the activity. The owner cannot leave, delete, unlist, or list it again. Unavailable actions appear dimmed and explain why when tapped.
- After the final session ends, members and the owner can leave. When the owner leaves, the longest-standing member becomes the admin. If the owner is the last member, the group is disbanded.
- Unlisting leaves the group active and linked to the activity.
- Deletion is available only outside the active schedule.
  - With no group, show the standard deletion confirmation.
  - With a group, offer **Delete activity and group**, **Delete activity, keep the group**, or **Cancel**.
  - If the group is kept, remove the activity prefix and link. A system message explains that it has become a regular group.

## 6. Navigation and naming

- The Discover tabs are **Hosts / Activities / Cashback**. Internal keys stay the same.
- The bottom navigation and chat title use **Hosts**.
- Reviews after an activity ends follow the existing rules.
