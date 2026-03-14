import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { Button } from '@/components/selia/button';
import { IconBox } from '@/components/selia/icon-box';
import { TriangleAlert } from 'lucide-react';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { DevErrorOverlay } from './dev-error-overlay';

export function ErrorBoundary({ error, reset }: ErrorComponentProps) {
  if (import.meta.env.DEV) {
    return <DevErrorOverlay error={error} reset={reset} />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <IconBox variant="danger-subtle" size="lg">
        <TriangleAlert />
      </IconBox>
      <div className="flex flex-col items-center gap-1 text-center">
        <Heading level={2} size="md">
          Something went wrong
        </Heading>
        <Text className="text-muted max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </Text>
      </div>
      <Button variant="secondary" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
