# Implementation Tasks and Acceptance-Criterion Review

These are the tasks from `D:\PLAN.txt`, normalized into a checklist. They are not instructions to modify the current application during this exercise.

Legend: **Linked** means the task explicitly covers an acceptance criterion or covers a requirement that the SRS traceability table maps to one. **Not linked** means no AC in the SRS confirms the task.

| ID | Task | Acceptance criteria | Review |
|---|---|---|---|
| 1.1 | Create the Next.js App Router, TypeScript, and Tailwind shell. | — | **Not linked**; only claims NFR-05, which is a scope check rather than an AC. |
| 1.2 | Define Prisma User/Ticket/Comment models, migrate, and seed the three users. | AC-01 | **Linked** via FR-01. |
| 1.3 | Add trim and validation helpers for title, description, category, priority, status, and comments. | AC-02, AC-03, AC-06, AC-07, AC-08, AC-10 | **Linked** via VAL-01–VAL-06. |
| 2.1 | Add login, logout, current-user handlers, and signed session cookie. | AC-01 | **Linked**. |
| 2.2 | Add server-side current-user, role, and authorization helpers. | AC-01, AC-05, AC-09, AC-11 | **Linked** via FR-01/NFR-01. |
| 2.3 | Build login page, role-aware layout, sign-out, and unauthenticated page redirect. | AC-01 | **Linked**. |
| 3.1 | Add employee-only ticket creation function/endpoint with validation, Open status, ownership, timestamps, and no-write failures. | AC-02, AC-03, AC-11 | **Linked**. |
| 3.2 | Add role-filtered ticket list function/endpoint. | AC-04 | **Linked**. |
| 3.3 | Add the role-aware ticket list page, fields, creator display, empty state, and create link. | AC-01, AC-04 | **Linked**. |
| 3.4 | Add employee create form, validation messages, post-success navigation, and no status field. | AC-02, AC-03 | **Linked**. |
| 4.1 | Add authorized ticket-detail function/endpoint with chronological comments and hidden-ticket 404 behavior. | AC-05 | **Linked**. |
| 4.2 | Add creator-only field updates, lifecycle restriction, validation, timestamp behavior, and refusal preservation. | AC-06, AC-07, AC-09, AC-11 | **Linked**. |
| 4.3 | Add support-only status updates for every status transition with timestamp behavior. | AC-08, AC-11 | **Linked**. |
| 4.4 | Add ticket detail page with fields, dates, role-specific controls, and hidden-ticket protection. | AC-05, AC-06, AC-08 | **Linked**. |
| 5.1 | Add comment creation for authorized viewers in every status, including Closed, with validation and unchanged ticket timestamp. | AC-07, AC-10, AC-11 | **Linked**. |
| 5.2 | Add chronological comment list/form, author/time display, closed-ticket form, and validation message. | AC-07, AC-10 | **Linked**. |
| 6.1 | Test signed-out rejection, role-aware screens/actions, and sign-out blocking. | AC-01 | **Linked**. |
| 6.2 | Test valid create, Open status, creator, dates, unique ID, and 100-character title. | AC-02 | **Linked**. |
| 6.3 | Test invalid create inputs produce no row and a message. | AC-03 | **Linked**. |
| 6.4 | Test separate employee lists and support creator display. | AC-04 | **Linked**. |
| 6.5 | Test another employee cannot receive fields/comments for a hidden ticket. | AC-05 | **Linked**. |
| 6.6 | Test creator edits in all editable statuses and timestamp invariants. | AC-06 | **Linked**. |
| 6.7 | Test Closed field refusal, unchanged fields, and authorized comments. | AC-07 | **Linked**. |
| 6.8 | Test employee status refusal, all support transitions, timestamp changes, and reopening. | AC-07, AC-08 | **Linked**. |
| 6.9 | Test support/non-creator field-edit refusal. | AC-09 | **Linked**. |
| 6.10 | Test blank-comment refusal, author/time, order, and unchanged ticket timestamp. | AC-10 | **Linked**. |
| 6.11 | Test reload after every refused operation. | AC-11 | **Linked**. |
| 6.12 | Test sign-out/sign-in persistence after create, edit, status, and comment. | AC-12 | **Linked**. |

## Unlinked-task result

Only **Task 1.1** lacks a direct acceptance-criterion link. It is a project-shell/bootstrap task and is justified by the SRS scope constraint (NFR-05), but NFR-05 has no standalone acceptance criterion. No other plan task is unlinked when the SRS traceability table is followed.
