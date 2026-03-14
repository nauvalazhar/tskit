import { SignUpForm } from '@/components/auth/signup-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpForm />;
}
