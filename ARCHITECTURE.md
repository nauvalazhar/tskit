# TSKit — Architecture Guide

General-purpose SaaS starter kit built on TanStack Start with batteries included.

## Stack

- **Framework:** TanStack Start (React 19, SSR, file-based routing)
- **Auth:** Better Auth with Drizzle adapter (2FA, email/password, OAuth)
- **Email:** React Email + provider (Resend, SES, or SMTP)
- **Styling:** Tailwind CSS v4 with OKLCH color system
- **Components:** Selia UI + CVA (class-variance-authority)
- **Database:** PostgreSQL + Drizzle ORM
- **Language:** TypeScript (strict mode)
- **Package Manager:** bun

> **Status key:** Items marked **[Planned]** are designed but not yet implemented.

---

## Project Structure

```
src/
├── routes/                          # Thin page shells — wires UI to logic
│   ├── __root.tsx
│   ├── _marketing/                  # Public pages
│   │   ├── route.tsx                # Marketing layout
│   │   ├── index.tsx                # Landing page
│   │   └── pricing.tsx              # Pricing page
│   ├── _auth/                       # Auth layout group (unauthenticated)
│   │   ├── route.tsx                # Auth layout
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   └── verify-2fa.tsx
│   ├── _app/                        # Authenticated layout
│   │   ├── route.tsx                # App layout (auth guard)
│   │   ├── dashboard.tsx            # User dashboard
│   │   ├── billing.tsx              # Billing layout
│   │   ├── billing.index.tsx        # Plans & subscription
│   │   ├── billing.success.tsx      # Post-checkout success
│   │   ├── settings.tsx             # Settings layout
│   │   ├── settings.index.tsx       # Profile settings
│   │   ├── settings.security.tsx    # Security settings (2FA, password)
│   │   ├── settings.preferences.tsx # User preferences
│   │   └── settings.advanced.tsx    # Advanced settings (delete account)
│   ├── admin/                       # Admin layout
│   │   ├── route.tsx                # Admin layout (role guard)
│   │   ├── index.tsx                # Dashboard stub
│   │   ├── users.tsx                # [Planned] User management
│   │   ├── users.$id.tsx            # [Planned] Single user detail
│   │   ├── payments.tsx             # [Planned] Payment gateway config
│   │   └── settings.tsx             # [Planned] Site-wide settings
│   └── api/
│       ├── auth.$.ts                # Better Auth handler
│       └── webhooks/
│           └── stripe.ts            # POST /api/webhooks/stripe
│
├── components/                      # All UI components
│   ├── selia/                       # Design system (27 components)
│   ├── app/                         # App shell
│   │   ├── app-sidebar.tsx
│   │   └── email-verification-banner.tsx
│   ├── auth/                        # Auth forms
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   ├── reset-password-form.tsx
│   │   ├── login-github-button.tsx
│   │   └── login-google-button.tsx
│   ├── settings/                    # Settings components
│   │   ├── profile-form.tsx
│   │   ├── avatar-upload.tsx
│   │   ├── change-password-form.tsx
│   │   ├── set-password-form.tsx
│   │   ├── enable-two-factor-form.tsx
│   │   ├── disable-two-factor-form.tsx
│   │   └── sessions-list.tsx
│   ├── billing/
│   │   ├── plan-card.tsx
│   │   ├── checkout-button.tsx
│   │   ├── cancel-button.tsx
│   │   ├── change-plan-button.tsx
│   │   ├── manage-button.tsx
│   │   └── subscription-status.tsx
│   ├── dashboard/                   # [Planned]
│   ├── admin/                       # [Planned]
│   └── shared/
│       ├── page-header.tsx
│       ├── tabline.tsx
│       ├── user-avatar.tsx
│       ├── error-boundary.tsx       # ErrorBoundary (styled error page)
│       ├── not-found.tsx            # Styled 404 page
│       ├── dev-error-overlay.tsx
│       └── require-email-verification.tsx
│
├── services/                        # Business logic + DB queries
│   ├── plan.service.ts
│   ├── subscription.service.ts
│   ├── usage.service.ts
│   ├── api-key.service.ts           # [Planned]
│   ├── webhook.service.ts           # [Planned]
│   ├── file.service.ts              # [Planned]
│   └── settings.service.ts          # [Planned]
│
├── jobs/                            # [Planned] Background job handlers
│   ├── webhook-delivery.job.ts      # [Planned]
│   └── email-send.job.ts            # [Planned]
│
├── emails/                          # React Email templates (server-only)
│   ├── verify-email.tsx             # Email verification OTP
│   ├── reset-password.tsx           # Password reset link
│   ├── password-changed.tsx         # Password change notification
│   ├── subscription-created.tsx     # Subscription confirmation
│   ├── payment-failed.tsx           # Payment failure alert
│   ├── welcome.tsx                  # [Planned]
│   ├── invitation.tsx               # [Planned]
│   └── index.ts                     # template type map (inferred)
│
├── queries/                         # TanStack Query options
│   ├── billing.queries.ts
│   └── admin.queries.ts             # [Planned]
│
├── functions/                       # Server functions (RPC boundary)
│   ├── auth.ts                      # getSession, listUserAccounts
│   ├── billing.ts                   # checkout, plans, subscription, cancel
│   ├── settings.ts                  # updateProfile, updateTheme, deleteAccount
│   ├── storage.ts                   # uploadAvatar
│   └── admin/                       # [Planned]
│       ├── users.ts                 # [Planned]
│       └── payments.ts              # [Planned]
│
├── hooks/                           # Shared React hooks
│   ├── use-email-verified.ts
│   └── use-subscription.ts
│
├── validation/                      # [Planned] Shared zod schemas
│
├── middleware/                       # Server function & request middleware
│   ├── auth.ts                      # authMiddleware
│   ├── email-verified.ts            # emailVerifiedMiddleware
│   ├── subscribed.ts                # subscribedMiddleware (active subscription)
│   ├── logging.ts                   # Request logging + serverFnErrorMiddleware
│   └── admin.ts                     # [Planned] adminMiddleware
│
├── config/                          # Named channels — env vars read here
│   ├── features.ts                  # Feature registry (entitlement keys)
│   ├── storage.ts                   # channels: driver + bucket + credentials
│   ├── mail.ts                      # channels: driver + apiKey + from
│   └── payment.ts                   # channels: driver + secretKey + webhookSecret
│
├── lib/                             # App-level helpers — facades over core/
│   ├── auth-client.ts               # Better Auth client instance
│   ├── auth.ts                      # Better Auth server instance
│   ├── entitlements.ts              # hasFeature(), withinLimit(), requireLimit()
│   ├── storage.ts                   # storage.use('public').upload(), storage.upload()
│   ├── mailer.ts                    # mailer.send(), mailer.use('resend').send()
│   ├── payment.ts                   # payment.checkout(), payment.portal()
│   ├── api-response.ts              # apiError(), apiSuccess() for API routes
│   ├── logger.ts                    # Pino + captureException() + child loggers
│   ├── http.ts                      # HTTP helpers
│   ├── theme.ts                     # Theme utilities
│   ├── utils.ts                     # cn() and shared helpers
│   ├── constants.ts                 # App-wide constants
│   ├── queue.ts                     # [Planned] queue.add()
│   └── rate-limit.ts                # [Planned] rateLimit.check()
│
├── database/                        # DB client, schemas, migrations
│   ├── index.ts                     # DB client (drizzle instance)
│   ├── seed.ts                      # Development seed script
│   ├── schemas/
│   │   ├── auth.ts                  # user, session, account, verification
│   │   ├── billing.ts               # plans, customers, subscriptions, usage, webhookEvents
│   │   ├── settings.ts              # User settings
│   │   ├── api-key.ts               # [Planned] API keys table
│   │   ├── webhook-endpoint.ts      # [Planned] outgoing webhook endpoints
│   │   ├── file.ts                  # [Planned] files table
│   │   └── site-settings.ts         # [Planned] site_settings table
│   └── migrations/
│
├── core/                            # Foundational — portable, app-agnostic
│   └── drivers/
│       ├── payment/
│       │   ├── types.ts             # PaymentDriver interface
│       │   ├── index.ts             # driver registry + createPaymentDriver()
│       │   └── stripe.ts            # StripePaymentDriver
│       ├── email/
│       │   ├── types.ts             # EmailDriver interface
│       │   ├── index.ts             # driver registry + createEmailDriver()
│       │   └── resend.ts            # ResendEmailDriver
│       ├── storage/
│       │   ├── types.ts             # StorageDriver interface
│       │   ├── index.ts             # driver registry + createStorageDriver()
│       │   ├── base.ts              # BaseStorageDriver abstract class
│       │   └── s3.ts                # S3StorageDriver (R2, S3, MinIO, etc.)
│       └── queue/                   # [Planned]
│           ├── types.ts             # [Planned]
│           ├── index.ts             # [Planned]
│           └── bullmq.ts            # [Planned]
│
├── router.tsx
├── routeTree.gen.ts                 # Auto-generated (read-only)
└── styles.css                       # Tailwind + theme variables
```

