import { Link } from '@tanstack/react-router';
import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { Button } from '@/components/selia/button';
import { IconBox } from '@/components/selia/icon-box';
import { FileQuestion } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <IconBox variant="danger-subtle" size="lg">
        <FileQuestion />
      </IconBox>
      <div className="flex flex-col items-center gap-1 text-center">
        <Heading level={2} size="md">
          Page not found
        </Heading>
        <Text className="text-muted max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </Text>
      </div>
      <Button variant="secondary" size="sm" render={<Link to="/dashboard" />}>
        Go to dashboard
      </Button>
    </div>
  );
}
