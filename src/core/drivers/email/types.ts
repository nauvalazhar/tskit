export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface MailDriverConfig {
  driver: string;
  apiKey: string;
  from: string;
}

export interface EmailDriver {
  send(params: SendEmailParams): Promise<{ id: string }>;
}
