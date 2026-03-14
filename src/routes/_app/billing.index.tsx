import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { PageHeader } from '@/components/shared/page-header';
import { SubscriptionStatus } from '@/components/billing/subscription-status';
import { createFileRoute } from '@tanstack/react-router';
import { getSubscription } from '@/functions/billing';

export const Route = createFileRoute('/_app/billing/')({
  loader: async () => {
    const subscription = await getSubscription();
    return { subscription };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { subscription } = Route.useLoaderData();
  return (
    <>
      <PageHeader>
        <Heading>Billing</Heading>
        <Text className="text-muted mt-1">
          Manage your subscription and billing details.
        </Text>
      </PageHeader>
      <SubscriptionStatus subscription={subscription} />
    </>
  );
}
