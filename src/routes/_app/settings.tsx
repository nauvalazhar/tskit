import { Heading } from '@/components/selia/heading';
import { PageHeader } from '@/components/shared/page-header';
import { Tabline, TablineItem, TablineList } from '@/components/shared/tabline';
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from '@tanstack/react-router';
import { ActivityIcon, LockIcon, Settings2Icon, ShieldIcon, UserIcon } from 'lucide-react';

export const Route = createFileRoute('/_app/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();

  return (
    <>
      <PageHeader>
        <Heading>Settings</Heading>
        <Tabline value={pathname}>
          <TablineList>
            <TablineItem
              nativeButton={false}
              value="/settings"
              render={<Link to="/settings" />}
            >
              <UserIcon />
              Profile
            </TablineItem>
            <TablineItem
              nativeButton={false}
              value="/settings/preferences"
              render={<Link to="/settings/preferences" />}
            >
              <Settings2Icon />
              Preferences
            </TablineItem>
            <TablineItem
              nativeButton={false}
              value="/settings/security"
              render={<Link to="/settings/security" />}
            >
              <ShieldIcon />
              Security
            </TablineItem>
            <TablineItem
              nativeButton={false}
              value="/settings/activity"
              render={<Link to="/settings/activity" />}
            >
              <ActivityIcon />
              Activity
            </TablineItem>
            <TablineItem
              nativeButton={false}
              value="/settings/advanced"
              render={<Link to="/settings/advanced" />}
            >
              <LockIcon />
              Advanced
            </TablineItem>
          </TablineList>
        </Tabline>
      </PageHeader>
      <Outlet />
    </>
  );
}
