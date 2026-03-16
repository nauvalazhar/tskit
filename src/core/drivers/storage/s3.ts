import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BaseStorageDriver } from './base';
import type { UploadParams, StorageObject, S3StorageDriverConfig } from './types';

export class S3StorageDriver extends BaseStorageDriver {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;
  private prefix: string;

  constructor(config: S3StorageDriverConfig) {
    super();
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl || '';
    this.prefix = config.prefix || '';
    this.client = new S3Client({
      region: config.region || 'auto',
      endpoint: config.endpoint,
      credentials: config.credentials,
    });
  }

  private prefixKey(key: string): string {
    return this.prefix ? `${this.prefix}/${key}` : key;
  }

  async upload(params: UploadParams): Promise<StorageObject> {
    const key = this.prefixKey(params.key);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body:
        params.buffer instanceof ArrayBuffer
          ? Buffer.from(params.buffer)
          : params.buffer,
      ContentType: params.contentType,
      Metadata: params.metadata,
    });

    await this.client.send(command);

    const url = this.publicUrl
      ? `${this.publicUrl}/${key}`
      : await this.getUrl(params.key);

    const size =
      params.buffer instanceof ArrayBuffer
        ? params.buffer.byteLength
        : params.buffer.length;

    return { key, url, size };
  }

  async getUrl(key: string, expiresIn?: number): Promise<string> {
    const prefixed = this.prefixKey(key);

    if (this.publicUrl) {
      return `${this.publicUrl}/${prefixed}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: prefixed,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresIn || 3600,
    });
  }

  async getPresignedUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.prefixKey(key),
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresIn || 600 });
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: this.prefixKey(key),
    });

    await this.client.send(command);
  }
}
