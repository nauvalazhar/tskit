# TSKit

General-purpose SaaS starter kit built on TanStack Start with batteries included.

## Stack

- **Framework:** TanStack Start (React 19, SSR, file-based routing)
- **Auth:** Better Auth + Drizzle adapter (email/password, GitHub, Google, 2FA)
- **Database:** PostgreSQL + Drizzle ORM
- **Billing:** Stripe (plans, checkout, portal, webhooks, entitlements)
- **Email:** React Email + Resend (driver-swappable)
- **Storage:** Cloudflare R2 / S3-compatible (driver-swappable)
- **Components:** Selia UI (Base UI + CVA)
- **Styling:** Tailwind CSS v4 + OKLCH color system
- **Language:** TypeScript (strict mode)
- **Package Manager:** bun

## Scripts

All scripts are run with `bun`:

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server on port 3000 |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun test` | Run Vitest tests |
| `bun run db:generate` | Generate Drizzle migrations from schema changes |
| `bun run db:migrate` | Apply pending database migrations |
| `bun run db:seed` | Seed database with development data |
| `bun run auth:generate` | Regenerate Better Auth schema (`database/schemas/auth.ts`) |
| `bun run email:dev` | Start React Email preview on port 3001 |
| `bun run ui` | Run Selia UI CLI (add/update components) |

**DO NOT** use `npx`, `bunx`, or direct tool invocations (e.g., `npx drizzle-kit generate`) — always use the `bun run <script>` aliases above.

## Project Structure

```
src/
├── routes/                          # Thin page shells — wires UI to logic
│   ├── __root.tsx                   # Root layout, session context
│   ├── _auth/                       # Guest-only layout (login, register, etc.)
│   ├── _app/                        # Authenticated layout
│   │   ├── dashboard.tsx
│   │   ├── billing.tsx              # Billing layout
│   │   ├── billing.index.tsx        # Plans & subscription
│   │   ├── billing.success.tsx      # Post-checkout success
│   │   ├── settings.tsx             # Settings layout
│   │   ├── settings.index.tsx       # Profile
│   │   ├── settings.security.tsx    # Password & 2FA
│   │   ├── settings.preferences.tsx # Theme
│   │   ├── settings.activity.tsx    # Activity log
│   │   └── settings.advanced.tsx    # Delete account
│   ├── _marketing/                  # Public pages
│   │   ├── index.tsx                # Landing page
│   │   └── pricing.tsx              # Pricing page
│   ├── admin/                       # Admin pages (overview, users, subscriptions, plans, audit)
│   └── api/
│       ├── auth.$.ts                # Better Auth handler
│       └── webhooks/stripe.ts       # Stripe webhook
│
├── components/
│   ├── selia/                       # Design system (27 components)
│   ├── app/                         # App shell, email verification banner
│   ├── auth/                        # Login, signup, forgot/reset password forms
│   ├── billing/                     # Plan card, checkout, cancel, change plan, status
│   ├── settings/                    # Profile, password, 2FA, avatar, sessions list, activity log
│   └── shared/                      # Error boundary, not-found, page header, tabline
│
├── validations/                     # Shared Zod schemas (importable by all layers)
│   ├── admin.ts                     # Admin search/filter schemas
│   └── audit.ts                     # Audit log query schemas
│
├── services/                        # Business logic + DB queries
│   ├── admin/                       # Admin-specific services (split by domain)
│   │   ├── overview.service.ts
│   │   ├── users.service.ts
│   │   ├── subscriptions.service.ts
│   │   └── plans.service.ts
│   ├── plan.service.ts
│   ├── subscription.service.ts
│   ├── usage.service.ts
│   └── audit.service.ts
│
├── functions/                       # Server functions (RPC boundary)
│   ├── admin/                       # Admin server functions (split by domain)
│   │   ├── overview.ts
│   │   ├── users.ts
│   │   ├── subscriptions.ts
│   │   ├── plans.ts
│   │   └── audit.ts
│   ├── auth.ts                      # getSession, listUserAccounts
│   ├── billing.ts                   # checkout, plans, subscription, cancel
│   ├── settings.ts                  # updateProfile, updateTheme, deleteAccount
│   ├── storage.ts                   # uploadAvatar
│   └── audit.ts                     # getUserAuditLogs
│
├── emails/                          # React Email templates (server-only)
│   ├── verify-email.tsx
│   ├── reset-password.tsx
│   ├── password-changed.tsx
│   ├── subscription-created.tsx
│   ├── payment-failed.tsx
│   └── index.ts                     # Template type map
│
├── queries/
│   ├── admin/                       # Admin query option factories (split by domain)
│   │   ├── overview.queries.ts
│   │   ├── users.queries.ts
│   │   ├── subscriptions.queries.ts
│   │   ├── plans.queries.ts
│   │   └── audit.queries.ts
│   ├── billing.queries.ts           # TanStack Query option factories
│   └── audit.queries.ts            # User audit log query options
│
├── hooks/
│   ├── use-email-verified.ts
│   └── use-subscription.ts
│
├── middleware/
│   ├── auth.ts                      # authMiddleware (redirects to /login)
│   ├── email-verified.ts            # emailVerifiedMiddleware
│   ├── subscribed.ts                # subscribedMiddleware (active subscription)
│   └── logging.ts                   # Request logging + serverFnErrorMiddleware
│
├── config/                          # Named channels — only place env vars are read
│   ├── features.ts                  # Feature registry (entitlement keys)
│   ├── storage.ts                   # Storage channels (S3/R2)
│   ├── mail.ts                      # Email channels (Resend)
│   └── payment.ts                   # Payment channels (Stripe)
│
├── lib/                             # App-level facades over core/
│   ├── auth.ts                      # Better Auth server instance
│   ├── auth-client.ts               # Better Auth client instance
│   ├── entitlements.ts              # hasFeature(), withinLimit(), requireLimit()
│   ├── storage.ts                   # storage.upload(), storage.use('private')
│   ├── mailer.ts                    # mailer.send(template, to, data)
│   ├── payment.ts                   # payment.checkout(), payment.portal()
│   ├── audit.ts                     # Audit log facade
│   ├── api-response.ts              # apiError(), apiSuccess() for API routes
│   ├── logger.ts                    # Pino + captureException()
│   ├── theme.ts                     # Theme utilities
│   ├── http.ts                      # HTTP helpers
│   ├── utils.ts                     # cn() and shared helpers
│   └── constants.ts                 # App-wide constants
│
├── database/
│   ├── index.ts                     # Drizzle client
│   ├── seed.ts                      # Development seed script
│   ├── schemas/
│   │   ├── auth.ts                  # user, session, account, verification
│   │   ├── billing.ts               # plans, customers, subscriptions, usage, webhookEvents
│   │   ├── settings.ts              # User settings
│   │   └── audit.ts                 # Audit log
│   └── migrations/
│
├── core/drivers/                    # Portable, config-injected driver classes
│   ├── email/                       # EmailDriver interface + ResendEmailDriver
│   ├── payment/                     # PaymentDriver interface + StripePaymentDriver
│   └── storage/                     # StorageDriver interface + S3StorageDriver
│
├── router.tsx
├── routeTree.gen.ts                 # Auto-generated (read-only)
└── styles.css
```

## Layer Rules

**Import direction:**
```
routes → components → queries → functions → services → database/
                                           → lib/*    → core/drivers
                              middleware ↗
           ↘ validations/ ← (importable by all layers, no app imports)
```

- `routes/` — thin shells. Loader calls `ensureQueryData`, renders components. No business logic.
- `components/` — all UI, grouped by domain. Access session via `Route.useRouteContext()`.
- `functions/` — server functions (RPC boundary). Auth via `.middleware()`, validation via `.validator()`.
- `services/` — business logic + DB queries. Named function exports, NOT class instances.
- `lib/` — facades over `core/`. Daily-driver imports (`storage`, `mailer`, `payment`).
- `core/drivers/` — know *how* (S3, Resend, Stripe) but not *where*. Config-injected.
- `config/` — only place env vars are read. Defines named channels.
- `validations/` — shared Zod schemas. Leaf dependency — no imports from app code. Importable by all layers.
- `emails/` — server-only. Each file exports `subject` + default component.

**Server-only safety:** Services, `lib/` facades, `core/` drivers, and DB code must always be called through `createServerFn` wrappers in `functions/`. Never call them directly from components.

## Key Patterns

### Config → Driver → Facade
Storage, email, and payment all follow: `config/*.ts` defines channels → `core/drivers/` implements the interface → `lib/*.ts` provides the facade. Consumers import from `lib/`, never from `core/` or `config/` directly.

### Middleware Chain
Server functions use `.middleware([authMiddleware])` for auth. Middleware attaches `context.user`. Chain middlewares: `subscribedMiddleware` adds `context.subscription` with plan entitlements.

### Email Templates
File name = template name: `emails/verify-email.tsx` → `mailer.send("verify-email", to, data)`. Each file exports `subject` (function) + default component. Type map in `emails/index.ts` infers props automatically.

### Entitlements
Plans store `entitlements` as JSONB (`{ projects: 3, analytics: true }`). Check with `hasFeature()` / `withinLimit()` / `requireLimit()` from `lib/entitlements.ts`. Feature keys defined in `config/features.ts`.

### Usage Tracking
`usage.service.ts` tracks per-user consumption with lazy period reset. Operates on `userId` + `featureKey`, not orgId.

### Audit Logging
`audit.service.ts` records who did what. Log via `audit.log()` facade from `lib/audit.ts`. Action names use dot-notation: `domain.resource.verb` (e.g., `billing.checkout.created`, `admin.user.banned`). Query logs via `getAuditLogs` server function (admin only, cursor-paginated).

### Session Flow
Session fetched once in `__root.tsx` → flows via route context → layout routes guard access in `beforeLoad` → components read via `Route.useRouteContext()`.

### Error Handling
- Server functions: framework primitives (`redirect`, `notFound`, `Error`)
- API routes: `apiError()` / `apiSuccess()` from `lib/api-response.ts`
- Client: error boundaries (`defaultErrorComponent`, `defaultNotFoundComponent`) catch everything

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Service file | `<domain>.service.ts` | `plan.service.ts` |
| Service exports | Named functions (not classes) | `export async function listPlans()` |
| Server function | `camelCase` verb | `createCheckout`, `getPlans` |
| Query file | `<domain>.queries.ts` | `billing.queries.ts` |
| Query object | `<domain>Queries` | `billingQueries.plans()` |
| Component file | `kebab-case.tsx` | `plan-card.tsx` |
| Route file | TanStack convention | `billing.index.tsx` |
| Email template | `kebab-case.tsx` | `verify-email.tsx` |
| Middleware | `<name>Middleware` | `authMiddleware`, `subscribedMiddleware` |
| Schema file | `<domain>.ts` | `billing.ts` |
| Config file | `<domain>.ts` | `payment.ts` |
| Hook | `use-<name>.ts` | `use-subscription.ts` |
| Validation file | `<domain>.ts` | `admin.ts` |

## What's Implemented

- Auth: email/password, GitHub OAuth, Google OAuth, 2FA (TOTP), email verification, password reset
- Billing: Stripe checkout, subscription lifecycle, webhook handling, customer portal, plan entitlements
- Email: 5 transactional templates (verify-email, reset-password, password-changed, subscription-created, payment-failed)
- Storage: S3/R2 upload with scoped keys, avatar upload
- Usage tracking & metering with lazy period reset
- User settings: profile, avatar, password, 2FA, theme preferences, session management, account deletion
- Error boundaries: global + per-route styled error/404 pages
- Logging: Pino structured logging with captureException
- Design system: 27 Selia UI components
- Marketing: landing page, pricing page
- Audit logging: schema, service, facade, wired into auth/settings/billing/storage/admin server functions
- Audit log UI: admin page (`/admin/audit`) + user settings tab (`/settings/activity`)
- Admin dashboard: overview, users, subscriptions, plans, audit log
- Database seed script
- API response helpers

## What's Planned (Not Yet Implemented)

- Team/organization UI (Better Auth org plugin is wired but no UI exists)
- Background jobs / queue system (no `core/drivers/queue/`, no `jobs/`, no `lib/queue.ts`)

## Common Tasks

### Add a page
1. Create route file in `routes/_app/<name>.tsx`
2. Create component(s) in `components/<domain>/`
3. If data needed: add server function in `functions/`, query in `queries/`, loader in route

### Add a service
1. Create `services/<domain>.service.ts` with named function exports
2. Create server functions in `functions/<domain>.ts` with appropriate middleware
3. Add query options in `queries/<domain>.queries.ts`

### Add an email template
1. Create `emails/<name>.tsx` exporting `subject` function + default component
2. Add entry to `emails/index.ts` type map and `loadTemplate` switch
3. Send via `mailer.send("<name>", to, data)`

### Add a driver
1. Implement interface in `core/drivers/<category>/<name>.ts`
2. Register in `core/drivers/<category>/index.ts`
3. Add channel in `config/<category>.ts`

## Rules for AI Agents

- **DO NOT** reference or create: `src/jobs/`, `core/drivers/queue/`, `lib/queue.ts`, `lib/rate-limit.ts` — these don't exist
- **DO NOT** use class-based services. Existing services use named function exports.
- **DO NOT** import from `core/` or `config/` in components or routes — use `lib/` facades
- **DO NOT** call services or DB directly from components — always go through `functions/`
- **DO NOT** read env vars outside of `config/` files (except `VITE_` prefixed vars in client code)
- **DO NOT** modify `routeTree.gen.ts` — it's auto-generated
- The `#/*` import alias maps to `./src/*` (configured in package.json `imports`)
- Auth schemas in `database/schemas/auth.ts` are generated by Better Auth CLI — edit with care
- Billing schema is consolidated in `database/schemas/billing.ts` (plans, customers, subscriptions, usage, webhookEvents) — not separate files
- The auth server uses `twoFactor()` plugin, NOT `organization()`. The client uses `twoFactorClient()`, NOT `organizationClient()`.
