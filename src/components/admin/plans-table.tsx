import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
} from '@/components/selia/menu';
import { getRouteApi, useNavigate, useRouter } from '@tanstack/react-router';
import { togglePlanActive, getAllPlans } from '@/functions/admin/plans';
import { EllipsisIcon } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/selia/card';
import { toastManager } from '@/components/selia/toast';
import { DataTable } from '@/components/shared/data-table';
import { TableSearchInput } from '@/components/shared/table-search-input';

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
  const plans = routeApi.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <TableSearchInput
          placeholder="Search by plan name..."
          value={search}
          onSearch={(v) => navigate({ search: { search: v } })}
          onClear={() => navigate({ search: {} })}
        />
      </CardHeader>
      <CardBody>
        <DataTable data={plans} columns={columns} emptyMessage="No plans yet." />
      </CardBody>
    </Card>
  );
}

function PlanActions({ plan }: { plan: Plan }) {
  const navigate = useNavigate();
  const router = useRouter();

  function handleToggle() {
    toastManager.promise(
      togglePlanActive({
        data: { planId: plan.id, active: !plan.active },
      }).then(() => router.invalidate()),
      {
        loading: {
          title: plan.active ? 'Deactivating plan...' : 'Activating plan...',
          type: 'loading',
        },
        success: {
          title: plan.active ? 'Plan deactivated' : 'Plan activated',
          type: 'success',
        },
        error: (err) => ({
          title:
            err instanceof Error ? err.message : 'Failed to update plan.',
          type: 'error',
        }),
      },
    );
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
