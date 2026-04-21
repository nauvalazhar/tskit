import { betterAuth } from 'better-auth';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { admin } from 'better-auth/plugins/admin';
import { eq } from 'drizzle-orm';
import { db } from '@/database';
import { users } from '@/database/schemas/auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { mailer } from '@/lib/mailer';
import { storage } from '@/lib/storage';
import { customSession } from 'better-auth/plugins';
import { subscriptions } from '@/database/schemas/billing';

const options = {
  baseURL: process.env.VITE_APP_URL || 'http://localhost:3000',
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
      beforeDelete: async (user, request) => {
        // Add pre-deletion logic here.
        // Throw APIError to prevent deletion.
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
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, user.id),
        with: { plan: true },
      });

      return {
        session,
        user: {
          ...user,
          subscription,
        },
      };
    }, options),
  ],
});
