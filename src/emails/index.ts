import type ResetPasswordEmail from './reset-password';
import type PasswordChangedEmail from './password-changed';
import type VerifyEmailEmail from './verify-email';
import type SubscriptionCreatedEmail from './subscription-created';
import type PaymentFailedEmail from './payment-failed';
import type TeamInvitationEmail from './team-invitation';

type PropsOf<T extends (...args: any[]) => any> = Parameters<T>[0];

export type EmailTemplates = {
  'reset-password': PropsOf<typeof ResetPasswordEmail>;
  'password-changed': PropsOf<typeof PasswordChangedEmail>;
  'verify-email': PropsOf<typeof VerifyEmailEmail>;
  'subscription-created': PropsOf<typeof SubscriptionCreatedEmail>;
  'payment-failed': PropsOf<typeof PaymentFailedEmail>;
  'team-invitation': PropsOf<typeof TeamInvitationEmail>;
};

export interface LoadedTemplate<P> {
  component: (props: P) => React.ReactElement;
  subject: ((props: P) => string) | (() => string);
}

async function load(name: keyof EmailTemplates) {
  switch (name) {
    case 'reset-password':
      return import('./reset-password');
    case 'password-changed':
      return import('./password-changed');
    case 'verify-email':
      return import('./verify-email');
    case 'subscription-created':
      return import('./subscription-created');
    case 'payment-failed':
      return import('./payment-failed');
    case 'team-invitation':
      return import('./team-invitation');
  }
}

export async function loadTemplate<T extends keyof EmailTemplates>(
  name: T,
): Promise<LoadedTemplate<EmailTemplates[T]>> {
  const mod = await load(name);
  return {
    component: mod.default,
    subject: mod.subject,
  } as LoadedTemplate<EmailTemplates[T]>;
}
