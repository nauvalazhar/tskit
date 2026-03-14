# TSKit — Feature Roadmap

## Completed

- [x] **Email verification** — Email OTP verification on signup.
- [x] **Theme persistence** — Theme preference persisted to user settings table.
- [x] **Billing & subscriptions** — Stripe integration: plans, checkout, customer portal, webhook handling, subscription lifecycle.
- [x] **Usage tracking & metering** — Per-user usage tracking with lazy period reset (`services/usage.service.ts` + `lib/entitlements.ts`).
- [x] **Email templates** — 5 transactional templates: verify-email, reset-password, password-changed, subscription-created, payment-failed.
- [x] **API response helpers** — `apiError()` / `apiSuccess()` response utilities in `lib/api-response.ts`.
- [x] **Error boundaries** — Global + per-route error boundaries with styled error/404 pages.
- [x] **Seed script** — Database seeder for development (`database/seed.ts`).
- [x] **Session management UI** — List active sessions, revoke sessions (`components/settings/sessions-list.tsx`).

## Existing TODOs (in code)

- [ ] **Admin role check** — Wire up admin role guard in `admin/route.tsx`. Logic is commented out, just needs enabling.

## Phase 1 — Core SaaS Features

- [ ] **Team / organization management** — Better Auth org plugin is wired but has no UI. Create teams, invite members, assign roles, team switching UI.
- [ ] **API key management** — Generate, revoke, and scope API keys for developer-facing products.

## Phase 2 — Admin & Observability

- [ ] **Admin dashboard** — User management table, system metrics, feature flags. Stub route already exists at `admin/`.
- [ ] **Admin middleware** — `middleware/admin.ts` for server-side admin role enforcement.
- [ ] **Audit log** — Track security-sensitive actions: login, password change, 2FA toggle, account deletion, role changes.
- [ ] **Impersonation** — Admin sign-in-as-user for customer support, with clear visual indicator and audit trail.

## Phase 3 — Infrastructure

- [ ] **Background jobs / queue** — Async job processing for emails, webhooks, heavy tasks (BullMQ, Inngest, or similar).
- [ ] **Rate limiting** — Protect API routes and server functions from abuse.
- [ ] **Webhook delivery system** — Send events to customer-configured endpoints with retry logic and delivery logs.
- [ ] **Test suite** — Vitest is configured but no tests exist. Add unit tests for core drivers, integration tests for server functions, and component tests.

## Phase 4 — User Experience

- [ ] **Notification system** — In-app notifications with read/unread state, bell icon, notification preferences.
- [ ] **Onboarding flow** — Post-signup wizard or checklist to guide new users through setup.
- [ ] **User preferences (remaining)** — Theme is done. Still TODO: timezone, locale, date format, notification channel settings.
- [ ] **Email templates (remaining)** — 5 core templates done. Still TODO: welcome, team invitation, billing receipts, usage alerts.

## Phase 5 — Developer Experience

- [ ] **CLI scaffolding** — Generators for new services, server functions, email templates, and API routes.
- [ ] **Request validation (shared schemas)** — Inline `.validator()` is used on server functions. Still TODO: shared `validation/` directory with reusable Zod schemas.

## Phase 6 — Security

- [ ] **CSRF protection** — Verify origin headers on mutations.
- [ ] **Login activity log** — Show recent sign-in history (IP, device, time) in security settings.
- [ ] **Account lockout** — Temporary lockout after repeated failed login attempts.

## Guides/Architectural

- [ ] Check if codebase comply with the arch
- [ ] Components should use compound pattern
- [ ] Email preview in browser
- [ ] Task scheduler
- [ ] Scripts runner
