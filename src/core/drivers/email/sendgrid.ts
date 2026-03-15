import sgMail from '@sendgrid/mail';
import type { EmailDriver, MailDriverConfig, SendEmailParams } from './types';

export class SendGridEmailDriver implements EmailDriver {
  private from: string;

  constructor(config: MailDriverConfig) {
    sgMail.setApiKey(config.apiKey);
    this.from = config.from;
  }

  async send(params: SendEmailParams): Promise<{ id: string }> {
    try {
      const [response] = await sgMail.send({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      return { id: response.headers['x-message-id'] || '' };
    } catch (error) {
      const err = error as { response?: { body?: string }; message?: string };
      if (err.response?.body) {
        const body = err.response.body;
        throw new Error(
          typeof body === 'string' ? body : JSON.stringify(body, null, 2),
        );
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
