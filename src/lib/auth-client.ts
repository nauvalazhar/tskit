import { createAuthClient } from 'better-auth/react';
import {
  adminClient,
  customSessionClient,
  twoFactorClient,
} from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = '/verify-2fa';
      },
    }),
    adminClient(),
    customSessionClient<typeof auth>(),
  ],
});
