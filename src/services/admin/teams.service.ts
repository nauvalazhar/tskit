import { eq, ilike, or, count, desc, inArray } from 'drizzle-orm';
import { db } from '@/database';
import { organizations } from '@/database/schemas/auth';
import { subscriptions } from '@/database/schemas/billing';

export async function listTeamsAdmin({
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
        ilike(organizations.name, `%${search}%`),
        ilike(organizations.slug, `%${search}%`),
      )
    : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.query.organizations.findMany({
      where,
      orderBy: desc(organizations.createdAt),
      limit: perPage,
      offset,
      with: {
        members: {
          with: { users: { columns: { id: true, name: true, email: true, image: true } } },
        },
      },
    }),
    db.select({ total: count() }).from(organizations).where(where),
  ]);

  // Fetch subscriptions for these orgs in one query
  const orgIds = items.map((o) => o.id);
  const orgSubscriptions = orgIds.length > 0
    ? await db.query.subscriptions.findMany({
        where: inArray(subscriptions.organizationId, orgIds),
        with: { plan: true },
      })
    : [];

  const subsByOrg = new Map<string, typeof orgSubscriptions>();
  for (const sub of orgSubscriptions) {
    const list = subsByOrg.get(sub.organizationId) ?? [];
    list.push(sub);
    subsByOrg.set(sub.organizationId, list);
  }

  const teams = items.map((org) => ({
    ...org,
    subscription: subsByOrg.get(org.id)?.[0] ?? null,
  }));

  return {
    teams,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getTeamAdmin(teamId: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, teamId),
    with: {
      members: {
        with: { users: { columns: { id: true, name: true, email: true, image: true } } },
      },
      invitations: true,
    },
  });

  if (!org) return null;

  const teamSubscriptions = await db.query.subscriptions.findMany({
    where: eq(subscriptions.organizationId, teamId),
    with: { plan: true, user: { columns: { id: true, name: true, email: true } } },
  });

  return {
    ...org,
    subscriptions: teamSubscriptions,
  };
}
