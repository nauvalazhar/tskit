import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  CardHeaderAction,
} from '@/components/selia/card';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import { ManageButton } from './manage-button';
import { CancelButton } from './cancel-button';
import { getSubscriptionStatus } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

interface SubscriptionStatusProps {
  subscription:
    | {
        status: string;
        cancelAtPeriodEnd: boolean;
        currentPeriodEnd: Date | string | null;
        plan: {
          name: string;
          price: number;
          currency: string;
          interval: string;
        };
      }
    | null
    | undefined;
  canManage?: boolean;
}

export function SubscriptionStatus({
  subscription,
  canManage = true,
}: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No active subscription</CardTitle>
          <CardDescription>
            {canManage
              ? 'Subscribe to a plan to get started.'
              : 'Your team does not have an active subscription.'}
          </CardDescription>
        </CardHeader>
        {canManage && (
          <CardBody>
            <Button
              nativeButton={false}
              variant="primary"
              render={<Link to="/pricing" />}
            >
              View Plans
            </Button>
          </CardBody>
        )}
      </Card>
    );
  }

  const status = subscription.cancelAtPeriodEnd
    ? 'canceled'
    : subscription.status;
  const badge = getSubscriptionStatus(status) ?? {
    variant: 'secondary' as const,
    label: status,
  };

  const periodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card>
      <CardHeader className="border-none">
        <div className="flex items-center gap-2">
          <CardTitle>{subscription.plan.name}</CardTitle>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <CardDescription>
          {subscription.cancelAtPeriodEnd && periodEnd
            ? `You still have access until ${periodEnd}`
            : periodEnd
              ? `Renews on ${periodEnd}`
              : null}
        </CardDescription>
        {canManage && (
          <CardHeaderAction>
            <ManageButton />
            {subscription.status === 'active' &&
              !subscription.cancelAtPeriodEnd && (
                <CancelButton periodEnd={periodEnd || ''} />
              )}
          </CardHeaderAction>
        )}
      </CardHeader>
    </Card>
  );
}
