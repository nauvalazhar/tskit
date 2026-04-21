import { eq, ilike, or, count, desc } from 'drizzle-orm';
import { db } from '@/database';
import { users, sessions, accounts } from '@/database/schemas/auth';
import { subscriptions } from '@/database/schemas/billing';

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
