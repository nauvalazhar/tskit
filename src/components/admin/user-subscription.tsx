import { useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Button } from '@/components/selia/button';
import {
  Card,
  CardBody,
  CardSubsection,
  CardSubsectionTitle,
  CardSubsectionDescription,
} from '@/components/selia/card';
import { Badge } from '@/components/selia/badge';
import { Item, ItemContent, ItemTitle, ItemDescription, ItemAction } from '@/components/selia/item';
import { adminUserQuery } from '@/queries/admin/users.queries';
import { getSubscriptionStatus } from '@/lib/utils';

const routeApi = getRouteApi('/admin/users/$userId');

export function UserSubscription() {
  const { userId } = routeApi.useParams();
  const user = useSuspenseQuery(adminUserQuery(userId)).data!;

  const subs = user.subscriptions ?? [];

  return (
    <Card>
      <CardBody>
        <CardSubsection>
          <CardSubsectionTitle>Subscriptions</CardSubsectionTitle>
          <CardSubsectionDescription>
            Subscriptions via teams this user belongs to
          </CardSubsectionDescription>
        </CardSubsection>
        {subs.length > 0 ? (
          <div className="space-y-3">
            {subs.map((sub) => {
              const org = (sub as Record<string, unknown>).organization as
                | { name: string }
                | undefined;
              return (
                <Item key={sub.id} size="sm">
                  <ItemContent>
                    <ItemTitle className="flex items-center gap-2">
                      {sub.plan.name}
                      <Badge
                        variant={
                          getSubscriptionStatus(sub.status)?.variant ??
                          'secondary'
                        }
                      >
                        {getSubscriptionStatus(sub.status)?.label ?? sub.status}
                      </Badge>
                    </ItemTitle>
                    <ItemDescription className="text-sm">
                      {org?.name ?? 'Unknown team'}
                      {sub.currentPeriodStart && sub.currentPeriodEnd && (
                        <>
                          {' '}&middot;{' '}
                          {new Date(sub.currentPeriodStart).toLocaleDateString()}{' '}
                          &ndash;{' '}
                          {new Date(sub.currentPeriodEnd).toLocaleDateString()}
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
                          search={{ search: org?.name }}
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
          <p className="text-muted text-sm">No subscriptions</p>
        )}
      </CardBody>
    </Card>
  );
}
