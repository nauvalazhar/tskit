import { SignUpForm } from '@/components/auth/signup-form';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';

export const Route = createFileRoute('/_auth/register')({
  head: () => ({
    meta: [{ title: pageTitle('Sign Up') }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpForm />;
}
