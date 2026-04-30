import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { getUsers } from '@/functions/admin/users';
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
  loader: ({ deps }) => getUsers({ data: deps }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Users</Heading>
      </PageHeader>
      <UsersTable />
    </div>
  );
}
