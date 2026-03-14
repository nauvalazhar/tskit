import {
  Sidebar,
  SidebarCollapsible,
  SidebarCollapsiblePanel,
  SidebarCollapsibleTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupTitle,
  SidebarHeader,
  SidebarItem,
  SidebarItemButton,
  SidebarList,
  SidebarLogo,
  SidebarMenu,
  SidebarSubmenu,
} from '@/components/selia/sidebar';
import {
  ChartAreaIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  HomeIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  ShoppingBagIcon,
  TagsIcon,
  UserIcon,
} from 'lucide-react';
import {
  Menu,
  MenuPopup,
  MenuItem,
  MenuTrigger,
  MenuSeparator,
} from '@/components/selia/menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/selia/avatar';
import { authClient } from '@/lib/auth-client';
import { UserAvatar } from '../shared/user-avatar';
import { Link, useRouter } from '@tanstack/react-router';

export function AppSidebar() {
  return (
    <Sidebar className="lg:w-72">
      <SidebarHeader>
        <SidebarLogo>
          <img
            src="https://selia.earth/selia.png"
            alt="Selia"
            className="size-8"
          />
          <span className="font-semibold">Selia</span>
        </SidebarLogo>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupTitle>Navigation</SidebarGroupTitle>
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
  const router = useRouter();

  if (!session || error) {
    return null;
  }

  const user = session.user;

  return (
    <Menu>
      <MenuTrigger
        data-slot="sidebar-item-button"
        render={
          <SidebarItemButton>
            <UserAvatar name={user.name} image={user.image || ''} />
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-sm text-muted">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
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
        <MenuItem
          onClick={async () => {
            await authClient.signOut();
            // you can swap this with client-side navigation
            window.location.href = '/login';
          }}
        >
          <LogOutIcon />
          Logout
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
