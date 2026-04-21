import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/settings/team')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
