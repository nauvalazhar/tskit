import { createMiddleware } from '@tanstack/react-start';
import { orgMiddleware } from './org';
import { getSubscriptionByOrganizationId } from '@/services/subscription.service';

export const subscribedMiddleware = createMiddleware({ type: 'function' })
  .middleware([orgMiddleware])
  .server(async ({ next, context }) => {
    const subscription = await getSubscriptionByOrganizationId(context.organization.id);

    if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
      throw new Error('Active subscription required');
    }

    return next({ context: { subscription } });
  });
