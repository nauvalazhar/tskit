---
title: Admin Dashboard
description: How the admin dashboard works in TSKit.
sidebar:
  order: 10
---

TSKit includes an admin dashboard at `/admin` for managing users, subscriptions, plans, and viewing audit logs. Only users with the `admin` role can access it.

## Access control

The admin section is protected by `adminMiddleware`, which chains auth and rate limiting. If a non-admin user tries to access any admin page, they are redirected to `/dashboard`.

The `admin` role is set on the user record in the database. Better Auth's admin plugin provides the API for promoting and banning users.

## Pages

The admin dashboard has five pages:

### Overview (`/admin`)

A summary view with key metrics - total users, active subscriptions, revenue, and recent activity.

### Users (`/admin/users`)

List and search users. Admins can:

- View user details (email, signup date, verification status, role)
- Ban or unban users
- Impersonate users for debugging

### Subscriptions (`/admin/subscriptions`)

View all active subscriptions across organizations. Shows the plan, status, billing period, and organization.

### Plans (`/admin/plans`)

Manage subscription plans. View plan details, entitlements, pricing, and the number of active subscribers on each plan.

### Audit Log (`/admin/audit`)

Browse the full audit trail across the app. Filter by action type, date range, and actor. Uses cursor-based pagination for performance.

## Architecture

The admin section follows the same layered pattern as the rest of the app:

- **Routes** in `routes/admin/` - Thin page shells with loaders that fetch and return data
- **Server functions** in `functions/admin/` - Split by domain (overview, users, subscriptions, plans, audit)
- **Services** in `services/admin/` - Business logic and queries, also split by domain

All admin server functions use `adminMiddleware`, which handles both authentication and role verification.

## Key files

| File | Purpose |
|------|---------|
| `routes/admin/` | Admin page routes |
| `functions/admin/` | Admin server functions (overview, users, subscriptions, plans, audit) |
| `services/admin/` | Admin services |
| `middleware/admin.ts` | Admin middleware (auth + role check + rate limit) |
