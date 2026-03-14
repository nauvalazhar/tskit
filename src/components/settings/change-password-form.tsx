import { useRef, useState } from 'react';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldError, FieldLabel } from '@/components/selia/field';
import { Form } from '@/components/selia/form';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';
import { Alert } from '@/components/selia/alert';
import { CircleAlert } from 'lucide-react';

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    setPending(false);

    if (error) {
      setError(error.message || 'Failed to change password.');
      return;
    }

    toastManager.add({
      title: 'Password Changed',
      description: 'Your password has been changed successfully.',
      type: 'success',
    });

    formRef.current?.reset();
  };

  return (
    <Form ref={formRef} onSubmit={handleSubmit}>
      <Field>
        <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="Enter current password"
          required
        />
        <FieldError match="valueMissing">
          Current password is required
        </FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
        <Input
          ref={newPasswordRef}
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Enter new password"
          required
        />
        <FieldError match="valueMissing">New password is required</FieldError>
      </Field>
      <Field
        validationMode="onSubmit"
        validate={(value) => {
          const newPassword = newPasswordRef.current?.value;
          if (value !== newPassword) {
            return 'Passwords do not match';
          }
          return null;
        }}
      >
        <FieldLabel htmlFor="confirmNewPassword">
          Confirm New Password
        </FieldLabel>
        <Input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          placeholder="Confirm new password"
          required
        />
        <FieldError match="valueMissing">
          Please confirm your new password
        </FieldError>
        <FieldError match="customError" />
      </Field>
      {error && (
        <Alert variant="danger">
          <CircleAlert />
          {error}
        </Alert>
      )}
      <Button variant="primary" progress={pending} type="submit">
        Change Password
      </Button>
    </Form>
  );
}
