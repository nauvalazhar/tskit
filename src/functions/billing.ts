import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth';
import { orgMiddleware } from '@/middleware/org';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';
import { listPlans } from '@/services/plan.service';
import {
  getSubscriptionByOrganizationId,
  markSubscriptionCanceled,
  updateSubscriptionPlan,
} from '@/services/subscription.service';
import { payment } from '@/lib/payment';
import { audit } from '@/lib/audit';
import { auth } from '@/lib/auth';
import type { PaymentChannel } from '@/config/payment';

const defaultRateLimit = createRateLimitMiddleware('default');

async function requireBillingRole(headers: Headers) {
  const member = await auth.api.getActiveMember({ headers });
  if (!member || !['owner', 'admin'].includes(member.role)) {
    throw new Error('Only team owners and admins can manage billing');
  }
  return member;
}

export const getPlans = createServerFn().handler(async () => {
  return listPlans();
});

export const getSubscription = createServerFn()
  .middleware([orgMiddleware])
  .handler(async ({ context }) => {
    return getSubscriptionByOrganizationId(context.organization.id);
  });

export const createCheckout = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, orgMiddleware])
  .inputValidator(z.object({ planId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    await requireBillingRole(headers);

    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:3000';

    const result = await payment.checkout(
      context.organization.id,
      context.user.id,
      data.planId,
      {
        success: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel: `${baseUrl}/billing?canceled=true`,
      },
    );

    await audit.log({
      actorId: context.user.id,
      action: 'billing.checkout.created',
      targetType: 'organization',
      targetId: context.organization.id,
      metadata: { planId: data.planId },
    });

    return result;
  });

export const createPortalSession = createServerFn({ method: 'POST' })
  .middleware([defaultRateLimit, orgMiddleware])
  .inputValidator(z.object({ returnUrl: z.url() }))
  .handler(async ({ context, data }) => {
    const headers = await getRequestHeaders();
    await requireBillingRole(headers);

    return payment.portal(context.organization.id, context.user.id, data.returnUrl);
  });

export const cancelSubscription = createServerFn({ method: 'POST' })
  .middleware([orgMiddleware])
  .handler(async ({ context }) => {
    const headers = await getRequestHeaders();
    await requireBillingRole(headers);

    const sub = await getSubscriptionByOrganizationId(context.organization.id);
    if (!sub) throw new Error('No active subscription');

    await payment.use(sub.channel as PaymentChannel).cancelSubscription(sub.externalId);
    await markSubscriptionCanceled(sub.externalId);

    await audit.log({
      actorId: context.user.id,
      action: 'billing.subscription.cancelled',
      targetType: 'organization',
      targetId: context.organization.id,
      metadata: { subscriptionExternalId: sub.externalId },
    });
  });

export const changePlan = createServerFn({ method: 'POST' })
  .middleware([orgMiddleware])
  .inputValidator(z.object({ planId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const headers = await getRequestHeaders();
    await requireBillingRole(headers);

    const sub = await getSubscriptionByOrganizationId(context.organization.id);
    if (!sub) throw new Error('No active subscription');
    if (sub.planId === data.planId) throw new Error('Already on this plan');

    await payment.use(sub.channel as PaymentChannel).changePlan(sub.externalId, data.planId);
    await updateSubscriptionPlan(sub.externalId, data.planId);

    await audit.log({
      actorId: context.user.id,
      action: 'billing.plan.changed',
      targetType: 'organization',
      targetId: context.organization.id,
      metadata: { planId: data.planId },
    });
  });
