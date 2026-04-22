import { queryOptions } from '@tanstack/react-query';
import { getTeamsAdmin, getTeam } from '@/functions/admin/teams';

export function adminTeamsQuery(params: {
  page?: number;
  search?: string;
}) {
  return queryOptions({
    queryKey: ['admin', 'teams', params],
    queryFn: () => getTeamsAdmin({ data: params }),
  });
}

export function adminTeamQuery(teamId: string) {
  return queryOptions({
    queryKey: ['admin', 'teams', teamId],
    queryFn: () => getTeam({ data: { teamId } }),
  });
}
