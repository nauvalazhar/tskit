import { createServerFn } from '@tanstack/react-start';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/database';
import { userSettings } from '@/database/schemas/settings';
import { authMiddleware } from '@/middleware/auth';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';
import { audit } from '@/lib/audit';

const defaultRateLimit = createRateLimitMiddleware('default');

export const getUserSettings = createServerFn()
  .middleware([authMiddleware])
  .inputValidator(z.object({ keys: z.array(z.string().min(1)).max(50).optional() }).optional())
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
  .middleware([defaultRateLimit, authMiddleware])
  .inputValidator(z.object({ key: z.string().min(1), value: z.string() }))
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

    const SILENT_KEYS = ['sidebar'];
    if (!SILENT_KEYS.includes(data.key)) {
      await audit.log({
        actorId: context.user.id,
        action: 'settings.profile.updated',
        metadata: { key: data.key },
      });
    }
  });
