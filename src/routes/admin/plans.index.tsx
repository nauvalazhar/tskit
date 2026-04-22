import { createFileRoute, Link } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { adminPlansQuery } from '@/queries/admin/plans.queries';
import { plansSearchSchema } from '@/validations/admin';
import { PlansTable } from '@/components/admin/plans-table';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/selia/button';
import { PlusIcon } from 'lucide-react';
import { Heading } from '@/components/selia/heading';
import { Suspense } from 'react';

export const Route = createFileRoute('/admin/plans/')({
  head: () => ({
    meta: [{ title: pageTitle('Plans') }],
  }),
  validateSearch: plansSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    context.queryClient.ensureQueryData(adminPlansQuery({ search: deps.search }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex items-center justify-between">
          <Heading>Plans</Heading>
          <Button
            nativeButton={false}
            render={<Link to="/admin/plans/create" />}
          >
            <PlusIcon />
            Create Plan
          </Button>
        </div>
      </PageHeader>
      <Suspense>
        <PlansTable />
      </Suspense>
    </div>
  );
}
