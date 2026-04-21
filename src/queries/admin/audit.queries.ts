import { queryOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import { getAuditLogs } from '@/functions/admin/audit';
import type { auditQuerySchema } from '@/validations/audit';

export function adminAuditLogsQuery(
  params: z.infer<typeof auditQuerySchema> = {},
) {
  return queryOptions({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => getAuditLogs({ data: params }),
  });
}
