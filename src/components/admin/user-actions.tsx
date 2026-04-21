import { useState } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  Card,
  CardBody,
  CardSubsection,
  CardSubsectionTitle,
  CardSubsectionDescription,
} from '@/components/selia/card';
import { Button } from '@/components/selia/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem,
} from '@/components/selia/select';
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from '@/components/selia/alert-dialog';
import {
  adminBanUser,
  adminUnbanUser,
  adminSetRole,
  adminRemoveUser,
} from '@/functions/admin';
import { adminUserQuery } from '@/queries/admin.queries';
import { toastManager } from '@/components/selia/toast';
import { Strong } from '@/components/selia/text';
import { authClient } from '@/lib/auth-client';

const routeApi = getRouteApi('/admin/users/$userId');

const roles = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

export function UserActions() {
  const { userId } = routeApi.useParams();
  const user = useSuspenseQuery(adminUserQuery(userId)).data!;
  const { data: session } = authClient.useSession();
  const isSelf = session?.user.id === user.id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [role, setRole] = useState(user.role || 'user');
  const [banOpen, setBanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  if (isSelf) return null;

  async function handleBanToggle() {
    try {
      if (user.banned) {
        await adminUnbanUser({ data: { userId: user.id } });
      } else {
        await adminBanUser({ data: { userId: user.id } });
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setBanOpen(false);
    } catch (e) {
      toastManager.add({
        title: 'Error',
        description:
          e instanceof Error
            ? e.message
            : `Failed to ${user.banned ? 'unban' : 'ban'} user.`,
        type: 'error',
      });
    }
  }

  async function handleRoleSave() {
    setSavingRole(true);
    try {
      await adminSetRole({ data: { userId: user.id, role } });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (e) {
      toastManager.add({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to update role.',
        type: 'error',
      });
    } finally {
      setSavingRole(false);
    }
  }

  async function handleDelete() {
    try {
      await adminRemoveUser({ data: { userId: user.id } });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteOpen(false);
      navigate({ to: '/admin/users' });
    } catch (e) {
      toastManager.add({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to delete user.',
        type: 'error',
      });
    }
  }

  return (
    <>
      <Card>
        <CardBody>
          <CardSubsection>
            <CardSubsectionTitle>Role</CardSubsectionTitle>
            <CardSubsectionDescription>
              Change the user's permission level
            </CardSubsectionDescription>
          </CardSubsection>
          <div className="flex items-center gap-3">
            <div className="w-48">
              <Select
                value={roles.find((r) => r.value === role)}
                onValueChange={(v) =>
                  setRole((v as (typeof roles)[number]).value)
                }
                items={roles}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  <SelectList>
                    {roles.map((item) => (
                      <SelectItem key={item.value} value={item}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectList>
                </SelectPopup>
              </Select>
            </div>
            <Button
              onClick={handleRoleSave}
              progress={savingRole}
              disabled={role === (user.role || 'user')}
            >
              Save Role
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardSubsection>
            <CardSubsectionTitle>Danger Zone</CardSubsectionTitle>
            <CardSubsectionDescription>
              Irreversible actions that affect user access
            </CardSubsectionDescription>
          </CardSubsection>
          <div className="divide-y divide-separator">
            <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium">
                  {user.banned ? 'Unban User' : 'Ban User'}
                </p>
                <p className="text-muted text-sm">
                  {user.banned
                    ? 'Restore access so this user can sign in again.'
                    : 'Prevent this user from signing in.'}
                </p>
              </div>
              <Button
                variant={user.banned ? 'outline' : 'danger-light'}
                onClick={() => setBanOpen(true)}
              >
                {user.banned ? 'Unban' : 'Ban'}
              </Button>
            </div>
            <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium">Delete User</p>
                <p className="text-muted text-sm">
                  Permanently remove this user and all their data.
                </p>
              </div>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <AlertDialog open={banOpen} onOpenChange={setBanOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.banned ? 'Unban' : 'Ban'} User
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to {user.banned ? 'unban' : 'ban'}{' '}
              <Strong>{user.name}</Strong>?
              {!user.banned && ' They will no longer be able to sign in.'}
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <Button
              variant={user.banned ? 'primary' : 'danger'}
              onClick={handleBanToggle}
            >
              {user.banned ? 'Unban' : 'Ban'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{' '}
              <Strong>{user.name}</Strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  );
}
