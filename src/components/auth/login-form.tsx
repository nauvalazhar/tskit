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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setPending(false);

    if (error) {
      if (error.status === 302 || error.code === 'TWO_FACTOR_REQUIRED') {
        router.navigate({
          to: '/verify-2fa',
        });
        return;
      }

      setError(error.message || 'Invalid email or password.');
      return;
    }

    router.navigate({ to: '/dashboard' });
  };

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
          <Form onSubmit={handleLogin}>
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
              <FieldError match="valueMissing">Email is required</FieldError>
            </Field>
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
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
              <FieldError match="valueMissing">Password is required</FieldError>
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
