# Employee Support Ticket Application

A full-stack employee IT support ticket application built with Next.js, TypeScript, Prisma, SQLite, Tailwind CSS, and iron-session. Employees can submit and manage their own support requests, while support staff can view every request and maintain its lifecycle.

The application includes authentication, role-based authorization, ticket creation and editing, support status changes, chronological ticket comments, and persistent local storage.

## Table of Contents

- [Features](#features)
- [Roles and Permissions](#roles-and-permissions)
- [Ticket Lifecycle](#ticket-lifecycle)
- [Comment Feature](#comment-feature)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Database and Seed Data](#database-and-seed-data)
- [Running the Application](#running-the-application)
- [User Accounts](#user-accounts)
- [Pages](#pages)
- [API Reference](#api-reference)
- [Validation and HTTP Responses](#validation-and-http-responses)
- [Architecture](#architecture)
- [Verification](#verification)
- [Security Notes](#security-notes)
- [Scope and Limitations](#scope-and-limitations)
- [Development Commands](#development-commands)

## Features

- Username/password authentication with hashed passwords
- HTTP-only, signed session cookies
- Employee and support staff roles
- Employee ticket lists limited to the signed-in employee
- Support staff views for all tickets
- Ticket creation with server-side validation
- Ticket field editing while a ticket is not Closed
- Support-only status updates
- Chronological ticket discussion threads
- Support and employee comment identity badges
- Closed-ticket edit and comment protection
- Persistent SQLite storage
- Responsive Tailwind CSS interface
- Server-side authorization independent of UI controls

## Roles and Permissions

| Action | Employee - Creator | Employee - Non-Creator | Support Staff |
|---|---|---|---|
| Create ticket | Yes | Yes | No |
| View own ticket | Yes | - | - |
| View another employee's ticket | - | No | Yes |
| Edit title, description, category, or priority | Yes, unless Closed | No | No |
| Change status | No | No | Yes |
| View comments | Yes | No | Yes |
| Post comment on an Open, In Progress, or Resolved ticket | Yes | No | Yes |
| Post comment on a Closed ticket | No | No | No |

Authorization is enforced in shared server functions and again in Route Handlers. Hiding a control in the interface does not authorize the corresponding API action.

## Ticket Lifecycle

All newly created tickets begin in `Open` status.

| Status | Meaning | Creator field editing | Comments |
|---|---|---|---|
| Open | Submitted, not yet being worked | Allowed | Allowed |
| In Progress | Support staff are actively working | Allowed | Allowed |
| Resolved | Support staff consider the issue addressed | Allowed | Allowed |
| Closed | Work has finished | Not allowed | Not allowed |

Support staff can change a ticket from any status to any other status. Reopening a Closed ticket restores field-editing availability to its creator.

## Comment Feature

Comments use a Prisma `Comment` model related to both `Ticket` and `User`.

Each comment stores:

- Unique comment ID
- Comment content
- Related ticket ID
- Author user ID
- Creation timestamp

Comments are:

- Trimmed before saving
- Required to contain at least one non-whitespace character
- Limited to 1,000 characters
- Ordered from oldest to newest
- Displayed with author username and role
- Added to the ticket detail view immediately below ticket information
- Prevented from modifying the ticket's `updatedAt` value

In the UI:

- Support staff comments receive a purple Support Staff badge
- The ticket creator's employee comments receive a blue Creator badge
- Other employee identities receive an Employee badge
- Timestamps are formatted using the visitor's locale
- A Closed ticket shows a locked comment state instead of a composer

This implementation intentionally treats Closed tickets as read-only for comments. Posting a comment to a Closed ticket returns `400` and does not change the ticket or comment data.

## Technology Stack

| Layer | Technology |
|---|---|
| Application framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19 and Tailwind CSS |
| Icons | Lucide React |
| Database | SQLite |
| ORM | Prisma 6 |
| Password hashing | bcryptjs |
| Session management | iron-session |
| Runtime verification | tsx |
| Development linting | ESLint |

## Project Structure

```text
Employee Support Ticket - 4/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db
├── scripts/
│   └── verify.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── me/route.ts
│   │   │   └── tickets/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           ├── route.ts
│   │   │           ├── status/route.ts
│   │   │           └── comments/route.ts
│   │   ├── login/page.tsx
│   │   ├── tickets/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── CommentForm.tsx
│   │   ├── CommentList.tsx
│   │   ├── Navbar.tsx
│   │   ├── StatusSelect.tsx
│   │   └── TicketForm.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── session.ts
│   │   ├── tickets.ts
│   │   └── validate.ts
│   └── proxy.ts
├── .env.example
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20 or later is recommended
- npm
- A Windows, macOS, or Linux development environment

## Installation and Setup

1. Install dependencies:

```powershell
npm install
```

2. Create the environment file:

```powershell
Copy-Item .env.example .env
```

3. Replace `SESSION_SECRET` in `.env` with a secure random string of at least 32 characters.

4. Synchronize the Prisma schema with SQLite:

```powershell
npx prisma db push
```

This creates or updates `prisma/dev.db` and generates the Prisma client.

5. Seed the training users and sample tickets:

```powershell
npx prisma db seed
```

The seed operation creates only missing users and creates sample tickets only if the Ticket table is empty.

## Environment Variables

Example `.env.example`:

```dotenv
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace_with_a_secure_random_string_of_at_least_32_chars"
```

### `DATABASE_URL`

The SQLite database path. The configured value stores the database at:

```text
prisma/dev.db
```

### `SESSION_SECRET`

The secret used by iron-session to seal session cookies. Use a long, random value in every deployed environment. Do not reuse the example placeholder.

## Database and Seed Data

### User

- `id`: integer primary key
- `username`: unique string
- `passwordHash`: bcrypt password hash
- `role`: `employee` or `support`
- `tickets`: tickets created by the user
- `comments`: comments authored by the user

### Ticket

- `id`: integer primary key
- `title`: string
- `description`: string
- `category`: `Hardware`, `Software`, `Network`, `Access`, or `Other`
- `priority`: `Low`, `Medium`, or `High`
- `status`: `Open`, `In Progress`, `Resolved`, or `Closed`
- `createdById`: creator foreign key
- `createdAt`: creation timestamp
- `updatedAt`: field/status update timestamp
- `comments`: chronological discussion records

### Comment

- `id`: integer primary key
- `content`: comment text
- `ticketId`: related ticket
- `authorId`: signed-in comment author
- `createdAt`: comment timestamp

Deleting a ticket cascades to delete its comments.

## Running the Application

Start the development server:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

The root route sends signed-out users to `/login` and signed-in users to `/tickets`.

For a production build:

```powershell
npm run build
npm start
```

## User Accounts

These training accounts are seeded with the known password `password123`:

| Username | Password | Role |
|---|---|---|
| `employee1` | `password123` | Employee |
| `employee2` | `password123` | Employee |
| `support1` | `password123` | Support Staff |

No registration or user-administration interface is included.

## Pages

### `/login`

- Signs users in with username and password
- Shows authentication errors
- Provides quick-select buttons for the seeded accounts

### `/tickets`

- Loads role-appropriate ticket rows
- Employees see only their own tickets
- Support staff see every ticket and the creator username
- Employees see a create-ticket link
- Support staff see ticket operation totals

### `/tickets/new`

- Employee-only ticket creation page
- Requires title, description, category, and priority
- Does not expose a status field
- Sends the ticket to the create API

### `/tickets/[id]`

- Displays the ticket ID, title, description, category, priority, status, creator, created date, and updated date
- Shows comments oldest to newest
- Shows the field editor only to the creator when the ticket is not Closed
- Shows the status control only to support staff
- Shows comments and the comment composer to authorized viewers
- Shows no ticket content to unauthorized employees

## API Reference

All ticket operations require an active session unless otherwise stated.

### Authentication

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and create the session |
| `POST` | `/api/auth/logout` | Destroy the session |
| `GET` | `/api/auth/me` | Return the current user and role |

### Tickets

| Method | Path | Authorization | Purpose |
|---|---|---|---|
| `GET` | `/api/tickets` | Signed-in employee or support user | List own tickets or all tickets |
| `POST` | `/api/tickets` | Employee | Create an Open ticket |
| `GET` | `/api/tickets/:id` | Ticket creator or support staff | Return ticket details and comments |
| `PATCH` | `/api/tickets/:id` | Ticket creator, unless Closed | Update title, description, category, or priority |
| `PATCH` | `/api/tickets/:id/status` | Support staff | Change one of the four statuses |

### Comments

| Method | Path | Authorization | Purpose |
|---|---|---|---|
| `GET` | `/api/tickets/:id/comments` | Ticket creator or support staff | Return comments oldest to newest |
| `POST` | `/api/tickets/:id/comments` | Ticket creator or support staff, unless Closed | Create a comment |

Example comment request:

```json
{
  "content": "The VPN issue has been reproduced and is under review."
}
```

Example comment response:

```json
{
  "id": 12,
  "content": "The VPN issue has been reproduced and is under review.",
  "ticketId": 7,
  "authorId": 3,
  "createdAt": "2026-11-18T12:30:00.000Z",
  "author": {
    "username": "support1",
    "role": "support"
  }
}
```

## Validation and HTTP Responses

| Status | Meaning |
|---|---|
| `200` | Operation succeeded |
| `201` | Ticket or comment was created |
| `400` | Invalid input or prohibited action for the current lifecycle state |
| `401` | No signed-in user |
| `403` | Signed-in user has an unauthorized role |
| `404` | Ticket does not exist or an employee cannot view it |
| `500` | Unexpected server-side error |

Server validation applies the following rules:

| Field | Rule |
|---|---|
| Title | Trimmed; required; 1–100 characters |
| Description | Trimmed; at least one character |
| Category | `Hardware`, `Software`, `Network`, `Access`, or `Other` |
| Priority | `Low`, `Medium`, or `High` |
| Status | `Open`, `In Progress`, `Resolved`, or `Closed` |
| Comment content | Trimmed; required; 1–1,000 characters |

Refused operations must not change ticket or comment records.

## Architecture

The application uses one Next.js server and one Prisma data-access layer:

```text
Browser
  -> Server Component or Client Component
  -> Route Handler or shared server function
  -> Session lookup
  -> Role and ownership authorization
  -> Input validation
  -> Prisma
  -> SQLite
```

Shared server modules include:

- `src/lib/session.ts`: reads and writes the iron-session cookie
- `src/lib/auth.ts`: loads the signed-in database user
- `src/lib/validate.ts`: validates and trims user input
- `src/lib/tickets.ts`: performs ticket and comment operations
- `src/lib/prisma.ts`: owns the shared Prisma client

The Next.js proxy at `src/proxy.ts` redirects unauthenticated ticket-page and login-page visits when appropriate. Ownership and role decisions remain in server functions rather than proxy logic.

Ticket comments do not update `Ticket.updatedAt`; only ticket field and status writes refresh that timestamp.

## Verification

The verification script exercises the application's seeded users and shared server functions.

Run:

```powershell
npm run verify
```

The suite covers ticket visibility, creation validation, field editing, status changes, reopened tickets, comment validation, comment ordering, author identities, unauthorized comment access, and Closed-ticket comment protection.

The latest implemented verification run reports:

```text
49 passed, 0 failed
```

## Security Notes

- Passwords are stored as bcrypt hashes
- Session cookies are HTTP-only
- Ticket operations use the database user role, not a browser-provided role
- Employees cannot read or comment on another employee's ticket
- Support staff cannot edit ticket text
- Employees cannot change ticket status
- Closed tickets reject field edits and new comments
- API responses do not return hidden ticket details to unauthorized employees
- Input is trimmed and validated before database writes

## Scope and Limitations

The application intentionally leaves out:

- Registration and password reset
- User administration
- Email or push notifications
- External integrations
- Payments
- Ticket assignment
- Attachments
- Search and filtering
- Dashboards and reports
- Editing or deleting comments
- Automatic priority changes
- Due dates and escalation
- Multiple support roles
- A separate backend or database access system

## Development Commands

```powershell
npm run dev       # Start the Next.js development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm start         # Start the production server
npm run verify    # Run shared-server verification checks
npx prisma db push # Synchronize the SQLite database with schema.prisma
npx prisma db seed # Seed users and sample data
npx prisma studio  # Inspect data through Prisma Studio
npx prisma generate # Generate the Prisma client
```
