import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemAction,
} from '@/components/selia/item';
import { PageHeader } from '@/components/shared/page-header';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  UserIcon,
  ShieldIcon,
  Settings2Icon,
  ChevronRightIcon,
} from 'lucide-react';

export const Route = createFileRoute('/_app/dashboard')({
  loader: async ({ context }) => {
    return {
      user: context.session?.user || null,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useLoaderData();

  return (
    <>
      <PageHeader>
        <Heading>Welcome back, {user?.name || 'there'}!</Heading>
        <Text className="text-muted mt-1">
          Here's an overview of your account.
        </Text>
      </PageHeader>
      <div className="flex gap-3 *:flex-1">
        <Item render={<Link to="/settings" />}>
          <ItemMedia>
            <UserIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Profile</ItemTitle>
            <ItemDescription>
              Update your name and profile information.
            </ItemDescription>
          </ItemContent>
          <ItemAction>
            <ChevronRightIcon />
          </ItemAction>
        </Item>
        <Item render={<Link to="/settings/security" />}>
          <ItemMedia>
            <ShieldIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Security</ItemTitle>
            <ItemDescription>
              Manage your password and security settings.
            </ItemDescription>
          </ItemContent>
          <ItemAction>
            <ChevronRightIcon />
          </ItemAction>
        </Item>
        <Item render={<Link to="/settings/preferences" />}>
          <ItemMedia>
            <Settings2Icon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Preferences</ItemTitle>
            <ItemDescription>
              Customize your app appearance and preferences.
            </ItemDescription>
          </ItemContent>
          <ItemAction>
            <ChevronRightIcon />
          </ItemAction>
        </Item>
      </div>
    </>
  );
}
