import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { subscriptionsSearchSchema } from '@/validations/admin';
import { adminSubscriptionsQuery } from '@/queries/admin/subscriptions.queries';
import { SubscriptionsTable } from '@/components/admin/subscriptions-table';
import { PageHeader } from '@/components/shared/page-header';
import { Heading } from '@/components/selia/heading';

export const Route = createFileRoute('/admin/subscriptions')({
  validateSearch: subscriptionsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      adminSubscriptionsQuery({
        page: deps.page,
        search: deps.search,
        status: deps.status,
      }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Subscriptions</Heading>
      </PageHeader>
      <Suspense>
        <SubscriptionsTable />
      </Suspense>
    </div>
  );
}
