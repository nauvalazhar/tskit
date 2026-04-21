import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { adminOverviewQuery } from '@/queries/admin/overview.queries';
import { OverviewStats } from '@/components/admin/overview-stats';
import { RecentActivity } from '@/components/admin/recent-activity';
import { PageHeader } from '@/components/shared/page-header';
import { Heading } from '@/components/selia/heading';

export const Route = createFileRoute('/admin/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(adminOverviewQuery());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(adminOverviewQuery());

  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Overview</Heading>
      </PageHeader>
      <OverviewStats stats={data} />
      <RecentActivity
        recentUsers={data.recentUsers}
        recentSubscriptions={data.recentSubscriptions}
      />
    </div>
  );
}
