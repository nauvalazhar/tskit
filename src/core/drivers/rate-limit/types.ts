import { z } from 'zod';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface RateLimitDriver {
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

export const memoryRateLimitDriverConfigSchema = z.object({
  driver: z.literal('memory'),
});

export const rateLimitDriverConfigSchema = memoryRateLimitDriverConfigSchema;

export type MemoryRateLimitDriverConfig = z.infer<
  typeof memoryRateLimitDriverConfigSchema
>;
export type RateLimitDriverConfig = z.infer<typeof rateLimitDriverConfigSchema>;
