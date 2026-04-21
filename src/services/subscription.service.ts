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
import type { PaymentChannel } from '@/config/payment';
import type {
  WebhookEvent,
  NormalizedSubscriptionData,
  NormalizedPaymentData,
} from '@/core/drivers/payment/types';

export async function getSubscriptionByOrganizationId(organizationId: string) {
  return db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, organizationId),
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

export async function handleWebhookEvent(event: WebhookEvent, channel: PaymentChannel) {
  // Idempotency check
  const existing = await db.query.webhookEvents.findFirst({
    where: eq(webhookEvents.externalId, event.id),
  });

  if (existing) return;

  switch (event.type) {
    case 'subscription.created':
      await handleSubscriptionCreated(event.data as NormalizedSubscriptionData, channel);
      break;
    case 'subscription.updated':
      await handleSubscriptionUpdated(event.data as NormalizedSubscriptionData, channel);
      break;
    case 'subscription.deleted':
      await handleSubscriptionDeleted(event.data as NormalizedSubscriptionData);
      break;
    case 'payment.succeeded':
      await handlePaymentSucceeded(event.data as NormalizedPaymentData);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.data as NormalizedPaymentData);
      break;
  }

  // Log after successful processing
  await db.insert(webhookEvents).values({
    externalId: event.id,
    channel,
    type: event.type,
  });
}

async function handleSubscriptionCreated(data: NormalizedSubscriptionData, channel: PaymentChannel) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.externalCustomerId, data.customerId),
  });

  if (!customer) return;

  const plan = data.priceId ? await getPlanByExternalPriceId(data.priceId) : null;

  if (!plan) return;

  await db.insert(subscriptions).values({
    userId: customer.userId,
    organizationId: customer.organizationId,
    planId: plan.id,
    channel,
    externalId: data.id,
    status: data.status,
    currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart * 1000) : null,
    currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd * 1000) : null,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd,
  });

  // Send confirmation email to the user who initiated the checkout
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

async function handleSubscriptionUpdated(data: NormalizedSubscriptionData, channel: PaymentChannel) {
  const existing = await getSubscriptionByExternalId(data.id);

  if (!existing) {
    // If we don't have a record yet, treat as created
    await handleSubscriptionCreated(data, channel);
    return;
  }

  const plan = data.priceId ? await getPlanByExternalPriceId(data.priceId) : null;

  await db
    .update(subscriptions)
    .set({
      status: data.status,
      planId: plan?.id ?? existing.planId,
      currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart * 1000) : undefined,
      currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd * 1000) : undefined,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      canceledAt: data.canceledAt ? new Date(data.canceledAt * 1000) : null,
    })
    .where(eq(subscriptions.externalId, data.id));
}

async function handleSubscriptionDeleted(data: NormalizedSubscriptionData) {
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
    })
    .where(eq(subscriptions.externalId, data.id));
}

async function handlePaymentSucceeded(data: NormalizedPaymentData) {
  if (!data.subscriptionId) return;

  await db
    .update(subscriptions)
    .set({ status: 'active' })
    .where(eq(subscriptions.externalId, data.subscriptionId));
}

async function handlePaymentFailed(data: NormalizedPaymentData) {
  if (!data.subscriptionId) return;

  await db
    .update(subscriptions)
    .set({ status: 'past_due' })
    .where(eq(subscriptions.externalId, data.subscriptionId));

  // Send failure email to the user who initiated the subscription
  const sub = await getSubscriptionByExternalId(data.subscriptionId);
  if (!sub) return;

  const user = await db.query.users.findFirst({
    where: eq(users.id, sub.userId),
  });

  if (user) {
    await mailer.send('payment-failed', user.email, { name: user.name });
  }
}
