import { useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import {
  Card,
  CardBody,
  CardSubsection,
  CardSubsectionTitle,
  CardSubsectionDescription,
} from '@/components/selia/card';
import { Badge } from '@/components/selia/badge';
import { Item, ItemContent, ItemTitle, ItemDescription } from '@/components/selia/item';
import { adminUserQuery } from '@/queries/admin/users.queries';

const routeApi = getRouteApi('/admin/users/$userId');

const ROLE_VARIANTS: Record<string, 'primary' | 'secondary' | 'info'> = {
  owner: 'primary',
  admin: 'info',
  member: 'secondary',
};

export function UserTeams() {
  const { userId } = routeApi.useParams();
  const user = useSuspenseQuery(adminUserQuery(userId)).data!;

  const teams = user.teams ?? [];

  return (
    <Card>
      <CardBody>
        <CardSubsection>
          <CardSubsectionTitle>Teams</CardSubsectionTitle>
          <CardSubsectionDescription>
            Organizations this user belongs to
          </CardSubsectionDescription>
        </CardSubsection>
        {teams.length > 0 ? (
          <div className="space-y-3">
            {teams.map((team) => (
              <Item key={team.id} size="sm">
                <ItemContent>
                  <ItemTitle>{team.name}</ItemTitle>
                  <ItemDescription className="text-sm">
                    {team.slug}
                  </ItemDescription>
                </ItemContent>
                <Badge variant={ROLE_VARIANTS[team.role] ?? 'secondary'}>
                  {team.role}
                </Badge>
              </Item>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">Not a member of any team</p>
        )}
      </CardBody>
    </Card>
  );
}
