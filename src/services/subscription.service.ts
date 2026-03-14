import { eq } from 'drizzle-orm';
import { db } from '@/database';
import {
  customers,
  subscriptions,
  webhookEvents,
} from '@/database/schemas/billing';
import { users } from '@/database/schemas/auth';
import { mailer } from '@/lib/mailer';
import { getPlanByExternalPriceId } from './plan.service';
import type { WebhookEvent } from '@/core/drivers/payment/types';

export async function getSubscriptionByUserId(userId: string) {
  return db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
    with: { plan: true },
  });
}

export async function getSubscriptionByExternalId(externalId: string) {
  return db.query.subscriptions.findFirst({
    where: eq(subscriptions.externalId, externalId),
  });
}

export async function markSubscriptionCanceled(externalId: string) {
  await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: true })
    .where(eq(subscriptions.externalId, externalId));
}

export async function updateSubscriptionPlan(externalId: string, planId: string) {
  await db
    .update(subscriptions)
    .set({ planId, cancelAtPeriodEnd: false })
    .where(eq(subscriptions.externalId, externalId));
}

export async function handleWebhookEvent(event: WebhookEvent, channel: string) {
  // Idempotency check
  const existing = await db.query.webhookEvents.findFirst({
    where: eq(webhookEvents.externalId, event.id),
  });

  if (existing) return;

  switch (event.type) {
    case 'subscription.created':
      await handleSubscriptionCreated(event.data, channel);
      break;
    case 'subscription.updated':
      await handleSubscriptionUpdated(event.data, channel);
      break;
    case 'subscription.deleted':
      await handleSubscriptionDeleted(event.data);
      break;
    case 'payment.succeeded':
      await handlePaymentSucceeded(event.data);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.data);
      break;
  }

  // Log after successful processing
  await db.insert(webhookEvents).values({
    externalId: event.id,
    channel,
    type: event.type,
  });
}

async function handleSubscriptionCreated(data: Record<string, any>, channel: string) {
  const customerId = data.customer as string;
  const customer = await db.query.customers.findFirst({
    where: eq(customers.externalCustomerId, customerId),
  });

  if (!customer) return;

  const item = data.items?.data?.[0];
  const priceId = item?.price?.id as string;
  const plan = priceId ? await getPlanByExternalPriceId(priceId) : null;

  if (!plan) return;

  const periodStart = item?.current_period_start ?? data.current_period_start;
  const periodEnd = item?.current_period_end ?? data.current_period_end;

  await db.insert(subscriptions).values({
    userId: customer.userId,
    planId: plan.id,
    channel,
    externalId: data.id as string,
    status: data.status as string,
    currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
  });

  // Send confirmation email
  const user = await db.query.users.findFirst({
    where: eq(users.id, customer.userId),
  });

  if (user) {
    await mailer.send('subscription-created', user.email, {
      name: user.name,
      planName: plan.name,
    });
  }
}

async function handleSubscriptionUpdated(data: Record<string, any>, channel: string) {
  const externalId = data.id as string;
  const existing = await getSubscriptionByExternalId(externalId);

  if (!existing) {
    // If we don't have a record yet, treat as created
    await handleSubscriptionCreated(data, channel);
    return;
  }

  const item = data.items?.data?.[0];
  const priceId = item?.price?.id as string;
  const plan = priceId ? await getPlanByExternalPriceId(priceId) : null;

  const periodStart = item?.current_period_start ?? data.current_period_start;
  const periodEnd = item?.current_period_end ?? data.current_period_end;

  await db
    .update(subscriptions)
    .set({
      status: data.status as string,
      planId: plan?.id ?? existing.planId,
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : undefined,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
      cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
      canceledAt: data.canceled_at ? new Date(data.canceled_at * 1000) : null,
    })
    .where(eq(subscriptions.externalId, externalId));
}

async function handleSubscriptionDeleted(data: Record<string, any>) {
  const externalId = data.id as string;

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
    })
    .where(eq(subscriptions.externalId, externalId));
}

async function handlePaymentSucceeded(data: Record<string, any>) {
  const subscriptionId = data.subscription as string;
  if (!subscriptionId) return;

  await db
    .update(subscriptions)
    .set({ status: 'active' })
    .where(eq(subscriptions.externalId, subscriptionId));
}

async function handlePaymentFailed(data: Record<string, any>) {
  const subscriptionId = data.subscription as string;
  if (!subscriptionId) return;

  await db
    .update(subscriptions)
    .set({ status: 'past_due' })
    .where(eq(subscriptions.externalId, subscriptionId));

  // Send failure email
  const sub = await getSubscriptionByExternalId(subscriptionId);
  if (!sub) return;

  const user = await db.query.users.findFirst({
    where: eq(users.id, sub.userId),
  });

  if (user) {
    await mailer.send('payment-failed', user.email, { name: user.name });
  }
}
