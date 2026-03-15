import type { MailDriverConfig } from '@/core/drivers/email/types';

export interface MailConfig {
  default: string;
  channels: Record<string, MailDriverConfig>;
}

export const mailConfig: MailConfig = {
  default: process.env.EMAIL_PROVIDER || 'resend',
  channels: {
    resend: {
      driver: 'resend',
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM!,
    },
    sendgrid: {
      driver: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY!,
      from: process.env.EMAIL_FROM!,
    },
  },
};
