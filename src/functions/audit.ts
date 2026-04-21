import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth';
import { query as queryAuditLogs } from '@/services/audit.service';

export const getUserAuditLogs = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      cursor: z.uuid().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    return queryAuditLogs({ actorId: context.user.id, ...data });
  });
