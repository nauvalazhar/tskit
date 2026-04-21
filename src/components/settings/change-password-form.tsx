import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
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

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);

      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
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

      form.reset();
    },
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="currentPassword"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Current password is required' : undefined,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((err, i) => (
              <FieldError key={i}>{err}</FieldError>
            ))}
          </Field>
        )}
      </form.Field>
      <form.Field
        name="newPassword"
        validators={{
          onChange: ({ value }) =>
            !value ? 'New password is required' : undefined,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((err, i) => (
              <FieldError key={i}>{err}</FieldError>
            ))}
          </Field>
        )}
      </form.Field>
      <form.Field
        name="confirmNewPassword"
        validators={{
          onChange: ({ value }) => {
            if (!value) return 'Please confirm your new password';
            if (value !== form.getFieldValue('newPassword'))
              return 'Passwords do not match';
            return undefined;
          },
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor="confirmNewPassword">
              Confirm New Password
            </FieldLabel>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="Confirm new password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((err, i) => (
              <FieldError key={i}>{err}</FieldError>
            ))}
          </Field>
        )}
      </form.Field>
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
