import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, index, jsonb } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    targetType: text('target_type'),
    targetId: text('target_id'),
    metadata: jsonb('metadata').$type<Record<string, string | number | boolean | null>>(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('audit_logs_actorId_idx').on(table.actorId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_createdAt_idx').on(table.createdAt),
  ],
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));
