import { useState } from 'react';
import { useRouter, useRouteContext, Link } from '@tanstack/react-router';
import {
  ChevronsUpDownIcon,
  CheckIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
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
import { Button } from '@/components/selia/button';
import { authClient } from '@/lib/auth-client';
import { setActiveTeam } from '@/functions/team';
import { UserAvatar } from './user-avatar';
import { CreateTeamDialog } from '../app/create-team-dialog';

export function UserMenu() {
  const { data: session, error } = authClient.useSession();
  const { activeOrganization, teams: orgs } = useRouteContext({ from: '__root__' });
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  if (!session || error) {
    return null;
  }

  const user = session.user;
  const isAdmin = user.role === 'admin';

  const handleSwitch = async (orgId: string) => {
    await setActiveTeam({ data: { organizationId: orgId } });
    await router.invalidate();
  };

  return (
    <>
      <Menu>
        <MenuTrigger
          render={
            <Button variant="plain" size="sm" className="gap-2" pill>
              <UserAvatar name={user.name} image={user.image || ''} size="sm" />
              <span className="font-medium max-sm:hidden">{user.name}</span>
              <ChevronsUpDownIcon className="size-3.5 text-muted" />
            </Button>
          }
        />
        <MenuPopup side="bottom" align="end" className="min-w-56">
          <MenuItem render={<Link to="/settings" />}>
            <UserIcon />
            Profile
          </MenuItem>
          <MenuItem render={<Link to="/settings" />}>
            <SettingsIcon />
            Settings
          </MenuItem>
          {isAdmin && (
            <>
              <MenuSeparator />
              <MenuItem render={<Link to="/admin" />}>
                <ShieldIcon />
                Admin
              </MenuItem>
            </>
          )}
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
