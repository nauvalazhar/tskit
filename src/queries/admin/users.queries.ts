import { queryOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import { getUsers, getUser } from '@/functions/admin/users';
import type { usersSearchSchema } from '@/validations/admin';

export function adminUsersQuery(params: z.infer<typeof usersSearchSchema>) {
  return queryOptions({
    queryKey: ['admin', 'users', params],
    queryFn: () => getUsers({ data: params }),
  });
}

export function adminUserQuery(userId: string) {
  return queryOptions({
    queryKey: ['admin', 'users', userId],
    queryFn: () => getUser({ data: { userId } }),
  });
}
