import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Text } from '@/components/selia/text';
import { Button } from '@/components/selia/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';
import {
  getAvatarUploadUrl,
  cleanupOldAvatar,
  removeAvatar,
} from '@/functions/storage';
import { UPLOAD_MAX_SIZE, UPLOAD_ALLOWED_TYPES } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';
import { upload } from '@/lib/http';

type Phase = 'idle' | 'compressing' | 'uploading' | 'finalizing';

const BUTTON_TEXT: Record<Phase, string> = {
  idle: 'Change Avatar',
  compressing: 'Compressing...',
  uploading: 'Uploading...',
  finalizing: 'Saving...',
};

export function AvatarUpload({
  name,
  image,
}: {
  name: string;
  image?: string;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [removePending, setRemovePending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const getUploadUrl = useServerFn(getAvatarUploadUrl);
  const cleanupOld = useServerFn(cleanupOldAvatar);
  const remove = useServerFn(removeAvatar);

  const busy = phase !== 'idle';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!UPLOAD_ALLOWED_TYPES.includes(file.type)) {
      const types = UPLOAD_ALLOWED_TYPES.map((t) =>
        t.split('/')[1].toUpperCase(),
      ).join(', ');
      toastManager.add({
        title: 'Invalid File Type',
        description: `Allowed types: ${types}.`,
        type: 'error',
      });
      return;
    }

    if (file.size > UPLOAD_MAX_SIZE) {
      toastManager.add({
        title: 'File Too Large',
        description: `Maximum file size is ${formatFileSize(UPLOAD_MAX_SIZE)}.`,
        type: 'error',
      });
      return;
    }

    try {
      setPhase('compressing');
      const compressed = await imageCompression(file, {
        maxSizeMB: UPLOAD_MAX_SIZE / (1024 * 1024),
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      setPhase('uploading');
      setUploadProgress(0);

      const { presignedUrl, publicUrl } = await getUploadUrl({
        data: {
          contentType: compressed.type,
          fileName: file.name,
        },
      });

      await upload(presignedUrl, compressed, {
        onProgress: ({ percent }) => setUploadProgress(percent),
      });

      setPhase('finalizing');
      const oldImageUrl = image;

      const { error } = await authClient.updateUser({ image: publicUrl });

      if (error) {
        toastManager.add({
          title: 'Upload Failed',
          description: error.message || 'Failed to update avatar.',
          type: 'error',
        });
        return;
      }

      if (oldImageUrl) {
        cleanupOld({ data: { url: oldImageUrl } }).catch(() => {});
      }

      toastManager.add({
        title: 'Avatar Updated',
        description: 'Your avatar has been updated successfully.',
        type: 'success',
      });

      router.invalidate();
    } catch (error) {
      toastManager.add({
        title: 'Upload Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong uploading your avatar.',
        type: 'error',
      });
    } finally {
      setPhase('idle');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    setRemovePending(true);

    await remove();
    const { error } = await authClient.updateUser({ image: '' });

    setRemovePending(false);

    if (error) {
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to remove avatar.',
        type: 'error',
      });
      return;
    }

    toastManager.add({
      title: 'Avatar Removed',
      description: 'Your avatar has been removed.',
      type: 'success',
    });

    router.invalidate();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar name={name} image={image} size="lg" />
        {phase === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <span className="text-xs font-medium text-white">
              {uploadProgress}%
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Text className="font-medium">{name}</Text>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            progress={busy}
            disabled={removePending}
            onClick={() => fileInputRef.current?.click()}
          >
            {BUTTON_TEXT[phase]}
          </Button>
          {image && (
            <Button
              type="button"
              variant="plain"
              size="sm"
              progress={removePending}
              disabled={busy}
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
