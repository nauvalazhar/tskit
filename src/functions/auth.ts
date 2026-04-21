import { auth } from '@/lib/auth';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { authMiddleware } from '@/middleware/auth';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';

const authRateLimit = createRateLimitMiddleware('auth');

export const getSession = createServerFn()
  .middleware([authRateLimit])
  .handler(async () => {
    const headers = await getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
  });

export const listUserAccounts = createServerFn()
  .middleware([authRateLimit, authMiddleware])
  .handler(async () => {
    const headers = await getRequestHeaders();
    const accounts = await auth.api.listUserAccounts({ headers });

    return accounts;
  });

export const listSessions = createServerFn()
  .middleware([authRateLimit, authMiddleware])
  .handler(async () => {
    const headers = await getRequestHeaders();
    return await auth.api.listSessions({ headers });
  });
