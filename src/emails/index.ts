import type ResetPasswordEmail from './reset-password';
import type PasswordChangedEmail from './password-changed';
import type VerifyEmailEmail from './verify-email';
import type SubscriptionCreatedEmail from './subscription-created';
import type PaymentFailedEmail from './payment-failed';

type PropsOf<T extends (...args: any[]) => any> = Parameters<T>[0];

export type EmailTemplates = {
  'reset-password': PropsOf<typeof ResetPasswordEmail>;
  'password-changed': PropsOf<typeof PasswordChangedEmail>;
  'verify-email': PropsOf<typeof VerifyEmailEmail>;
  'subscription-created': PropsOf<typeof SubscriptionCreatedEmail>;
  'payment-failed': PropsOf<typeof PaymentFailedEmail>;
};

export async function loadTemplate(name: keyof EmailTemplates) {
  switch (name) {
    case 'reset-password': {
      const mod = await import('./reset-password');
      return { component: mod.default, subject: mod.subject };
    }
    case 'password-changed': {
      const mod = await import('./password-changed');
      return { component: mod.default, subject: mod.subject };
    }
    case 'verify-email': {
      const mod = await import('./verify-email');
      return { component: mod.default, subject: mod.subject };
    }
    case 'subscription-created': {
      const mod = await import('./subscription-created');
      return { component: mod.default, subject: mod.subject };
    }
    case 'payment-failed': {
      const mod = await import('./payment-failed');
      return { component: mod.default, subject: mod.subject };
    }
  }
}
