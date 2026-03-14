import Stripe from 'stripe';
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
  ChangePlanParams,
  ChangePlanResult,
} from './types';

const EVENT_MAP: Record<string, WebhookEventType> = {
  'customer.subscription.created': 'subscription.created',
  'customer.subscription.updated': 'subscription.updated',
  'customer.subscription.deleted': 'subscription.deleted',
  'invoice.payment_succeeded': 'payment.succeeded',
  'invoice.payment_failed': 'payment.failed',
};

export class StripePaymentDriver implements PaymentDriver {
  private client: Stripe;
  private webhookSecret: string;

  constructor(config: PaymentDriverConfig) {
    this.client = new Stripe(config.secretKey);
    this.webhookSecret = config.webhookSecret;
  }

  async createCustomer(params: CreateCustomerParams): Promise<CustomerResult> {
    const customer = await this.client.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    });
    return { id: customer.id };
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const session = await this.client.checkout.sessions.create({
      customer: params.customerId,
      mode: 'subscription',
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    if (!session.url) {
      throw new Error('Stripe checkout session did not return a URL');
    }

    return { url: session.url };
  }

  async createPortalSession(params: CreatePortalSessionParams): Promise<PortalSessionResult> {
    const session = await this.client.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return { url: session.url };
  }

  async handleWebhook(request: Request): Promise<WebhookEvent> {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const event = this.client.webhooks.constructEvent(body, signature, this.webhookSecret);
    const type: WebhookEventType = EVENT_MAP[event.type] || 'unhandled';

    return {
      id: event.id,
      type,
      data: event.data.object as Record<string, any>,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async changePlan(params: ChangePlanParams): Promise<ChangePlanResult> {
    const subscription = await this.client.subscriptions.retrieve(params.subscriptionId);
    const itemId = subscription.items.data[0]?.id;

    if (!itemId) {
      throw new Error('Subscription has no items');
    }

    const updated = await this.client.subscriptions.update(params.subscriptionId, {
      items: [{ id: itemId, price: params.newPriceId }],
      proration_behavior: 'create_prorations',
      cancel_at_period_end: false,
    });

    const item = updated.items.data[0];

    return {
      id: updated.id,
      status: updated.status,
      priceId: item?.price?.id || '',
      currentPeriodStart: new Date(item?.current_period_start * 1000),
      currentPeriodEnd: new Date(item?.current_period_end * 1000),
      cancelAtPeriodEnd: updated.cancel_at_period_end,
    };
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionInfo> {
    const sub = await this.client.subscriptions.retrieve(subscriptionId);
    const item = sub.items.data[0];

    return {
      id: sub.id,
      status: sub.status,
      priceId: item?.price?.id || '',
      currentPeriodStart: new Date(item?.current_period_start * 1000),
      currentPeriodEnd: new Date(item?.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }
}
