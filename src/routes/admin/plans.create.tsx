import { createFileRoute, Link } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { PlanForm } from '@/components/admin/plan-form';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/selia/button';
import { ArrowLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/admin/plans/create')({
  head: () => ({
    meta: [{ title: pageTitle('Create Plan') }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader>
        <div className="flex items-center gap-3">
          <Button
            variant="plain"
            size="xs-icon"
            render={<Link to="/admin/plans" />}
          >
            <ArrowLeftIcon />
          </Button>
          <h1 className="text-2xl font-semibold">Create Plan</h1>
        </div>
      </PageHeader>
      <PlanForm
        isNew
        plan={{
          slug: '',
          name: '',
          description: '',
          price: 0,
          currency: 'usd',
          interval: 'month',
          entitlements: {},
          sortOrder: 0,
          popular: false,
          active: true,
        }}
      />
    </div>
  );
}
