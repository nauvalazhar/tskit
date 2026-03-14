export interface PaymentDriverConfig {
  driver: string;
  secretKey: string;
  webhookSecret: string;
  publicKey?: string;
}

export interface CreateCustomerParams {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CustomerResult {
  id: string;
}

export interface CreateCheckoutParams {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export interface PortalSessionResult {
  url: string;
}

export interface SubscriptionInfo {
  id: string;
  status: string;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export type WebhookEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.deleted'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'unhandled';

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, any>;
}

export interface ChangePlanParams {
  subscriptionId: string;
  newPriceId: string;
}

export interface ChangePlanResult {
  id: string;
  status: string;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentDriver {
  createCustomer(params: CreateCustomerParams): Promise<CustomerResult>;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  createPortalSession(params: CreatePortalSessionParams): Promise<PortalSessionResult>;
  handleWebhook(request: Request): Promise<WebhookEvent>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<SubscriptionInfo>;
  changePlan(params: ChangePlanParams): Promise<ChangePlanResult>;
}
