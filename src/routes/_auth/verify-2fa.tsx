import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/selia/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
} from '@/components/selia/card';
import { Input } from '@/components/selia/input';
import { Field, FieldError, FieldLabel } from '@/components/selia/field';
import { Text, TextLink } from '@/components/selia/text';
import { Form } from '@/components/selia/form';
import { createFileRoute } from '@tanstack/react-router';
import { Link, useRouter } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import { Alert } from '@/components/selia/alert';
import { CircleAlert } from 'lucide-react';

export const Route = createFileRoute('/_auth/verify-2fa')({
  component: RouteComponent,
});

function RouteComponent() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: { code: '' },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);

      if (useBackupCode) {
        const { error } = await authClient.twoFactor.verifyBackupCode({
          code: value.code,
        });

        setPending(false);

        if (error) {
          setError(error.message || 'Invalid backup code.');
          return;
        }
      } else {
        const { error } = await authClient.twoFactor.verifyTotp({
          code: value.code,
        });

        setPending(false);

        if (error) {
          setError(error.message || 'Invalid verification code.');
          return;
        }
      }

      router.navigate({ to: '/dashboard' });
    },
  });

  return (
    <div className="w-full lg:h-screen flex items-center justify-center p-4">
      <Card className="w-full lg:w-5/12 xl:w-md">
        <CardHeader align="center">
          <CardTitle>Two-Factor Verification</CardTitle>
          <CardDescription>
            {useBackupCode
              ? 'Enter one of your backup codes to sign in.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </CardDescription>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="code"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return 'Code is required';
                  if (!useBackupCode && !/^[0-9]{6}$/.test(value))
                    return 'Enter a 6-digit code';
                  return undefined;
                },
                onChange: ({ value }) => {
                  if (!value) return 'Code is required';
                  if (!useBackupCode && !/^[0-9]{6}$/.test(value))
                    return 'Enter a 6-digit code';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="2fa-code">
                    {useBackupCode ? 'Backup Code' : 'Verification Code'}
                  </FieldLabel>
                  <Input
                    id="2fa-code"
                    type="text"
                    inputMode={useBackupCode ? 'text' : 'numeric'}
                    maxLength={useBackupCode ? undefined : 6}
                    placeholder={useBackupCode ? 'Enter backup code' : '000000'}
                    autoComplete="one-time-code"
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
            <Button
              variant="primary"
              block
              size="lg"
              progress={pending}
              type="submit"
            >
              Verify
            </Button>
          </Form>
          <Text className="text-center">
            <TextLink
              render={
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setUseBackupCode(!useBackupCode);
                  }}
                />
              }
            >
              {useBackupCode
                ? 'Use authenticator app instead'
                : 'Use a backup code'}
            </TextLink>
          </Text>
          <Text className="text-center">
            <TextLink render={<Link to="/login">Back to Login</Link>} />
          </Text>
        </CardBody>
      </Card>
    </div>
  );
}
