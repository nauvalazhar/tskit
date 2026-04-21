import { queryOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import {
  getAdminOverview,
  getUsers,
  getUser,
  getSubscriptions,
  getAllPlans,
  getPaymentChannels,
} from '@/functions/admin';
import type { usersSearchSchema, subscriptionsSearchSchema, plansSearchSchema } from '@/validations/admin';

export function adminOverviewQuery() {
  return queryOptions({
    queryKey: ['admin', 'overview'],
    queryFn: () => getAdminOverview(),
  });
}

export function adminUsersQuery(params: z.infer<typeof usersSearchSchema>) {
  return queryOptions({
    queryKey: ['admin', 'users', params],
    queryFn: () => getUsers({ data: params }),
  });
}

export function adminUserQuery(userId: string) {
  return queryOptions({
    queryKey: ['admin', 'users', userId],
    queryFn: () => getUser({ data: { userId } }),
  });
}

export function adminSubscriptionsQuery(
  params: z.infer<typeof subscriptionsSearchSchema>,
) {
  return queryOptions({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: () => getSubscriptions({ data: params }),
  });
}

export function adminPlansQuery(params: z.infer<typeof plansSearchSchema> = {}) {
  return queryOptions({
    queryKey: ['admin', 'plans', params],
    queryFn: () => getAllPlans({ data: params }),
  });
}

export function adminPaymentChannelsQuery() {
  return queryOptions({
    queryKey: ['admin', 'payment-channels'],
    queryFn: () => getPaymentChannels(),
  });
}
