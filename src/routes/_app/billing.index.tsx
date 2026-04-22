import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { PageHeader } from '@/components/shared/page-header';
import { SubscriptionStatus } from '@/components/billing/subscription-status';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { getSubscription } from '@/functions/billing';
import { getActiveMemberRole } from '@/functions/team';
import { Alert, AlertTitle, AlertDescription } from '@/components/selia/alert';
import { InfoIcon } from 'lucide-react';

export const Route = createFileRoute('/_app/billing/')({
  head: () => ({
    meta: [{ title: pageTitle('Billing') }],
  }),
  loader: async () => {
    const role = await getActiveMemberRole();
    const canManage = role === 'owner' || role === 'admin';

    let subscription = null;
    try {
      subscription = await getSubscription();
    } catch {
      // org might not have a subscription yet — that's fine
    }
    return { subscription, canManage };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { subscription, canManage } = Route.useLoaderData();
  return (
    <>
      <PageHeader>
        <Heading>Billing</Heading>
        <Text className="text-muted mt-1">
          Manage your team's subscription and billing details.
        </Text>
      </PageHeader>
      {!canManage && (
        <Alert className="mb-6">
          <InfoIcon className="size-4" />
          <AlertTitle>View only</AlertTitle>
          <AlertDescription>
            Only team owners and admins can manage billing. Contact your team
            admin to make changes.
          </AlertDescription>
        </Alert>
      )}
      <SubscriptionStatus subscription={subscription} canManage={canManage} />
    </>
  );
}
