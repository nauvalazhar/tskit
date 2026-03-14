import { useState, useEffect } from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { billingSubscriptionPollingQuery } from '@/queries/billing.queries';
import { Card, CardBody } from '@/components/selia/card';
import { Button } from '@/components/selia/button';
import { CheckIcon, LoaderCircleIcon, AlertTriangleIcon } from 'lucide-react';

export const Route = createFileRoute('/_app/billing/success')({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: search.session_id as string | undefined,
  }),
  beforeLoad: ({ search }) => {
    if (!search.session_id) {
      throw redirect({ to: '/billing' });
    }
  },
  component: RouteComponent,
});

const SLOW_THRESHOLD = 5_000;
const TIMEOUT = 30_000;

function RouteComponent() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timedOut = elapsed >= TIMEOUT;
  const { data: subscription } = useQuery(billingSubscriptionPollingQuery(!timedOut));
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  if (isActive) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardBody className="flex flex-col items-center gap-4 py-10">
            <div className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
              <CheckIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">You're all set!</h2>
              <p className="text-muted mt-1 text-sm">
                Your <strong>{subscription.plan.name}</strong> subscription is now active.
              </p>
            </div>
            <Button variant="primary" render={<Link to="/billing" />}>
              Go to Billing
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardBody className="flex flex-col items-center gap-4 py-10">
            <div className="bg-warning/10 text-warning flex size-12 items-center justify-center rounded-full">
              <AlertTriangleIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Taking longer than expected</h2>
              <p className="text-muted mt-1 text-sm">
                Your payment was received, but the subscription is still being set up.
                This usually resolves within a few minutes.
              </p>
            </div>
            <Button variant="primary" render={<Link to="/billing" />}>
              Go to Billing
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isSlow = elapsed >= SLOW_THRESHOLD;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardBody className="flex flex-col items-center gap-4 py-10">
          <LoaderCircleIcon className="text-muted size-10 animate-spin" />
          <div>
            <h2 className="text-lg font-semibold">
              {isSlow ? 'Taking a bit longer than usual...' : 'Setting up your subscription...'}
            </h2>
            <p className="text-muted mt-1 text-sm">
              {isSlow
                ? "Don't worry, your payment was received. We're still setting things up."
                : 'This usually takes just a few seconds.'}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
