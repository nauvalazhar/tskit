import { AdminSidebar } from '@/components/admin/admin-sidebar';
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
    <div className="flex h-dvh dark:bg-[oklch(0.1809_0.0023_247.96)] bg-[oklch(0.977_0.0007_247.83)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-10 rounded-l-3xl ring ring-card-border/40 my-4 bg-background">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
