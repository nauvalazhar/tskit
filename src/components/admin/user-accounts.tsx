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
import { adminUserQuery } from '@/queries/admin/users.queries';

const routeApi = getRouteApi('/admin/users/$userId');

export function UserAccounts() {
  const { userId } = routeApi.useParams();
  const user = useSuspenseQuery(adminUserQuery(userId)).data!;

  return (
    <Card>
      <CardBody>
        <CardSubsection>
          <CardSubsectionTitle>Linked Accounts</CardSubsectionTitle>
          <CardSubsectionDescription>
            OAuth providers connected to this account
          </CardSubsectionDescription>
        </CardSubsection>
        {user.accounts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.accounts.map((account, i) => (
              <Badge key={i} variant="secondary">
                {account.providerId}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">No linked accounts</p>
        )}
      </CardBody>
    </Card>
  );
}
