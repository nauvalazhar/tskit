import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';

export const Route = createFileRoute('/_auth/forgot-password')({
  head: () => ({
    meta: [{ title: pageTitle('Forgot Password') }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotPasswordForm />;
}
