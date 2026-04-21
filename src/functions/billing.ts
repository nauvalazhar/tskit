import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';
import { listPlans } from '@/services/plan.service';
import {
  getSubscriptionByUserId,
  markSubscriptionCanceled,
  updateSubscriptionPlan,
} from '@/services/subscription.service';
import { payment } from '@/lib/payment';
import type { PaymentChannel } from '@/config/payment';

const defaultRateLimit = createRateLimitMiddleware('default');

export const getPlans = createServerFn().handler(async () => {
  return listPlans();
});

export const getSubscription = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return getSubscriptionByUserId(context.user.id);
  });

export const createCheckout = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(z.object({ planId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:3000';

    return payment.checkout(context.user.id, data.planId, {
      success: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel: `${baseUrl}/billing?canceled=true`,
    });
  });

export const createPortalSession = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(z.object({ returnUrl: z.url() }))
  .handler(async ({ context, data }) => {
    return payment.portal(context.user.id, data.returnUrl);
  });

export const cancelSubscription = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sub = await getSubscriptionByUserId(context.user.id);
    if (!sub) throw new Error('No active subscription');

    await payment.use(sub.channel as PaymentChannel).cancelSubscription(sub.externalId);
    await markSubscriptionCanceled(sub.externalId);
  });

export const changePlan = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ planId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const sub = await getSubscriptionByUserId(context.user.id);
    if (!sub) throw new Error('No active subscription');
    if (sub.planId === data.planId) throw new Error('Already on this plan');

    await payment.use(sub.channel as PaymentChannel).changePlan(sub.externalId, data.planId);
    await updateSubscriptionPlan(sub.externalId, data.planId);
  });
