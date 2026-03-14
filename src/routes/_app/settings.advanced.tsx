import { useState } from 'react';
import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldError, FieldLabel } from '@/components/selia/field';
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
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';
import { listUserAccounts } from '@/functions/auth';

export const Route = createFileRoute('/_app/settings/advanced')({
  loader: async () => {
    const accounts = await listUserAccounts();
    const hasPassword =
      accounts?.some((account) => account.providerId === 'credential') ?? false;

    return { hasPassword };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasPassword } = Route.useLoaderData();
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    setPending(true);

    const { error } = await authClient.deleteUser({
      password: hasPassword ? confirmation : undefined,
    });

    if (error) {
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to delete account.',
        type: 'error',
      });
      setPending(false);
      return;
    }

    toastManager.add({
      title: 'Account Deleted',
      description: 'Your account has been permanently deleted.',
      type: 'success',
    });

    router.navigate({ to: '/login' });
  };

  const isConfirmed = hasPassword
    ? confirmation.length > 0
    : confirmation === 'DELETE';

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <Heading level={2} size="sm">
          Delete Account
        </Heading>
        <Text className="text-muted mt-1">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </Text>
      </div>
      <div>
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="danger">Delete Account</Button>}
          />
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogBody className="flex flex-col gap-4">
              <AlertDialogDescription>
                This will permanently delete your account, all your data, and
                log you out. This action cannot be undone.
              </AlertDialogDescription>
              {hasPassword ? (
                <Field>
                  <FieldLabel htmlFor="deletePassword">
                    Enter your password to confirm
                  </FieldLabel>
                  <Input
                    id="deletePassword"
                    type="password"
                    placeholder="Enter your password"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                  />
                  <FieldError match="valueMissing">
                    Password is required
                  </FieldError>
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="deleteConfirmation">
                    Type DELETE to confirm
                  </FieldLabel>
                  <Input
                    id="deleteConfirmation"
                    type="text"
                    placeholder='Type "DELETE"'
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                  />
                </Field>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogClose>Cancel</AlertDialogClose>
              <Button
                variant="danger"
                onClick={handleDelete}
                progress={pending}
                disabled={!isConfirmed}
              >
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>
      </div>
    </div>
  );
}
