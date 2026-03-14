import type { ReactNode } from 'react';
import { useEmailVerified } from '@/hooks/use-email-verified';

export function RequireEmailVerification({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isVerified, isLoading } = useEmailVerified();

  if (isLoading) {
    return null;
  }

  if (!isVerified) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
