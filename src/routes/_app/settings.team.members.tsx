import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { Divider } from '@/components/selia/divider';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { TeamMembersList } from '@/components/settings/team-members-list';
import { TeamInviteForm } from '@/components/settings/team-invite-form';
import { TeamInvitationsList } from '@/components/settings/team-invitations-list';
import type { TeamMember, TeamInvitation } from '@/validations/team';
import {
  getActiveOrganization,
  getActiveMemberRole,
  getTeamMembers,
  getTeamInvitations,
} from '@/functions/team';

export const Route = createFileRoute('/_app/settings/team/members')({
  head: () => ({
    meta: [{ title: pageTitle('Team Members') }],
  }),
  loader: async ({ context }) => {
    const [activeOrg, role] = await Promise.all([
      getActiveOrganization(),
      getActiveMemberRole(),
    ]);
    if (!activeOrg)
      return {
        activeOrg: null,
        members: [] as TeamMember[],
        invitations: [] as TeamInvitation[],
        currentUserId: '',
        currentUserRole: 'member',
      };

    const [members, invitations] = await Promise.all([
      getTeamMembers({ data: { organizationId: activeOrg.id } }),
      getTeamInvitations({ data: { organizationId: activeOrg.id } }),
    ]);

    return {
      activeOrg,
      members: members as TeamMember[],
      invitations: invitations as TeamInvitation[],
      currentUserId: context.session?.user?.id ?? '',
      currentUserRole: role ?? 'member',
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { activeOrg, members, invitations, currentUserId, currentUserRole } =
    Route.useLoaderData();
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  if (!activeOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Text className="text-muted">No active team selected.</Text>
      </div>
    );
  }

  const hasPendingInvitations = invitations.some(
    (inv) => inv.status === 'pending',
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Heading level={2} size="sm">
            Members
          </Heading>
          <Text className="text-muted mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''} in this
            team.
          </Text>
          {canManage && (
            <div className="mt-3">
              <TeamInviteForm />
            </div>
          )}
        </div>
        <div>
          <TeamMembersList
            members={members}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            organizationId={activeOrg.id}
          />
        </div>
      </div>

      {hasPendingInvitations && (
        <>
          <Divider />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Heading level={2} size="sm">
                Pending Invitations
              </Heading>
              <Text className="text-muted mt-1">
                Invitations that have been sent but not yet accepted.
              </Text>
            </div>
            <div>
              <TeamInvitationsList
                invitations={invitations}
                canManage={canManage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
