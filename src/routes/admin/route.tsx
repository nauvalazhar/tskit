import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { SidebarLayout } from '@/components/app/sidebar-layout';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: '/login' });
    }
    const user = context.session.user;
    if (user.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarLayout sidebar={<AdminSidebar />} maxWidth="max-w-6xl">
      <Outlet />
    </SidebarLayout>
  );
}
