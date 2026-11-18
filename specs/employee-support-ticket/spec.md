# Feature Specification: Employee Support Ticket Application

## Source of truth

This specification is derived from `D:\SRS.txt`. The SRS governs business behavior and acceptance criteria; `D:\PLAN.txt` governs the proposed technical approach. This exercise does not change application code.

## Overview

Signed-in employees report IT problems and follow their own tickets. Support staff can see every ticket, change its status, and discuss tickets with requesters. The application uses the two roles `Employee` and `Support Staff`.

## Actors and permissions

| Action | Employee | Support Staff |
|---|---|---|
| Create a ticket | Yes | No |
| List tickets | Own tickets only | All tickets |
| View details/comments | Own tickets only | Any ticket |
| Edit title, description, category, priority | Own ticket unless Closed | No |
| Change status | No | Yes |
| Add a comment | Own ticket, including Closed | Any ticket, including Closed |

Every ticket action requires a signed-in user. A refused request must return no hidden ticket content and must not change stored data.

## Ticket and comment rules

- A ticket has a unique immutable ID, title, description, category, priority, status, creator, created date, and last-updated date.
- Categories are `Hardware`, `Software`, `Network`, `Access`, and `Other`.
- Priorities are `Low`, `Medium`, and `High`.
- Statuses are `Open`, `In Progress`, `Resolved`, and `Closed`.
- New tickets always start as `Open`; support can move a ticket from any status to any other status.
- Title and description are trimmed before validation. Title must be 1–100 characters; description must contain at least one character.
- Comment text is trimmed and must contain at least one character. Comments store text, signed-in author, and creation time, and appear oldest-first.
- Field edits refresh last-updated date while preserving creator and created date. Status changes also refresh last-updated date. Comments do not change ticket last-updated date.
- Closed tickets cannot have fields edited, but an authorized viewer can still add comments. Reopening a Closed ticket restores creator field editing.

## Functional requirements

- **FR-01:** Sign in and sign out; ticket actions are available only while signed in.
- **FR-02:** Employees create tickets with title, description, category, and priority; the system sets Open, creator, both dates, and a unique ID.
- **FR-03:** Employees list only their tickets; support lists every ticket and creator; list rows show the required ticket fields and dates.
- **FR-04:** Authorized users view all ticket fields, both dates, and comments in time order.
- **FR-05:** The creating employee edits the four editable fields while status is not Closed; successful saves refresh last-updated only.
- **FR-06:** Support changes status to any valid status from any current status; successful changes refresh last-updated.
- **FR-07:** An authorized viewer adds a comment in any status, including Closed.

## Non-functional requirements

- **NFR-01:** All create, list, view, edit, status, and comment actions enforce session, role, and ownership checks.
- **NFR-02:** Invalid input gives a clear message and leaves tickets/comments unchanged.
- **NFR-03:** Tickets, edits, status changes, and comments persist across sign-out/sign-in.
- **NFR-04:** Screens show the user role and ticket statuses; Closed hides field editing but keeps authorized comment entry available.
- **NFR-05:** Keep the scope limited to this specification; exclude payments, notifications, and external integrations.

## Acceptance criteria

- **AC-01:** Signed-out users cannot list, create, view, edit, or comment. After sign-in, each role sees its actions and role.
- **AC-02:** A valid employee submission creates an Open ticket with the employee as creator, both dates, and a unique ID.
- **AC-03:** Blank title/description, overlong title, or invalid category/priority creates no ticket and explains the failure.
- **AC-04:** Employee lists contain only that employee’s tickets; support lists contain every ticket and creator.
- **AC-05:** An employee requesting another employee’s ID receives no fields/comments and cannot comment.
- **AC-06:** The creator can validly edit an Open, In Progress, or Resolved ticket; last-updated changes while creator and created date remain unchanged.
- **AC-07:** A Closed field edit is refused without changing fields; an authorized user can still add a valid comment.
- **AC-08:** Employees cannot change status; support can set every valid status from every current status and last-updated changes.
- **AC-09:** Support and non-creators cannot edit ticket fields.
- **AC-10:** Blank comments are refused; valid comments store author/time and appear chronologically.
- **AC-11:** After every refused create, edit, status, or comment, reloading shows the previous stored values.
- **AC-12:** After create/edit/status/comment, signing out and in again shows the same ID, fields, status, and comments.

## Out of scope

Registration, password reset, user administration, extra roles, assignment, attachments, search, filters, dashboards, reports, comment editing/deletion, due dates, escalation, automatic priority changes, payments, notifications, and external integrations.
