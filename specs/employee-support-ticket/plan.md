# Implementation Plan: Employee Support Ticket Application

## Planning basis

This is the technical plan derived from `D:\PLAN.txt`, constrained by the SRS in `D:\SRS.txt`. It targets the existing stack: Next.js App Router with TypeScript, React/Tailwind, Prisma with SQLite, bcryptjs, and iron-session. It is an analysis artifact; do not rebuild or modify the existing application for this exercise.

## Architecture

```text
Browser
  -> Server Component or client form
  -> Route Handler or shared server function
  -> session/auth, validation, role/ownership checks
  -> Prisma
  -> SQLite
```

- Pages live under `src/app`; API handlers live under `src/app/api`.
- Shared modules are `src/lib/session.ts`, `src/lib/auth.ts`, `src/lib/validate.ts`, `src/lib/tickets.ts`, and `src/lib/prisma.ts`.
- The browser is never an authorization boundary. Server functions and handlers must enforce the same rules.
- Use seeded `employee1`, `employee2`, and `support1` accounts; there is no registration flow.
- Preserve the existing Next.js/Prisma architecture and do not add another backend or database path.

## Data model

Use User, Ticket, and Comment records with unique IDs, ownership/author relations, timestamps, and the SRS values for category, priority, and status. Prisma persists them to the local SQLite database. Validation occurs before writes.

## Delivery order

1. Establish the project/database shell and validation helpers.
2. Implement session, authentication, authorization, login/layout, and sign-out.
3. Implement ticket creation and role-filtered lists.
4. Implement ticket details, field updates, status updates, and lifecycle rules.
5. Implement comments and closed-ticket behavior.
6. Run the acceptance checks through pages and handlers, including persistence and refused-write checks.

## Verification strategy

Use the three seeded users. Test UI behavior through pages and use Route Handlers/shared server functions where hidden data or refused writes must be inspected. Verify that every refusal preserves stored data, and verify sign-out/sign-in persistence. The final scope check must confirm the SRS out-of-scope list is not implemented.

## Explicit SRS constraints

Support cannot create or edit ticket text; employees cannot change status; new tickets have no client-controlled status; Closed tickets reject field edits but allow authorized comments; comments do not update ticket last-updated.