---

## Layer Responsibilities

```
routes → components → queries → functions → services  → database/
                                           → lib/*     → core/drivers
                                middleware ↗
```

| Layer         | Responsibility                                                                       |
| ------------- | ------------------------------------------------------------------------------------ |
| `routes/`     | Thin page shells. Loader calls `ensureQueryData`, renders components. Minimal logic. |
| `components/` | All UI, grouped by domain.                                                           |
| `queries/`    | TanStack Query options. Bridges client to server via `functions/`.                   |
| `functions/`  | Server functions (RPC boundary). Validation, orchestration. Calls services.          |
| `middleware/` | Auth, role checks, logging. Attaches to server functions via `.middleware()`.        |
| `services/`   | Business logic + DB queries via Drizzle.                                             |
| `emails/`     | React Email templates. Each file exports `subject` + default component. Server-only. |
| `database/`   | DB client + Drizzle schemas + migrations. App-specific data model.                   |
| `config/`     | Named channels. Pairs a driver with credentials + settings. Reads env vars.            |
| `lib/`        | App-level facades over `core/`. The daily-driver imports.                            |
| `core/`       | Driver classes — know _how_ (S3, Resend) but not _where_. Config-injected.           |
| `hooks/`      | Shared React hooks.                                                                  |
| `jobs/`       | **[Planned]** Background job handlers. Async work triggered by services.             |
| `validation/` | **[Planned]** Shared zod schemas.                                                    |

### core/ vs lib/

`config/` defines named channels — each pairs a driver name with its credentials
and settings. Env vars are read here, never in driver classes.

`core/` contains driver classes — they know _how_ to talk to S3 or Resend, but not _where_.
They receive config via constructor injection. Portable and app-agnostic.

`lib/` is the app-level facade — resolves config → creates drivers, caches instances.
This is what you import day-to-day: `lib/auth`, `lib/storage`, `lib/mailer`, `lib/payment`.

Each facade **transforms the interface** — it takes app-level params and resolves them
to driver-level params. The driver never sees templates, scopes, userIds, or planIds.

```ts
// ❌ Verbose — reaching into core directly
import { createStorageDriver } from '@/core/drivers/storage';
import { storageConfig } from '@/config/storage';
const driver = createStorageDriver(storageConfig.channels.public);
await driver.upload({ buffer, key: 'avatars/photo.png', contentType });

// ✅ Clean — use the lib facade
import { storage } from '@/lib/storage';
await storage.upload('avatars', { buffer, contentType, name: 'photo.png' });

// ✅ Explicit channel selection
await storage.use('private').upload({ buffer, key, contentType });
```

The same applies to all facades:

| Facade | App-level method | What it resolves | Then delegates to driver |
|--------|-----------------|------------------|------------------------|
| `mailer` | `send(template, to, data)` | template name → rendered HTML + subject | `driver.send({ to, subject, html })` |
| `storage` | `upload(scope, file)` | scope + filename → UUID-based key | `driver.upload({ buffer, key, contentType })` |
| `payment` | `checkout(userId, planId, urls)` | userId → customer, planId → priceId | `driver.createCheckout({ customerId, priceId, ... })` |

---

## Import Rules

Import from `lib/` for daily use, from `core/` only when configuring infrastructure.

```ts
// ✅ Auth middleware in server functions
import { authMiddleware } from '@/middleware/auth';

// ✅ Auth client in components
import { authClient } from '@/lib/auth-client';

// ✅ Facades in services and server functions
import { storage } from '@/lib/storage';
import { mailer } from '@/lib/mailer';
import { payment } from '@/lib/payment';

// ✅ Schemas — always import directly (no facade needed)
import { plans } from '@/database/schemas/billing';
import type { Plan } from '@/database/schemas/billing';

// ✅ DB client in services
import { db } from '@/database';

// ✅ Queries call server functions
import { getPlans } from '@/functions/billing';

// ✅ Services in server functions (named exports, domain-prefixed)
import { getSubscriptionByUserId } from '@/services/subscription.service';
import { listPlans, getPlanById } from '@/services/plan.service';

// ✅ Entitlement checks
import { hasFeature, requireLimit } from '@/lib/entitlements';

// ✅ Feature registry
import { featureRegistry } from '@/config/features';
```

### Server-Only Safety

TanStack Start is isomorphic by default — folder names don't prevent code from shipping
to the client. The framework provides runtime guards:

- **`createServerFn`** — runs on server, callable from client via RPC
- **`createServerOnlyFn`** — crashes if called from client
- **`VITE_` prefix** — only way to expose env vars to client

Services, `lib/` facades, `core/` drivers, and DB code must always be called through
`createServerFn` or `createServerOnlyFn` wrappers in `functions/`. Never call them
directly from components.

---

## Error Handling

Three layers: server functions use framework primitives, API routes use a response
helper, and the router catches everything else with error boundaries.

### Server Functions (Internal RPC)

Use the framework's built-in primitives. No custom error classes needed:

- **Auth** → middleware throws `redirect({ to: '/login' })` or `Error('Forbidden')`
- **Not found** → `throw notFound()`
- **Validation** → `.validator(zodSchema)` on the server function
- **Business errors** → throw plain `Error`, client catches via try/catch

For server-side error logging, opt in per server function via `serverFnErrorMiddleware`:

```ts
import { serverFnErrorMiddleware } from '@/middleware/logging';

export const myServerFn = createServerFn()
  .middleware([serverFnErrorMiddleware, authMiddleware])
  .handler(async ({ context }) => {
    // errors here are logged via captureException before re-throwing
  });
```

### API Routes (External HTTP)

API routes serve external consumers and need proper HTTP status codes with a consistent
JSON shape. A simple helper handles this:

