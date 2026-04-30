---
title: Audit Logging
description: How audit logging works in TSKit.
sidebar:
  order: 8
---

TSKit records user actions to an audit log. This gives you a trail of who did what and when, useful for security, debugging, and compliance.

## How it works

The audit system has three parts:

1. **Facade** (`lib/facades/audit.ts`) - The `audit.log()` function you call from server functions. It automatically captures the IP address and user agent from the request headers.
2. **Service** (`services/audit.service.ts`) - Handles insertion and querying of audit records.
3. **Labels** (`lib/audit-labels.ts`) - Maps action strings to human-readable labels for the UI.

## Logging an action

Call `audit.log()` from any server function:

```ts
await audit.log({
  actorId: context.user.id,
  action: 'billing.checkout.created',
  targetType: 'organization',
  targetId: context.organization.id,
  metadata: { planId: data.planId },
})
```

The `ipAddress` and `userAgent` fields are captured automatically - you don't need to pass them.

## Action naming

Actions use dot-notation following the pattern `domain.resource.verb`:

- `billing.checkout.created`
- `billing.subscription.cancelled`
- `billing.plan.changed`
- `team.member.invited`
- `team.member.removed`
- `team.member.role_changed`
- `settings.profile.updated`
- `settings.password.changed`
- `settings.two_factor.enabled`
- `admin.user.banned`

The first segment (before the first dot) is treated as the domain. This is used for filtering in the UI.

## Log entry fields

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `actorId` | string | No | The user who performed the action |
| `action` | string | Yes | Dot-notation action name |
| `targetType` | string | No | Type of the target (e.g., "user", "organization") |
| `targetId` | string | No | ID of the target |
| `metadata` | object | No | Extra key-value data |
| `ipAddress` | string | Auto | Captured automatically |
| `userAgent` | string | Auto | Captured automatically |

## Querying logs

The `query()` function in `services/audit.service.ts` supports filtering and cursor-based pagination:

```ts
const result = await query({
  actorId: userId,
  action: 'billing',        // prefix match - finds all billing.* actions
  from: new Date('2024-01-01'),
  to: new Date('2024-12-31'),
  cursor: lastItemId,
  limit: 50,
})
// { items: AuditLog[], nextCursor: string | null }
```

## Where logs are shown

Audit logs are displayed in two places:

- **Admin dashboard** at `/admin/audit` - All audit logs across the app, accessible to admins.
- **User settings** at `/settings/activity` - The current user's own activity log.

## Key files

| File | Purpose |
|------|---------|
| `lib/facades/audit.ts` | Audit facade with auto IP/UA capture |
| `lib/audit-labels.ts` | Human-readable labels for action strings |
| `services/audit.service.ts` | Log insertion and querying |
| `database/schemas/audit.ts` | Audit log table schema |
