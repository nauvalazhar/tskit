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
import { Divider } from '@/components/selia/divider';
import { Link, useRouter } from '@tanstack/react-router';
import { Form } from '@/components/selia/form';
import { LoginGithubButton } from '@/components/auth/login-github-button';
import { LoginGoogleButton } from '@/components/auth/login-google-button';
import { authClient } from '@/lib/auth-client';
import { Alert } from '@/components/selia/alert';
import { CircleAlert } from 'lucide-react';

export function LoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);

      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      setPending(false);

      if (error) {
        if (error.status === 302 || error.code === 'TWO_FACTOR_REQUIRED') {
          router.navigate({ to: '/verify-2fa' });
          return;
        }
        setError(error.message || 'Invalid email or password.');
        return;
      }

      router.navigate({ to: '/dashboard' });
    },
  });

  return (
    <div className="w-full lg:h-screen flex items-center justify-center p-4">
      <Card className="w-full lg:w-5/12 xl:w-md">
        <CardHeader align="center">
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Login with your Google or GitHub account
          </CardDescription>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <LoginGoogleButton />
            <LoginGithubButton />
          </div>
          <Divider variant="center" className="my-2">
            Or continue with email
          </Divider>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="email"
              validators={{
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
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Password is required' : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <TextLink
                      className="ml-auto"
                      render={<Link to="/forgot-password" />}
                    >
                      Forgot password?
                    </TextLink>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
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
              Sign In
            </Button>
          </Form>
          <Text className="text-center">
            Don't have an account?{' '}
            <TextLink render={<Link to="/register">Sign up</Link>} />
          </Text>
        </CardBody>
      </Card>
    </div>
  );
}
