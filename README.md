# TSKit

**Status: WIP**

A production-ready SaaS starter kit built on TanStack Start. Authentication, billing, email, storage, and 30+ UI components — wired together with clean architecture so you can ship your product, not boilerplate.

## Features

- **Authentication** — Email/password, GitHub & Google OAuth, two-factor auth (TOTP), email verification, password reset
- **Billing** — Stripe checkout, subscription lifecycle, customer portal, webhook handling, plan entitlements & usage metering
- **Email** — React Email templates + Resend (driver-swappable). 5 transactional templates included
- **Storage** — S3-compatible uploads (Cloudflare R2, AWS S3, MinIO) with scoped keys
- **User Settings** — Profile, avatar upload, password management, 2FA setup, theme preferences, session management, account deletion
- **UI Components** — Selia UI
- **Error Handling** — Global + per-route error boundaries with styled error/404 pages
- **Logging** — Pino structured logging with `captureException` integration point

## Tech Stack

| Category    | Technology                                         |
| ----------- | -------------------------------------------------- |
| Framework   | TanStack Start (React 19, SSR, file-based routing) |
| Auth        | Better Auth + Drizzle adapter                      |
| Database    | PostgreSQL + Drizzle ORM                           |
| Billing     | Stripe                                             |
| Email       | React Email + Resend                               |
| Storage     | AWS SDK v3 (S3/R2)                                 |
| Components  | Selia UI (Base UI + CVA)                           |
| Styling     | Tailwind CSS v4                                    |
| Language    | TypeScript                                         |
| Package Mgr | bun                                                |
| Testing     | Vitest                                             |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) running locally
- Stripe account (test mode) for billing
- Resend account for transactional email

### Setup

```bash
# Clone the repo
git clone <your-repo-url> my-saas
cd my-saas

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see comments in .env.example)

# Set up the database
createdb tskit
bun run db:generate
bun run db:migrate
bun run db:seed

# Start the dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Stripe Webhooks (local dev)

```bash
# In a separate terminal
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in your `.env`.

## Project Structure

```
src/
├── routes/          # Pages — thin shells, wires UI to logic
├── components/      # All UI — design system, auth, billing, settings, shared
├── services/        # Business logic + DB queries
├── functions/       # Server functions (RPC boundary)
├── emails/          # React Email templates (server-only)
├── hooks/           # Shared React hooks
├── middleware/       # Auth, subscription, logging middleware
├── config/          # Named channels — env vars read here
├── lib/             # App-level facades (storage, mailer, payment, auth)
├── database/        # Drizzle client, schemas, migrations, seed
└── core/drivers/    # Portable driver classes (Stripe, Resend, S3)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full architecture guide.

## Scripts

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `bun run dev`         | Start dev server on port 3000      |
| `bun run build`       | Production build                   |
| `bun run preview`     | Preview production build           |
| `bun run test`        | Run tests (Vitest)                 |
| `bun run db:generate` | Generate Drizzle migrations        |
| `bun run db:migrate`  | Run pending migrations             |
| `bun run db:seed`     | Seed the database with sample data |
| `bun run ui`          | Launch Selia UI CLI                |

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Full architecture guide with patterns, conventions, and code examples
- [CLAUDE.md](./CLAUDE.md) — AI agent reference (concise architecture overview)
- [TODO.md](./TODO.md) — Feature roadmap

## License

[MIT](./LICENSE)
