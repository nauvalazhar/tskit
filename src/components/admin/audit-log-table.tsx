import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/selia/badge';
import { DataTable } from '@/components/shared/data-table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem,
} from '@/components/selia/select';
import { Card, CardHeader, CardBody } from '@/components/selia/card';
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
} from '@/components/selia/tooltip';
import { UserAvatar } from '@/components/shared/user-avatar';
import { getRouteApi } from '@tanstack/react-router';
import {
  getActionLabel,
  getActionDomain,
  DOMAIN_OPTIONS,
} from '@/lib/audit-labels';
import {
  formatRelativeDate,
  formatFullDate,
  parseUserAgent,
} from '@/lib/utils';
import type { getAuditLogs } from '@/functions/admin/audit';
import {
  Pagination,
  PaginationButton,
  PaginationItem,
  PaginationList,
} from '@/components/selia/pagination';

const routeApi = getRouteApi('/admin/audit');

type AuditLog = Awaited<ReturnType<typeof getAuditLogs>>['items'][number];

const DOMAIN_BADGE_VARIANTS: Record<
  string,
  'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'danger'
> = {
  admin: 'danger',
  billing: 'warning',
  settings: 'info',
  storage: 'secondary',
  user: 'success',
};

const columnHelper = createColumnHelper<AuditLog>();

const columns = [
  columnHelper.accessor('createdAt', {
    header: 'Time',
    cell: ({ getValue }) => {
      const date = getValue();
      return (
        <Tooltip>
          <TooltipTrigger className="cursor-default underline decoration-dotted underline-offset-2 text-muted whitespace-nowrap">
            {formatRelativeDate(date)}
          </TooltipTrigger>
          <TooltipPopup>{formatFullDate(date)}</TooltipPopup>
        </Tooltip>
      );
    },
  }),
  columnHelper.display({
    id: 'actor',
    header: 'User',
    cell: ({ row }) => {
      const actor = row.original.actor;
      if (!actor) return <span className="text-muted">System</span>;
      return (
        <div className="flex items-center gap-2">
          <UserAvatar name={actor.name} image={actor.image || ''} size="sm" />
          <div className="min-w-0">
            <p className="font-medium truncate">{actor.name}</p>
            <p className="text-muted truncate text-sm">{actor.email}</p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor('action', {
    header: 'Action',
    cell: ({ getValue }) => {
      const action = getValue();
      const domain = getActionDomain(action);
      return (
        <div className="flex items-center gap-2">
          <Badge variant={DOMAIN_BADGE_VARIANTS[domain] ?? 'secondary'}>
            {domain}
          </Badge>
          <span>{getActionLabel(action)}</span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'target',
    header: 'Target',
    cell: ({ row }) => {
      const { targetType, targetId } = row.original;
      if (!targetType) return <span className="text-muted">-</span>;
      return (
        <span className="text-sm">
          {targetType}
          {targetId && (
            <span className="text-muted ml-1 font-mono text-xs">
              {targetId.length > 12 ? `${targetId.slice(0, 12)}...` : targetId}
            </span>
          )}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'device',
    header: 'Device',
    cell: ({ row }) => {
      const { ipAddress, userAgent } = row.original;
      const { browser, os } = parseUserAgent(userAgent);
      return (
        <div className="min-w-0">
          <p className="text-sm truncate">
            {browser} on {os}
          </p>
          {ipAddress && (
            <p className="text-muted text-xs font-mono truncate">{ipAddress}</p>
          )}
        </div>
      );
    },
  }),
];

export function AuditLogTable() {
  const { action, cursor } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { items, nextCursor } = routeApi.useLoaderData();
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  function handleNextPage() {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, cursor ?? '']);
    navigate({ search: (prev) => ({ ...prev, cursor: nextCursor }) });
  }

  function handlePrevPage() {
    if (cursorStack.length === 0) {
      navigate({ search: (p) => ({ ...p, cursor: undefined }) });
      return;
    }
    const prev = cursorStack[cursorStack.length - 1];
    setCursorStack((s) => s.slice(0, -1));
    navigate({
      search: (p) => ({
        ...p,
        cursor: prev || undefined,
      }),
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-full sm:w-48">
              <Select
                value={
                  DOMAIN_OPTIONS.find((o) => o.value === action) ??
                  DOMAIN_OPTIONS[0]
                }
                onValueChange={(v) => {
                  const option = v as (typeof DOMAIN_OPTIONS)[number];
                  setCursorStack([]);
                  navigate({
                    search: {
                      action: option.value || undefined,
                      cursor: undefined,
                    },
                  });
                }}
                items={DOMAIN_OPTIONS}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    {DOMAIN_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            data={items}
            columns={columns}
            emptyMessage="No audit logs found."
          />
        </CardBody>
      </Card>

      {(cursor || cursorStack.length > 0 || nextCursor) && (
        <div className="flex items-center justify-center mt-4 gap-2.5">
          <Pagination>
            <PaginationList>
              <PaginationItem>
                <PaginationButton
                  disabled={!cursor}
                  onClick={handlePrevPage}
                >
                  Previous
                </PaginationButton>
              </PaginationItem>
              <PaginationItem>
                <PaginationButton
                  disabled={!nextCursor}
                  onClick={handleNextPage}
                >
                  Next
                </PaginationButton>
              </PaginationItem>
            </PaginationList>
          </Pagination>
        </div>
      )}
    </>
  );
}
