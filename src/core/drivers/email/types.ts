import { z } from 'zod';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const mailDriverConfigSchema = z.object({
  driver: z.string(),
  apiKey: z.string().min(1),
  from: z.string().min(1),
});
export type MailDriverConfig = z.infer<typeof mailDriverConfigSchema>;

export interface EmailDriver {
  send(params: SendEmailParams): Promise<{ id: string }>;
}
