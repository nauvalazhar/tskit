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
  ArrowLeftIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UsersIcon,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function AdminSidebar() {
  return (
    <Sidebar className="lg:w-64">
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
            </SidebarList>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarList>
            <SidebarItem>
              <SidebarItemButton render={<Link to="/dashboard" />}>
                <ArrowLeftIcon />
                Back to App
              </SidebarItemButton>
            </SidebarItem>
          </SidebarList>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
