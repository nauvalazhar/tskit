import { queryOptions, useQuery } from '@tanstack/react-query';
import { getSubscription } from '@/functions/billing';
import { hasFeature, withinLimit, remaining } from '@/lib/entitlements';

const subscriptionQuery = queryOptions({
  queryKey: ['billing', 'subscription'],
  queryFn: () => getSubscription(),
});

export function useSubscription() {
  const { data, isPending } = useQuery(subscriptionQuery);
  const entitlements = data?.plan?.entitlements ?? {};

  return {
    subscription: data ?? null,
    plan: data?.plan ?? null,
    isSubscribed: !!data && ['active', 'trialing'].includes(data.status),
    isPending,
    hasFeature: (key: string) => hasFeature(entitlements, key),
    withinLimit: (key: string, usage: number) => withinLimit(entitlements, key, usage),
    remaining: (key: string, usage: number) => remaining(entitlements, key, usage),
  };
}
