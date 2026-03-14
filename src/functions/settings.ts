import { createServerFn } from '@tanstack/react-start';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '@/database';
import { userSettings } from '@/database/schemas/settings';
import { authMiddleware } from '@/middleware/auth';

export const getUserSettings = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((data?: { keys?: string[] }) => data)
  .handler(async ({ data, context }) => {
    const conditions = [eq(userSettings.userId, context.user.id)];

    if (data?.keys?.length) {
      conditions.push(inArray(userSettings.key, data.keys));
    }

    const rows = await db.select().from(userSettings).where(and(...conditions));

    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<
      string,
      string
    >;
  });

export const updateUserSetting = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { key: string; value: string }) => data)
  .handler(async ({ data, context }) => {
    await db
      .insert(userSettings)
      .values({
        userId: context.user.id,
        key: data.key,
        value: data.value,
      })
      .onConflictDoUpdate({
        target: [userSettings.userId, userSettings.key],
        set: { value: data.value },
      });
  });
