import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: searchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  return <ResetPasswordForm token={token} />;
}
