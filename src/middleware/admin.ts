import { createMiddleware } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { authMiddleware } from './auth';

export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }

    return next({ context: { user: context.user } });
  });
