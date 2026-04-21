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
import { Link, useRouter } from '@tanstack/react-router';
import { Form } from '@/components/selia/form';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';
import { Alert } from '@/components/selia/alert';
import { CircleAlert } from 'lucide-react';

export function ResetPasswordForm({ token }: { token?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);

      const { error } = await authClient.resetPassword({
        newPassword: value.password,
        token: token!,
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
    },
  });

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

  return (
    <div className="w-full lg:h-screen flex items-center justify-center p-4">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Card className="w-full lg:w-5/12 xl:w-md">
          <CardHeader align="center">
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <form.Field
              name="password"
              validators={{
                onSubmit: ({ value }) =>
                  !value ? 'Password is required' : undefined,
                onChange: ({ value }) =>
                  !value ? 'Password is required' : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <Input
                    id="password"
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
              name="confirmPassword"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return 'Please confirm your password';
                  if (value !== form.getFieldValue('password'))
                    return 'Passwords do not match';
                  return undefined;
                },
                onChange: ({ value }) => {
                  if (!value) return 'Please confirm your password';
                  if (value !== form.getFieldValue('password'))
                    return 'Passwords do not match';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm New Password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
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
