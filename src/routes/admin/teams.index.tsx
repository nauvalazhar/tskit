import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { pageTitle } from '@/lib/utils';
import { getTeamsAdmin } from '@/functions/admin/teams';
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
  loader: ({ deps }) => getTeamsAdmin({ data: deps }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Heading>Teams</Heading>
      </PageHeader>
      <TeamsTable />
    </div>
  );
}
