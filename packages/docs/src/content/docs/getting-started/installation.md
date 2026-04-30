---
title: Installation
description: Get TSKit running on your machine.
---

## Prerequisites

- [Bun](https://bun.sh) v1.0 or later
- [PostgreSQL](https://www.postgresql.org) database

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/nauvalazhar/tskit.git my-app
cd my-app
bun install
```

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in the required values. At minimum you need:

- `DATABASE_URL`: your PostgreSQL connection string
- `BETTER_AUTH_SECRET`: a random secret for auth sessions (generate one with `openssl rand -base64 32`)

See the [environment variables reference](/reference/environment-variables/) for the full list, including OAuth (GitHub, Google), billing (Stripe / Polar), email (Resend / SendGrid), and storage (S3 / R2) settings.

Run database migrations to set up the schema:

```bash
bun run db:migrate
```

Optionally, seed the database with sample data for development:

```bash
bun run db:seed
```

Start the dev server:

```bash
bun dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Cleaning up

The `packages/` folder ships alongside the app but isn't part of your product. None of it is required for the dev server or production build:

- `packages/docs/` — this documentation site (Astro Starlight). Delete unless you plan to host TSKit docs alongside your app.
- `packages/cli/` — the `create-tskit` CLI. Delete unless you're maintaining a fork of it.
- `packages/skill/` — `SKILL.md`, a project guide that AI coding assistants (Claude Code, Cursor, etc.) read for conventions. Keep this if you use AI tools.

Workspaces use a `packages/*` glob, so removing individual sub-folders doesn't require any other config changes.

## Configuring services

The app boots without any external services. To turn specific features on, see the relevant guide:

- [Billing](/guides/billing/): Stripe or Polar
- [Email](/guides/email/): Resend or SendGrid
- [Storage](/guides/storage/): S3 or Cloudflare R2
- [Authentication](/guides/authentication/): GitHub and Google OAuth

## Scripts

| Command | What it does |
|---------|-------------|
| `bun dev` | Start dev server on port 3000 |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun test` | Run tests (Vitest) |
| `bun run db:generate` | Generate Drizzle migrations from schema changes |
| `bun run db:migrate` | Apply pending database migrations |
| `bun run db:seed` | Seed database with development data |
| `bun run auth:generate` | Regenerate Better Auth schema |
| `bun run email:dev` | Start React Email preview on port 3001 |
| `bun run ui` | Run Selia UI CLI to add or update components |
