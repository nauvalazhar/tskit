import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { Divider } from '@/components/selia/divider';
import { createFileRoute, Link } from '@tanstack/react-router';
import { TeamGeneralForm } from '@/components/settings/team-general-form';
import { TeamDelete } from '@/components/settings/team-delete';
import { getTeams, getActiveOrganization, getActiveMemberRole } from '@/functions/team';
import { Button } from '@/components/selia/button';

export const Route = createFileRoute('/_app/settings/team/')({
  loader: async () => {
    const [activeOrg, teams, role] = await Promise.all([
      getActiveOrganization(),
      getTeams(),
      getActiveMemberRole(),
    ]);
    return { activeOrg, teams: teams ?? [], role };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { activeOrg, teams, role } = Route.useLoaderData();
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  const canEdit = isOwner || isAdmin;

  if (!activeOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Text className="text-muted">No active team selected.</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Heading level={2} size="sm">
            General
          </Heading>
          <Text className="text-muted mt-1">
            {canEdit
              ? 'Update your team name and URL slug.'
              : 'View your team details.'}
          </Text>
        </div>
        <div>
          {canEdit ? (
            <TeamGeneralForm name={activeOrg.name} slug={activeOrg.slug} />
          ) : (
            <div className="flex flex-col gap-2">
              <Text className="font-medium">{activeOrg.name}</Text>
              <Text className="text-muted text-sm">{activeOrg.slug}</Text>
            </div>
          )}
        </div>
      </div>
      <Divider />
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Heading level={2} size="sm">
            Members
          </Heading>
          <Text className="text-muted mt-1">
            {canEdit
              ? 'Manage your team members and invitations.'
              : 'View team members.'}
          </Text>
        </div>
        <div>
          <Link to="/settings/team/members">
            <Button variant="outline" size="sm">
              {canEdit ? 'Manage members' : 'View members'}
            </Button>
          </Link>
        </div>
      </div>
      {isOwner && (
        <>
          <Divider />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Heading level={2} size="sm">
                Delete Team
              </Heading>
              <Text className="text-muted mt-1">
                Permanently delete this team and remove all members.
                {teams.length <= 1 && ' You cannot delete your only team.'}
              </Text>
            </div>
            <div>
              <TeamDelete
                organizationId={activeOrg.id}
                teamName={activeOrg.name}
                isOnlyTeam={teams.length <= 1}
                teams={teams}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
