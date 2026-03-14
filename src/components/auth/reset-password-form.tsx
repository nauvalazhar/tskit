import { useRef, useState } from 'react';
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
import { Link, useRouter } from '@tanstack/react-router';
import { Form } from '@/components/selia/form';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';
import { Alert } from '@/components/selia/alert';
import { CircleAlert } from 'lucide-react';

export function ResetPasswordForm({ token }: { token?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!token) {
    return (
      <div className="w-full lg:h-screen flex items-center justify-center p-4">
        <Card className="w-full lg:w-5/12 xl:w-md">
          <CardHeader align="center">
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <Text className="text-center">
              <TextLink render={<Link to="/forgot-password" />}>
                Request a new reset link
              </TextLink>
            </Text>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('password') as string;

    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    setPending(false);

    if (error) {
      setError(error.message || 'Failed to reset password.');
      return;
    }

    toastManager.add({
      title: 'Password Reset',
      description: 'Your password has been reset successfully.',
      type: 'success',
    });

    router.navigate({ to: '/login' });
  };

  return (
    <div className="w-full lg:h-screen flex items-center justify-center p-4">
      <Form onSubmit={handleResetPassword}>
        <Card className="w-full lg:w-5/12 xl:w-md">
          <CardHeader align="center">
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                required
              />
              <FieldError match="valueMissing">
                Password is required
              </FieldError>
            </Field>
            <Field
              validationMode="onSubmit"
              validate={(value) => {
                const password = passwordRef.current?.value;
                if (value !== password) {
                  return 'Passwords do not match';
                }
                return null;
              }}
            >
              <FieldLabel htmlFor="confirmPassword">
                Confirm New Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                required
              />
              <FieldError match="valueMissing">
                Please confirm your password
              </FieldError>
              <FieldError match="customError" />
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
              Reset Password
            </Button>
            <Text className="text-center">
              <TextLink render={<Link to="/login">Back to Login</Link>} />
            </Text>
          </CardBody>
        </Card>
      </Form>
    </div>
  );
}
