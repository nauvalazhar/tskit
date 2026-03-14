import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_marketing')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="container mx-auto py-20 px-4">
      <Outlet />
    </main>
  );
}
