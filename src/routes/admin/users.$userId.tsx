import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { adminUserQuery } from '@/queries/admin.queries';
import { Button } from '@/components/selia/button';
import { UserProfile } from '@/components/admin/user-profile';
import { UserSubscription } from '@/components/admin/user-subscription';
import { UserAccounts } from '@/components/admin/user-accounts';
import { UserActions } from '@/components/admin/user-actions';
import { PageHeader } from '@/components/shared/page-header';
import { ArrowLeftIcon } from 'lucide-react';
import { Heading } from '@/components/selia/heading';

export const Route = createFileRoute('/admin/users/$userId')({
  loader: async ({ context, params }) => {
    const user = await context.queryClient.ensureQueryData(
      adminUserQuery(params.userId),
    );
    if (!user) throw notFound();
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader>
        <div className="flex items-center gap-3">
          <Button
            nativeButton={false}
            variant="plain"
            size="xs-icon"
            render={<Link to="/admin/users" />}
          >
            <ArrowLeftIcon />
          </Button>
          <Heading>User Details</Heading>
        </div>
      </PageHeader>
      <UserProfile />
      <UserSubscription />
      <UserAccounts />
      <UserActions />
    </div>
  );
}
