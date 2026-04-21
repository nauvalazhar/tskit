import { z } from 'zod';
import {
  SUBSCRIPTION_STATUS_KEYS,
  type SubscriptionStatus,
} from '@/lib/constants';

export type { SubscriptionStatus };

const pagination = {
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(100).optional(),
};

export const usersSearchSchema = z.object({
  ...pagination,
  search: z.string().optional(),
});

export const subscriptionStatusSchema = z.enum(
  SUBSCRIPTION_STATUS_KEYS as [SubscriptionStatus, ...SubscriptionStatus[]],
);

export const subscriptionsSearchSchema = z.object({
  ...pagination,
  search: z.string().optional(),
  status: subscriptionStatusSchema.optional(),
});

export const plansSearchSchema = z.object({
  search: z.string().optional(),
});
