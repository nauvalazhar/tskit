import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { adminMiddleware } from '@/middleware/admin';
import { plansSearchSchema } from '@/validations/admin';
import { listAllPlans, deletePlanPrice } from '@/services/admin/plans.service';
import { upsertPlan, upsertPlanPrice } from '@/services/plan.service';
import { audit } from '@/lib/audit';
import { db } from '@/database';
import { plans } from '@/database/schemas/billing';
import { paymentChannelSchema } from '@/config/payment';

const channel = paymentChannelSchema;

export const getAllPlans = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(plansSearchSchema)
  .handler(async ({ data }) => {
    return listAllPlans(data);
  });

export const getPaymentChannels = createServerFn()
  .middleware([adminMiddleware])
  .handler(async () => {
    return paymentChannelSchema.options.map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    }));
  });

export const savePlan = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullish(),
      price: z.number().int().nonnegative(),
      currency: z.string().min(1),
      interval: z.string().min(1),
      entitlements: z.record(z.string(), z.union([z.boolean(), z.number()])).optional(),
      sortOrder: z.number().int().nonnegative().optional(),
      popular: z.boolean().optional(),
      active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const result = await upsertPlan(data);

    await audit.log({
      actorId: context.user.id,
      action: 'admin.plan.saved',
      targetType: 'plan',
      targetId: data.slug,
      metadata: { name: data.name },
    });

    return result;
  });

export const savePlanPrice = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(
    z.object({
      planId: z.uuid(),
      channel,
      externalProductId: z.string().min(1),
      externalPriceId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    return upsertPlanPrice(data);
  });

export const removePlanPrice = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ priceId: z.uuid() }))
  .handler(async ({ data }) => {
    await deletePlanPrice(data.priceId);
  });

export const togglePlanActive = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ planId: z.uuid(), active: z.boolean() }))
  .handler(async ({ data, context }) => {
    await db
      .update(plans)
      .set({ active: data.active })
      .where(eq(plans.id, data.planId));

    await audit.log({
      actorId: context.user.id,
      action: data.active ? 'admin.plan.activated' : 'admin.plan.deactivated',
      targetType: 'plan',
      targetId: data.planId,
    });
  });
