import { createServerFn } from '@tanstack/react-start';
import { adminMiddleware } from '@/middleware/admin';
import { auditQuerySchema } from '@/validations/audit';
import { query as queryAuditLogs } from '@/services/audit.service';

export const getAuditLogs = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(auditQuerySchema)
  .handler(async ({ data }) => {
    return queryAuditLogs(data);
  });
