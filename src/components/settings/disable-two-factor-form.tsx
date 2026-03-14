import { useRef, useState } from 'react';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldError, FieldLabel } from '@/components/selia/field';
import { Form } from '@/components/selia/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/selia/alert';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';
import { TriangleAlert } from 'lucide-react';

export function DisableTwoFactorForm({ onSuccess }: { onSuccess: () => void }) {
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    const { error } = await authClient.twoFactor.disable({
      password,
    });

    setPending(false);

    if (error) {
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to disable 2FA.',
        type: 'error',
      });
      return;
    }

    toastManager.add({
      title: '2FA Disabled',
      description: 'Two-factor authentication has been disabled.',
      type: 'success',
    });

    onSuccess();
  };

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Disabling two-factor authentication will make your account less
          secure.
        </AlertDescription>
      </Alert>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <Field>
          <FieldLabel htmlFor="disable-2fa-password">Password</FieldLabel>
          <Input
            id="disable-2fa-password"
            name="password"
            type="password"
            placeholder="Enter your password to confirm"
            required
          />
          <FieldError match="valueMissing">Password is required</FieldError>
        </Field>
        <Button variant="danger" progress={pending} type="submit">
          Disable 2FA
        </Button>
      </Form>
    </div>
  );
}
