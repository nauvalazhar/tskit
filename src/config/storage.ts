import { z } from 'zod';
import { storageDriverConfigSchema } from '@/core/drivers/storage/types';

const storageChannelsSchema = z.object({
  public: storageDriverConfigSchema,
  private: storageDriverConfigSchema,
});

const storageConfigSchema = z.object({
  default: storageChannelsSchema.keyof(),
  channels: storageChannelsSchema,
});

export const storageConfig = storageConfigSchema.parse({
  default: 'public',
  channels: {
    public: {
      driver: 's3',
      bucket: process.env.R2_BUCKET_NAME,
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      publicUrl: process.env.R2_PUBLIC_URL,
    },
    private: {
      driver: 's3',
      bucket: process.env.R2_PRIVATE_BUCKET_NAME || 'tskit-private',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    },
  },
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;
export type StorageChannel = keyof StorageConfig['channels'];
