---
title: Storage
description: How file storage works in TSKit.
sidebar:
  order: 5
---

TSKit supports file uploads through any S3-compatible storage provider, including Cloudflare R2, AWS S3, and MinIO. The storage system is driver-swappable and follows the config-driver-facade pattern.

## Setup

Configure your S3-compatible storage in `.env`:

```bash
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=your-bucket
S3_PUBLIC_URL=https://your-public-url.com
VITE_STORAGE_URL=https://your-public-url.com
```

## Uploading files

Use the `storage` facade from `lib/facades/storage.ts`:

```ts
const result = await storage.upload('avatars', {
  buffer,
  contentType: 'image/png',
  name: 'profile.png',
})
```

The first argument is the scope, which is used as a key prefix in the bucket. This keeps uploads organized by domain (e.g., `avatars/`, `documents/`).

## Presigned uploads

For client-side uploads, generate a presigned URL:

```ts
const { presignedUrl, publicUrl } = await storage.getPresignedUploadUrl(
  'avatars',
  'image/png',
  'profile.png',
)
```

The client can then upload directly to the presigned URL without the file passing through your server.

## Multiple channels

The storage system supports multiple channels for different buckets or configurations. Use `.use()` to select a channel:

```ts
await storage.use('private').upload('documents', { buffer, contentType, name })
```

Channels are defined in `config/storage.ts`.

## Avatar upload example

TSKit includes a working avatar upload flow as a reference. The server function in `functions/storage.ts` handles the upload, generates a scoped key, and returns the public URL. When a user changes their avatar, the old one is cleaned up automatically.

## Key files

| File | Purpose |
|------|---------|
| `lib/facades/storage.ts` | Storage facade (upload, presigned URLs, cleanup) |
| `config/storage.ts` | Storage channel config (S3 endpoints, buckets) |
| `core/drivers/storage/s3.ts` | S3 driver implementation |
| `core/drivers/storage/types.ts` | StorageDriver interface |
| `functions/storage.ts` | Avatar upload server function |
