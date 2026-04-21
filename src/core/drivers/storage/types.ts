import { z } from 'zod';

export interface UploadParams {
  buffer: Buffer | ArrayBuffer;
  key: string;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface StorageObject {
  key: string;
  url: string;
  size: number;
}

export const s3StorageDriverConfigSchema = z.object({
  driver: z.literal('s3'),
  bucket: z.string().min(1),
  endpoint: z.string().min(1),
  region: z.string().optional(),
  credentials: z.object({
    accessKeyId: z.string().min(1),
    secretAccessKey: z.string().min(1),
  }),
  publicUrl: z.string().optional(),
  prefix: z.string().optional(),
});
export const storageDriverConfigSchema = s3StorageDriverConfigSchema;

export type S3StorageDriverConfig = z.infer<typeof s3StorageDriverConfigSchema>;
export type StorageDriverConfig = z.infer<typeof storageDriverConfigSchema>;

export interface StorageDriver {
  upload(params: UploadParams): Promise<StorageObject>;
  getUrl(key: string, expiresIn?: number): Promise<string>;
  getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
}
