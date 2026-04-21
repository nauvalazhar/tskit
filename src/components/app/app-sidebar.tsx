import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useRouteContext } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarItemButton,
  SidebarList,
  SidebarLogo,
  SidebarMenu,
} from '@/components/selia/sidebar';
import {
  ChevronsUpDownIcon,
  CheckIcon,
  CreditCardIcon,
  HomeIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import {
  Menu,
  MenuPopup,
  MenuItem,
  MenuTrigger,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
} from '@/components/selia/menu';
import { authClient } from '@/lib/auth-client';
import { setActiveTeam } from '@/functions/team';
import { teamListQuery } from '@/queries/team.queries';
import { UserAvatar } from '../shared/user-avatar';
import { CreateTeamDialog } from './create-team-dialog';
import { Link } from '@tanstack/react-router';

export function AppSidebar() {
  return (
    <Sidebar className="lg:w-64">
      <SidebarHeader>
        <SidebarLogo>
          <img
            src="https://selia.earth/selia.png"
            alt="Selia"
            className="size-8"
          />
          <span className="font-semibold">{import.meta.env.VITE_APP_NAME}</span>
        </SidebarLogo>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton render={<Link to="/dashboard" />}>
                  <HomeIcon />
                  Dashboard
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton render={<Link to="/billing" />}>
                  <CreditCardIcon />
                  Billing
                </SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarList>
            <SidebarItem>
              <UserMenu />
            </SidebarItem>
          </SidebarList>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function UserMenu() {
  const { data: session, error } = authClient.useSession();
  const { activeOrganization } = useRouteContext({ from: '__root__' });
  const { data: orgs } = useQuery(teamListQuery());
  const queryClient = useQueryClient();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  if (!session || error) {
    return null;
  }

  const user = session.user;

  const handleSwitch = async (orgId: string) => {
    await setActiveTeam({ data: { organizationId: orgId } });
    queryClient.invalidateQueries({ queryKey: ['teams'] });
    await router.invalidate();
  };

  return (
    <>
      <Menu>
        <MenuTrigger
          data-slot="sidebar-item-button"
          render={
            <SidebarItemButton>
              <UserAvatar name={user.name} image={user.image || ''} />
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-muted truncate">
                  {activeOrganization?.name ?? 'No team'}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto shrink-0" />
            </SidebarItemButton>
          }
        />
        <MenuPopup className="w-(--anchor-width)" side="top">
          <MenuItem render={<Link to="/settings" />}>
            <UserIcon />
            Profile
          </MenuItem>
          <MenuItem render={<Link to="/settings" />}>
            <SettingsIcon />
            Settings
          </MenuItem>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Team</MenuGroupLabel>
            {orgs?.map((org) => (
              <MenuItem
                key={org.id}
                onClick={() => handleSwitch(org.id)}
                className="justify-between"
              >
                <span className="truncate">{org.name}</span>
                {org.id === activeOrganization?.id && (
                  <CheckIcon className="size-4 text-primary shrink-0" />
                )}
              </MenuItem>
            ))}
            <MenuItem onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-4" />
              Create team
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem
            onClick={async () => {
              await authClient.signOut();
              window.location.href = '/login';
            }}
          >
            <LogOutIcon />
            Logout
          </MenuItem>
        </MenuPopup>
      </Menu>

      <CreateTeamDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
