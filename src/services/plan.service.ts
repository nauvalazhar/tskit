import { eq, asc } from 'drizzle-orm';
import { db } from '@/database';
import { plans } from '@/database/schemas/billing';

export async function listPlans() {
  return db
    .select()
    .from(plans)
    .where(eq(plans.active, true))
    .orderBy(asc(plans.sortOrder));
}

export async function getPlanById(id: string) {
  return db.query.plans.findFirst({
    where: eq(plans.id, id),
  });
}

export async function getPlanByExternalPriceId(priceId: string) {
  return db.query.plans.findFirst({
    where: eq(plans.externalPriceId, priceId),
  });
}

export async function upsertPlan(data: {
  channel: string;
  externalProductId: string;
  externalPriceId: string;
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
      channel: data.channel,
      externalProductId: data.externalProductId,
      externalPriceId: data.externalPriceId,
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
      target: plans.externalPriceId,
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
