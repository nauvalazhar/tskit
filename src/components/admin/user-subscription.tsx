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

  return (
    <Card>
      <CardBody>
        <CardSubsection>
          <CardSubsectionTitle>Subscription</CardSubsectionTitle>
          <CardSubsectionDescription>
            Current plan and billing period
          </CardSubsectionDescription>
        </CardSubsection>
        {user.subscription ? (
          <Item size="sm">
            <ItemContent>
              <ItemTitle className="flex items-center gap-2">
                {user.subscription.plan.name}
                <Badge
                  variant={
                    getSubscriptionStatus(user.subscription.status)?.variant ??
                    'secondary'
                  }
                >
                  {getSubscriptionStatus(user.subscription.status)?.label ??
                    user.subscription.status}
                </Badge>
              </ItemTitle>
              {user.subscription.currentPeriodStart &&
                user.subscription.currentPeriodEnd && (
                  <ItemDescription className="text-sm">
                    {new Date(
                      user.subscription.currentPeriodStart,
                    ).toLocaleDateString()}{' '}
                    &ndash;{' '}
                    {new Date(
                      user.subscription.currentPeriodEnd,
                    ).toLocaleDateString()}
                  </ItemDescription>
                )}
            </ItemContent>
            <ItemAction>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link
                    to="/admin/subscriptions"
                    search={{ search: user.email }}
                  />
                }
              >
                View
              </Button>
            </ItemAction>
          </Item>
        ) : (
          <p className="text-muted text-sm">No active subscription</p>
        )}
      </CardBody>
    </Card>
  );
}
