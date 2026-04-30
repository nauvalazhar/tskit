---
title: Adding a Page
description: How to add a new page to TSKit.
sidebar:
  order: 1
---

This guide walks through adding a new page that loads data from the server. The example adds a `/notifications` page to the authenticated app.

## 1. Create the server function

Add a server function in `functions/` that fetches data with appropriate middleware:

```ts
// src/functions/notifications.ts
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '#/middleware/auth'
import { getNotifications } from '#/services/notification.service'

export const listNotifications = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return getNotifications(context.user.id)
  })
```

## 2. Create the route

Add the route file. The loader awaits the server function and returns the data:

```tsx
// src/routes/_app/notifications.tsx
import { createFileRoute } from '@tanstack/react-router'
import { listNotifications } from '#/functions/notifications'
import { NotificationList } from '#/components/notifications/notification-list'
import { PageHeader } from '#/components/shared/page-header'

export const Route = createFileRoute('/_app/notifications')({
  loader: () => listNotifications(),
  component: NotificationsPage,
})

function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" />
      <NotificationList />
    </>
  )
}
```

## 3. Create the component

The component reads loader data via `getRouteApi(...).useLoaderData()`:

```tsx
// src/components/notifications/notification-list.tsx
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/_app/notifications')

export function NotificationList() {
  const notifications = routeApi.useLoaderData()

  return (
    <ul>
      {notifications.map((n) => (
        <li key={n.id}>{n.message}</li>
      ))}
    </ul>
  )
}
```

If the data is read directly inside the route's component (no separate file), use `Route.useLoaderData()` instead.

## Mutations

After mutating notifications, call `await router.invalidate()` to refresh the loader:

```tsx
async function markAllRead() {
  await markNotificationsRead()
  await router.invalidate()
}
```

## Summary

The pattern is always the same:

1. **Service** - Business logic and database query
2. **Server function** - RPC boundary with middleware
3. **Route** - Loader awaits the server function and returns its data
4. **Component** - Reads data via `Route.useLoaderData()` (or `getRouteApi(...).useLoaderData()` from a child file)
