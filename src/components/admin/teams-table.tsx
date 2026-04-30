import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/selia/badge';
import { DataPagination } from '@/components/shared/data-pagination';
import { DataTable } from '@/components/shared/data-table';
import { TableSearchInput } from '@/components/shared/table-search-input';
import { getRouteApi, Link } from '@tanstack/react-router';
import { getSubscriptionStatus } from '@/lib/utils';
import { Card, CardBody, CardHeader } from '@/components/selia/card';
import type { getTeamsAdmin } from '@/functions/admin/teams';

const routeApi = getRouteApi('/admin/teams/');

type Team = Awaited<ReturnType<typeof getTeamsAdmin>>['teams'][number];

const columnHelper = createColumnHelper<Team>();

const columns = [
  columnHelper.display({
    id: 'team',
    header: 'Team',
    cell: ({ row }) => (
      <Link
        to="/admin/teams/$teamId"
        params={{ teamId: row.original.id }}
        className="flex flex-col gap-1 min-w-0"
      >
        <p className="font-medium truncate">{row.original.name}</p>
        <p className="text-muted truncate">{row.original.slug}</p>
      </Link>
    ),
  }),
  columnHelper.display({
    id: 'members',
    header: 'Members',
    cell: ({ row }) => {
      const memberCount = row.original.members?.length ?? 0;
      return (
        <span>
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'subscription',
    header: 'Subscription',
    cell: ({ row }) => {
      const sub = row.original.subscription;
      if (!sub) return <span className="text-muted">None</span>;
      const status = getSubscriptionStatus(sub.status);
      return (
        <div className="flex items-center gap-2">
          <Badge variant={status?.variant ?? 'secondary'}>
            {status?.label ?? sub.status}
          </Badge>
          <span className="text-muted truncate">{sub.plan.name}</span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'owner',
    header: 'Owner',
    cell: ({ row }) => {
      const owner = row.original.members?.find((m) => m.role === 'owner');
      if (!owner) return <span className="text-muted">—</span>;
      return (
        <div className="min-w-0 flex flex-col gap-1">
          <p className="truncate">{owner.users.name}</p>
          <p className="text-muted truncate">{owner.users.email}</p>
        </div>
      );
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
];

export function TeamsTable() {
  const { page = 1, search = '' } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { teams, totalPages } = routeApi.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <TableSearchInput
          placeholder="Search by team name or slug..."
          value={search}
          onSearch={(v) => navigate({ search: { page: 1, search: v } })}
          onClear={() => navigate({ search: { page: 1 } })}
        />
      </CardHeader>
      <CardBody>
        <DataTable data={teams} columns={columns} emptyMessage="No teams found." />

        <DataPagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) =>
            navigate({ search: { page: p, search: search || undefined } })
          }
        />
      </CardBody>
    </Card>
  );
}
