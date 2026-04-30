---
title: User Dashboard
description: The user-facing app pages in TSKit.
sidebar:
  order: 9
---

The user dashboard is the authenticated area of the app at `/dashboard`. All pages under `_app/` require a valid session and are wrapped in a sidebar layout.

## Pages

### Dashboard (`/dashboard`)

The landing page after login. Shows a welcome message and quick links to profile, security, and preferences.

### Billing (`/billing`)

Subscription management for the current team. Shows the active plan, status, and renewal date. Team owners and admins can:

- Subscribe to a plan via Stripe or Polar checkout
- Change plans (upgrade or downgrade)
- Cancel the subscription (takes effect at the end of the billing period)
- Open the customer portal to manage payment methods and invoices

See the [Billing guide](/guides/billing/) for details on how billing works.

### Billing success (`/billing/success`)

The page users land on after completing a Stripe checkout. It polls for the subscription to become active, then shows a confirmation.

### Settings

Settings are organized into tabs under `/settings`:

#### Profile (`/settings`)

Update name and profile photo (avatar upload).

#### Security (`/settings/security`)

Change password, enable or disable two-factor authentication, and manage active sessions (view and revoke).

#### Preferences (`/settings/preferences`)

Theme settings (light, dark, or system).

#### Activity (`/settings/activity`)

The current user's audit log. Shows a timeline of actions they have performed.

#### Advanced (`/settings/advanced`)

Account deletion. Requires password confirmation and shows a warning about what will be removed.

#### Team (`/settings/team`)

Team management, split into two sub-pages:

- **General** (`/settings/team`) - Team name, slug, and logo. Team deletion (owner only).
- **Members** (`/settings/team/members`) - View members and their roles, invite new members by email, remove members, and change roles.

See the [Teams guide](/guides/teams/) for details on how teams work.

## Layout

All user-facing pages share the `_app` layout which includes:

- A sidebar with navigation links, team switcher, and user menu
- An email verification banner that appears if the user's email is not verified

The sidebar collapses on mobile with a toggle button.

## Key files

| File | Purpose |
|------|---------|
| `routes/_app/route.tsx` | App layout (sidebar, banner) and auth guard |
| `routes/_app/dashboard.tsx` | Dashboard page |
| `routes/_app/billing.tsx` | Billing layout |
| `routes/_app/billing.index.tsx` | Billing page |
| `routes/_app/billing.success.tsx` | Post-checkout success page |
| `routes/_app/settings.tsx` | Settings layout (tabs) |
| `routes/_app/settings.index.tsx` | Profile settings |
| `routes/_app/settings.security.tsx` | Security settings |
| `routes/_app/settings.preferences.tsx` | Theme preferences |
| `routes/_app/settings.activity.tsx` | User activity log |
| `routes/_app/settings.advanced.tsx` | Account deletion |
| `routes/_app/settings.team.tsx` | Team settings layout |
| `routes/_app/settings.team.index.tsx` | Team general settings |
| `routes/_app/settings.team.members.tsx` | Team members management |
