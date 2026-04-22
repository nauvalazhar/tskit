import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableContainer,
} from '@/components/selia/table';
import { Badge } from '@/components/selia/badge';
import { Input } from '@/components/selia/input';
import { DataPagination } from '@/components/shared/data-pagination';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { adminTeamsQuery } from '@/queries/admin/teams.queries';
import { getSubscriptionStatus } from '@/lib/utils';
import { SearchIcon } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/selia/card';
import { InputGroup, InputGroupAddon } from '@/components/selia/input-group';
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
  const { data } = useSuspenseQuery(adminTeamsQuery({ page, search }));
  const { teams, totalPages } = data;

  const table = useReactTable({
    data: teams,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2.5">
          <InputGroup className="w-xs">
            <InputGroupAddon align="start">
              <SearchIcon />
            </InputGroupAddon>
            <Input
              key={search}
              placeholder="Search by team name or slug..."
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  navigate({ search: { page: 1, search: value || undefined } });
                }
              }}
            />
          </InputGroup>
          {search && (
            <p className="text-sm text-muted">
              Showing results for "<strong>{search}</strong>".{' '}
              <button
                className="underline cursor-pointer"
                onClick={() => navigate({ search: { page: 1 } })}
              >
                Clear search
              </button>
            </p>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted py-8"
                  >
                    No teams found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
