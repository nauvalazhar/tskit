---
title: Adding a Service
description: How to add a new service to TSKit.
sidebar:
  order: 2
---

Services hold business logic and database queries. They are called by server functions, never directly from components.

## 1. Create the service

Add a new file in `services/`. Use named function exports, not classes:

```ts
// src/services/notification.service.ts
import { db } from '#/database'
import { notifications } from '#/database/schemas/notifications'
import { eq, desc } from 'drizzle-orm'

export async function getNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
}

export async function markAsRead(notificationId: string) {
  return db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(eq(notifications.id, notificationId))
}
```

## 2. Create the server function

Wrap the service in a server function with middleware:

```ts
// src/functions/notifications.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { authMiddleware } from '#/middleware/auth'
import { createRateLimitMiddleware } from '#/middleware/rate-limit'
import * as notificationService from '#/services/notification.service'

const defaultRateLimit = createRateLimitMiddleware('default')

export const listNotifications = createServerFn({ method: 'GET' })
  .middleware([defaultRateLimit, authMiddleware])
  .handler(async ({ context }) => {
    return notificationService.getNotifications(context.user.id)
  })

export const markNotificationRead = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    return notificationService.markAsRead(data.id)
  })
```

## 3. Use the server function in a route

Call the server function from a route loader and return its data. Components read via `Route.useLoaderData()`. See [Adding a Page](/reference/adding-a-page/) for the full pattern.

## Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Service file | `<domain>.service.ts` | `notification.service.ts` |
| Service exports | Named functions | `getNotifications`, `markAsRead` |
| Server function | camelCase verb | `listNotifications`, `markNotificationRead` |
