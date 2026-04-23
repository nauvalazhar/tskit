import { createMiddleware } from '@tanstack/react-start';
import { getRequestIP } from '@tanstack/react-start/server';
import { rateLimiter } from '@/lib/facades/rate-limit';
import type { RateLimitRule } from '@/config/rate-limit';

export function createRateLimitMiddleware(rule: RateLimitRule) {
  return createMiddleware({ type: 'function' }).server(async ({ next }) => {
    const ip = getRequestIP({ xForwardedFor: true }) || 'unknown';
    const key = `${rule}:${ip}`;

    const result = await rateLimiter.use(rule).check(key);

    if (!result.allowed) {
      throw new Error('Too many requests. Please try again later.');
    }

    return next();
  });
}
