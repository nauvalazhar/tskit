import type { StorageDriver, UploadParams, StorageObject } from './types';

export abstract class BaseStorageDriver implements StorageDriver {
  abstract upload(params: UploadParams): Promise<StorageObject>;
  abstract getUrl(key: string, expiresIn?: number): Promise<string>;
  abstract getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
  abstract delete(key: string): Promise<void>;

  async deleteMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.delete(key)));
  }
}
