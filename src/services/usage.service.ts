import { eq, and } from 'drizzle-orm';
import { db } from '@/database';
import { usage } from '@/database/schemas/billing';

export interface Period {
  start: Date;
  end: Date;
}

export async function getUsageCount(
  organizationId: string,
  featureKey: string,
  period: Period,
): Promise<number> {
  const record = await db.query.usage.findFirst({
    where: and(eq(usage.organizationId, organizationId), eq(usage.featureKey, featureKey)),
  });

  if (!record) return 0;

  // Lazy period reset: if the period has expired, reset usage
  if (record.periodEnd < new Date()) {
    await db
      .update(usage)
      .set({
        used: 0,
        periodStart: period.start,
        periodEnd: period.end,
      })
      .where(eq(usage.id, record.id));

    return 0;
  }

  return record.used;
}

export async function incrementUsage(
  organizationId: string,
  featureKey: string,
  period: Period,
  amount = 1,
): Promise<void> {
  const record = await db.query.usage.findFirst({
    where: and(eq(usage.organizationId, organizationId), eq(usage.featureKey, featureKey)),
  });

  if (!record) {
    await db.insert(usage).values({
      organizationId,
      featureKey,
      used: amount,
      periodStart: period.start,
      periodEnd: period.end,
    });
    return;
  }

  // Reset if period expired, then add amount
  const newUsed = record.periodEnd < new Date() ? amount : record.used + amount;

  await db
    .update(usage)
    .set({
      used: newUsed,
      periodStart: record.periodEnd < new Date() ? period.start : record.periodStart,
      periodEnd: record.periodEnd < new Date() ? period.end : record.periodEnd,
    })
    .where(eq(usage.id, record.id));
}

export async function decrementUsage(
  organizationId: string,
  featureKey: string,
  amount = 1,
): Promise<void> {
  const record = await db.query.usage.findFirst({
    where: and(eq(usage.organizationId, organizationId), eq(usage.featureKey, featureKey)),
  });

  if (!record) return;

  await db
    .update(usage)
    .set({ used: Math.max(0, record.used - amount) })
    .where(eq(usage.id, record.id));
}

export async function resetUsage(organizationId: string, featureKey: string): Promise<void> {
  await db
    .update(usage)
    .set({ used: 0 })
    .where(and(eq(usage.organizationId, organizationId), eq(usage.featureKey, featureKey)));
}
