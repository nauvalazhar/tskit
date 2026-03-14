import { authClient } from '@/lib/auth-client';

export function useEmailVerified() {
  const { data: session, isPending } = authClient.useSession();

  return {
    isVerified: session?.user?.emailVerified ?? false,
    isLoading: isPending,
  };
}
