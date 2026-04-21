import { useRouter } from '@tanstack/react-router';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import {
  Menu,
  MenuPopup,
  MenuItem,
  MenuTrigger,
  MenuSeparator,
} from '@/components/selia/menu';
import { UserAvatar } from '@/components/shared/user-avatar';
import { toastManager } from '@/components/selia/toast';
import { removeMember, updateMemberRole } from '@/functions/team';
import type { TeamMember } from '@/validations/team';
import { EllipsisIcon } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

const ROLE_VARIANTS: Record<string, 'primary' | 'secondary' | 'info'> = {
  owner: 'primary',
  admin: 'info',
  member: 'secondary',
};

export function TeamMembersList({
  members,
  currentUserId,
  currentUserRole,
}: {
  members: TeamMember[];
  currentUserId: string;
  currentUserRole: string;
}) {
  const router = useRouter();
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleRemove = async (memberIdOrEmail: string) => {
    try {
      await removeMember({ data: { memberIdOrEmail } });
      await router.invalidate();
      toastManager.add({
        title: 'Member removed',
        type: 'success',
      });
    } catch (err) {
      toastManager.add({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to remove member.',
        type: 'error',
      });
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      await updateMemberRole({
        data: { memberId, role: role as 'owner' | 'admin' | 'member' },
      });
      await router.invalidate();
      toastManager.add({
        title: 'Role updated',
        type: 'success',
      });
    } catch (err) {
      toastManager.add({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to update role.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex flex-col divide-y divide-card-border">
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId;
        const isOwner = member.role === 'owner';

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <UserAvatar
              name={member.user.name}
              image={member.user.image || undefined}
            />
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="font-medium truncate">
                {member.user.name}
                {isCurrentUser && (
                  <span className="text-muted ml-1">(you)</span>
                )}
              </span>
              <span className="text-muted truncate">{member.user.email}</span>
            </div>
            <Badge variant={ROLE_VARIANTS[member.role] ?? 'secondary'}>
              {ROLE_LABELS[member.role] ?? member.role}
            </Badge>
            {canManage && !isCurrentUser && !isOwner && (
              <Menu>
                <MenuTrigger
                  render={
                    <Button variant="plain">
                      <EllipsisIcon className="size-4" />
                    </Button>
                  }
                />
                <MenuPopup side="bottom" align="end">
                  {currentUserRole === 'owner' && (
                    <>
                      <MenuItem
                        onClick={() =>
                          handleRoleChange(
                            member.id,
                            member.role === 'admin' ? 'member' : 'admin',
                          )
                        }
                      >
                        {member.role === 'admin'
                          ? 'Demote to member'
                          : 'Promote to admin'}
                      </MenuItem>
                      <MenuSeparator />
                    </>
                  )}
                  <MenuItem onClick={() => handleRemove(member.id)}>
                    Remove from team
                  </MenuItem>
                </MenuPopup>
              </Menu>
            )}
          </div>
        );
      })}
    </div>
  );
}
