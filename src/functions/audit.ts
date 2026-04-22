import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';
import { query as queryAuditLogs } from '@/services/audit.service';

const defaultRateLimit = createRateLimitMiddleware('default');

export const getUserAuditLogs = createServerFn()
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(
    z.object({
      action: z.string().optional(),
      cursor: z.uuid().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    return queryAuditLogs({ actorId: context.user.id, ...data });
  });
