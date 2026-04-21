import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { authMiddleware } from './auth';
import { auth } from '@/lib/auth';

export const orgMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const headers = await getRequestHeaders();
    const activeOrg = await auth.api.getFullOrganization({ headers });

    if (!activeOrg) {
      throw new Error('No active organization');
    }

    return next({ context: { organization: activeOrg } });
  });
