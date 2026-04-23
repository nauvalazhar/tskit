import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';
import { adminMiddleware } from '@/middleware/admin';
import { usersSearchSchema } from '@/validations/admin';
import { listUsersAdmin, getUserAdmin } from '@/services/admin/users.service';
import { auth } from '@/lib/facades/auth';
import { audit } from '@/lib/audit';

const userId = z.uuid();

export const getUsers = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(usersSearchSchema)
  .handler(async ({ data }) => {
    return listUsersAdmin(data);
  });

export const getUser = createServerFn()
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId }))
  .handler(async ({ data }) => {
    return getUserAdmin(data.userId);
  });

export const adminBanUser = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId, banReason: z.string().optional() }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) throw new Error('Cannot ban yourself');
    const headers = await getRequestHeaders();
    await auth.api.banUser({ headers, body: { userId: data.userId, banReason: data.banReason } });

    await audit.log({
      actorId: context.user.id,
      action: 'admin.user.banned',
      targetType: 'user',
      targetId: data.userId,
      metadata: data.banReason ? { reason: data.banReason } : undefined,
    });
  });

export const adminUnbanUser = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) throw new Error('Cannot unban yourself');
    const headers = await getRequestHeaders();
    await auth.api.unbanUser({ headers, body: { userId: data.userId } });

    await audit.log({
      actorId: context.user.id,
      action: 'admin.user.unbanned',
      targetType: 'user',
      targetId: data.userId,
    });
  });

export const adminSetRole = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId, role: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) throw new Error('Cannot change your own role');
    const headers = await getRequestHeaders();
    await auth.api.setRole({ headers, body: { userId: data.userId, role: data.role as 'user' | 'admin' } });

    await audit.log({
      actorId: context.user.id,
      action: 'admin.user.role.changed',
      targetType: 'user',
      targetId: data.userId,
      metadata: { role: data.role },
    });
  });

export const adminRemoveUser = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ userId }))
  .handler(async ({ data, context }) => {
    if (data.userId === context.user.id) throw new Error('Cannot delete yourself');
    const headers = await getRequestHeaders();
    await auth.api.removeUser({ headers, body: { userId: data.userId } });

    await audit.log({
      actorId: context.user.id,
      action: 'admin.user.removed',
      targetType: 'user',
      targetId: data.userId,
    });
  });
