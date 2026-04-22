import { AppSidebar } from '@/components/app/app-sidebar';
import { EmailVerificationBanner } from '@/components/app/email-verification-banner';
import { SidebarLayout } from '@/components/app/sidebar-layout';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    if (!context.session?.user) {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarLayout
      sidebar={<AppSidebar />}
      banner={<EmailVerificationBanner />}
    >
      <Outlet />
    </SidebarLayout>
  );
}
