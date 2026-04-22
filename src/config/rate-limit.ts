import { z } from 'zod';
import { rateLimitDriverConfigSchema } from '@/core/drivers/rate-limit/types';

const rateLimitRuleSchema = z.object({
  maxRequests: z.number().positive(),
  windowMs: z.number().positive(),
});

const rateLimitRulesSchema = z.object({
  auth: rateLimitRuleSchema,
  api: rateLimitRuleSchema,
  upload: rateLimitRuleSchema,
  admin: rateLimitRuleSchema,
  default: rateLimitRuleSchema,
});

const rateLimitConfigSchema = z.object({
  driver: rateLimitDriverConfigSchema,
  default: rateLimitRulesSchema.keyof(),
  rules: rateLimitRulesSchema,
});

export const rateLimitConfig = rateLimitConfigSchema.parse({
  driver: { driver: 'memory' },
  default: 'default',
  rules: {
    auth: { maxRequests: 120, windowMs: 60 * 1000 },
    api: { maxRequests: 100, windowMs: 60 * 1000 },
    upload: { maxRequests: 10, windowMs: 60 * 1000 },
    admin: { maxRequests: 60, windowMs: 60 * 1000 },
    default: { maxRequests: 60, windowMs: 60 * 1000 },
  },
});

export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;
export type RateLimitRule = keyof RateLimitConfig['rules'];
