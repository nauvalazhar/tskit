# TSKit Architecture Guide

This document describes the architecture patterns, layer rules, and conventions for the TSKit codebase. Read this before creating or modifying code in `src/`.

## Project Structure

```
src/
├── routes/            # Thin page shells (loaders + components)
│   ├── _auth/         # Guest-only layout (login, register, etc.)
│   ├── _app/          # Authenticated layout
│   ├── _marketing/    # Public pages
│   ├── admin/         # Admin pages
│   └── api/           # Server-only handlers (auth, webhooks)
├── components/        # UI grouped by domain (selia/, app/, auth/, billing/, settings/, shared/)
├── validations/       # Shared Zod schemas (leaf dep — no app imports, importable by all layers)
├── services/          # Business logic + DB queries (named function exports)
├── functions/         # Server functions (RPC boundary, middleware + validator)
├── emails/            # React Email templates (subject export + default component)
├── hooks/             # React hooks
├── middleware/         # Auth, org, admin, rate-limit, subscribed, logging
├── config/            # Named channels, static registries, env var reads
├── lib/               # App-level code — facades + shared helpers
│   └── facades/       # Config → driver wiring (never import in components)
├── database/          # Drizzle client, schemas/, migrations/, seed
│   └── schemas/       # Table definitions (auth, billing, settings, audit)
└── core/drivers/      # Portable driver interfaces + implementations
```

## Layer Rules

### Import Direction

```
routes → components → functions → services → database/
                                → lib/facades/ → core/drivers
                   middleware ↗
           ↘ validations/ ← (importable by all layers, no app imports)
           ↘ lib/* (non-facades) ← (importable by all layers)
```

### Layer Responsibilities

