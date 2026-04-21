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
} from '@/components/selia/table';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
} from '@/components/selia/menu';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { togglePlanActive, getAllPlans } from '@/functions/admin/plans';
import { adminPlansQuery } from '@/queries/admin/plans.queries';
import { EllipsisIcon, SearchIcon } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/selia/card';
import { Input } from '@/components/selia/input';
import { InputGroup, InputGroupAddon } from '@/components/selia/input-group';
import { TableContainer } from '@/components/selia/table';

const routeApi = getRouteApi('/admin/plans/');

type Plan = Awaited<ReturnType<typeof getAllPlans>>[number];

const columnHelper = createColumnHelper<Plan>();

const columns = [
  columnHelper.display({
    id: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">{row.original.name}</p>
        <p className="text-muted">{row.original.slug}</p>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'price',
    header: 'Price',
    cell: ({ row }) =>
      `$${(row.original.price / 100).toFixed(2)}/${row.original.interval}`,
  }),
  columnHelper.accessor('active', {
    header: 'Status',
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? 'success' : 'secondary'}>
        {getValue() ? 'Active' : 'Inactive'}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'channels',
    header: 'Channels',
    cell: ({ row }) =>
      row.original.prices.length > 0 ? (
        row.original.prices.map((p) => (
          <Badge key={p.channel} variant="secondary" className="mr-1">
            {p.channel}
          </Badge>
        ))
      ) : (
        <span className="text-muted">None</span>
      ),
  }),
  columnHelper.accessor('sortOrder', {
    header: 'Order',
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <PlanActions plan={row.original} />,
  }),
];

export function PlansTable() {
  const { search = '' } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { data: plans } = useSuspenseQuery(adminPlansQuery({ search }));

  const table = useReactTable({
    data: plans,
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
              placeholder="Search by plan name..."
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  navigate({ search: { search: value || undefined } });
                }
              }}
            />
          </InputGroup>
          {search && (
            <p className="text-sm text-muted">
              Showing results for "<strong>{search}</strong>".{' '}
              <button
                className="underline cursor-pointer"
                onClick={() => navigate({ search: {} })}
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
                    No plans yet.
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
      </CardBody>
    </Card>
  );
}

function PlanActions({ plan }: { plan: Plan }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleToggle() {
    await togglePlanActive({ data: { planId: plan.id, active: !plan.active } });
    queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
  }

  return (
    <div className="flex justify-end">
      <Menu>
        <MenuTrigger
          render={
            <Button variant="plain" size="xs-icon">
              <EllipsisIcon />
            </Button>
          }
        />
        <MenuPopup size="compact">
          <MenuItem
            onClick={() =>
              navigate({
                to: '/admin/plans/$planId',
                params: { planId: plan.id },
              })
            }
          >
            Edit
          </MenuItem>
          <MenuItem onClick={handleToggle}>
            {plan.active ? 'Deactivate' : 'Activate'}
          </MenuItem>
        </MenuPopup>
      </Menu>
    </div>
  );
}
