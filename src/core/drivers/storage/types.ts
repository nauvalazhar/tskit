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

interface StorageDriverConfigBase {
  bucket: string;
  publicUrl?: string;
  prefix?: string;
}

export interface S3StorageDriverConfig extends StorageDriverConfigBase {
  driver: 's3';
  endpoint: string;
  region?: string;
  credentials: { accessKeyId: string; secretAccessKey: string };
}

export type StorageDriverConfig = S3StorageDriverConfig;

export interface StorageDriver {
  upload(params: UploadParams): Promise<StorageObject>;
  getUrl(key: string, expiresIn?: number): Promise<string>;
  getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
}
