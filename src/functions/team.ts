import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/database';
import { users, members } from '@/database/schemas/auth';
import { userSettings } from '@/database/schemas/settings';
import { authMiddleware } from '@/middleware/auth';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';
import { audit } from '@/lib/audit';
import {
  createTeamSchema,
  updateTeamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  revokeInvitationSchema,
  setActiveTeamSchema,
  deleteTeamSchema,
} from '@/validations/team';

const defaultRateLimit = createRateLimitMiddleware('default');

export const getTeams = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    const headers = await getRequestHeaders();
    return auth.api.listOrganizations({ headers });
  });

export const getActiveOrganization = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    const headers = await getRequestHeaders();
    const org = await auth.api.getFullOrganization({ headers });
    return org ?? null;
  });

export const getActiveMemberRole = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    const headers = await getRequestHeaders();
    const member = await auth.api.getActiveMember({ headers });
    return member?.role ?? null;
  });

export const createTeam = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(createTeamSchema)
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    const org = await auth.api.createOrganization({
      body: { name: data.name, slug: data.slug },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.created',
      targetType: 'organization',
      targetId: org.id,
      metadata: { name: data.name, slug: data.slug },
    });

    return org;
  });

export const updateTeam = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(updateTeamSchema)
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    const org = await auth.api.updateOrganization({
      body: { data },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.updated',
      targetType: 'organization',
      targetId: org?.id,
      metadata: { ...data },
    });

    return org;
  });

export const deleteTeam = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(deleteTeamSchema)
  .handler(async ({ data, context }) => {
    // Ensure user has at least one other team
    const memberships = await db.query.members.findMany({
      where: eq(members.userId, context.user.id),
    });
    if (memberships.length <= 1) {
      throw new Error('You cannot delete your only team');
    }

    const headers = await getRequestHeaders();
    const org = await auth.api.deleteOrganization({
      body: { organizationId: data.organizationId },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.deleted',
      targetType: 'organization',
      targetId: data.organizationId,
    });

    return org;
  });

export const setActiveTeam = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(setActiveTeamSchema)
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    const result = await auth.api.setActiveOrganization({
      body: { organizationId: data.organizationId },
      headers,
    });

    // Persist last used org for next login
    await db
      .insert(userSettings)
      .values({
        userId: context.user.id,
        key: 'lastActiveOrganizationId',
        value: data.organizationId,
      })
      .onConflictDoUpdate({
        target: [userSettings.userId, userSettings.key],
        set: { value: data.organizationId },
      });

    return result;
  });

export const inviteMember = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(inviteMemberSchema)
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    const invitation = await auth.api.createInvitation({
      body: { email: data.email, role: data.role },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.member.invited',
      targetType: 'invitation',
      targetId: invitation.id,
      metadata: { email: data.email, role: data.role },
    });

    return invitation;
  });

export const revokeInvitation = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(revokeInvitationSchema)
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    await auth.api.cancelInvitation({
      body: { invitationId: data.invitationId },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.invitation.revoked',
      targetType: 'invitation',
      targetId: data.invitationId,
    });
  });

export const removeMember = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(removeMemberSchema)
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    const member = await auth.api.removeMember({
      body: { memberIdOrEmail: data.memberIdOrEmail },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.member.removed',
      targetType: 'member',
      targetId: data.memberIdOrEmail,
    });

    return member;
  });

export const updateMemberRole = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(updateMemberRoleSchema)
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    await auth.api.updateMemberRole({
      body: { memberId: data.memberId, role: data.role },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.member.role_changed',
      targetType: 'member',
      targetId: data.memberId,
      metadata: { role: data.role },
    });
  });

export const getTeamMembers = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(
    z.object({ organizationId: z.string().optional() }).optional(),
  )
  .handler(async ({ data }) => {
    const headers = await getRequestHeaders();
    const result = await auth.api.listMembers({
      headers,
      query: { organizationId: data?.organizationId },
    });
    return result.members;
  });

export const getTeamInvitations = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(
    z.object({ organizationId: z.string().optional() }).optional(),
  )
  .handler(async ({ data }) => {
    const headers = await getRequestHeaders();
    return auth.api.listInvitations({
      headers,
      query: { organizationId: data?.organizationId },
    });
  });

export const acceptInvitation = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ invitationId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    const member = await auth.api.acceptInvitation({
      body: { invitationId: data.invitationId },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.invitation.accepted',
      targetType: 'invitation',
      targetId: data.invitationId,
    });

    return member;
  });

export const rejectInvitation = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ invitationId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    await auth.api.rejectInvitation({
      body: { invitationId: data.invitationId },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.invitation.rejected',
      targetType: 'invitation',
      targetId: data.invitationId,
    });
  });

export const getInvitation = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(z.object({ invitationId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const headers = await getRequestHeaders();
    const invitation = await auth.api.getInvitation({
      query: { id: data.invitationId },
      headers,
    });
    if (!invitation) return null;

    // Fetch inviter details (name, image) since getInvitation only returns inviterId/email
    const inviter = await db.query.users.findFirst({
      where: eq(users.id, invitation.inviterId),
      columns: { id: true, name: true, email: true, image: true },
    });

    return {
      ...invitation,
      inviterName: inviter?.name ?? null,
      inviterImage: inviter?.image ?? null,
    };
  });

export const leaveTeam = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ organizationId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    // Ensure user has at least one other team
    const memberships = await db.query.members.findMany({
      where: eq(members.userId, context.user.id),
    });
    if (memberships.length <= 1) {
      throw new Error('You cannot leave your only team');
    }

    // Switch to another team before leaving
    const otherTeam = memberships.find(
      (m) => m.organizationId !== data.organizationId,
    );

    const headers = await getRequestHeaders();

    if (otherTeam) {
      await auth.api.setActiveOrganization({
        body: { organizationId: otherTeam.organizationId },
        headers,
      });

      await db
        .insert(userSettings)
        .values({
          userId: context.user.id,
          key: 'lastActiveOrganizationId',
          value: otherTeam.organizationId,
        })
        .onConflictDoUpdate({
          target: [userSettings.userId, userSettings.key],
          set: { value: otherTeam.organizationId },
        });
    }

    await auth.api.leaveOrganization({
      body: { organizationId: data.organizationId },
      headers,
    });

    await audit.log({
      actorId: context.user.id,
      action: 'team.member.left',
      targetType: 'organization',
      targetId: data.organizationId,
    });
  });

export const checkSlug = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    return auth.api.checkOrganizationSlug({
      body: { slug: data.slug },
    });
  });
