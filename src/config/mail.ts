import { z } from 'zod';
import { mailDriverConfigSchema } from '@/core/drivers/email/types';

const mailChannelsSchema = z.object({
  resend: mailDriverConfigSchema,
  sendgrid: mailDriverConfigSchema,
});

const mailConfigSchema = z.object({
  default: mailChannelsSchema.keyof(),
  channels: mailChannelsSchema,
});

export const mailConfig = mailConfigSchema.parse({
  default: process.env.EMAIL_PROVIDER || 'resend',
  channels: {
    resend: {
      driver: 'resend',
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    },
    sendgrid: {
      driver: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.EMAIL_FROM,
    },
  },
});

export type MailConfig = z.infer<typeof mailConfigSchema>;
export type MailChannel = keyof MailConfig['channels'];
