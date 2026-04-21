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
import { Alert, AlertDescription, AlertTitle } from '@/components/selia/alert';
import { Link } from '@tanstack/react-router';
import { Form } from '@/components/selia/form';
import { authClient } from '@/lib/auth-client';
import { CircleAlert, MailIcon } from 'lucide-react';

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);

      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: '/reset-password',
      });

      setPending(false);

      if (error) {
        setError(error.message || 'Something went wrong.');
        return;
      }

      setSubmitted(true);
    },
  });

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
                  If an account exists with that email, you'll receive a
                  password reset link shortly.
                </AlertDescription>
              </Alert>
              <Text className="text-center">
                <TextLink render={<Link to="/login">Back to Login</Link>} />
              </Text>
            </>
          ) : (
            <>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <form.Field
                  name="email"
                  validators={{
                    onSubmit: ({ value }) =>
                      !value
                        ? 'Email is required'
                        : !/\S+@\S+\.\S+/.test(value)
                          ? 'Please enter a valid email'
                          : undefined,
                    onChange: ({ value }) =>
                      !value
                        ? 'Email is required'
                        : !/\S+@\S+\.\S+/.test(value)
                          ? 'Please enter a valid email'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
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
                  Send Reset Instructions
                </Button>
              </Form>
              <Text className="text-center">
                <TextLink render={<Link to="/login">Back to Login</Link>} />
              </Text>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
