import { createFileRoute, Link } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { getAllPlans } from '@/functions/admin/plans';
import { plansSearchSchema } from '@/validations/admin';
import { PlansTable } from '@/components/admin/plans-table';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/selia/button';
import { PlusIcon } from 'lucide-react';
import { Heading } from '@/components/selia/heading';

export const Route = createFileRoute('/admin/plans/')({
  head: () => ({
    meta: [{ title: pageTitle('Plans') }],
  }),
  validateSearch: plansSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getAllPlans({ data: deps }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
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
      <PlansTable />
    </div>
  );
}
