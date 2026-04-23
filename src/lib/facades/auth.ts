import { betterAuth } from 'better-auth';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { admin } from 'better-auth/plugins/admin';
import { organization } from 'better-auth/plugins/organization';
import { eq, asc, and, count } from 'drizzle-orm';
import { db } from '@/database';
import { users, members, organizations } from '@/database/schemas/auth';
import { userSettings } from '@/database/schemas/settings';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { mailer } from '@/lib/facades/mailer';
import { storage } from '@/lib/facades/storage';
import { customSession } from 'better-auth/plugins';
import { subscriptions } from '@/database/schemas/billing';

const appUrl = process.env.VITE_APP_URL || 'http://localhost:3000';

const options = {
  baseURL: appUrl,
  trustedOrigins: [appUrl],
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  databaseHooks: {
    account: {
      update: {
        after: async (account) => {
          if (!('password' in account) || !account.password) return;

          const user = await db.query.users.findFirst({
            where: eq(users.id, account.userId as string),
          });

          if (!user) return;

          await mailer.send('password-changed', user.email, {
            name: user.name,
          });
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          if (session.activeOrganizationId) return { data: session };

          const userId = session.userId as string;
          const memberships = await db.query.members.findMany({
            where: eq(members.userId, userId),
            orderBy: asc(members.createdAt),
          });

          if (memberships.length === 0) return { data: session };

          let orgId = memberships[0].organizationId;

          // If multiple orgs, check last used preference
          if (memberships.length > 1) {
            const pref = await db.query.userSettings.findFirst({
              where: and(
                eq(userSettings.userId, userId),
                eq(userSettings.key, 'lastActiveOrganizationId'),
              ),
            });

            if (pref && memberships.some((m) => m.organizationId === pref.value)) {
              orgId = pref.value;
            }
          }

          return {
            data: { ...session, activeOrganizationId: orgId },
          };
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          // Auto-create a personal team for every new user.
          // We use auth.api after auth is initialized (lazy reference via exported `auth`).
          const { createPersonalTeam } = await import('@/services/team.service');
          await createPersonalTeam(user.id, user.name);
        },
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await mailer.send('verify-email', user.email, {
        url,
        name: user.name,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await mailer.send('reset-password', user.email, {
        url,
        name: user.name,
      });
    },
    onPasswordReset: async ({ user }) => {
      await mailer.send('password-changed', user.email, {
        name: user.name,
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        // Delete any orgs where this user is the sole member
        const userMembers = await db.query.members.findMany({
          where: eq(members.userId, user.id),
        });

        for (const membership of userMembers) {
          const [{ memberCount }] = await db
            .select({ memberCount: count() })
            .from(members)
            .where(eq(members.organizationId, membership.organizationId));

          if (memberCount === 1) {
            await db
              .delete(organizations)
              .where(eq(organizations.id, membership.organizationId));
          }
        }
      },
      afterDelete: async (user) => {
        if (user.image) {
          await storage.removeByUrl(user.image);
        }
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    tanstackStartCookies(),
    twoFactor(),
    admin(),
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      creatorRole: 'owner',
      invitationExpiresIn: 60 * 60 * 48, // 48 hours
      sendInvitationEmail: async ({ invitation, organization, inviter }) => {
        console.log('[sendInvitationEmail] sending to:', invitation.email, 'org:', organization.name);
        try {
          await mailer.send('team-invitation', invitation.email, {
            teamName: organization.name,
            inviterName: inviter.user.name,
            inviterEmail: inviter.user.email,
            acceptUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/invite/${invitation.id}`,
          });
          console.log('[sendInvitationEmail] sent successfully');
        } catch (err) {
          console.error('[sendInvitationEmail] failed:', err);
        }
      },
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const orgId = session.activeOrganizationId;
      const subscription = orgId
        ? await db.query.subscriptions.findFirst({
            where: eq(subscriptions.organizationId, orgId),
            with: { plan: true },
          })
        : undefined;

      return {
        session: {
          ...session,
          activeOrganizationId: orgId ?? null,
        },
        user: {
          ...user,
          subscription,
        },
      };
    }, options),
  ],
});
