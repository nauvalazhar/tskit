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
import { CreditCardIcon, HomeIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function AppSidebar() {
  return (
    <Sidebar>
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
    </Sidebar>
  );
}
