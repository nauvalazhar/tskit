import { useState } from 'react';
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router';
import { pageTitle, getSubscriptionStatus } from '@/lib/utils';
import { adminDeleteTeam, getTeam } from '@/functions/admin/teams';
import { Button } from '@/components/selia/button';
import { Badge } from '@/components/selia/badge';
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
import {
  Card,
  CardBody,
  CardSubsection,
  CardSubsectionTitle,
  CardSubsectionDescription,
} from '@/components/selia/card';
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemAction,
} from '@/components/selia/item';
import { UserAvatar } from '@/components/shared/user-avatar';
import { PageHeader } from '@/components/shared/page-header';
import { Heading } from '@/components/selia/heading';
import { ArrowLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/admin/teams/$teamId')({
  head: () => ({
    meta: [{ title: pageTitle('Team Details') }],
  }),
  loader: async ({ params }) => {
    const team = await getTeam({ data: { teamId: params.teamId } });
    if (!team) throw notFound();
    return { team };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { team } = Route.useLoaderData();

  const pendingInvitations =
    team.invitations?.filter((inv) => inv.status === 'pending') ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader>
        <div className="flex items-center gap-3">
          <Button
            nativeButton={false}
            variant="plain"
            size="xs-icon"
            render={<Link to="/admin/teams" />}
          >
            <ArrowLeftIcon />
          </Button>
          <Heading>Team Details</Heading>
        </div>
      </PageHeader>

      <Card>
        <CardBody>
          <CardSubsection>
            <CardSubsectionTitle>General</CardSubsectionTitle>
            <CardSubsectionDescription>
              Team information and settings
            </CardSubsectionDescription>
          </CardSubsection>
          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <p className="text-muted text-sm">{team.slug}</p>
            </div>
            <p className="text-muted text-sm">
              Created {new Date(team.createdAt).toLocaleDateString()} &middot;{' '}
              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CardSubsection>
            <CardSubsectionTitle>Members</CardSubsectionTitle>
            <CardSubsectionDescription>
              {team.members.length} member{team.members.length !== 1 ? 's' : ''}{' '}
              in this team
            </CardSubsectionDescription>
          </CardSubsection>
          <div className="space-y-1">
            {team.members.map((member) => (
              <Item
                key={member.id}
                size="sm"
                variant="outline"
                render={
                  <Link
                    to="/admin/users/$userId"
                    params={{ userId: member.userId }}
                  />
                }
              >
                <ItemMedia>
                  <UserAvatar
                    name={member.users.name}
                    image={member.users.image || ''}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{member.users.name}</ItemTitle>
                  <ItemDescription>{member.users.email}</ItemDescription>
                </ItemContent>
                <ItemAction>
                  <Badge
                    variant={
                      member.role === 'owner'
                        ? 'primary'
                        : member.role === 'admin'
                          ? 'info'
                          : 'secondary'
                    }
                  >
                    {member.role}
                  </Badge>
                </ItemAction>
              </Item>
            ))}
          </div>
        </CardBody>
      </Card>

      {pendingInvitations.length > 0 && (
        <Card>
          <CardBody>
            <CardSubsection>
              <CardSubsectionTitle>Pending Invitations</CardSubsectionTitle>
              <CardSubsectionDescription>
                {pendingInvitations.length} pending invitation
                {pendingInvitations.length !== 1 ? 's' : ''}
              </CardSubsectionDescription>
            </CardSubsection>
            <div className="space-y-1">
              {pendingInvitations.map((inv) => (
                <Item key={inv.id} size="sm">
                  <ItemContent>
                    <ItemTitle>{inv.email}</ItemTitle>
                    <ItemDescription>
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </ItemDescription>
                  </ItemContent>
                  <ItemAction>
                    <Badge variant="warning">Pending</Badge>
                    {inv.role && <Badge variant="secondary">{inv.role}</Badge>}
                  </ItemAction>
                </Item>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <CardSubsection>
            <CardSubsectionTitle>Subscription</CardSubsectionTitle>
            <CardSubsectionDescription>
              Current plan and billing status
            </CardSubsectionDescription>
          </CardSubsection>
          {team.subscriptions.length > 0 ? (
            <div className="space-y-3">
              {team.subscriptions.map((sub) => {
                const status = getSubscriptionStatus(sub.status);
                return (
                  <Item key={sub.id} size="sm">
                    <ItemContent>
                      <ItemTitle className="flex items-center gap-2">
                        {sub.plan.name}
                        <Badge variant={status?.variant ?? 'secondary'}>
                          {status?.label ?? sub.status}
                        </Badge>
                      </ItemTitle>
                      <ItemDescription>
                        Initiated by {sub.user.name}
                        {sub.currentPeriodStart && sub.currentPeriodEnd && (
                          <>
                            {' '}
                            &middot;{' '}
                            {new Date(
                              sub.currentPeriodStart,
                            ).toLocaleDateString()}{' '}
                            &ndash;{' '}
                            {new Date(
                              sub.currentPeriodEnd,
                            ).toLocaleDateString()}
                          </>
                        )}
                      </ItemDescription>
                    </ItemContent>
                    <ItemAction>
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={
                          <Link
                            to="/admin/subscriptions"
                            search={{ search: team.name }}
                          />
                        }
                      >
                        View
                      </Button>
                    </ItemAction>
                  </Item>
                );
              })}
            </div>
          ) : (
            <p className="text-muted text-sm">No active subscription</p>
          )}
        </CardBody>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardBody>
          <CardSubsection>
            <CardSubsectionTitle>Danger Zone</CardSubsectionTitle>
            <CardSubsectionDescription>
              Permanently delete this team and all associated data
            </CardSubsectionDescription>
          </CardSubsection>
          <DeleteTeamButton teamId={team.id} teamName={team.name} />
        </CardBody>
      </Card>
    </div>
  );
}

function DeleteTeamButton({ teamId, teamName }: { teamId: string; teamName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setPending(true);
    try {
      await adminDeleteTeam({ data: { teamId } });
      setOpen(false);
      toastManager.add({
        title: 'Team deleted',
        description: `${teamName} has been permanently deleted.`,
        type: 'success',
      });
      router.navigate({ to: '/admin/teams' });
    } catch (err) {
      toastManager.add({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete team.',
        type: 'error',
      });
      setPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete team
      </Button>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {teamName}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>
            This will permanently delete the team, remove all members, cancel
            any active subscriptions, and delete all associated data. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogClose>Cancel</AlertDialogClose>
          <Button variant="danger" onClick={handleDelete} progress={pending}>
            Delete team
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
