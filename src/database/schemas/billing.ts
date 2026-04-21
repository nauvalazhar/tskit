import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users, organizations } from './auth';
import type { PaymentChannel } from '@/config/payment';

export const plans = pgTable('plans', {
  id: uuid('id')
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').default(0).notNull(),
  currency: text('currency').default('usd').notNull(),
  interval: text('interval').notNull(),
  entitlements: jsonb('entitlements')
    .$type<Record<string, boolean | number>>()
    .default({})
    .notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  popular: boolean('popular').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const planPrices = pgTable(
  'plan_prices',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),
    channel: text('channel').$type<PaymentChannel>().notNull(),
    externalProductId: text('external_product_id').notNull(),
    externalPriceId: text('external_price_id').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('plan_prices_planId_idx').on(table.planId),
    uniqueIndex('plan_prices_planId_channel_unq').on(table.planId, table.channel),
  ],
);

export const customers = pgTable(
  'customers',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    channel: text('channel').$type<PaymentChannel>().notNull(),
    externalCustomerId: text('external_customer_id').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('customers_userId_idx').on(table.userId),
    index('customers_organizationId_idx').on(table.organizationId),
    uniqueIndex('customers_orgId_channel_unq').on(table.organizationId, table.channel),
  ],
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'restrict' }),
    channel: text('channel').$type<PaymentChannel>().notNull(),
    externalId: text('external_id').notNull().unique(),
    status: text('status').notNull(),
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
    canceledAt: timestamp('canceled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('subscriptions_userId_idx').on(table.userId),
    index('subscriptions_organizationId_idx').on(table.organizationId),
    index('subscriptions_planId_idx').on(table.planId),
  ],
);

export const usage = pgTable(
  'usage',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    featureKey: text('feature_key').notNull(),
    used: integer('used').default(0).notNull(),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('usage_orgId_featureKey_idx').on(table.organizationId, table.featureKey)],
);

export const usageRelations = relations(usage, ({ one }) => ({
  organization: one(organizations, {
    fields: [usage.organizationId],
    references: [organizations.id],
  }),
}));

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id')
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  externalId: text('external_id').notNull().unique(),
  channel: text('channel').$type<PaymentChannel>().notNull(),
  type: text('type').notNull(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
});

// Relations

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
  prices: many(planPrices),
}));

export const planPricesRelations = relations(planPrices, ({ one }) => ({
  plan: one(plans, {
    fields: [planPrices.planId],
    references: [plans.id],
  }),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));
