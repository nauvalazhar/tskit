import { queryOptions } from '@tanstack/react-query';
import { getPlans, getSubscription } from '@/functions/billing';

export function billingPlansQuery() {
  return queryOptions({
    queryKey: ['billing', 'plans'],
    queryFn: () => getPlans(),
  });
}

export function billingSubscriptionQuery() {
  return queryOptions({
    queryKey: ['billing', 'subscription'],
    queryFn: () => getSubscription(),
  });
}

const POLL_INTERVAL = 2000;

export function billingSubscriptionPollingQuery(enabled: boolean) {
  return queryOptions({
    queryKey: ['billing', 'subscription', 'polling'],
    queryFn: () => getSubscription(),
    refetchInterval: (query) => {
      if (!enabled) return false;
      const status = query.state.data?.status;
      if (status === 'active' || status === 'trialing') return false;
      return POLL_INTERVAL;
    },
  });
}
