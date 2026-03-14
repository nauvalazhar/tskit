import { useState } from 'react';
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

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    if (useBackupCode) {
      const { error } = await authClient.twoFactor.verifyBackupCode({
        code,
      });

      setPending(false);

      if (error) {
        setError(error.message || 'Invalid backup code.');
        return;
      }
    } else {
      const { error } = await authClient.twoFactor.verifyTotp({
        code,
      });

      setPending(false);

      if (error) {
        setError(error.message || 'Invalid verification code.');
        return;
      }
    }

    router.navigate({ to: '/dashboard' });
  };

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
          <Form onSubmit={handleVerify}>
            <Field>
              <FieldLabel htmlFor="2fa-code">
                {useBackupCode ? 'Backup Code' : 'Verification Code'}
              </FieldLabel>
              <Input
                id="2fa-code"
                name="code"
                type="text"
                inputMode={useBackupCode ? 'text' : 'numeric'}
                pattern={useBackupCode ? undefined : '[0-9]{6}'}
                maxLength={useBackupCode ? undefined : 6}
                placeholder={useBackupCode ? 'Enter backup code' : '000000'}
                autoComplete="one-time-code"
                required
              />
              <FieldError match="valueMissing">Code is required</FieldError>
              {!useBackupCode && (
                <FieldError match="patternMismatch">
                  Enter a 6-digit code
                </FieldError>
              )}
            </Field>
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
