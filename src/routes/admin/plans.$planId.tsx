import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { getAllPlans, getPaymentChannels } from '@/functions/admin/plans';
import { PlanForm } from '@/components/admin/plan-form';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/selia/button';
import { ArrowLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/admin/plans/$planId')({
  head: () => ({
    meta: [{ title: pageTitle('Edit Plan') }],
  }),
  loader: async ({ params }) => {
    const [plans, channels] = await Promise.all([
      getAllPlans({ data: {} }),
      getPaymentChannels(),
    ]);
    const plan = plans.find((p) => p.id === params.planId);
    if (!plan) throw notFound();
    return { plan, channels };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { plan } = Route.useLoaderData();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader>
        <div className="flex items-center gap-3">
          <Button
            nativeButton={false}
            variant="plain"
            size="xs-icon"
            render={<Link to="/admin/plans" />}
          >
            <ArrowLeftIcon />
          </Button>
          <h1 className="text-2xl font-semibold">Plan Details</h1>
        </div>
      </PageHeader>
      <PlanForm plan={plan} />
    </div>
  );
}
