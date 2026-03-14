import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context, location }) => {
    if (context.session?.user) {
      const isResetPassword =
        location.pathname === '/reset-password' &&
        'token' in (location.search as Record<string, unknown>);

      if (!isResetPassword) {
        throw redirect({
          to: '/dashboard',
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
