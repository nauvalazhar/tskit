import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { adminUsersQuery } from '@/queries/admin/users.queries';
import { UsersTable } from '@/components/admin/users-table';
import { PageHeader } from '@/components/shared/page-header';
import { usersSearchSchema } from '@/validations/admin';
import { Heading } from '@/components/selia/heading';

export const Route = createFileRoute('/admin/users/')({
  validateSearch: usersSearchSchema,
  head: () => ({
    meta: [{ title: pageTitle('Users') }],
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      adminUsersQuery({ page: deps.page, search: deps.search }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Users</Heading>
      </PageHeader>
      <Suspense>
        <UsersTable />
      </Suspense>
    </div>
  );
}
