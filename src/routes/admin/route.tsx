import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (!context.session?.user) {
      throw redirect({
        to: '/login',
      });
    }
    // TODO: Add admin role check
    // if (context.session.user.role !== 'admin') {
    //   throw redirect({ to: '/dashboard' });
    // }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
