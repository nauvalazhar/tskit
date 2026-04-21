import { queryOptions } from '@tanstack/react-query';
import {
  getTeams,
  getTeamMembers,
  getTeamInvitations,
  getActiveOrganization,
} from '@/functions/team';

export function teamListQuery() {
  return queryOptions({
    queryKey: ['teams'],
    queryFn: () => getTeams(),
  });
}

export function teamActiveQuery() {
  return queryOptions({
    queryKey: ['teams', 'active'],
    queryFn: () => getActiveOrganization(),
  });
}

export function teamMembersQuery(organizationId?: string) {
  return queryOptions({
    queryKey: ['teams', 'members', organizationId],
    queryFn: () => getTeamMembers({ data: organizationId ? { organizationId } : undefined }),
    enabled: !!organizationId,
  });
}

export function teamInvitationsQuery(organizationId?: string) {
  return queryOptions({
    queryKey: ['teams', 'invitations', organizationId],
    queryFn: () => getTeamInvitations({ data: organizationId ? { organizationId } : undefined }),
    enabled: !!organizationId,
  });
}
