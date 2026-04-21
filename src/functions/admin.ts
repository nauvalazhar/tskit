import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { adminMiddleware } from '@/middleware/admin';
import { usersSearchSchema, subscriptionsSearchSchema, plansSearchSchema } from '@/validations/admin';
import {
  getOverviewStats,
  listUsersAdmin,
  getUserAdmin,
  listSubscriptionsAdmin,
  listAllPlans,
  deletePlanPrice,
} from '@/services/admin.service';
import { upsertPlan, upsertPlanPrice } from '@/services/plan.service';
import {
  markSubscriptionCanceled,
  updateSubscriptionPlan,
} from '@/services/subscription.service';
import { payment } from '@/lib/payment';
import { auth } from '@/lib/auth';
import { db } from '@/database';
import { plans } from '@/database/schemas/billing';
import { paymentChannelSchema } from '@/config/payment';

const userId = z.uuid();
const channel = paymentChannelSchema;

export const getAdminOverview = createServerFn()
  .middleware([adminMiddleware])
  .handler(async () => {
    return getOverviewStats();
  });

export const getUsers = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(usersSearchSchema)
  .handler(async ({ data }) => {
    return listUsersAdmin(data);
  });

export const getUser = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId }))
  .handler(async ({ data }) => {
    return getUserAdmin(data.userId);
  });

export const adminBanUser = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId, banReason: z.string().optional() }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) throw new Error('Cannot ban yourself');
    const headers = await getRequestHeaders();
    await auth.api.banUser({ headers, body: { userId: data.userId, banReason: data.banReason } });
  });

export const adminUnbanUser = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) throw new Error('Cannot unban yourself');
    const headers = await getRequestHeaders();
    await auth.api.unbanUser({ headers, body: { userId: data.userId } });
  });

export const adminSetRole = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId, role: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) throw new Error('Cannot change your own role');
    const headers = await getRequestHeaders();
    await auth.api.setRole({ headers, body: { userId: data.userId, role: data.role as 'user' | 'admin' } });
  });

export const adminRemoveUser = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) throw new Error('Cannot delete yourself');
    const headers = await getRequestHeaders();
    await auth.api.removeUser({ headers, body: { userId: data.userId } });
  });

export const getSubscriptions = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(subscriptionsSearchSchema)
  .handler(async ({ data }) => {
    return listSubscriptionsAdmin(data);
  });

export const adminCancelSubscription = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ externalId: z.string().min(1), channel }))
  .handler(async ({ data }) => {
    await payment.use(data.channel).cancelSubscription(data.externalId);
    await markSubscriptionCanceled(data.externalId);
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
  .handler(async ({ data }) => {
    await payment.use(data.channel).changePlan(data.externalId, data.newPlanId);
    await updateSubscriptionPlan(data.externalId, data.newPlanId);
  });

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
  .handler(async ({ data }) => {
    return upsertPlan(data);
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
  .handler(async ({ data }) => {
    await db
      .update(plans)
      .set({ active: data.active })
      .where(eq(plans.id, data.planId));
  });
