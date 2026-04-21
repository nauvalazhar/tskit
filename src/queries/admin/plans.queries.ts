import { queryOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import { getAllPlans, getPaymentChannels } from '@/functions/admin/plans';
import type { plansSearchSchema } from '@/validations/admin';

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
