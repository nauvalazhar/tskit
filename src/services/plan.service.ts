import { eq, asc, and } from 'drizzle-orm';
import { db } from '@/database';
import { plans, planPrices } from '@/database/schemas/billing';

export async function listPlans() {
  return db.query.plans.findMany({
    where: eq(plans.active, true),
    orderBy: asc(plans.sortOrder),
    with: { prices: true },
  });
}

export async function getPlanById(id: string) {
  return db.query.plans.findFirst({
    where: eq(plans.id, id),
  });
}

export async function getPlanByExternalPriceId(priceId: string) {
  const price = await db.query.planPrices.findFirst({
    where: eq(planPrices.externalPriceId, priceId),
    with: { plan: true },
  });
  return price?.plan ?? null;
}

export async function getPlanPrice(planId: string, channel: string) {
  return db.query.planPrices.findFirst({
    where: and(eq(planPrices.planId, planId), eq(planPrices.channel, channel)),
  });
}

export async function upsertPlan(data: {
  slug: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  interval: string;
  entitlements?: Record<string, boolean | number>;
  sortOrder?: number;
  active?: boolean;
}) {
  const [plan] = await db
    .insert(plans)
    .values({
      slug: data.slug,
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency,
      interval: data.interval,
      entitlements: data.entitlements ?? {},
      sortOrder: data.sortOrder ?? 0,
      active: data.active ?? true,
    })
    .onConflictDoUpdate({
      target: plans.slug,
      set: {
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        interval: data.interval,
        entitlements: data.entitlements ?? {},
        sortOrder: data.sortOrder ?? 0,
        active: data.active ?? true,
      },
    })
    .returning();

  return plan;
}

export async function upsertPlanPrice(data: {
  planId: string;
  channel: string;
  externalProductId: string;
  externalPriceId: string;
}) {
  const [price] = await db
    .insert(planPrices)
    .values({
      planId: data.planId,
      channel: data.channel,
      externalProductId: data.externalProductId,
      externalPriceId: data.externalPriceId,
    })
    .onConflictDoUpdate({
      target: [planPrices.planId, planPrices.channel],
      set: {
        externalProductId: data.externalProductId,
        externalPriceId: data.externalPriceId,
      },
    })
    .returning();

  return price;
}
