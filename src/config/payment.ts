import type { PaymentDriverConfig } from '@/core/drivers/payment/types';

export interface PaymentConfig {
  default: string;
  channels: Record<string, PaymentDriverConfig>;
}

export const paymentConfig: PaymentConfig = {
  default: process.env.PAYMENT_PROVIDER || 'stripe',
  channels: {
    stripe: {
      driver: 'stripe',
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      publicKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    },
    polar: {
      driver: 'polar',
      secretKey: process.env.POLAR_ACCESS_TOKEN!,
      webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
      publicKey: process.env.POLAR_SERVER,
    },
  },
};
