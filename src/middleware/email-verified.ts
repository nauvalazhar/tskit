import { createMiddleware } from '@tanstack/react-start';
import { authMiddleware } from '@/middleware/auth';

export const emailVerifiedMiddleware = createMiddleware({
  type: 'function',
})
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (!context.user.emailVerified) {
      throw new Error('Email verification required.');
    }

    return next();
  });
