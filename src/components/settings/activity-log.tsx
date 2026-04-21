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
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import { Card, CardBody } from '@/components/selia/card';
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
} from '@/components/selia/tooltip';
import { useQuery } from '@tanstack/react-query';
import { userAuditLogsQuery } from '@/queries/audit.queries';
import { getActionLabel, getActionDomain } from '@/lib/audit-labels';
import {
  formatRelativeDate,
  formatFullDate,
  parseUserAgent,
} from '@/lib/utils';
import type { getUserAuditLogs } from '@/functions/audit';

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
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const { data } = useQuery(userAuditLogsQuery({ cursor }));

  const items = data?.items ?? [];
  const nextCursor = data?.nextCursor ?? null;

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleNext() {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, cursor ?? '']);
    setCursor(nextCursor);
  }

  function handlePrev() {
    const prev = cursorStack[cursorStack.length - 1];
    setCursorStack((s) => s.slice(0, -1));
    setCursor(prev || undefined);
  }

  return (
    <Card>
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

        {(cursorStack.length > 0 || nextCursor) && (
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={cursorStack.length === 0}
              onClick={handlePrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!nextCursor}
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
