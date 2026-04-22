import { createMiddleware } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { authMiddleware } from './auth';
import { createRateLimitMiddleware } from './rate-limit';

const adminRateLimit = createRateLimitMiddleware('admin');

export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([adminRateLimit, authMiddleware])
  .server(async ({ next, context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }

    return next({ context: { user: context.user } });
  });