```ts
// lib/api-response.ts

export function apiError(code: string, message: string, status = 400) {
  return Response.json({ error: { code, message } }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}

// Usage in API routes:
// if (!key) return apiError("UNAUTHORIZED", "Invalid API key", 401);
// if (rateLimited) return apiError("RATE_LIMIT_EXCEEDED", "Too many requests", 429);
// return apiSuccess(quote);
```

### Error Boundaries

The router is wired with `defaultErrorComponent`, `defaultNotFoundComponent`, and
`defaultOnCatch` so unhandled errors always show a styled page instead of a blank screen.

| Component       | Location                           | Purpose                                     |
| --------------- | ---------------------------------- | ------------------------------------------- |
| `ErrorBoundary` | `components/shared/error-boundary` | Styled error page within the active layout  |
| `NotFound`      | `components/shared/not-found`      | Styled 404 page with "Go to dashboard" link |

- `defaultErrorComponent` → `ErrorBoundary` (used by all routes including root — the `shellComponent` always wraps it)
- `defaultNotFoundComponent` → `NotFound`
- `defaultOnCatch` → calls `captureException(error, { source: 'router' })`, skips redirects/not-founds
- Root route has `notFoundComponent` → `NotFound` (acts as the app-wide 404 fallback)

### Client-Side Errors

On the client, errors are **UI feedback** — use an inline Alert, a toast, or let an error
boundary handle it. No manual logging. `captureException` is a no-op on the client
via `createIsomorphicFn`.

#### Alert vs Toast

| Scenario                                                 | Use                | Why                                                                          |
| -------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| Form submission error (wrong password, validation fail)  | **Alert** (inline) | Persistent, contextual — user sees it right where they need to fix and retry |
| Success confirmation (account created, password changed) | **Toast**          | Transient — user doesn't need to act on it                                   |
| Redirect-based error (OAuth fail)                        | **Toast**          | No form context to anchor an alert to                                        |
| Dialog action error (enable 2FA, delete account)         | **Toast**          | Dialog may close; toast persists across views                                |
| Background/async error (network, polling)                | **Toast**          | Not tied to a specific form                                                  |

#### Alert pattern (form errors)

```tsx
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null); // clear previous error on resubmission

  const { error } = await authClient.signIn.email({ email, password });

  if (error) {
    setError(error.message || 'Invalid email or password.');
    return;
  }
};

// In JSX — render above the submit button
{
  error && (
    <Alert variant="danger">
      <CircleAlert />
      {error}
    </Alert>
  );
}
```

#### Toast pattern (confirmations & non-form errors)

```tsx
// Success confirmation
toastManager.add({
  title: 'Password Changed',
  description: 'Your password has been changed successfully.',
  type: 'success',
});

// Redirect-based error (no form context)
toastManager.add({
  title: 'Login Failed',
  description: 'An error occurred while logging in.',
  type: 'error',
});
```

---

## Logging & Observability

Client and server have different concerns:

|            | Error feedback                 | Error tracking              | Structured logging     |
| ---------- | ------------------------------ | --------------------------- | ---------------------- |
| **Client** | Alert / Toast / error boundary | `captureException` (no-op)  | Don't                  |
| **Server** | —                              | `captureException` → Pino   | Pino (`lib/logger.ts`) |

### Logger (Server-Only)

Pino for structured logging. Server-only — it writes to stdout. Don't import it in
components or client code. Sensitive fields are redacted automatically.

```ts
// lib/logger.ts

import pino from 'pino';
import { createIsomorphicFn } from '@tanstack/react-start';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['password', 'token', 'secret', 'cookie', 'authorization'],
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined,
});

// Child loggers for domain-specific context
export const requestLogger = logger.child({ domain: 'request' });
export const authLogger = logger.child({ domain: 'auth' });
```

Use it in services, jobs, middleware, and API routes:

```ts
// In a service
logger.info({ orgId, event: 'subscription.created' }, 'Webhook processed');

// In a job
logger.error({ err, jobId }, 'Webhook delivery failed');

// In an API route
logger.warn({ ip, key: prefix }, 'Rate limit exceeded');
```

### `captureException` (Sentry Integration Point)

`captureException(err, context?)` is the single integration point for error tracking.
It's wrapped with `createIsomorphicFn` — logs via Pino on the server, no-op on the client.

```ts
// lib/logger.ts

export const captureException = createIsomorphicFn().server(
  (err: unknown, context?: Record<string, unknown>) => {
    logger.error({ err, ...context }, 'Captured exception');
  },
);
```

