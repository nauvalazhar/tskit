import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  adminPlansQuery,
  adminPaymentChannelsQuery,
} from '@/queries/admin/plans.queries';
import { PlanForm } from '@/components/admin/plan-form';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/selia/button';
import { ArrowLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/admin/plans/$planId')({
  loader: async ({ context, params }) => {
    const [plans] = await Promise.all([
      context.queryClient.ensureQueryData(adminPlansQuery()),
      context.queryClient.ensureQueryData(adminPaymentChannelsQuery()),
    ]);
    const plan = plans.find((p) => p.id === params.planId);
    if (!plan) throw notFound();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { planId } = Route.useParams();
  const plans = useSuspenseQuery(adminPlansQuery()).data;
  const plan = plans.find((p) => p.id === planId)!;

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
