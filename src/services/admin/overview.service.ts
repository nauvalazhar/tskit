import { eq, or, count, sql, desc } from 'drizzle-orm';
import { db } from '@/database';
import { users } from '@/database/schemas/auth';
import { plans, subscriptions } from '@/database/schemas/billing';

export async function getOverviewStats() {
  const [[{ totalUsers }], [{ activeSubscriptions }], [{ mrr }], [{ recentSignups }]] =
    await Promise.all([
      db.select({ totalUsers: count() }).from(users),
      db
        .select({ activeSubscriptions: count() })
        .from(subscriptions)
        .where(
          or(eq(subscriptions.status, 'active'), eq(subscriptions.status, 'trialing')),
        ),
      db
        .select({
          mrr: sql<number>`coalesce(sum(${plans.price}), 0)`.as('mrr'),
        })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .where(
          or(eq(subscriptions.status, 'active'), eq(subscriptions.status, 'trialing')),
        ),
      db
        .select({ recentSignups: count() })
        .from(users)
        .where(sql`${users.createdAt} > now() - interval '30 days'`),
    ]);

  const [recentUsers, recentSubscriptions] = await Promise.all([
    db.query.users.findMany({
      orderBy: desc(users.createdAt),
      limit: 5,
    }),
    db.query.subscriptions.findMany({
      orderBy: desc(subscriptions.createdAt),
      limit: 5,
      with: { user: true, plan: true },
    }),
  ]);

  return {
    totalUsers,
    activeSubscriptions,
    mrr: Number(mrr),
    recentSignups,
    recentUsers,
    recentSubscriptions,
  };
}