Currently logs via Pino. When adding Sentry, swap the body to
`Sentry.captureException(err, { extra: context })` — all call sites pick it up
automatically. Follow TanStack Start's
[observability guide](https://tanstack.com/start/latest/docs/framework/react/guide/observability)
for Sentry setup.

Called from:
- `loggingMiddleware` — request-level errors
- `serverFnErrorMiddleware` — server function errors (opt-in)
- `defaultOnCatch` — router-level unhandled errors

### Log Destinations

Pino supports [transports](https://github.com/pinojs/pino/blob/main/docs/transports.md)
for routing logs to external services (Axiom, Datadog, Logtail, etc.). This is
deploy-time configuration — not a runtime provider switch:

```ts
// lib/logger.ts (production with transport)

import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['password', 'token', 'secret', 'cookie', 'authorization'],
  transport:
    process.env.NODE_ENV === 'production'
      ? {
          target: '@logtail/pino',
          options: { sourceToken: process.env.LOGTAIL_TOKEN },
        }
      : { target: 'pino-pretty' },
});
```

No multi-provider abstraction. Logging destinations are an infrastructure choice
configured once at deploy time, not switched at runtime via admin panel.

---

## Middleware

Auth checks live in `middleware/` and attach to server functions via `.middleware()`.
This replaces imperative `requireAuth()` calls — auth runs before the handler, and
the authenticated user/member is available via `context`.

### Auth Middleware

```ts
// middleware/auth.ts

import { createMiddleware } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { auth } from '@/lib/auth';

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({ headers: getHeaders() });
    if (!session) throw redirect({ to: '/login' });
    return next({ context: { user: session.user } });
  },
);

// [Planned] orgRoleMiddleware — will be added when org plugin UI is implemented
```

### Admin Middleware [Planned]

```ts
// middleware/admin.ts — [Planned]

import { createMiddleware } from '@tanstack/react-start';
import { authMiddleware } from './auth';

export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (context.user.role !== 'admin') throw new Error('Forbidden');
    return next();
  });
```

### Logging Middleware

Request middleware wraps `next()` in try/catch to log errors before re-throwing.
Redirects and not-founds are skipped — they're normal control flow, not errors.

```ts
// middleware/logging.ts

import { createMiddleware } from '@tanstack/react-start';
import { isRedirect, isNotFound } from '@tanstack/react-router';
import { requestLogger, captureException } from '@/lib/logger';

export const loggingMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request, pathname }) => {
    const start = Date.now();

    try {
      const result = await next();
      const duration = Date.now() - start;

      requestLogger.info(
        { method: request.method, pathname, status: result.response.status, duration },
        'Request handled',
      );

      return result;
    } catch (error) {
      if (isRedirect(error) || isNotFound(error)) throw error;

      requestLogger.error(
        { method: request.method, pathname, duration: Date.now() - start, err: error },
        'Request error',
      );

      throw error;
    }
  },
);

// Opt-in per server function: .middleware([serverFnErrorMiddleware, ...])
export const serverFnErrorMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      if (isRedirect(error) || isNotFound(error)) throw error;
      captureException(error, { source: 'serverFn' });
      throw error;
    }
  },
);
```

Register it globally in `src/start.ts` so it runs on every request:

```ts
// start.ts

import { createStart } from '@tanstack/react-start';
import { loggingMiddleware } from '@/middleware/logging';

export const startInstance = createStart(() => ({
  requestMiddleware: [loggingMiddleware],
}));
```

### Usage

```ts
// functions/billing.ts — attach middleware, use context

export const createCheckout = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(checkoutSchema)
  .handler(async ({ data, context }) => {
    // context.user is guaranteed by middleware
    const plan = await getPlanById(data.planId);
    if (!plan) throw notFound();
    // ...
  });

// functions/billing.ts — requires active subscription

export const cancelSubscription = createServerFn({ method: 'POST' })
  .middleware([subscribedMiddleware])
  .handler(async ({ context }) => {
    // context.user + context.subscription guaranteed
    // ...
  });
```

---

## Lib Facades

Each facade resolves config → creates driver instances, and caches them. Drivers are
generic infrastructure ("put bytes in S3"). Facades know about your app ("upload a file
with a scoped key on the default disk").

### Storage

```ts
// lib/storage.ts

import { storageConfig } from '@/config/storage';
import { createStorageDriver } from '@/core/drivers/storage';
import type { StorageDriver, StorageObject } from '@/core/drivers/storage/types';

class Storage {
  private drivers = new Map<string, StorageDriver>();

  private resolve(): StorageDriver {
    const name = this.channel || storageConfig.default;
    if (!this.drivers.has(name)) {
      const config = storageConfig.channels[name];
      if (!config) throw new Error(`Storage channel "${name}" not configured`);
      this.drivers.set(name, createStorageDriver(config));
    }
    return this.drivers.get(name)!;
  }

  use(name: string): Storage { ... }

  // Convenience — delegates to default channel
  async upload(scope: string, file: { buffer: Buffer | ArrayBuffer; contentType: string; name: string }): Promise<StorageObject> { ... }
  async getUrl(key: string): Promise<string> { ... }
  async remove(key: string): Promise<void> { ... }
}

export const storage = new Storage();

// Default channel:
// await storage.upload('avatars', file);
//
// Explicit channel:
// await storage.use('private').upload({ buffer, key, contentType });
```

### Mailer

The mailer uses a convention-based pattern inspired by Laravel. Each email template file
in `emails/` exports a `subject` and a `Body` component. The mailer resolves the template
by name, renders it, and sends via the configured email driver.

```ts
// lib/mailer.ts

import { mailConfig } from '@/config/mail';
import { createEmailDriver } from '@/core/drivers/email';
import type { EmailDriver } from '@/core/drivers/email/types';

class Mailer {
  private drivers = new Map<string, EmailDriver>();

  private resolve(): EmailDriver {
    const name = this.channel || mailConfig.default;
    if (!this.drivers.has(name)) {
      const config = mailConfig.channels[name];
      if (!config) throw new Error(`Mail channel "${name}" not configured`);
      this.drivers.set(name, createEmailDriver(config));
    }
    return this.drivers.get(name)!;
  }

  use(name: string): Mailer { ... }

  async send<T extends keyof EmailTemplates>(template: T, to: string, data: EmailTemplates[T]) {
    // loads template, renders HTML, sends via default channel
    return this.resolve().send({ to, subject, html });
  }
}

export const mailer = new Mailer();

// Default channel:
// await mailer.send("verify-email", user.email, { name: user.name, url: verifyUrl });
//
// Explicit channel:
// await mailer.use("transactional").send("reset-password", user.email, { name: user.name, url: resetUrl });
```

### Queue [Planned]

```ts
// lib/queue.ts — [Planned]

import {
  getActiveQueueProvider,
  getQueueProvider,
} from '@/core/drivers/queue';
import type { EmailTemplates } from '@/emails';

type Jobs = {
  'webhook.deliver': {
    endpointId: string;
    event: string;
    payload: unknown;
    secret: string;
    url: string;
  };
  'email.send': {
    template: keyof EmailTemplates;
    to: string;
    data: Record<string, unknown>;
  };
  'usage.reset': { orgId: string };
};

class Queue {
  private pinnedProvider?: string;

  private async resolve() {
    return this.pinnedProvider
      ? getQueueProvider(this.pinnedProvider)
      : await getActiveQueueProvider();
  }

  using(provider: string): Queue {
    const scoped = new Queue();
    scoped.pinnedProvider = provider;
    return scoped;
  }

  async add<T extends keyof Jobs>(job: T, data: Jobs[T]) {
    const p = await this.resolve();
    return p.add(job, data);
  }
}

export const queue = new Queue();

// Default (uses active provider from settings):
// await queue.add("email.send", { template: "welcome", to: user.email, data: { name: user.name } });
//
// Override inline:
// await queue.using("bullmq").add("email.send", { ... });
```

### Rate Limit [Planned]

```ts
// lib/rate-limit.ts — [Planned]

import { usageService } from '@/services/usage.service';
import { RateLimitExceededError } from '@/lib/errors';

class RateLimit {
  async check(orgId: string, metric: string) {
    const plan = await getOrgPlan(orgId);
    const limit = plan.limits?.[metric];
    if (!limit) return;

    const current = await usageService.getCurrentPeriod(orgId, metric);
    if (current >= limit) {
      throw new RateLimitExceededError(metric, limit);
    }
  }
}

export const rateLimit = new RateLimit();
```

---

## Config / Driver / Channel Pattern

Storage and email follow a **config → driver → facade** pattern (inspired by Laravel):

1. **`config/*.ts`** — defines named **channels**: driver name + credentials + settings. Env vars are read here, never in drivers.
2. **`core/drivers/*/types.ts`** — driver interface (`StorageDriver`, `EmailDriver`)
3. **`core/drivers/*/base.ts`** — abstract base class with shared behavior
4. **`core/drivers/*/<driver>.ts`** — concrete driver class, receives config via constructor
5. **`core/drivers/*/index.ts`** — driver registry: maps driver names to factory functions
6. **`lib/*.ts`** — facade: resolves config → creates drivers, caches instances

Consumers don't import from `core/drivers/` or `config/` directly — they use the `lib/` facades.

```
config/storage.ts          →  defines channels (driver + bucket + credentials + publicUrl + prefix)
config/mail.ts             →  defines channels (driver + apiKey + from)
core/drivers/storage/    →  driver classes (S3StorageDriver) — config-injected, no env vars
core/drivers/email/      →  driver classes (ResendEmailDriver) — config-injected, no env vars
lib/storage.ts             →  facade: storage.use('public').upload(file)
lib/mailer.ts              →  facade: mailer.send(template, to, data)
```

### Why classes (not plain objects)

Drivers hold their own state (SDK clients, config). Classes are better when you need:

- Constructor logic for initializing SDK clients with config
- Shared base behavior (e.g. `deleteMany` calling `delete` in a loop)
- Clear instantiation with typed config

### Adding a new channel

```ts
// config/storage.ts — add a new channel
channels: {
  // ...existing
  videos: {
    driver: 's3',
    bucket: process.env.R2_BUCKET_NAME!,
    prefix: 'videos',           // auto-prepends to all keys
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { ... },
    publicUrl: process.env.R2_PUBLIC_URL,
  },
}

// usage
await storage.use('videos').upload({ buffer, key: 'intro.mp4', contentType: 'video/mp4' });
// actual key in bucket: videos/intro.mp4
```

---

## Payment Driver

Payment follows the same Config → Driver → Facade pattern as email and storage.
The driver knows _how_ to talk to Stripe (raw API calls with `customerId`, `priceId`).
The facade knows _what_ the app needs (resolves `userId` → customer, `planId` → price).

### Config

```ts
// config/payment.ts

export interface PaymentDriverConfig {
  driver: string;
  secretKey: string;
  webhookSecret: string;
  publicKey?: string;
}

export const paymentConfig: PaymentConfig = {
  default: 'stripe',
  channels: {
    stripe: {
      driver: 'stripe',
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      publicKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    },
  },
};
```

### Interface

```ts
// core/drivers/payment/types.ts

export interface PaymentDriver {
  createCustomer(params: CreateCustomerParams): Promise<CustomerResult>;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  createPortalSession(params: CreatePortalSessionParams): Promise<PortalSessionResult>;
  handleWebhook(request: Request): Promise<WebhookEvent>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<SubscriptionInfo>;
}
```

The driver interface uses **provider-level params** — `customerId`, `priceId`, raw
Stripe IDs. It doesn't know about `userId` or `planId`. This keeps it portable.

Normalized `WebhookEventType`:
- `subscription.created` / `subscription.updated` / `subscription.deleted`
- `payment.succeeded` / `payment.failed`
- `unhandled` (passthrough for unrecognized events)

### Driver Registry

```ts
// core/drivers/payment/index.ts

import { StripePaymentDriver } from './stripe';
import type { PaymentDriver, PaymentDriverConfig } from './types';

const drivers: Record<string, (config: PaymentDriverConfig) => PaymentDriver> = {
  stripe: (config) => new StripePaymentDriver(config),
};

export function createPaymentDriver(config: PaymentDriverConfig): PaymentDriver {
  const factory = drivers[config.driver];
  if (!factory) throw new Error(`Payment driver "${config.driver}" not found`);
  return factory(config);
}
```

### Facade

The facade bridges app-level concepts to driver-level params — just like
`mailer` resolves templates → HTML and `storage` resolves scopes → keys.

```ts
// lib/payment.ts

class Payment {
  private drivers = new Map<string, PaymentDriver>();
  private channel: string | undefined;

  private resolve(): PaymentDriver { /* lazy init + cache from paymentConfig */ }
  use(name: string): Payment { /* scoped copy */ }

  // App-level: takes userId, resolves to Stripe customer (creates if needed)
  async getOrCreateCustomer(userId: string) {
    const existing = await db.query.customers.findFirst({ ... });
    if (existing) return existing;

    const user = await db.query.users.findFirst({ ... });
    const result = await this.resolve().createCustomer({ email: user.email, name: user.name });
    return db.insert(customers).values({ userId, channel, externalCustomerId: result.id });
  }

  // App-level: takes userId + planId, resolves both, delegates to driver
  async checkout(userId: string, planId: string, urls: { success; cancel }) {
    const customer = await this.getOrCreateCustomer(userId);
    const plan = await getPlanById(planId);
    return this.resolve().createCheckout({
      customerId: customer.externalCustomerId,
      priceId: plan.externalPriceId,
      successUrl: urls.success,
      cancelUrl: urls.cancel,
    });
  }

  // App-level: takes userId, resolves to customer, delegates to driver
  async portal(userId: string, returnUrl: string) {
    const customer = await this.getOrCreateCustomer(userId);
    return this.resolve().createPortalSession({
      customerId: customer.externalCustomerId,
      returnUrl,
    });
  }

  // Thin delegations — channel resolution is still the value
  async cancelSubscription(subscriptionId: string) { ... }
  async getSubscription(subscriptionId: string) { ... }
  async handleWebhook(request: Request) { ... }
}

export const payment = new Payment();
```

### Webhook Handling

Each driver implements `handleWebhook()` — it verifies the signature using the
provider's SDK and normalizes the raw event into the common `WebhookEvent` shape.
This keeps provider-specific logic inside `core/`.

The webhook route is thin — it picks the channel and hands the normalized event
to the subscription service:

```ts
// routes/api/webhooks/stripe.ts

export const Route = createFileRoute('/api/webhooks/stripe')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const channel = paymentConfig.default;
        const event = await payment.use(channel).handleWebhook(request);
        await handleWebhookEvent(event, channel);
        return apiSuccess({ received: true });
      },
    },
  },
});
```

The business logic lives in the service — what to do when a payment succeeds, fails,
or a subscription changes. This keeps it testable, reusable across channels, and
out of the route.

---

## Entitlements & Feature Gating

Plans define **entitlements** — a single JSONB column that maps feature keys to
`boolean` (on/off) or `number` (quota, `-1` = unlimited). The code-defined **feature
registry** (`config/features.ts`) is the source of truth for what features exist.

### Feature Registry

```ts
// config/features.ts

export const featureRegistry = {
  projects:    { label: 'Projects',           type: 'limit' },
  storage:     { label: 'Storage (GB)',       type: 'limit' },
  analytics:   { label: 'Advanced Analytics', type: 'boolean' },
  // ...
} as const;

export type FeatureKey = keyof typeof featureRegistry;
```

### Plan Entitlements

```ts
// In the plans table
entitlements: { projects: 3, storage: 1 }                    // Starter
entitlements: { projects: -1, storage: 50, analytics: true }  // Pro
```

### Entitlement Checks

Pure functions in `lib/entitlements.ts`:

```ts
import { hasFeature, withinLimit, requireLimit } from '@/lib/entitlements';

// Boolean feature check
hasFeature(plan.entitlements, 'analytics');     // true/false

// Quota check (respects -1 = unlimited)
withinLimit(plan.entitlements, 'projects', 5); // true if under limit
requireLimit(plan.entitlements, 'projects', 5); // throws if over limit
```

### Usage Tracking

The `usage` table tracks per-user consumption against quotas. One record per user
per feature. `usage.service.ts` handles increment/decrement/reset with lazy period
reset — if the period has expired, usage resets automatically on next read.

### Subscribed Middleware

`middleware/subscribed.ts` chains `authMiddleware` and adds the subscription + plan
to context. Use it for server functions that require an active subscription:

```ts
export const createProject = createServerFn({ method: 'POST' })
  .middleware([subscribedMiddleware])
  .handler(async ({ context }) => {
    const { subscription } = context;
    const used = await getUsageCount(context.user.id, 'projects', {
      start: subscription.currentPeriodStart,
      end: subscription.currentPeriodEnd,
    });
    requireLimit(subscription.plan.entitlements, 'projects', used);
    // ... create project
    await incrementUsage(context.user.id, 'projects', { start, end });
  });
```

### Client-Side

`useSubscription()` hook wraps the subscription query and exposes entitlement helpers:

```ts
const { isSubscribed, hasFeature, withinLimit } = useSubscription();
if (hasFeature('analytics')) { /* show analytics UI */ }
```

---

## Email Driver

### Config

```ts
// config/mail.ts

export interface MailDriverConfig {
  driver: string;
  apiKey: string;
  from: string;
}

export const mailConfig: MailConfig = {
  default: 'resend',
  channels: {
    resend: {
      driver: 'resend',
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM!,
    },
  },
};
```

### Interface

```ts
// core/drivers/email/types.ts

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface EmailDriver {
  send(params: SendEmailParams): Promise<{ id: string }>;
}
```

### Implementation (Resend)

```ts
// core/drivers/email/resend.ts

import { Resend } from 'resend';
import type { EmailDriver, SendEmailParams } from './types';
import type { MailDriverConfig } from '@/config/mail';

export class ResendEmailDriver implements EmailDriver {
  private client: Resend;
  private from: string;

  constructor(config: MailDriverConfig) {
    this.client = new Resend(config.apiKey);
    this.from = config.from;
  }

  async send({ to, subject, html }: SendEmailParams) {
    const { data } = await this.client.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
    return { id: data!.id };
  }
}
```

### Driver Registry

```ts
// core/drivers/email/index.ts

import { ResendEmailDriver } from './resend';
import type { EmailDriver } from './types';
import type { MailDriverConfig } from '@/config/mail';

const drivers: Record<string, (config: MailDriverConfig) => EmailDriver> = {
  resend: (config) => new ResendEmailDriver(config),
};

export function createEmailDriver(config: MailDriverConfig): EmailDriver {
  const factory = drivers[config.driver];
  if (!factory) throw new Error(`Email driver "${config.driver}" not found`);
  return factory(config);
}
```

### Templates

Email templates live in `emails/` as React Email components. They're server-only —
they compile to HTML and get sent via the `mailer` facade. They never render in the browser.

Each template file exports two things:

- `subject` — a function that returns the subject line (receives the same props as `Body`)
- `Body` — a React Email component

The file name IS the template name: `emails/verify-email.tsx` → `mailer.send("verify-email", ...)`.

```tsx
// emails/verify-email.tsx

import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
} from '@react-email/components';

interface Props {
  name: string;
  url: string;
}

export const subject = () => 'Verify your email address';

export default function VerifyEmailEmail({ name, url }: Props) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hi {name},</Text>
          <Text>Click the link below to verify your email address.</Text>
          <Link href={url}>Verify Email</Link>
        </Container>
      </Body>
    </Html>
  );
}
```

### Type Map

The barrel file infers prop types from each template — no manual duplication.

```ts
// emails/index.ts

import type ResetPasswordEmail from './reset-password';
import type PasswordChangedEmail from './password-changed';
import type VerifyEmailEmail from './verify-email';
import type SubscriptionCreatedEmail from './subscription-created';
import type PaymentFailedEmail from './payment-failed';

type PropsOf<T extends (...args: any[]) => any> = Parameters<T>[0];

export type EmailTemplates = {
  'reset-password': PropsOf<typeof ResetPasswordEmail>;
  'password-changed': PropsOf<typeof PasswordChangedEmail>;
  'verify-email': PropsOf<typeof VerifyEmailEmail>;
  'subscription-created': PropsOf<typeof SubscriptionCreatedEmail>;
  'payment-failed': PropsOf<typeof PaymentFailedEmail>;
};
```

Adding a new template is three steps: create the file, add a type entry to `index.ts`, add a case to the `loadTemplate` switch.

---

## Storage Driver

### Config

```ts
// config/storage.ts

export interface StorageDriverConfig {
  driver: string;
  bucket: string;
  endpoint: string;
  region?: string;
  credentials: { accessKeyId: string; secretAccessKey: string };
  publicUrl?: string;
  prefix?: string;
}

export const storageConfig: StorageConfig = {
  default: 'public',
  channels: {
    public: {
      driver: 's3',
      bucket: process.env.R2_BUCKET_NAME!,
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      publicUrl: process.env.R2_PUBLIC_URL,
    },
    private: {
      driver: 's3',
      bucket: process.env.R2_PRIVATE_BUCKET_NAME || 'tskit-private',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    },
  },
};
```

### Interface

```ts
// core/drivers/storage/types.ts

export interface StorageDriver {
  upload(params: UploadParams): Promise<StorageObject>;
  getUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
}
```

### Base Class

```ts
// core/drivers/storage/base.ts

export abstract class BaseStorageDriver implements StorageDriver {
  abstract upload(params: UploadParams): Promise<StorageObject>;
  abstract getUrl(key: string, expiresIn?: number): Promise<string>;
  abstract delete(key: string): Promise<void>;

  async deleteMany(keys: string[]) {
    await Promise.all(keys.map((k) => this.delete(k)));
  }
}
```

### Driver Registry

```ts
// core/drivers/storage/index.ts

import { S3StorageDriver } from './s3';
import type { StorageDriver } from './types';
import type { StorageDriverConfig } from '@/config/storage';

const drivers: Record<string, (config: StorageDriverConfig) => StorageDriver> = {
  s3: (config) => new S3StorageDriver(config),
};

export function createStorageDriver(config: StorageDriverConfig): StorageDriver {
  const factory = drivers[config.driver];
  if (!factory) throw new Error(`Storage driver "${config.driver}" not found`);
  return factory(config);
}
```

---

## Auth (Better Auth)

Better Auth handles authentication, sessions, and organization/team management.
The server instance lives in `lib/auth.ts`. The client lives in `lib/auth-client.ts`.
Session flows through the app via **route context** (routes/components) and
**middleware** (server functions).

### Server Instance

```ts
// lib/auth.ts

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { db } from '@/database';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  // ... emailVerification, emailAndPassword, socialProviders config
  plugins: [tanstackStartCookies(), twoFactor()],
});
```

### Client

```ts
// lib/auth-client.ts

import { createAuthClient } from 'better-auth/react';
import { twoFactorClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [twoFactorClient({ onTwoFactorRedirect: () => { window.location.href = '/verify-2fa'; } })],
});
```

### Session via Route Context

Session is fetched once in `__root.tsx` and flows through the entire route tree
via TanStack Router's context. No re-fetching, no importing `core/` in routes.

```ts
// functions/auth.ts

import { createServerFn } from '@tanstack/react-start';
import { auth } from '@/lib/auth';

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async ({ request }) => {
    return auth.api.getSession({ headers: request.headers });
  },
);
```

> **Note:** `auth.api.getSession()` is a direct in-process function call, not an
> HTTP request. It reads the session cookie from the headers and does a DB lookup.
> The server function wrapper exists because `beforeLoad` runs on both server (SSR)
> and client (navigation) — the server function provides the RPC bridge.

```tsx
// routes/__root.tsx

import { getSessionFn } from '@/functions/auth';

export const Route = createRootRouteWithContext()({
  beforeLoad: async () => {
    const session = await getSessionFn();
    return { session };
  },
  // ...
});
```

Now every child route and component can access `session` from context.

### Route Guards

Layout routes check `context.session` in `beforeLoad` — no imports needed:

```tsx
// routes/_auth/route.tsx — guest-only (login, register, forgot-password)
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    if (context.session) throw redirect({ to: '/dashboard' });
  },
  component: () => <Outlet />,
});

// routes/_app.tsx — authenticated pages
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    if (!context.session) throw redirect({ to: '/login' });
  },
  component: () => <Outlet />,
});

// routes/admin/route.tsx — admin-only pages
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (!context.session) throw redirect({ to: '/login' });
    // TODO: uncomment admin role check when admin pages are built
    // if (context.session.user.role !== 'admin')
    //   throw redirect({ to: '/dashboard' });
  },
  component: () => <Outlet />,
});
```

### Conditional Rendering

Components access session from route context for role-based UI:

```tsx
function DashboardHeader() {
  const { session } = Route.useRouteContext();

  return (
    <header>
      <h1>Welcome, {session.user.name}</h1>
      {session.user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
    </header>
  );
}
```

### Auth in Server Functions

Server functions use middleware (see [Middleware](#middleware) section):

```ts
// Attach middleware — context.user is guaranteed in the handler
export const createCheckout = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // context.user available
  });

// subscribedMiddleware chains authMiddleware + adds subscription to context
export const cancelSubscription = createServerFn({ method: 'POST' })
  .middleware([subscribedMiddleware])
  .handler(async ({ context }) => {
    // context.user + context.subscription available
  });
```

### Summary

| Where                    | How                                       | Source            |
| ------------------------ | ----------------------------------------- | ----------------- |
| Routes (guards)          | `beforeLoad` checks `context.session`     | Route context     |
| Components (UI)          | `Route.useRouteContext()`                 | Route context     |
| Server functions         | `.middleware([authMiddleware])`           | Middleware        |
| API routes               | Manual check with `apiError()`            | `core/` (wiring)  |
| Client-side auth actions | `authClient.signIn`, `authClient.signOut` | `lib/auth-client` |

### Schema

Better Auth tables are generated via the CLI:

```bash
npx @better-auth/cli generate --output ./src/database/schemas/auth.ts
```

```ts
// database/schemas/auth.ts (generated by Better Auth CLI, then you own it)

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: text("role").default("user"),       // "user" | "admin" (site-level)
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const sessions = pgTable("sessions", { ... })
export const accounts = pgTable("accounts", { ... })
export const verifications = pgTable("verifications", { ... })
```

### Roles

Site-level roles via `user.role` column:

| Role    | Purpose                              |
| ------- | ------------------------------------ |
| `user`  | Default role for all users           |
| `admin` | Access to admin panel (stub exists)  |

> **[Planned]** Org/team roles (`owner`, `admin`, `member`) via Better Auth org plugin. The plugin is available but not yet wired with UI.

### Drizzle Config

```ts
// drizzle.config.ts

export default defineConfig({
  schema: ['./src/database/schemas/*'],
});
```

No barrel file — import schemas directly:

```ts
import { plans } from '@/database/schemas/billing';
import { users } from '@/database/schemas/auth';
import type { Plan } from '@/database/schemas/billing';
```

---

## Service Layer

Services handle business logic and DB queries. They live in `services/` at the top level
because they're app-specific — not portable infrastructure.

**Style:** Services use **named function exports** (not class instances):

```ts
// ✅ Correct — named exports
export async function listPlans() { ... }
export async function getPlanById(id: string) { ... }

// ❌ Avoid — class instances
export const planService = new PlanService();
```

**Rule:** Server functions handle auth + validation + orchestration. Services handle
business logic + DB queries. Drivers handle external APIs. Facades bridge the two.

### Example: Subscription Service

The service receives normalized `WebhookEvent` from the driver (via the facade) and
handles pure business logic — DB writes and emails. It never calls Stripe directly.

```ts
// services/subscription.service.ts

import { db } from '@/database';
import { customers, subscriptions, webhookEvents } from '@/database/schemas/billing';
import { mailer } from '@/lib/mailer';
import type { WebhookEvent } from '@/core/drivers/payment/types';

export async function getSubscriptionByUserId(userId: string) {
  return db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
    with: { plan: true },
  });
}

export async function handleWebhookEvent(event: WebhookEvent, channel: string) {
  // Idempotency — skip already-processed events
  const existing = await db.query.webhookEvents.findFirst({
    where: eq(webhookEvents.externalId, event.id),
  });
  if (existing) return;

  await db.insert(webhookEvents).values({
    externalId: event.id, channel, type: event.type,
  });

  switch (event.type) {
    case 'subscription.created':
      // Resolve customer → userId, lookup plan by priceId, insert subscription
      // Send confirmation email via mailer
      break;
    case 'subscription.deleted':
      await db.update(subscriptions)
        .set({ status: 'canceled', canceledAt: new Date() })
        .where(eq(subscriptions.externalId, event.data.id));
      break;
    case 'payment.failed':
      // Mark subscription past_due, send failure email
      await mailer.send('payment-failed', user.email, { name: user.name });
      break;
  }
}
```

### Example: Server Function Using Middleware + Services + Facades

```ts
// functions/billing.ts

import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from '@/middleware/auth';
import { listPlans } from '@/services/plan.service';
import { getSubscriptionByUserId } from '@/services/subscription.service';
import { payment } from '@/lib/payment';

export const getPlans = createServerFn().handler(async () => {
  return listPlans();
});

// Facade resolves userId → customer, planId → priceId internally
export const createCheckout = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { planId: string; successUrl: string; cancelUrl: string }) => data)
  .handler(async ({ data, context }) => {
    return payment.checkout(context.user.id, data.planId, {
      success: data.successUrl,
      cancel: data.cancelUrl,
    });
  });

export const cancelSubscription = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sub = await getSubscriptionByUserId(context.user.id);
    if (!sub) throw new Error('No active subscription');

    // Use the subscription's channel to cancel via the correct driver
    await payment.use(sub.channel).cancelSubscription(sub.externalId);
  });
```

---

## TanStack Query Options

Query options live in `queries/`, consumed by components and route loaders.

### Structure

```ts
// queries/billing.queries.ts

import { queryOptions } from '@tanstack/react-query';
import { getPlans, getSubscription } from '@/functions/billing';

export const billingQueries = {
  plans: () =>
    queryOptions({
      queryKey: ['billing', 'plans'],
      queryFn: () => getPlans(),
    }),

  subscription: () =>
    queryOptions({
      queryKey: ['billing', 'subscription'],
      queryFn: () => getSubscription(),
    }),
};
```

### Usage in Loaders (SSR Prefetch)

```tsx
// routes/_app/billing.tsx

export const Route = createFileRoute('/_app/billing')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(billingQueries.plans());
    context.queryClient.ensureQueryData(billingQueries.subscription());
  },
  component: BillingPage,
});
```

### Usage in Components (Client-side)

```tsx
function BillingPage() {
  const { data: plans } = useSuspenseQuery(billingQueries.plans());
  const { data: subscription } = useSuspenseQuery(
    billingQueries.subscription(),
  );
  // ...
}
```

### Invalidation After Mutations

```tsx
const queryClient = useQueryClient();

const checkout = useMutation({
  mutationFn: createCheckout,
  onSuccess: (data) => {
    window.location.href = data.checkoutUrl;
  },
});

const cancel = useMutation({
  mutationFn: cancelSubscription,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['billing'] });
  },
});
```

---

## Database Schema

```
# Auth (Better Auth managed — schemas/auth.ts)
user              id, name, email, emailVerified, image, role, createdAt, updatedAt
session           id, userId, token, expiresAt, ...
account           id, userId, provider, providerAccountId, ...
verification      id, identifier, value, expiresAt, ...

# Billing (schemas/billing.ts)
plans             id, channel, externalProductId, externalPriceId, name, description,
                  price, currency, interval, entitlements (jsonb), sortOrder, popular, active
customers         id, userId, channel, externalCustomerId
subscriptions     id, userId, planId, channel, externalId, status,
                  currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, canceledAt
usage             id, userId, featureKey, used, periodStart, periodEnd
webhook_events    id, externalId, channel, type, processedAt

# Settings (schemas/settings.ts)
settings          User settings (theme, etc.)

# [Planned]
api_keys          id, orgId, name, keyHash, prefix, lastUsedAt, expiresAt, createdAt
webhook_endpoints id, orgId, url, events (jsonb), secret, enabled, createdAt
files             id, orgId, key, url, size, contentType, createdAt
site_settings     key, value (jsonb)
```

### Example Data

```
plans:
┌──────────┬────────┬──────────┬──────────────────────────────────────────────────────┐
│ name     │ price  │ interval │ entitlements                                         │
├──────────┼────────┼──────────┼──────────────────────────────────────────────────────┤
│ Starter  │ 999    │ monthly  │ { projects: 3, storage: 1 }                          │
│ Pro      │ 2999   │ monthly  │ { projects: -1, storage: 50, analytics: true }       │
│ Business │ 9999   │ monthly  │ { projects: -1, storage: 500, analytics: true, ... } │
└──────────┴────────┴──────────┴──────────────────────────────────────────────────────┘
```

---

## API Keys

> **Status: Planned** — designed but not yet implemented.

API keys are scoped to an organization. Each key has a hashed value (never stored in
plain text) and a prefix for identification (e.g. `tskit_live_abc12...`).

```ts
// services/api-key.service.ts

export class ApiKeyService {
  async create(orgId: string, name: string) {
    const raw = `tskit_live_${generateRandomString(32)}`;
    const prefix = raw.slice(0, 16);
    const keyHash = await hashApiKey(raw);

    await db.insert(apiKeys).values({ orgId, name, keyHash, prefix });

    // Return raw key ONCE — it's never retrievable again
    return { key: raw, prefix };
  }

  async validate(raw: string) {
    const keyHash = await hashApiKey(raw);
    const key = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.keyHash, keyHash),
    });
    if (!key) return null;

    // Update last used timestamp (fire-and-forget)
    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, key.id))
      .then();

    return key;
  }

  async revoke(id: string, orgId: string) {
    return db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.orgId, orgId)));
  }
}

export const apiKeyService = new ApiKeyService();
```

---

## Usage Tracking

Tracks metered usage per user per billing period. One record per user per feature.
The service handles increment/decrement/reset with lazy period reset — if the period
has expired, usage resets automatically on next read.

```ts
// services/usage.service.ts

export async function getUsageCount(
  userId: string,
  featureKey: string,
  period: Period,
): Promise<number> {
  const record = await db.query.usage.findFirst({
    where: and(eq(usage.userId, userId), eq(usage.featureKey, featureKey)),
  });
  if (!record) return 0;
  // Lazy period reset: if expired, reset usage
  if (record.periodEnd < new Date()) { /* reset and return 0 */ }
  return record.used;
}

export async function incrementUsage(
  userId: string,
  featureKey: string,
  period: Period,
  amount = 1,
): Promise<void> { /* upsert usage record */ }

export async function decrementUsage(userId: string, featureKey: string, amount = 1): Promise<void> { ... }
export async function resetUsage(userId: string, featureKey: string): Promise<void> { ... }
```

---

## Outgoing Webhooks

> **Status: Planned** — designed but not yet implemented.

Users configure webhook endpoints to receive events from the platform. Delivery
happens via the background job queue with automatic retries.

```ts
// services/webhook.service.ts

import { queue } from '@/lib/queue';

export class WebhookService {
  async send(orgId: string, event: string, payload: unknown) {
    const endpoints = await db.query.webhookEndpoints.findMany({
      where: and(
        eq(webhookEndpoints.orgId, orgId),
        eq(webhookEndpoints.enabled, true),
      ),
    });

    for (const endpoint of endpoints) {
      if (!endpoint.events.includes(event)) continue;

      await queue.add('webhook.deliver', {
        endpointId: endpoint.id,
        event,
        payload,
        secret: endpoint.secret,
        url: endpoint.url,
      });
    }
  }
}

export const webhookService = new WebhookService();
```

Each delivery is signed with the endpoint's secret so the receiver can verify authenticity.
Failed deliveries are retried with exponential backoff (managed by the job queue).

---

## Background Jobs

> **Status: Planned** — designed but not yet implemented.

For async work: webhook delivery retries, email sending, usage aggregation, cleanup tasks.

Options for the queue provider in `core/drivers/queue/`:

| Queue              | Tradeoff                                  |
| ------------------ | ----------------------------------------- |
| **BullMQ**         | Redis-backed, mature, full-featured       |
| **Trigger.dev**    | Managed, serverless-friendly, built-in UI |
| **Upstash QStash** | HTTP-based, serverless, no Redis needed   |

Job handlers live in `jobs/`:

```ts
// jobs/webhook-delivery.job.ts

export async function handleWebhookDelivery(data: WebhookDeliveryData) {
  const signature = signPayload(data.payload, data.secret);

  const res = await fetch(data.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
    },
    body: JSON.stringify({ event: data.event, data: data.payload }),
  });

  if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);

  await db
    .update(webhookDeliveries)
    .set({ status: 'delivered' })
    .where(eq(webhookDeliveries.id, data.deliveryId));
}
```

---

## Data Flow

### Subscription Purchase

```
User picks plan → createCheckout() → payment.checkout(userId, planId) → facade resolves customer + plan → driver.createCheckout() → redirect to Stripe
  ↓
Webhook fires → payment.handleWebhook(request) → driver verifies signature + normalizes event → subscriptionService.handleWebhookEvent()
  ↓
Service creates/updates subscription in DB → mailer.send("subscription-created", ...)
```

### Admin Config Change

```
Admin manages plans → CRUD on plans table → billing page reflects changes
Adding a second Stripe account → add channel to paymentConfig → payment.use('stripe-eu').checkout(...)
```

---

## Admin

> **Status: Planned** — only a stub route exists at `admin/index.tsx`. Admin middleware, sub-routes, and server functions are not yet implemented.

- `admin/route.tsx` layout route checks `context.session.user.role` in `beforeLoad` and redirects non-admins.
- All server functions under `functions/admin/` will attach `adminMiddleware` for server-side enforcement.
- Admin will manage: users, organizations, plans, site settings.

---

## Adding a New Driver

To add a new driver (e.g. a new payment gateway):

1. Create `core/drivers/payment/<name>.ts` implementing `PaymentDriver`
2. Add it to the driver registry in `core/drivers/payment/index.ts`
3. Add a channel in `config/payment.ts` with credentials
4. Add a webhook route at `routes/api/webhooks/<name>.ts`

The facade (`lib/payment.ts`) doesn't change — it resolves the channel automatically.

The same pattern applies to email, storage, and queue drivers.

---

## Adding a New Feature Domain

When your SaaS needs a new domain (e.g. projects, teams, invoices):

1. **Schema** — add `database/schemas/<domain>.ts`
2. **Service** — add `services/<domain>.service.ts`
3. **Server functions** — add `functions/<domain>.ts`
4. **Queries** — add `queries/<domain>.queries.ts`
5. **Components** — add `components/<domain>/`
6. **Routes** — add `routes/_app/<domain>.tsx`

Follow the existing layer boundaries:

```
routes → components → queries → functions → services → database/
                                           → lib/*    → core/drivers
```

