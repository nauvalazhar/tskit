import { z } from 'zod';
import { storageDriverConfigSchema } from '@/core/drivers/storage/types';
import { defineConfig } from '@/config/define-config';

const storageChannelsSchema = z.object({
  public: storageDriverConfigSchema,
  // private: storageDriverConfigSchema,
});

const storageConfigSchema = z.object({
  default: storageChannelsSchema.keyof(),
  channels: storageChannelsSchema,
});

export const storageConfig = defineConfig(storageConfigSchema, {
  default: 'public',
  channels: {
    public: {
      driver: 's3',
      bucket: process.env.S3_BUCKET,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      publicUrl: process.env.S3_PUBLIC_URL,
    },
    // private: {
    //   driver: 's3',
    //   bucket: process.env.S3_PRIVATE_BUCKET,
    //   endpoint: process.env.S3_ENDPOINT,
    //   credentials: {
    //     accessKeyId: process.env.S3_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    //   },
    // },
  },
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;
export type StorageChannel = keyof StorageConfig['channels'];
