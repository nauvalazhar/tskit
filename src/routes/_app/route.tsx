import { AppSidebar } from '@/components/app/app-sidebar';
import { EmailVerificationBanner } from '@/components/app/email-verification-banner';
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
    <div className="flex h-dvh bg-[oklch(0.1809_0.0023_247.96)]">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-10 rounded-l-3xl ring ring-card-border/40 my-4 bg-background">
        <div className="mx-auto max-w-5xl">
          <EmailVerificationBanner />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
