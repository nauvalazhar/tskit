import { useState } from 'react';
import { Button } from '@/components/selia/button';
import { useServerFn } from '@tanstack/react-start';
import { createPortalSession } from '@/functions/billing';
import { toastManager } from '@/components/selia/toast';

export function ManageButton() {
  const [pending, setPending] = useState(false);
  const portal = useServerFn(createPortalSession);

  const handleClick = async () => {
    setPending(true);
    try {
      const result = await portal({
        data: { returnUrl: `${window.location.origin}/billing` },
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toastManager.add({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to open billing portal.',
        type: 'error',
      });
      setPending(false);
    }
  };

  return (
    <Button variant="secondary" progress={pending} onClick={handleClick}>
      Manage Subscription
    </Button>
  );
}
