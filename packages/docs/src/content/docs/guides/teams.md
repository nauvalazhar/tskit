---
title: Teams
description: How teams and organizations work in TSKit.
sidebar:
  order: 3
---

TSKit is multi-tenant. Every user belongs to at least one team, and most data (subscriptions, usage, billing) is scoped to the active team.

## How teams work

Teams are built on Better Auth's organization plugin. The schema includes three tables: `organizations`, `members`, and `invitations`. These are part of the auth schema and managed by Better Auth.

When a user signs up, a personal team is created automatically through a database hook in `lib/facades/auth.ts`. The team is named "{name}'s Team" with a slug like `personal-abc12345`. This happens behind the scenes so the user is ready to go from the start.

## Roles

Each team member has one of three roles:

| Role | Can manage team | Can manage billing | Can invite members |
|------|:-:|:-:|:-:|
| Owner | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes |
| Member | No | No | No |

Only owners can delete a team or transfer ownership.

## Switching teams

Users can switch between teams using the team switcher in the sidebar. When they switch, the active organization is updated on their session and persisted to user settings so it carries over to their next login.

The `setActiveTeam` server function handles this. It verifies that the user is a member of the target organization before switching.

## Inviting members

Team owners and admins can invite new members by email. The invitation flow:

1. An invitation is created with a role and sent via email using the `team-invitation` template.
2. The invitation expires after 48 hours.
3. The invited user clicks the link and lands on `/invite/{invitationId}`.
4. They see the team name and who invited them, then accept or reject.
5. On acceptance, they become a member of the team.

## Org-scoped data

Billing, subscriptions, and usage are all scoped to the organization. This means:

- Each team has its own Stripe customer
- Each team has its own subscription and plan
- Usage limits are tracked per team, not per user
- Only team owners and admins can manage billing

This is handled by `orgMiddleware`, which fetches the active organization and makes it available as `context.organization` in server functions.

## Preventing orphan users

A user cannot delete their only team or leave their only team. The server functions check membership count before allowing these actions. If a user deletes their account, any team where they are the sole member is also deleted.

## Key files

| File | Purpose |
|------|---------|
| `lib/team.ts` | Personal team auto-creation on signup |
| `functions/team.ts` | All team server functions (CRUD, members, invitations) |
| `middleware/org.ts` | Org middleware (fetches active organization) |
| `database/schemas/auth.ts` | Organization, member, and invitation tables |
| `components/settings/team-invite-form.tsx` | Invitation dialog |
| `components/settings/team-members-list.tsx` | Members list with role management |
| `routes/invite.$invitationId.tsx` | Invitation acceptance page |
