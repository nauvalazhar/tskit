import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/selia/field';
import { Input } from '@/components/selia/input';
import { Button } from '@/components/selia/button';
import { Form } from '@/components/selia/form';
import { useRouter } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';

export function ProfileForm({
  defaultName,
  email,
}: {
  defaultName: string;
  email: string;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: { name: defaultName },
    onSubmit: async ({ value }) => {
      setPending(true);

      const { error } = await authClient.updateUser({ name: value.name });

      setPending(false);

      if (error) {
        toastManager.add({
          title: 'Update Failed',
          description: error.message || 'Failed to update profile.',
          type: 'error',
        });
        return;
      }

      toastManager.add({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        type: 'success',
      });

      router.invalidate();
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
        name="name"
        validators={{
          onSubmit: ({ value }) =>
            !value ? 'Please enter your name.' : undefined,
          onChange: ({ value }) =>
            !value ? 'Please enter your name.' : undefined,
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
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
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" defaultValue={email} disabled />
        <FieldDescription>Email cannot be changed.</FieldDescription>
      </Field>
      <Button variant="primary" progress={pending} type="submit">
        Save Changes
      </Button>
    </Form>
  );
}
