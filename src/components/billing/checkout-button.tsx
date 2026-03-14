import { useState } from 'react';
import { Button } from '@/components/selia/button';
import { useServerFn } from '@tanstack/react-start';
import { createCheckout } from '@/functions/billing';
import { toastManager } from '@/components/selia/toast';

interface CheckoutButtonProps {
  planId: string;
  planName: string;
  variant?: 'primary' | 'outline';
}

export function CheckoutButton({
  planId,
  planName,
  variant = 'primary',
}: CheckoutButtonProps) {
  const [pending, setPending] = useState(false);
  const checkout = useServerFn(createCheckout);

  const handleClick = async () => {
    setPending(true);
    try {
      const result = await checkout({
        data: { planId },
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toastManager.add({
        title: 'Checkout Failed',
        description:
          error instanceof Error ? error.message : 'Failed to start checkout.',
        type: 'error',
      });
      setPending(false);
    }
  };

  return (
    <Button variant={variant} block progress={pending} onClick={handleClick}>
      Subscribe to {planName}
    </Button>
  );
}
