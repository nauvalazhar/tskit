import { useState } from 'react';
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
  const [name, setName] = useState(defaultName);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    const { error } = await authClient.updateUser({ name });

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
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FieldError match="valueMissing">Please enter your name.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email"
          defaultValue={email}
          disabled
        />
        <FieldDescription>Email cannot be changed.</FieldDescription>
      </Field>
      <Button variant="primary" progress={pending} type="submit">
        Save Changes
      </Button>
    </Form>
  );
}
