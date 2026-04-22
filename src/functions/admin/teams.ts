import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { eq, count, and, ne } from 'drizzle-orm';
import { adminMiddleware } from '@/middleware/admin';
import { listTeamsAdmin, getTeamAdmin } from '@/services/admin/teams.service';
import { db } from '@/database';
import { organizations, members } from '@/database/schemas/auth';
import { audit } from '@/lib/audit';

const teamsSearchSchema = z.object({
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(100).optional(),
  search: z.string().optional(),
});

export const getTeamsAdmin = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(teamsSearchSchema)
  .handler(async ({ data }) => {
    return listTeamsAdmin(data);
  });

export const getTeam = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(z.object({ teamId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return getTeamAdmin(data.teamId);
  });

export const adminDeleteTeam = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ teamId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    // Get all members of this team
    const teamMembers = await db.query.members.findMany({
      where: eq(members.organizationId, data.teamId),
    });

    // Check if any member would be left with zero teams
    for (const member of teamMembers) {
      const [{ otherTeams }] = await db
        .select({ otherTeams: count() })
        .from(members)
        .where(
          and(
            eq(members.userId, member.userId),
            ne(members.organizationId, data.teamId),
          ),
        );

      if (otherTeams === 0) {
        throw new Error(
          'Cannot delete this team — some members have no other team. Remove them first or add them to another team.',
        );
      }
    }

    await db.delete(organizations).where(eq(organizations.id, data.teamId));

    await audit.log({
      actorId: context.user.id,
      action: 'admin.team.deleted',
      targetType: 'organization',
      targetId: data.teamId,
    });
  });
