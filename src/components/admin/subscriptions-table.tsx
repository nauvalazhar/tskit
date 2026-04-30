import { useMemo, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import { DataPagination } from '@/components/shared/data-pagination';
import { DataTable } from '@/components/shared/data-table';
import { TableSearchInput } from '@/components/shared/table-search-input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem,
} from '@/components/selia/select';
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from '@/components/selia/alert-dialog';
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
} from '@/components/selia/menu';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import {
  adminCancelSubscription,
  getSubscriptions,
} from '@/functions/admin/subscriptions';
import { ChangePlanDialog } from './change-plan-dialog';
import { SUBSCRIPTION_STATUSES } from '@/lib/constants';
import { getSubscriptionStatus } from '@/lib/utils';
import type { SubscriptionStatus } from '@/validations/admin';
import { EllipsisIcon } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/selia/card';

const routeApi = getRouteApi('/admin/subscriptions');

type Subscription = Awaited<
  ReturnType<typeof getSubscriptions>
>['subscriptions'][number];

const statuses = [
  { label: 'All Statuses', value: '' },
  ...Object.entries(SUBSCRIPTION_STATUSES).map(([value, { label }]) => ({
    label,
    value,
  })),
];

const columnHelper = createColumnHelper<Subscription>();

const baseColumns = [
  columnHelper.display({
    id: 'team',
    header: 'Team',
    cell: ({ row }) => {
      const org = row.original.organization;
      return (
        <div className="min-w-0">
          <p className="font-medium truncate">{org?.name ?? '—'}</p>
          <p className="text-muted truncate">{org?.slug}</p>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'plan',
    header: 'Plan',
    cell: ({ row }) => row.original.plan.name,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getSubscriptionStatus(getValue());
      return (
        <Badge variant={status?.variant ?? 'secondary'}>
          {status?.label ?? getValue()}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('channel', {
    header: 'Channel',
    cell: ({ getValue }) => <Badge variant="secondary">{getValue()}</Badge>,
  }),
  columnHelper.display({
    id: 'period',
    header: 'Period',
    cell: ({ row }) => {
      const start = row.original.currentPeriodStart;
      const end = row.original.currentPeriodEnd;
      if (!start || !end) return <span className="text-muted">—</span>;
      return (
        <span>
          {new Date(start).toLocaleDateString()} –{' '}
          {new Date(end).toLocaleDateString()}
        </span>
      );
    },
  }),
  columnHelper.accessor('cancelAtPeriodEnd', {
    header: 'Cancel at end',
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="warning">Yes</Badge>
      ) : (
        <span className="text-muted">No</span>
      ),
  }),
];

export function SubscriptionsTable() {
  const { page = 1, search = '', status } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { subscriptions, totalPages } = routeApi.useLoaderData();
  const router = useRouter();
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [changePlanTarget, setChangePlanTarget] = useState<Subscription | null>(
    null,
  );

  const columns = useMemo(
    () => [
      ...baseColumns,
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <SubscriptionActionsMenu
            subscription={row.original}
            onCancel={setCancelTarget}
            onChangePlan={setChangePlanTarget}
          />
        ),
      }),
    ],
    [],
  );

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await adminCancelSubscription({
        data: {
          externalId: cancelTarget.externalId,
          channel: cancelTarget.channel,
        },
      });
      await router.invalidate();
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <TableSearchInput
          placeholder="Search by team name, user name or email..."
          value={search}
          onSearch={(v) =>
            navigate({ search: { page: 1, search: v, status } })
          }
          onClear={() => navigate({ search: { page: 1, status } })}
          extraFilters={
            <div className="w-full sm:w-48">
              <Select
                value={statuses.find((s) => s.value === status) ?? statuses[0]}
                onValueChange={(v) => {
                  const option = v as (typeof statuses)[number];
                  navigate({
                    search: {
                      page: 1,
                      search: search || undefined,
                      status:
                        option.value !== ''
                          ? (option.value as SubscriptionStatus)
                          : undefined,
                    },
                  });
                }}
                items={statuses}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>
          }
        />
      </CardHeader>
      <CardBody>
        <DataTable
          data={subscriptions}
          columns={columns}
          emptyMessage="No subscriptions found."
        />

        <DataPagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) =>
            navigate({
              search: { page: p, search: search || undefined, status },
            })
          }
        />

        <AlertDialog
          open={!!cancelTarget}
          onOpenChange={(open) => !open && setCancelTarget(null)}
        >
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogBody>
              <AlertDialogDescription>
                Are you sure you want to cancel this subscription? The team will
                retain access until the end of their billing period.
              </AlertDialogDescription>
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogClose>Close</AlertDialogClose>
              <Button variant="danger" onClick={handleCancel} progress={cancelling}>
                Cancel Subscription
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>

        <ChangePlanDialog
          open={!!changePlanTarget}
          onOpenChange={(open) => !open && setChangePlanTarget(null)}
          externalId={changePlanTarget?.externalId ?? ''}
          channel={changePlanTarget?.channel ?? 'stripe'}
          currentPlanId={changePlanTarget?.planId ?? ''}
        />
      </CardBody>
    </Card>
  );
}

function SubscriptionActionsMenu({
  subscription,
  onCancel,
  onChangePlan,
}: {
  subscription: Subscription;
  onCancel: (subscription: Subscription) => void;
  onChangePlan: (subscription: Subscription) => void;
}) {
  const canCancel =
    subscription.status === 'active' || subscription.status === 'trialing';

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
          {canCancel && (
            <MenuItem onClick={() => onChangePlan(subscription)}>
              Change Plan
            </MenuItem>
          )}
          {canCancel && (
            <MenuItem
              onClick={() => onCancel(subscription)}
              className="text-danger"
            >
              Cancel
            </MenuItem>
          )}
          {!canCancel && <MenuItem disabled>No actions available</MenuItem>}
        </MenuPopup>
      </Menu>
    </div>
  );
}
