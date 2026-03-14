import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { createFileRoute } from '@tanstack/react-router';

type ResetPasswordSearch = {
  token?: string;
};

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  return <ResetPasswordForm token={token} />;
}
