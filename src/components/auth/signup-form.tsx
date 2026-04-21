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
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);

      const { error } = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
        callbackURL: '/dashboard',
      });

      setPending(false);

      if (error) {
        setError(error.message || 'An error occurred during sign up.');
        return;
      }

      toastManager.add({
        title: 'Account Created',
        description:
          'Welcome! Please check your email to verify your account.',
        type: 'success',
      });

      router.navigate({ to: '/dashboard' });
    },
  });

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
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Sign up with your email and password.
            </CardDescription>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <form.Field
              name="name"
              validators={{
                onSubmit: ({ value }) =>
                  !value ? 'Name is required' : undefined,
                onChange: ({ value }) =>
                  !value ? 'Name is required' : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    autoFocus
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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
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
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
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
              name="terms"
              validators={{
                onSubmit: ({ value }) =>
                  !value
                    ? 'You must agree to the terms and conditions'
                    : undefined,
                onChange: ({ value }) =>
                  !value
                    ? 'You must agree to the terms and conditions'
                    : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <Label htmlFor="terms">
                    <Checkbox
                      id="terms"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(!!checked)
                      }
                    />
                    <span>
                      I agree to the <TextLink>Terms and Conditions</TextLink>
                    </span>
                  </Label>
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
