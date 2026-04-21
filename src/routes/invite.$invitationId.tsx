import { useState } from 'react';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { Button } from '@/components/selia/button';
import { Card, CardBody } from '@/components/selia/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/selia/avatar';
import {
  acceptInvitation,
  rejectInvitation,
  getInvitation,
} from '@/functions/team';
import { toastManager } from '@/components/selia/toast';
import { CheckIcon, XIcon } from 'lucide-react';

export const Route = createFileRoute('/invite/$invitationId')({
  beforeLoad: async ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: '/login' });
    }
  },
  loader: async ({ params }) => {
    const invitation = await getInvitation({
      data: { invitationId: params.invitationId },
    });
    return { invitationId: params.invitationId, invitation };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invitationId, invitation } = Route.useLoaderData();
  const router = useRouter();
  const [pending, setPending] = useState<'accept' | 'reject' | null>(null);
  const [done, setDone] = useState(false);

  const inviterName = invitation?.inviterName ?? 'Someone';
  const inviterImage = invitation?.inviterImage ?? null;
  const orgName = invitation?.organizationName ?? 'a team';

  const handleAccept = async () => {
    setPending('accept');
    try {
      await acceptInvitation({ data: { invitationId } });
      toastManager.add({
        title: 'Invitation accepted',
        description: `You have joined ${orgName}.`,
        type: 'success',
      });
      setDone(true);
      setTimeout(() => router.navigate({ to: '/dashboard' }), 1500);
    } catch (err) {
      toastManager.add({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to accept invitation.',
        type: 'error',
      });
      setPending(null);
    }
  };

  const handleReject = async () => {
    setPending('reject');
    try {
      await rejectInvitation({ data: { invitationId } });
      toastManager.add({
        title: 'Invitation declined',
        type: 'info',
      });
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      toastManager.add({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to decline invitation.',
        type: 'error',
      });
      setPending(null);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardBody className="py-12 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-full bg-success/15 text-success">
              <CheckIcon className="size-6" />
            </div>
            <Heading level={2} size="md">
              You're in!
            </Heading>
            <Text className="text-muted">Redirecting to your dashboard...</Text>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="py-10 flex flex-col items-center gap-5">
          <div className="relative">
            <Avatar size="lg">
              {inviterImage && (
                <AvatarImage src={inviterImage} alt={inviterName} />
              )}
              <AvatarFallback>{inviterName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-success text-white flex items-center justify-center ring-2 ring-card">
              <CheckIcon className="size-3" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <Heading level={2} size="md">
              {inviterName} invited you
            </Heading>
            <Text className="text-muted">
              {inviterName} has invited you to join{' '}
              <span className="font-medium text-foreground">{orgName}</span>.
              You can accept this invitation by clicking the button below.
            </Text>
          </div>
          <div className="flex gap-3">
            <Button
              variant="danger-light"
              onClick={handleReject}
              progress={pending === 'reject'}
              disabled={pending !== null}
            >
              <XIcon className="size-4" />
              Decline
            </Button>
            <Button
              variant="primary"
              onClick={handleAccept}
              progress={pending === 'accept'}
              disabled={pending !== null}
            >
              Accept Invitation
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
