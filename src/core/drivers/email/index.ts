import { ResendEmailDriver } from './resend';
import type { EmailDriver, MailDriverConfig } from './types';

const drivers: Record<string, (config: MailDriverConfig) => EmailDriver> = {
  resend: (config) => new ResendEmailDriver(config),
};

export function createEmailDriver(config: MailDriverConfig): EmailDriver {
  const factory = drivers[config.driver];
  if (!factory) throw new Error(`Email driver "${config.driver}" not found`);
  return factory(config);
}
