import { Resend } from 'resend';
import type { EmailDriver, SendEmailParams, MailDriverConfig } from './types';

export class ResendEmailDriver implements EmailDriver {
  private client: Resend;
  private from: string;

  constructor(config: MailDriverConfig) {
    this.client = new Resend(config.apiKey);
    this.from = config.from;
  }

  async send(params: SendEmailParams): Promise<{ id: string }> {
    const { data, error } = await this.client.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return { id: data!.id };
  }
}
