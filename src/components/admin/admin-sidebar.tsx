import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarItemButton,
  SidebarList,
  SidebarLogo,
  SidebarMenu,
} from '@/components/selia/sidebar';
import {
  Building2Icon,
  CreditCardIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ScrollTextIcon,
  UsersIcon,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarLogo>
          <img
            src="https://selia.earth/selia.png"
            alt="Selia"
            className="size-8"
          />
          <span className="font-semibold">Admin</span>
        </SidebarLogo>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarList>
              <SidebarItem>
                <SidebarItemButton render={<Link to="/admin" />}>
                  <LayoutDashboardIcon />
                  Overview
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton render={<Link to="/admin/users" />}>
                  <UsersIcon />
                  Users
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton render={<Link to="/admin/teams" />}>
                  <Building2Icon />
                  Teams
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton render={<Link to="/admin/subscriptions" />}>
                  <CreditCardIcon />
                  Subscriptions
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton render={<Link to="/admin/plans" />}>
                  <PackageIcon />
                  Plans
                </SidebarItemButton>
              </SidebarItem>
              <SidebarItem>
                <SidebarItemButton render={<Link to="/admin/audit" />}>
                  <ScrollTextIcon />
                  Audit Log
                </SidebarItemButton>
              </SidebarItem>
            </SidebarList>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
