import { eq, ilike, asc } from 'drizzle-orm';
import { db } from '@/database';
import { plans, planPrices } from '@/database/schemas/billing';

export async function listAllPlans({ search }: { search?: string } = {}) {
  const where = search ? ilike(plans.name, `%${search}%`) : undefined;

  return db.query.plans.findMany({
    where,
    orderBy: asc(plans.sortOrder),
    with: { prices: true },
  });
}

export async function deletePlanPrice(priceId: string) {
  await db.delete(planPrices).where(eq(planPrices.id, priceId));
}
