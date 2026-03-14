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
import { Checkbox } from '@/components/selia/checkbox';
import { Label } from '@/components/selia/label';
import { Link, useRouter } from '@tanstack/react-router';
import { Form } from '@/components/selia/form';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';
import { Alert } from '@/components/selia/alert';
import { CircleAlert } from 'lucide-react';

export function SignUpForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: '/dashboard',
    });

    setPending(false);

    if (error) {
      setError(error.message || 'An error occurred during sign up.');
      return;
    }

    toastManager.add({
      title: 'Account Created',
      description: 'Welcome! Please check your email to verify your account.',
      type: 'success',
    });

    router.navigate({ to: '/dashboard' });
  };

  return (
    <div className="w-full lg:h-screen flex items-center justify-center p-4">
      <Form onSubmit={handleSignUp}>
        <Card className="w-full lg:w-5/12 xl:w-md">
          <CardHeader align="center">
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Sign up with your email and password.
            </CardDescription>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                required
                autoFocus
              />
              <FieldError match="badInput">
                Please enter a valid name
              </FieldError>
              <FieldError match="valueMissing">Name is required</FieldError>
            </Field>
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
              </div>
              <Input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
              <FieldError match="valueMissing">Password is required</FieldError>
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
              <div className="flex items-center">
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
              </div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
              />
              <FieldError match="valueMissing">
                Please confirm your password
              </FieldError>
              <FieldError match="customError" />
            </Field>
            <Field>
              <Label htmlFor="terms">
                <Checkbox id="terms" required />
                <span>
                  I agree to the <TextLink>Terms and Conditions</TextLink>
                </span>
              </Label>
              <FieldError match="valueMissing">
                You must agree to the terms and conditions
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
              Sign Up
            </Button>
            <Text className="text-center">
              Already have an account?{' '}
              <TextLink render={<Link to="/login" />}>Sign in</TextLink>
            </Text>
          </CardBody>
        </Card>
      </Form>
    </div>
  );
}
