---
title: Rate Limiting
description: How rate limiting works in TSKit.
sidebar:
  order: 9
---

TSKit includes per-route rate limiting to protect against abuse. The rate limiter uses an in-memory driver by default, which works well for single-server deployments.

## Predefined rules

Five rate-limiting rules are defined in `config/rate-limit.ts`:

| Rule | Max requests | Window |
|------|:-----------:|:------:|
| `auth` | 120 | 1 minute |
| `api` | 100 | 1 minute |
| `upload` | 10 | 1 minute |
| `admin` | 60 | 1 minute |
| `default` | 60 | 1 minute |

## Using rate limiting

Add rate limiting to a server function using `createRateLimitMiddleware`:

```ts
import { createRateLimitMiddleware } from '#/middleware/rate-limit'

const uploadRateLimit = createRateLimitMiddleware('upload')

export const uploadFile = createServerFn({ method: 'POST' })
  .middleware([uploadRateLimit, authMiddleware])
  .handler(async ({ context }) => {
    // handler runs only if the rate limit allows it
  })
```

The middleware extracts the client's IP address and checks it against the rule. If the limit is exceeded, it throws a "Too many requests" error.

## How the driver works

The default `MemoryRateLimitDriver` uses an in-memory map to track request timestamps in a sliding window. When a request comes in, it counts how many previous requests from the same IP fall within the window.

This works well for development and single-server production setups. For multi-server deployments, you would need a persistent driver backed by something like Redis. See the [Adding a Driver](/reference/adding-a-driver/) reference for how to create one.

## Using the facade directly

Outside of middleware, you can use the `rateLimiter` facade from `lib/facades/rate-limit.ts`:

```ts
import { rateLimiter } from '#/lib/rate-limit'

const result = await rateLimiter.check('custom-key')
if (!result.allowed) {
  throw new Error('Rate limited')
}
```

Use a specific rule:

```ts
const result = await rateLimiter.use('upload').check(key)
```

## Key files

| File | Purpose |
|------|---------|
| `config/rate-limit.ts` | Rate limit rules and driver config |
| `lib/facades/rate-limit.ts` | RateLimiter facade |
| `middleware/rate-limit.ts` | Middleware factory |
| `core/drivers/rate-limit/memory.ts` | In-memory driver |
| `core/drivers/rate-limit/types.ts` | RateLimitDriver interface |
