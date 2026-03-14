import { storageConfig } from '@/config/storage';
import { createStorageDriver } from '@/core/drivers/storage';
import type { StorageDriver, StorageObject } from '@/core/drivers/storage/types';

class Storage {
  private drivers = new Map<string, StorageDriver>();
  private channel: string | undefined;

  private resolve(): StorageDriver {
    const name = this.channel || storageConfig.default;
    if (!this.drivers.has(name)) {
      const config = storageConfig.channels[name];
      if (!config) throw new Error(`Storage channel "${name}" not configured`);
      this.drivers.set(name, createStorageDriver(config));
    }
    return this.drivers.get(name)!;
  }

  use(name: string): Storage {
    const scoped = new Storage();
    scoped.drivers = this.drivers;
    scoped.channel = name;
    return scoped;
  }

  async upload(
    scope: string,
    file: { buffer: Buffer | ArrayBuffer; contentType: string; name: string },
  ): Promise<StorageObject> {
    const ext = file.name.split('.').pop() || 'bin';
    const key = `${scope}/${crypto.randomUUID()}.${ext}`;

    return this.resolve().upload({
      buffer: file.buffer,
      key,
      contentType: file.contentType,
    });
  }

  async getPresignedUploadUrl(
    scope: string,
    contentType: string,
    fileName: string,
  ): Promise<{ presignedUrl: string; publicUrl: string }> {
    const ext = fileName.split('.').pop() || 'bin';
    const key = `${scope}/${crypto.randomUUID()}.${ext}`;
    const presignedUrl = await this.resolve().getPresignedUploadUrl(key, contentType);
    const publicUrl = await this.resolve().getUrl(key);
    return { presignedUrl, publicUrl };
  }

  async getUrl(key: string): Promise<string> {
    return this.resolve().getUrl(key);
  }

  async remove(key: string): Promise<void> {
    return this.resolve().delete(key);
  }

  async removeByUrl(url: string): Promise<void> {
    const publicUrl = storageConfig.channels[storageConfig.default].publicUrl;
    if (!publicUrl || !url.startsWith(publicUrl)) return;
    const key = url.replace(`${publicUrl}/`, '');
    return this.remove(key);
  }
}

export const storage = new Storage();
