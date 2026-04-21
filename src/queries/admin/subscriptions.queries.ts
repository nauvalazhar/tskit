import { queryOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import { getSubscriptions } from '@/functions/admin/subscriptions';
import type { subscriptionsSearchSchema } from '@/validations/admin';

export function adminSubscriptionsQuery(
  params: z.infer<typeof subscriptionsSearchSchema>,
) {
  return queryOptions({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: () => getSubscriptions({ data: params }),
  });
}
