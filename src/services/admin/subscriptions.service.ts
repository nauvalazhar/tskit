import { eq, count, sql, desc, and } from 'drizzle-orm';
import { db } from '@/database';
import { subscriptions } from '@/database/schemas/billing';

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
      sql`(
        ${subscriptions.organizationId} in (
          select "organizations"."id" from "organizations"
          where "organizations"."name" ilike ${pattern}
        )
        or ${subscriptions.userId} in (
          select "users"."id" from "users"
          where "users"."name" ilike ${pattern} or "users"."email" ilike ${pattern}
        )
      )`,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.query.subscriptions.findMany({
      where,
      orderBy: desc(subscriptions.createdAt),
      limit: perPage,
      offset,
      with: { user: true, plan: true, organization: true },
    }),
    db.select({ total: count() }).from(subscriptions).where(where),
  ]);

  return {
    subscriptions: items,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}
