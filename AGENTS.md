<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project shape

- This is a single Next.js 16 App Router application; the runtime entrypoints are under `src/app`, with API Route Handlers in `src/app/api` and shared server/data-access logic in `src/lib`.
- `src/lib/tickets.ts` is the authorization-aware service layer used by both pages and Route Handlers. Preserve its ownership/role checks; UI visibility and `src/proxy.ts` redirects are not authorization boundaries.
- Prisma uses SQLite through `prisma/schema.prisma`; `DATABASE_URL` in `.env` points to `prisma/dev.db`. Keep the shared client in `src/lib/prisma.ts` and use the `@/*` alias for `src/*` imports.

## Setup and data

- After `npm install`, copy `.env.example` to `.env` and replace `SESSION_SECRET` with a random value of at least 32 characters. Do not commit `.env` or real secrets.
- Initialize the local database before running the app or verification: `npx prisma db push`, then `npx prisma db seed`. Seeding is additive for users and only creates sample tickets when the Ticket table is empty.
- Seeded local accounts all use `password123`: `employee1`, `employee2`, and `support1`. They are training credentials only.
- Schema changes require `npx prisma db push` (which also generates the Prisma client); use `npx prisma generate` when client regeneration is needed without changing the database.

## Commands

- Development: `npm run dev` (opens at `http://localhost:3000`); production check: `npm run build` then `npm start`. The build script intentionally invokes `next build --webpack`.
- Lint: `npm run lint`. There is no separate test runner or typecheck script in `package.json`; `npm run verify` is the executable integration-style check and requires the seeded database.
- Verification: `npm run verify` exercises the shared ticket/auth logic, permissions, lifecycle rules, validation, and comments. It writes verification-created records to the local SQLite database, so use a disposable/reset local DB if clean data matters.
- Useful database inspection: `npx prisma studio`.

## Domain constraints that are easy to miss

- New tickets are always `Open`; only support users may change status, while only the ticket creator may edit fields. `Closed` tickets reject field edits and comments; support can reopen them.
- Employees receive only their own tickets. Unauthorized ticket access intentionally resolves as not found (`404`) to avoid leaking records.
- Ticket field/status writes update `updatedAt`; comment writes intentionally do not. Comments are trimmed, limited to 1,000 characters, and returned oldest-first.
