import type {
  RateLimitDriver,
  RateLimitResult,
  MemoryRateLimitDriverConfig,
} from './types';

export class MemoryRateLimitDriver implements RateLimitDriver {
  private store = new Map<string, number[]>();

  constructor(_config: MemoryRateLimitDriverConfig) {}

  async check(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = this.store.get(key);

    if (timestamps) {
      timestamps = timestamps.filter((t) => t > windowStart);
    } else {
      timestamps = [];
    }

    if (timestamps.length === 0) {
      this.store.delete(key);
    }

    if (timestamps.length < limit) {
      timestamps.push(now);
      this.store.set(key, timestamps);

      return {
        allowed: true,
        remaining: limit - timestamps.length,
        resetAt: new Date(timestamps[0] + windowMs),
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(timestamps[0] + windowMs),
    };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}
