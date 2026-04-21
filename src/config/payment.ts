import { z } from 'zod';
import { paymentDriverConfigSchema } from '@/core/drivers/payment/types';

const paymentChannelsSchema = z.object({
  stripe: paymentDriverConfigSchema,
  polar: paymentDriverConfigSchema,
});

const paymentConfigSchema = z.object({
  default: paymentChannelsSchema.keyof(),
  channels: paymentChannelsSchema,
});

export const paymentConfig = paymentConfigSchema.parse({
  default: process.env.PAYMENT_PROVIDER || 'stripe',
  channels: {
    stripe: {
      driver: 'stripe',
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      publicKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    },
    polar: {
      driver: 'polar',
      secretKey: process.env.POLAR_ACCESS_TOKEN,
      webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
      publicKey: process.env.POLAR_SERVER,
    },
  },
});

export type PaymentConfig = z.infer<typeof paymentConfigSchema>;
export type PaymentChannel = keyof PaymentConfig['channels'];
export const paymentChannelSchema = paymentChannelsSchema.keyof();
