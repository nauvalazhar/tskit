import { Polar } from '@polar-sh/sdk';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import type {
  PaymentDriver,
  PaymentDriverConfig,
  CreateCustomerParams,
  CustomerResult,
  CreateCheckoutParams,
  CheckoutResult,
  CreatePortalSessionParams,
  PortalSessionResult,
  SubscriptionInfo,
  WebhookEvent,
  WebhookEventType,
  NormalizedSubscriptionData,
  NormalizedPaymentData,
  ChangePlanParams,
  ChangePlanResult,
} from './types';

const EVENT_MAP: Record<string, WebhookEventType> = {
  'subscription.created': 'subscription.created',
  'subscription.active': 'subscription.updated',
  'subscription.updated': 'subscription.updated',
  'subscription.canceled': 'subscription.deleted',
  'subscription.revoked': 'subscription.deleted',
  'order.paid': 'payment.succeeded',
};

export class PolarPaymentDriver implements PaymentDriver {
  private client: Polar;
  private webhookSecret: string;

  constructor(config: PaymentDriverConfig) {
    this.client = new Polar({
      accessToken: config.secretKey,
      server: config.publicKey === 'sandbox' ? 'sandbox' : 'production',
    });
    this.webhookSecret = config.webhookSecret;
  }

  async createCustomer(params: CreateCustomerParams): Promise<CustomerResult> {
    const customer = await this.client.customers.create({
      email: params.email,
      name: params.name,
      externalId: params.metadata?.userId,
    });
    return { id: customer.id };
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const checkout = await this.client.checkouts.create({
      products: [params.priceId],
      customerId: params.customerId,
      successUrl: params.successUrl,
    });

    if (!checkout.url) {
      throw new Error('Polar checkout did not return a URL');
    }

    return { url: checkout.url };
  }

  async createPortalSession(
    params: CreatePortalSessionParams,
  ): Promise<PortalSessionResult> {
    const session = await this.client.customerSessions.create({
      customerId: params.customerId,
    });
    return { url: session.customerPortalUrl };
  }

  async handleWebhook(request: Request): Promise<WebhookEvent> {
    const body = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let event: ReturnType<typeof validateEvent>;
    try {
      event = validateEvent(body, headers, this.webhookSecret);
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        throw new Error('Invalid webhook signature');
      }
      throw error;
    }

    const type: WebhookEventType = EVENT_MAP[event.type] || 'unhandled';
    const data = this.normalizeEventData(type, event);

    return { id: `${event.type}:${event.data.id}`, type, data };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: { cancelAtPeriodEnd: true },
    });
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionInfo> {
    const sub = await this.client.subscriptions.get({ id: subscriptionId });

    return {
      id: sub.id,
      status: sub.status,
      priceId: sub.productId,
      currentPeriodStart: new Date(sub.currentPeriodStart),
      currentPeriodEnd: new Date(sub.currentPeriodEnd),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    };
  }

  async changePlan(params: ChangePlanParams): Promise<ChangePlanResult> {
    const updated = await this.client.subscriptions.update({
      id: params.subscriptionId,
      subscriptionUpdate: {
        productId: params.newPriceId,
        cancelAtPeriodEnd: false,
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      priceId: updated.productId,
      currentPeriodStart: new Date(updated.currentPeriodStart),
      currentPeriodEnd: new Date(updated.currentPeriodEnd),
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
    };
  }

  private normalizeEventData(
    type: WebhookEventType,
    event: Record<string, any>,
  ): NormalizedSubscriptionData | NormalizedPaymentData {
    const polarData = event.data;

    if (type === 'payment.succeeded' || type === 'payment.failed') {
      return {
        subscriptionId: polarData.subscription_id ?? polarData.subscriptionId ?? null,
      };
    }

    const toUnix = (iso: string | null | undefined): number | null => {
      if (!iso) return null;
      return Math.floor(new Date(iso).getTime() / 1000);
    };

    return {
      id: polarData.id,
      customerId: polarData.customer_id ?? polarData.customerId,
      status: polarData.status,
      priceId: polarData.product_id ?? polarData.productId ?? null,
      currentPeriodStart: toUnix(polarData.current_period_start ?? polarData.currentPeriodStart),
      currentPeriodEnd: toUnix(polarData.current_period_end ?? polarData.currentPeriodEnd),
      cancelAtPeriodEnd: !!(polarData.cancel_at_period_end ?? polarData.cancelAtPeriodEnd),
      canceledAt: toUnix(polarData.canceled_at ?? polarData.canceledAt),
    };
  }
}
