import { createFileRoute } from '@tanstack/react-router';
import { getAdminOverview } from '@/functions/admin/overview';
import { pageTitle } from '@/lib/utils';
import { OverviewStats } from '@/components/admin/overview-stats';
import { RecentActivity } from '@/components/admin/recent-activity';
import { PageHeader } from '@/components/shared/page-header';
import { Heading } from '@/components/selia/heading';

export const Route = createFileRoute('/admin/')({
  head: () => ({
    meta: [{ title: pageTitle('Admin Overview') }],
  }),
  loader: () => getAdminOverview(),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();

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
