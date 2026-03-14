import { createMiddleware } from '@tanstack/react-start';
import { authMiddleware } from './auth';
import { getSubscriptionByUserId } from '@/services/subscription.service';

export const subscribedMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const subscription = await getSubscriptionByUserId(context.user.id);

    if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
      throw new Error('Active subscription required');
    }

    return next({ context: { subscription } });
  });
