import { useState } from 'react';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldLabel } from '@/components/selia/field';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from '@/components/selia/alert-dialog';
import { toastManager } from '@/components/selia/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { deleteTeam, setActiveTeam } from '@/functions/team';

export function TeamDelete({
  organizationId,
  teamName,
  isOnlyTeam,
  teams,
}: {
  organizationId: string;
  teamName: string;
  isOnlyTeam: boolean;
  teams: { id: string; name: string }[];
}) {
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleDelete = async () => {
    if (isOnlyTeam) return;
    setPending(true);

    try {
      // Switch to another team before deleting
      const otherTeam = teams.find((t) => t.id !== organizationId);
      if (otherTeam) {
        await setActiveTeam({ data: { organizationId: otherTeam.id } });
      }

      await deleteTeam({ data: { organizationId } });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toastManager.add({
        title: 'Team deleted',
        description: `${teamName} has been permanently deleted.`,
        type: 'success',
      });
      await router.invalidate();
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      toastManager.add({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete team.',
        type: 'error',
      });
      setPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="danger" disabled={isOnlyTeam}>
            Delete team
          </Button>
        }
      />
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {teamName}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody className="flex flex-col gap-4">
          <AlertDialogDescription>
            This will permanently delete the team, remove all members, and cancel
            all pending invitations. This action cannot be undone.
          </AlertDialogDescription>
          <Field>
            <FieldLabel htmlFor="deleteTeamConfirmation">
              Type DELETE to confirm
            </FieldLabel>
            <Input
              id="deleteTeamConfirmation"
              type="text"
              placeholder='Type "DELETE"'
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </Field>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose>Cancel</AlertDialogClose>
          <Button
            variant="danger"
            onClick={handleDelete}
            progress={pending}
            disabled={confirmation !== 'DELETE'}
          >
            Delete team
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