- **routes/** — thin shells. Loader awaits a server function and returns its data; components read via `Route.useLoaderData()`. No business logic.
- **routes/api/** — server-only API handlers (auth, webhooks). May import services directly — no RPC boundary needed.
- **components/** — all UI, grouped by domain. Access session via `Route.useRouteContext()`. May import from `lib/` root (auth-client, entitlements, utils) but NOT from `lib/facades/`.
- **functions/** — server functions (RPC boundary). Auth via `.middleware()`, validation via `.validator()`.
- **services/** — business logic + DB queries. Named function exports, NOT class instances.
- **lib/facades/** — config-to-driver wiring (storage, mailer, payment, rate-limit, auth, logger). Never import in components.
- **lib/*** — shared app code at `lib/` root (auth-client, entitlements, utils, constants, etc.). Importable anywhere.
- **core/drivers/** — know *how* (S3, Resend, Stripe, in-memory rate-limit) but not *where*. Config-injected.
- **config/** — named channels, static registries, and types. Primary place for env var reads, though server-only infrastructure (`database/`, `lib/facades/auth.ts`, `lib/facades/logger.ts`) may read env vars directly.
- **validations/** — shared Zod schemas. Leaf dependency — no imports from app code.
- **emails/** — server-only. Each file exports `subject` function + default component.

### Server-Only Safety

Services, `lib/facades/` code, `core/` drivers, and DB code must always be called through `createServerFn` wrappers in `functions/`. Never call them directly from components. Exception: `routes/api/` handlers are server-only and may call services directly.

## Key Patterns

### Config → Driver → Facade

All infrastructure (storage, email, payment, rate-limiting) follows:

1. `config/<domain>.ts` — defines named channels with driver config
2. `core/drivers/<domain>/` — implements the driver interface
3. `lib/facades/<domain>.ts` — provides the facade consumers import

Consumers import from `lib/facades/`, never from `core/` or `config/` directly.

**To add a new driver:**
1. Define the driver interface in `core/drivers/<category>/index.ts`
2. Implement it in `core/drivers/<category>/<name>.ts`
3. Register the channel in `config/<category>.ts`
4. Create or update the facade in `lib/facades/<category>.ts`

### Middleware Chain

Server functions use `.middleware([authMiddleware])` for auth. Middleware attaches data to `context`:

- `authMiddleware` → `context.user`
- `orgMiddleware` → `context.organization` (chains after auth)
- `subscribedMiddleware` → `context.subscription` with plan entitlements (chains after org)
- `rateLimitMiddleware` → rate-limits by IP or userId
- `adminMiddleware` → requires admin role

Chain order matters: `auth → org → subscribed` for billing functions.

### Email Templates

File name = template name: `emails/verify-email.tsx` → `mailer.send("verify-email", to, data)`.

Each file exports:
- `subject(data)` — function returning the subject line
- `default` component — React Email template

Type map in `emails/index.ts` infers props automatically.

**To add an email template:**
1. Create `emails/<name>.tsx` exporting `subject` + default component
2. Add entry to `emails/index.ts` type map and `loadTemplate` switch
3. Send via `mailer.send("<name>", to, data)`

### Entitlements

Plans store `entitlements` as JSONB (`{ projects: 3, analytics: true }`). Check with:
- `hasFeature(key)` — boolean feature gate
- `withinLimit(key, currentUsage)` — numeric limit check
- `requireLimit(key)` — throws if exceeded

Feature keys defined in `config/features.ts`.

### Usage Tracking

`usage.service.ts` tracks per-org consumption with lazy period reset. Operates on `organizationId` + `featureKey`.

### Audit Logging

Log actions via `audit.log()` from `lib/audit.ts`. Action names use dot-notation: `domain.resource.verb` (e.g., `billing.checkout.created`, `admin.user.banned`).

### Data Loading

Reads happen through route loaders. The loader awaits the relevant server function and returns the data; subcomponents read it via `Route.useLoaderData()` (or `getRouteApi('/path').useLoaderData()` from a non-route file). For routes scoped to a single entity, narrow at the loader by writing `if (!entity) throw notFound(); return { entity }`. `useLoaderData` then returns the non-null shape.

After mutations, refresh data with `await router.invalidate()`. This re-runs all active loaders. Do not maintain a parallel React Query cache for route data.

By default, this codebase uses React Query only where route loaders aren't a good fit: polling (`refetchInterval`), conditional fetches tied to UI state (`enabled: open`), and cross-component shared state (e.g. `useSubscription` hook). In those cases, define `queryOptions` co-located with the consumer file. There's no `queries/` directory.

If a feature genuinely needs React Query more broadly (background refetch on focus, optimistic updates, infinite queries, etc.), it's fine to introduce a `queries/<domain>.queries.ts` factory and use `ensureQueryData` / `useSuspenseQuery`. The default loader pattern is the recommended path, not a hard rule.

### Session Flow

Session fetched once in `__root.tsx` → flows via route context (includes `activeOrganization`) → layout routes guard access in `beforeLoad` → components read via `Route.useRouteContext()`.

### Teams / Organizations

Every user belongs to at least one team. Personal team auto-created on signup. Active org stored on session. Billing, subscriptions, and usage are org-scoped — only team owners/admins can manage billing.

### Error Handling

- **Server functions:** framework primitives (`redirect`, `notFound`, `Error`)
- **API routes:** `apiError()` / `apiSuccess()` from `lib/api-response.ts`
- **Client:** error boundaries catch everything

### Webhooks

Incoming webhooks live in `routes/api/webhooks/<provider>.ts`. They are server-only API routes that may call services directly. Each validates the webhook signature, parses the event, and delegates to the appropriate service.

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Service file | `<domain>.service.ts` | `plan.service.ts` |
| Service exports | Named functions (not classes) | `export async function listPlans()` |
| Server function | `camelCase` verb | `createCheckout`, `getPlans` |
| Component file | `kebab-case.tsx` | `plan-card.tsx` |
| Route file | TanStack convention | `billing.index.tsx` |
| Email template | `kebab-case.tsx` | `verify-email.tsx` |
| Middleware | `<name>Middleware` | `authMiddleware` |
| Schema file | `<domain>.ts` | `billing.ts` |
| Config file | `<domain>.ts` | `payment.ts` |
| Hook | `use-<name>.ts` | `use-subscription.ts` |
| Validation file | `<domain>.ts` | `admin.ts` |
| Audit action | `domain.resource.verb` | `billing.checkout.created` |
| Driver directory | `core/drivers/<category>/` | `core/drivers/payment/` |

## Common Tasks

### Add a page
1. Create route file in `routes/_app/<name>.tsx` (or `_marketing/` for public)
2. Create component(s) in `components/<domain>/`
3. If data needed: add server function in `functions/`, call it from the route's `loader`, read via `Route.useLoaderData()`

### Add a service
1. Create `services/<domain>.service.ts` with named function exports
2. Create server functions in `functions/<domain>.ts` with appropriate middleware
3. Call the server function from a route loader (for page data) or a co-located `queryOptions` (for polling / conditional / cross-component cases only)

### Add an email template
1. Create `emails/<name>.tsx` exporting `subject` function + default component
2. Add entry to `emails/index.ts` type map and `loadTemplate` switch
3. Send via `mailer.send("<name>", to, data)`

### Add a driver
1. Define interface in `core/drivers/<category>/index.ts`
2. Implement in `core/drivers/<category>/<name>.ts`
3. Add channel in `config/<category>.ts`
4. Create or update facade in `lib/facades/<category>.ts`

### Add middleware
1. Create `middleware/<name>.ts` using `createMiddleware()`
2. Chain in server functions via `.middleware([existingMiddleware, newMiddleware])`

### Add a webhook handler
1. Create `routes/api/webhooks/<provider>.ts`
2. Validate signature, parse event, delegate to service
3. Use `apiError()` / `apiSuccess()` for responses
