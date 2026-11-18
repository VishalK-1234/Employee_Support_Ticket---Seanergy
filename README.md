# Employee Support Ticket Application

A full-stack employee IT support portal built with Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

Employees can submit and manage their own tickets. Support staff can review all tickets, update statuses, and participate in chronological comment threads.

The interface uses a professional dark theme, a red accent, Inter/Segoe UI typography, Lucide icons, and accessible dark form and table surfaces.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Roles and Permissions](#roles-and-permissions)
- [Ticket Lifecycle](#ticket-lifecycle)
- [Database Setup](#database-setup)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [User Accounts](#user-accounts)
- [Application Routes](#application-routes)
- [Architecture](#architecture)
- [Validation and API Responses](#validation-and-api-responses)
- [Verification](#verification)
- [Security Notes](#security-notes)
- [Development Commands](#development-commands)

## Features

- Username/password authentication with bcrypt password hashes
- HTTP-only, secure iron-session cookies
- Employee and support staff roles
- Employee access restricted to owned tickets
- Support access to every ticket
- Ticket creation and field editing
- Support-only ticket status changes
- Chronological comment threads
- Closed-ticket field and comment protection
- Responsive dark ticket tables and detail views
- Neon PostgreSQL persistence
- Vercel-ready Next.js build
- Custom SupportDesk browser icon
- Hidden scrollbars for cleaner horizontal table scrolling

## Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19 and Tailwind CSS |
| Icons | Lucide React |
| Database | Neon PostgreSQL |
| ORM | Prisma 6 |
| Authentication | iron-session |
| Password hashing | bcryptjs |
| Verification | tsx |
| Linting | ESLint |

## Roles and Permissions

| Action | Employee - Creator | Employee - Non-Creator | Support |
|---|---|---|---|
| Create a ticket | Yes | Yes | No |
| View an owned ticket | Yes | No | Yes |
| View another employee's ticket | No | No | Yes |
| Edit title, description, category, or priority | Yes, unless Closed | No | No |
| Change status | No | No | Yes |
| View comments | Yes | No | Yes |
| Post comments on Open, In Progress, or Resolved tickets | Yes | No | Yes |
| Post comments on Closed tickets | No | No | No |

Authorization is enforced in shared server functions and Route Handlers. UI visibility is not treated as an authorization boundary.

## Ticket Lifecycle

New tickets start in `Open` status.

| Status | Creator field editing | Comments |
|---|---|---|
| Open | Allowed | Allowed |
| In Progress | Allowed | Allowed |
| Resolved | Allowed | Allowed |
| Closed | Not allowed | Not allowed |

Support staff can move a ticket to any status. Reopening a Closed ticket restores field editing for the creator.

## Database Setup

The application uses Neon PostgreSQL through Prisma.

The Prisma datasource is configured in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Create a `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Use the pooled Neon connection string as `DATABASE_URL`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
SESSION_SECRET="replace_with_a_random_secret_of_at_least_32_characters"
```

Do not commit `.env` or expose the database connection string.

Initialize and seed the database:

```powershell
npx prisma generate
npx prisma db push
npx prisma db seed
```

- `db push` creates or updates PostgreSQL tables from `schema.prisma`.
- `db seed` creates missing demo users and creates five sample tickets only when the Ticket table is empty.
- `postinstall` also runs `prisma generate` during dependency installation.

## Local Development

Prerequisites:

- Node.js 20 or later
- npm
- A Neon PostgreSQL database

Install and run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

The root route redirects signed-out users to `/login` and signed-in users to `/tickets`.

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `SESSION_SECRET` | Random secret of at least 32 characters used to seal session cookies |

Generate a suitable session secret with an installed tool such as OpenSSL:

```powershell
openssl rand -base64 48
```

## Vercel Deployment

Before deploying:

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add `DATABASE_URL` for Production, Preview, and Development environments.
4. Add `SESSION_SECRET` for Production, Preview, and Development environments.
5. Deploy.

Use the Neon **pooled** connection string for serverless functions.

Vercel runs the package postinstall script, which executes:

```powershell
prisma generate
```

Database setup is independent of the Vercel build:

```powershell
npx prisma db push
npx prisma db seed
```

Run these before or after deployment as needed against the configured Neon database.

## User Accounts

The seed script provides these training accounts:

| Username | Password | Role |
|---|---|---|
| `employee1` | `password123` | Employee |
| `employee2` | `password123` | Employee |
| `support1` | `password123` | Support staff |

These credentials are training-only. Change or remove them before exposing real organizational data.

## Application Routes

### Pages

| Route | Purpose |
|---|---|
| `/login` | Authentication |
| `/tickets` | Role-aware ticket list |
| `/tickets/new` | Employee ticket creation |
| `/tickets/[id]` | Ticket details, status, editing, and comments |

### Authentication API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate and create a session |
| POST | `/api/auth/logout` | Destroy the session |
| GET | `/api/auth/me` | Return the current user |

### Ticket API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/tickets` | List authorized tickets |
| POST | `/api/tickets` | Create an Open ticket |
| GET | `/api/tickets/:id` | Return authorized ticket details |
| PATCH | `/api/tickets/:id` | Edit authorized ticket fields |
| PATCH | `/api/tickets/:id/status` | Update status as support |

### Comment API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/tickets/:id/comments` | List comments oldest to newest |
| POST | `/api/tickets/:id/comments` | Add a comment to a non-Closed ticket |

Example comment request:

```json
{
  "content": "The VPN issue has been reproduced and is under review."
}
```

## Architecture

```text
Browser
  -> Next.js page or Route Handler
  -> iron-session lookup
  -> Role and ownership authorization
  -> Shared input validation
  -> Prisma
  -> Neon PostgreSQL
```

Key modules:

- `src/lib/session.ts`: creates and reads the session cookie
- `src/lib/auth.ts`: loads the authenticated database user
- `src/lib/validate.ts`: validates and normalizes input
- `src/lib/tickets.ts`: applies ownership and role authorization
- `src/lib/prisma.ts`: owns the shared Prisma client
- `src/proxy.ts`: redirects page visits based on the session cookie

`src/proxy.ts` only handles navigation. Database records remain protected by server-side authorization.

Ticket field/status writes refresh `updatedAt`. Comment writes do not.

## Validation and API Responses

| Status | Meaning |
|---|---|
| `200` | Operation succeeded |
| `201` | Record created |
| `400` | Invalid input or prohibited lifecycle operation |
| `401` | No active session |
| `403` | Signed-in user lacks the required role |
| `404` | Record is missing or hidden from an employee |
| `500` | Unexpected server error |

Validation rules:

| Field | Rule |
|---|---|
| Title | Trimmed, 1–100 characters |
| Description | Trimmed and required |
| Category | `Hardware`, `Software`, `Network`, `Access`, or `Other` |
| Priority | `Low`, `Medium`, or `High` |
| Status | `Open`, `In Progress`, `Resolved`, or `Closed` |
| Comment | Trimmed, 1–1,000 characters |

## Verification

Run the integration-style verification:

```powershell
npm run verify
```

The suite verifies:

- Seeded users and password hashes
- Role-based ticket visibility
- Unauthorized 404 behavior
- Ticket creation and validation
- Creator-only field editing
- Support-only status changes
- Closed-ticket rules
- Comment validation and ordering
- Comment author roles
- Closed-ticket comment protection

Latest completed run:

```text
49 passed, 0 failed
```

Run the production build:

```powershell
npm run build
```

The latest build completes successfully and generates all application routes.

## Security Notes

- Passwords are bcrypt hashes
- Session cookies are HTTP-only
- Cookies use `Secure` in production
- Roles and ownership come from the database session user
- Employees cannot read or comment on another employee's ticket
- Support staff cannot edit ticket fields
- Employees cannot change ticket status
- Closed tickets reject field edits and comments
- The `.env` file and local SQLite database are excluded from Git
- Demo credentials must be replaced or removed for a real deployment

## Dependency Audit

`npm install` and `npm audit --omit=dev` currently report three high-severity findings in the Prisma 6 dependency chain.

The audit's suggested fix upgrades to Prisma 7, which is a breaking change. Do not use `npm audit fix --force` until the schema and project configuration have been migrated and retested.

## Development Commands

```powershell
npm install                 # Install dependencies and generate Prisma Client
npm run dev                 # Start development server
npm run lint                # Run ESLint
npm run build               # Create the production build
npm start                   # Start the production server
npm run verify              # Run server/domain verification
npx prisma generate         # Generate Prisma Client
npx prisma db push          # Synchronize Neon tables
npx prisma db seed          # Seed users and sample tickets
npx prisma studio           # Open Prisma data browser
npx prisma migrate deploy   # Deploy migration history when migrations are added
```
