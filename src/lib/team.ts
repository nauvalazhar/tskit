import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/database';
import { sessions } from '@/database/schemas/auth';

/**
 * Creates a personal team for a newly registered user and sets it as active
 * on any existing sessions. Called from the user.create databaseHook.
 */
export async function createPersonalTeam(userId: string, userName: string) {
  const slug = `personal-${userId.slice(0, 8)}`;
  const name = `${userName}'s Team`;

  const org = await auth.api.createOrganization({
    body: { name, slug, userId },
  });

  // The session may already exist (created before this hook runs),
  // so backfill activeOrganizationId on any sessions that don't have one.
  await db
    .update(sessions)
    .set({ activeOrganizationId: org.id })
    .where(eq(sessions.userId, userId));
}
