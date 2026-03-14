import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/selia/button';
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from '@/components/selia/alert-dialog';
import { toastManager } from '@/components/selia/toast';
import { changePlan } from '@/functions/billing';
import { formatPrice } from '@/lib/utils';

interface ChangePlanButtonProps {
  planId: string;
  planName: string;
  planPrice: number;
  planCurrency: string;
  planInterval: string;
  direction: 'upgrade' | 'downgrade';
  variant?: 'primary' | 'outline';
}

export function ChangePlanButton({
  planId,
  planName,
  planPrice,
  planCurrency,
  planInterval,
  direction,
  variant = 'primary',
}: ChangePlanButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const change = useServerFn(changePlan);

  const label =
    direction === 'upgrade'
      ? `Upgrade to ${planName}`
      : `Downgrade to ${planName}`;

  const handleConfirm = async () => {
    setPending(true);
    try {
      await change({ data: { planId } });
      toastManager.add({
        title: 'Plan Changed',
        description: `You've been switched to the ${planName} plan.`,
        type: 'success',
      });
      setOpen(false);
      await router.invalidate();
    } catch (error) {
      toastManager.add({
        title: 'Plan Change Failed',
        description:
          error instanceof Error ? error.message : 'Failed to change plan.',
        type: 'error',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant={variant} block onClick={() => setOpen(true)}>
        {label}
      </Button>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>
            {direction === 'upgrade' ? (
              <>
                You'll be upgraded to{' '}
                <span className="font-semibold text-foreground">
                  {planName}
                </span>{' '}
                at{' '}
                <span className="font-semibold text-foreground">
                  {formatPrice(planPrice, planCurrency)}
                </span>
                /{planInterval === 'yearly' ? 'year' : 'month'}. You'll be
                charged a prorated amount for the remainder of your current
                billing period.
              </>
            ) : (
              <>
                You'll be downgraded to{' '}
                <span className="font-semibold text-foreground">
                  {planName}
                </span>{' '}
                at{' '}
                <span className="font-semibold text-foreground">
                  {formatPrice(planPrice, planCurrency)}
                </span>
                /{planInterval === 'yearly' ? 'year' : 'month'}. You'll receive
                a prorated credit for the remainder of your current billing
                period.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose>Cancel</AlertDialogClose>
          <Button
            variant={direction === 'upgrade' ? 'primary' : 'secondary'}
            onClick={handleConfirm}
            progress={pending}
          >
            {label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
