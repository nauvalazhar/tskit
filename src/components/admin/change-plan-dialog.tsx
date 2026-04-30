import { useState } from 'react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/selia/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectList,
  SelectItem,
} from '@/components/selia/select';
import { Button } from '@/components/selia/button';
import { adminChangePlan } from '@/functions/admin/subscriptions';
import { getAllPlans } from '@/functions/admin/plans';
import type { PaymentChannel } from '@/config/payment';
import { Badge } from '@/components/selia/badge';

const plansQuery = queryOptions({
  queryKey: ['admin', 'plans'],
  queryFn: () => getAllPlans({ data: {} }),
});

export function ChangePlanDialog({
  open,
  onOpenChange,
  externalId,
  channel,
  currentPlanId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  externalId: string;
  channel: PaymentChannel;
  currentPlanId: string;
}) {
  const router = useRouter();
  const { data: plans } = useQuery({
    ...plansQuery,
    enabled: open,
  });
  const [selectedPlan, setSelectedPlan] = useState<SelectItem | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!selectedPlan) return;
    setSaving(true);
    await adminChangePlan({
      data: { externalId, channel, newPlanId: selectedPlan.value },
    });
    await router.invalidate();
    setSaving(false);
    onOpenChange(false);
  }

  const activePlans = (plans ?? []).map((plan) => ({
    value: plan.id,
    label: (
      <>
        {plan.name} ({(plan.price / 100).toFixed(2)}/{plan.interval})
      </>
    ),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Change Plan</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <label className="font-medium mb-1.5 block">New Plan</label>
          <Select
            value={selectedPlan}
            onValueChange={(v) =>
              setSelectedPlan(v as (typeof activePlans)[number])
            }
            items={activePlans}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectPopup>
              <SelectList>
                {activePlans.map((plan) => (
                  <SelectItem
                    key={plan.value}
                    value={plan}
                    disabled={plan.value == currentPlanId}
                  >
                    {plan.label}{' '}
                    {plan.value === currentPlanId && (
                      <Badge variant="success">Current</Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectList>
            </SelectPopup>
          </Select>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            onClick={handleConfirm}
            progress={saving}
            disabled={!selectedPlan?.value}
          >
            Change Plan
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
