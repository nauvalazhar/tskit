import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { subscriptionsSearchSchema } from '@/validations/admin';
import { getSubscriptions } from '@/functions/admin/subscriptions';
import { SubscriptionsTable } from '@/components/admin/subscriptions-table';
import { PageHeader } from '@/components/shared/page-header';
import { Heading } from '@/components/selia/heading';

export const Route = createFileRoute('/admin/subscriptions')({
  head: () => ({
    meta: [{ title: pageTitle('Subscriptions') }],
  }),
  validateSearch: subscriptionsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getSubscriptions({ data: deps }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Subscriptions</Heading>
      </PageHeader>
      <SubscriptionsTable />
    </div>
  );
}
