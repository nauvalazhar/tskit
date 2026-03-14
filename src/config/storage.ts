import type { StorageDriverConfig } from '@/core/drivers/storage/types';

export interface StorageConfig {
  default: string;
  channels: Record<string, StorageDriverConfig>;
}

export const storageConfig: StorageConfig = {
  default: 'public',
  channels: {
    public: {
      driver: 's3',
      bucket: process.env.R2_BUCKET_NAME!,
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      publicUrl: process.env.R2_PUBLIC_URL,
    },
    private: {
      driver: 's3',
      bucket: process.env.R2_PRIVATE_BUCKET_NAME || 'tskit-private',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    },
  },
};
