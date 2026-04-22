import { queryOptions } from '@tanstack/react-query';
import { getUserAuditLogs } from '@/functions/audit';

export function userAuditLogsQuery(params: { action?: string; cursor?: string; limit?: number } = {}) {
  return queryOptions({
    queryKey: ['audit-logs', params],
    queryFn: () => getUserAuditLogs({ data: params }),
  });
}
