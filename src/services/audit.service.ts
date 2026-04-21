import { eq, and, gte, lte, desc, lt, like } from 'drizzle-orm';
import { db } from '@/database';
import { auditLogs } from '@/database/schemas/audit';

export interface AuditLogEntry {
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, string | number | boolean | null> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditQueryFilters {
  actorId?: string;
  action?: string;
  targetType?: string;
  from?: Date;
  to?: Date;
  cursor?: string;
  limit?: number;
}

export async function log(entry: AuditLogEntry): Promise<void> {
  await db.insert(auditLogs).values(entry);
}

export async function query(filters: AuditQueryFilters) {
  const limit = filters.limit ?? 50;
  const conditions = [];

  if (filters.actorId) {
    conditions.push(eq(auditLogs.actorId, filters.actorId));
  }
  if (filters.action) {
    conditions.push(like(auditLogs.action, `${filters.action}.%`));
  }
  if (filters.targetType) {
    conditions.push(eq(auditLogs.targetType, filters.targetType));
  }
  if (filters.from) {
    conditions.push(gte(auditLogs.createdAt, filters.from));
  }
  if (filters.to) {
    conditions.push(lte(auditLogs.createdAt, filters.to));
  }
  if (filters.cursor) {
    conditions.push(lt(auditLogs.id, filters.cursor));
  }

  const rows = await db.query.auditLogs.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { actor: { columns: { id: true, name: true, email: true, image: true } } },
    orderBy: [desc(auditLogs.createdAt)],
    limit: limit + 1,
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}
