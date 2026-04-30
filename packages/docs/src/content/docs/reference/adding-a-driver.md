---
title: Adding a Driver
description: How to add a new driver implementation.
sidebar:
  order: 4
---

TSKit uses a config-driver-facade pattern for storage, email, payment, and rate limiting. Each system has the same structure:

1. **Config** (`config/`) - Defines channels with provider settings
2. **Driver** (`core/drivers/`) - Implements the interface for a specific provider
3. **Facade** (`lib/facades/`) - Provides the high-level API consumers use

This guide walks through adding a new driver using a Redis rate-limit driver as an example.

## 1. Implement the interface

Look at the existing interface in `core/drivers/rate-limit/types.ts` to see what methods you need:

```ts
export interface RateLimitDriver {
  check(key: string, rule: { maxRequests: number; windowMs: number }): Promise<RateLimitResult>
  reset(key: string): Promise<void>
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}
```

Create your implementation:

```ts
// src/core/drivers/rate-limit/redis.ts
import type { RateLimitDriver, RateLimitResult } from './types'

export class RedisRateLimitDriver implements RateLimitDriver {
  private client: RedisClient

  constructor(config: { url: string }) {
    this.client = createRedisClient(config.url)
  }

  async check(
    key: string,
    rule: { maxRequests: number; windowMs: number },
  ): Promise<RateLimitResult> {
    // Your Redis sliding window implementation
  }

  async reset(key: string): Promise<void> {
    await this.client.del(key)
  }
}
```

## 2. Register in the factory

Open the driver's index file and add your new driver to the factory:

```ts
// src/core/drivers/rate-limit/index.ts
import { MemoryRateLimitDriver } from './memory'
import { RedisRateLimitDriver } from './redis'

export function createRateLimitDriver(config: { driver: string; [key: string]: any }) {
  switch (config.driver) {
    case 'memory':
      return new MemoryRateLimitDriver()
    case 'redis':
      return new RedisRateLimitDriver({ url: config.url })
    default:
      throw new Error(`Unknown rate limit driver: ${config.driver}`)
  }
}
```

## 3. Update the config

Update the channel config to support the new driver:

```ts
// src/config/rate-limit.ts
export const rateLimitConfig = {
  driver: {
    driver: process.env.RATE_LIMIT_DRIVER || 'memory',
    url: process.env.REDIS_URL,
  },
  // ... rules stay the same
}
```

The facade in `lib/facades/rate-limit.ts` picks up the driver through the factory, so no changes are needed there. Your new driver is ready to use.

## Existing driver categories

| Category | Interface location | Existing drivers |
|----------|-------------------|-----------------|
| Email | `core/drivers/email/types.ts` | Resend, SendGrid |
| Storage | `core/drivers/storage/types.ts` | S3 |
| Payment | `core/drivers/payment/types.ts` | Stripe |
| Rate Limit | `core/drivers/rate-limit/types.ts` | Memory |
