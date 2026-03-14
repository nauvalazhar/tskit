import { S3StorageDriver } from './s3';
import type { StorageDriver, StorageDriverConfig } from './types';

const drivers: Record<string, (config: StorageDriverConfig) => StorageDriver> = {
  s3: (config) => new S3StorageDriver(config),
};

export function createStorageDriver(config: StorageDriverConfig): StorageDriver {
  const factory = drivers[config.driver];
  if (!factory) throw new Error(`Storage driver "${config.driver}" not found`);
  return factory(config);
}
