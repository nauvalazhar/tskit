import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { adminMiddleware } from '@/middleware/admin';
import { subscriptionsSearchSchema } from '@/validations/admin';
import { listSubscriptionsAdmin } from '@/services/admin/subscriptions.service';
import {
  markSubscriptionCanceled,
  updateSubscriptionPlan,
} from '@/services/subscription.service';
import { payment } from '@/lib/facades/payment';
import { audit } from '@/lib/audit';
import { paymentChannelSchema } from '@/config/payment';

const channel = paymentChannelSchema;

export const getSubscriptions = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(subscriptionsSearchSchema)
  .handler(async ({ data }) => {
    return listSubscriptionsAdmin(data);
  });

export const adminCancelSubscription = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ externalId: z.string().min(1), channel }))
  .handler(async ({ data, context }) => {
    await payment.use(data.channel).cancelSubscription(data.externalId);
    await markSubscriptionCanceled(data.externalId);

    await audit.log({
      actorId: context.user.id,
      action: 'admin.subscription.cancelled',
      targetType: 'subscription',
      targetId: data.externalId,
    });
  });

export const adminChangePlan = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      externalId: z.string().min(1),
      channel,
      newPlanId: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    await payment.use(data.channel).changePlan(data.externalId, data.newPlanId);
    await updateSubscriptionPlan(data.externalId, data.newPlanId);

    await audit.log({
      actorId: context.user.id,
      action: 'admin.subscription.plan.changed',
      targetType: 'subscription',
      targetId: data.externalId,
      metadata: { newPlanId: data.newPlanId },
    });
  });
