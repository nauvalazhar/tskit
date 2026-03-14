import { useSuspenseQuery } from '@tanstack/react-query';
import { billingSubscriptionQuery } from '@/queries/billing.queries';
import { hasFeature, withinLimit, remaining } from '@/lib/entitlements';

export function useSubscription() {
  const { data, isPending } = useSuspenseQuery(billingSubscriptionQuery());
  const entitlements = data?.plan?.entitlements ?? {};

  return {
    subscription: data,
    plan: data?.plan ?? null,
    isSubscribed: !!data && ['active', 'trialing'].includes(data.status),
    hasFeature: (key: string) => hasFeature(entitlements, key),
    withinLimit: (key: string, usage: number) => withinLimit(entitlements, key, usage),
    remaining: (key: string, usage: number) => remaining(entitlements, key, usage),
    isPending,
  };
}
