import { LoginForm } from '@/components/auth/login-form';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';

export const Route = createFileRoute('/_auth/login')({
  head: () => ({
    meta: [{ title: pageTitle('Log In') }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginForm />;
}
