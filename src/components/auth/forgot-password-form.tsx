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
import { Alert, AlertDescription, AlertTitle } from '@/components/selia/alert';
import { Link } from '@tanstack/react-router';
import { Form } from '@/components/selia/form';
import { authClient } from '@/lib/auth-client';
import { CircleAlert, MailIcon } from 'lucide-react';

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    });

    setPending(false);

    if (error) {
      setError(error.message || 'Something went wrong.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="w-full lg:h-screen flex items-center justify-center p-4">
      <Card className="w-full lg:w-5/12 xl:w-md">
        <CardHeader align="center">
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive password reset instructions.
          </CardDescription>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          {submitted ? (
            <>
              <Alert variant="success">
                <MailIcon />
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>
                  If an account exists with that email, you'll receive a password
                  reset link shortly.
                </AlertDescription>
              </Alert>
              <Text className="text-center">
                <TextLink
                  render={<Link to="/login">Back to Login</Link>}
                />
              </Text>
            </>
          ) : (
            <>
              <Form onSubmit={handleForgotPassword}>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                  <FieldError match="typeMismatch">
                    Please enter a valid email
                  </FieldError>
                  <FieldError match="valueMissing">
                    Email is required
                  </FieldError>
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
                  Send Reset Instructions
                </Button>
              </Form>
              <Text className="text-center">
                <TextLink
                  render={<Link to="/login">Back to Login</Link>}
                />
              </Text>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
