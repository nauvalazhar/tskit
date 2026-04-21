import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { storage } from '@/lib/storage';
import { UPLOAD_ALLOWED_TYPES } from '@/lib/constants';
import { authMiddleware } from '@/middleware/auth';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';

const uploadRateLimit = createRateLimitMiddleware('upload');

export const getAvatarUploadUrl = createServerFn({ method: 'POST' })
  .middleware([uploadRateLimit, authMiddleware])
  .inputValidator(z.object({ contentType: z.string().min(1), fileName: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (!UPLOAD_ALLOWED_TYPES.includes(data.contentType)) {
      const types = UPLOAD_ALLOWED_TYPES.map((t) =>
        t.split('/')[1].toUpperCase(),
      ).join(', ');
      throw new Error(`Invalid file type. Allowed types: ${types}.`);
    }

    return storage.getPresignedUploadUrl(
      'avatars',
      data.contentType,
      data.fileName,
    );
  });

export const cleanupOldAvatar = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.object({ url: z.string().url() }))
  .handler(async ({ data }) => {
    if (data.url) {
      await storage.removeByUrl(data.url);
    }
  });

export const removeAvatar = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (context.user.image) {
      await storage.removeByUrl(context.user.image);
    }
  });
