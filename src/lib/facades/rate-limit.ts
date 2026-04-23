import { rateLimitConfig, type RateLimitRule } from '@/config/rate-limit';
import { createRateLimitDriver } from '@/core/drivers/rate-limit';
import type {
  RateLimitDriver,
  RateLimitResult,
} from '@/core/drivers/rate-limit/types';

class RateLimiter {
  private driver: RateLimitDriver | undefined;
  private rule: RateLimitRule | undefined;

  private resolveDriver(): RateLimitDriver {
    if (!this.driver) {
      this.driver = createRateLimitDriver(rateLimitConfig.driver);
    }
    return this.driver;
  }

  private resolveRule(override?: RateLimitRule) {
    const name = override || this.rule || rateLimitConfig.default;
    const config = rateLimitConfig.rules[name];
    if (!config)
      throw new Error(`Rate limit rule "${name}" not configured`);
    return config;
  }

  use(name: RateLimitRule): RateLimiter {
    const scoped = new RateLimiter();
    scoped.driver = this.resolveDriver();
    scoped.rule = name;
    return scoped;
  }

  async check(
    key: string,
    rule?: RateLimitRule,
  ): Promise<RateLimitResult> {
    const r = this.resolveRule(rule);
    return this.resolveDriver().check(key, r.maxRequests, r.windowMs);
  }

  async reset(key: string): Promise<void> {
    return this.resolveDriver().reset(key);
  }
}

export const rateLimiter = new RateLimiter();
