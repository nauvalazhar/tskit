import { useState } from 'react';
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
import {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationButton,
} from '@/components/selia/pagination';
import { Badge } from '@/components/selia/badge';
import { Card, CardHeader, CardBody } from '@/components/selia/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem,
} from '@/components/selia/select';
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
} from '@/components/selia/tooltip';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { userAuditLogsQuery } from '@/queries/audit.queries';
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
import type { getUserAuditLogs } from '@/functions/audit';

const routeApi = getRouteApi('/_app/settings/activity');

type AuditLog = Awaited<ReturnType<typeof getUserAuditLogs>>['items'][number];

const DOMAIN_BADGE_VARIANTS: Record<
  string,
  'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'danger'
> = {
  admin: 'danger',
  billing: 'warning',
  settings: 'info',
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

export function ActivityLog() {
  const { action, cursor } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const { data } = useSuspenseQuery(userAuditLogsQuery({ action, cursor }));
  const { items, nextCursor } = data;
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
                      No activity yet.
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

      {(cursor || cursorStack.length > 0 || nextCursor) && (
        <Pagination>
          <PaginationList>
            <PaginationItem>
              <PaginationButton disabled={!cursor} onClick={handlePrevPage}>
                Previous
              </PaginationButton>
            </PaginationItem>
            <PaginationItem>
              <PaginationButton disabled={!nextCursor} onClick={handleNextPage}>
                Next
              </PaginationButton>
            </PaginationItem>
          </PaginationList>
        </Pagination>
      )}
    </>
  );
}
