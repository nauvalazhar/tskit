import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { Button } from '@/components/selia/button';

export const Route = createFileRoute('/_marketing')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="font-mono font-semibold tracking-tight">
            {import.meta.env.VITE_APP_NAME}
          </Link>

          <div className="flex items-center gap-1">
            <Button
              nativeButton={false}
              variant="plain"
              size="sm"
              render={<Link to="/pricing" />}
            >
              Pricing
            </Button>
            {session ? (
              <Button
                nativeButton={false}
                variant="primary"
                size="sm"
                render={<Link to="/dashboard" />}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  nativeButton={false}
                  variant="plain"
                  size="sm"
                  render={<Link to="/login" />}
                >
                  Log in
                </Button>
                <Button
                  nativeButton={false}
                  variant="primary"
                  size="sm"
                  render={<Link to="/register" />}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-sm text-muted">
          <span>
            &copy; {new Date().getFullYear()}{' '}
            {import.meta.env.VITE_APP_NAME}
          </span>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
