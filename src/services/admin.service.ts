import { eq, ilike, or, count, sql, desc, asc, and } from 'drizzle-orm';
import { db } from '@/database';
import { users, sessions, accounts } from '@/database/schemas/auth';
import { plans, planPrices, subscriptions } from '@/database/schemas/billing';

export async function listUsersAdmin({
  page = 1,
  perPage = 20,
  search,
}: {
  page?: number;
  perPage?: number;
  search?: string;
}) {
  const offset = (page - 1) * perPage;

  const where = search
    ? or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
      )
    : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.query.users.findMany({
      where,
      orderBy: desc(users.createdAt),
      limit: perPage,
      offset,
    }),
    db.select({ total: count() }).from(users).where(where),
  ]);

  return {
    users: items,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getUserAdmin(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return null;

  const [subscription, userAccounts, [{ sessionCount }]] = await Promise.all([
    db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
      with: { plan: true },
    }),
    db.query.accounts.findMany({
      where: eq(accounts.userId, userId),
    }),
    db
      .select({ sessionCount: count() })
      .from(sessions)
      .where(eq(sessions.userId, userId)),
  ]);

  return {
    ...user,
    subscription: subscription ?? null,
    accounts: userAccounts,
    sessionCount,
  };
}

export async function listSubscriptionsAdmin({
  page = 1,
  perPage = 20,
  status,
  search,
}: {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
}) {
  const offset = (page - 1) * perPage;

  const conditions = [];
  if (status) conditions.push(eq(subscriptions.status, status));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`${subscriptions.userId} in (select "users"."id" from "users" where "users"."name" ilike ${pattern} or "users"."email" ilike ${pattern})`,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.query.subscriptions.findMany({
      where,
      orderBy: desc(subscriptions.createdAt),
      limit: perPage,
      offset,
      with: { user: true, plan: true },
    }),
    db.select({ total: count() }).from(subscriptions).where(where),
  ]);

  return {
    subscriptions: items,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

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
