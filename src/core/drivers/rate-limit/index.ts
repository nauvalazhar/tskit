import { MemoryRateLimitDriver } from './memory';
import type { RateLimitDriver, RateLimitDriverConfig } from './types';

const drivers: Record<
  string,
  (config: RateLimitDriverConfig) => RateLimitDriver
> = {
  memory: (config) => new MemoryRateLimitDriver(config),
};

export function createRateLimitDriver(
  config: RateLimitDriverConfig,
): RateLimitDriver {
  const factory = drivers[config.driver];
  if (!factory)
    throw new Error(`Rate limit driver "${config.driver}" not found`);
  return factory(config);
}
