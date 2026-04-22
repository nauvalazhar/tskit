import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { pageTitle } from '@/lib/utils';
import { adminTeamsQuery } from '@/queries/admin/teams.queries';
import { TeamsTable } from '@/components/admin/teams-table';
import { PageHeader } from '@/components/shared/page-header';
import { Heading } from '@/components/selia/heading';

const teamsSearchSchema = z.object({
  page: z.number().int().positive().optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute('/admin/teams/')({
  head: () => ({
    meta: [{ title: pageTitle('Teams') }],
  }),
  validateSearch: teamsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      adminTeamsQuery({ page: deps.page, search: deps.search }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Teams</Heading>
      </PageHeader>
      <Suspense>
        <TeamsTable />
      </Suspense>
    </div>
  );
}
