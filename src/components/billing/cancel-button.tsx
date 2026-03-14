import { Button } from '@/components/selia/button';
import { useState } from 'react';
import { toastManager } from '@/components/selia/toast';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { cancelSubscription } from '@/functions/billing';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/selia/alert-dialog';

export function CancelButton({ periodEnd }: { periodEnd?: string }) {
  const cancel = useServerFn(cancelSubscription);
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);

  const handleCancel = async () => {
    setCanceling(true);
    try {
      await cancel();
      toastManager.add({
        title: 'Subscription Canceled',
        description:
          'Your subscription will remain active until the end of the billing period.',
        type: 'success',
      });
      router.invalidate();
    } catch (error) {
      toastManager.add({
        title: 'Cancellation Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to cancel subscription.',
        type: 'error',
      });
    } finally {
      setCanceling(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="danger-light">Cancel Plan</Button>}
      />
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Plan</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>
            Are you sure you want to cancel your plan? You will still have
            access to your current plan
            {periodEnd ? (
              <>
                {' '}
                until{' '}
                <span className="font-semibold text-foreground">
                  {periodEnd}
                </span>
              </>
            ) : (
              ' until the end of the billing period'
            )}
            .
          </AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose>Keep Plan</AlertDialogClose>
          <Button variant="danger" progress={canceling} onClick={handleCancel}>
            Cancel Plan
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
