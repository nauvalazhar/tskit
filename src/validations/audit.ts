import { z } from 'zod';

export const auditQuerySchema = z.object({
  actorId: z.uuid().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  cursor: z.uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const auditSearchSchema = z.object({
  action: z.string().optional(),
  cursor: z.string().optional(),
});
