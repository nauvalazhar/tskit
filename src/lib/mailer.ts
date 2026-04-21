import { render } from '@react-email/render';
import { mailConfig, type MailChannel } from '@/config/mail';
import { createEmailDriver } from '@/core/drivers/email';
import type { EmailDriver } from '@/core/drivers/email/types';
import { loadTemplate, type EmailTemplates } from '@/emails';

class Mailer {
  private drivers = new Map<string, EmailDriver>();
  private channel: MailChannel | undefined;

  private resolve(): EmailDriver {
    const name = this.channel || mailConfig.default;
    if (!this.drivers.has(name)) {
      const config = mailConfig.channels[name];
      if (!config) throw new Error(`Mail channel "${name}" not configured`);
      this.drivers.set(name, createEmailDriver(config));
    }
    return this.drivers.get(name)!;
  }

  use(name: MailChannel): Mailer {
    const scoped = new Mailer();
    scoped.drivers = this.drivers;
    scoped.channel = name;
    return scoped;
  }

  async send<T extends keyof EmailTemplates>(
    template: T,
    to: string,
    data: EmailTemplates[T],
  ): Promise<{ id: string }> {
    const { component, subject: subjectFn } = await loadTemplate(template);
    const subject =
      typeof subjectFn === 'function' ? subjectFn() : subjectFn;
    const html = await render(component(data as any));

    return this.resolve().send({ to, subject, html });
  }
}

export const mailer = new Mailer();
