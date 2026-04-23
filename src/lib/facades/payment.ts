import { eq, and } from 'drizzle-orm';
import { paymentConfig, type PaymentChannel } from '@/config/payment';
import { createPaymentDriver } from '@/core/drivers/payment';
import type { PaymentDriver, WebhookEvent } from '@/core/drivers/payment/types';
import { db } from '@/database';
import { customers } from '@/database/schemas/billing';
import { users } from '@/database/schemas/auth';
import { getPlanById, getPlanPrice } from '@/services/plan.service';

class Payment {
  private drivers = new Map<string, PaymentDriver>();
  private channel: PaymentChannel | undefined;

  private resolve(): PaymentDriver {
    const name = this.channel || paymentConfig.default;
    if (!this.drivers.has(name)) {
      const config = paymentConfig.channels[name];
      if (!config) throw new Error(`Payment channel "${name}" not configured`);
      this.drivers.set(name, createPaymentDriver(config));
    }
    return this.drivers.get(name)!;
  }

  use(name: PaymentChannel): Payment {
    const scoped = new Payment();
    scoped.drivers = this.drivers;
    scoped.channel = name;
    return scoped;
  }

  async getOrCreateCustomer(organizationId: string, userId: string) {
    const channel = this.channel || paymentConfig.default;
    const existing = await db.query.customers.findFirst({
      where: and(eq(customers.organizationId, organizationId), eq(customers.channel, channel)),
    });

    if (existing) return existing;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) throw new Error('User not found');

    const result = await this.resolve().createCustomer({
      email: user.email,
      name: user.name,
      metadata: { organizationId, userId },
    });

    const [customer] = await db
      .insert(customers)
      .values({
        userId,
        organizationId,
        channel,
        externalCustomerId: result.id,
      })
      .returning();

    return customer;
  }

  async checkout(
    organizationId: string,
    userId: string,
    planId: string,
    urls: { success: string; cancel: string },
  ) {
    const channel = this.channel || paymentConfig.default;
    const customer = await this.getOrCreateCustomer(organizationId, userId);
    const plan = await getPlanById(planId);
    if (!plan) throw new Error('Plan not found');

    const price = await getPlanPrice(planId, channel);
    if (!price)
      throw new Error(`Plan "${plan.name}" not available on channel "${channel}"`);

    return this.resolve().createCheckout({
      customerId: customer.externalCustomerId,
      priceId: price.externalPriceId,
      successUrl: urls.success,
      cancelUrl: urls.cancel,
    });
  }

  async portal(organizationId: string, userId: string, returnUrl: string) {
    const customer = await this.getOrCreateCustomer(organizationId, userId);
    return this.resolve().createPortalSession({
      customerId: customer.externalCustomerId,
      returnUrl,
    });
  }

  async changePlan(subscriptionExternalId: string, newPlanId: string) {
    const channel = this.channel || paymentConfig.default;
    const plan = await getPlanById(newPlanId);
    if (!plan) throw new Error('Plan not found');

    const price = await getPlanPrice(newPlanId, channel);
    if (!price)
      throw new Error(`Plan "${plan.name}" not available on channel "${channel}"`);

    return this.resolve().changePlan({
      subscriptionId: subscriptionExternalId,
      newPriceId: price.externalPriceId,
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    return this.resolve().cancelSubscription(subscriptionId);
  }

  async getSubscription(subscriptionId: string) {
    return this.resolve().getSubscription(subscriptionId);
  }

  async handleWebhook(request: Request): Promise<WebhookEvent> {
    return this.resolve().handleWebhook(request);
  }
}

export const payment = new Payment();
