import { Fragment } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from '@/components/selia/card';
import { Badge } from '@/components/selia/badge';
import { Stack } from '@/components/selia/stack';
import { Separator } from '@/components/selia/separator';
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemAction,
} from '@/components/selia/item';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Link } from '@tanstack/react-router';
import { getSubscriptionStatus } from '@/lib/utils';

type RecentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
};

type RecentSubscription = {
  id: string;
  status: string;
  createdAt: Date;
  user: { name: string; email: string };
  plan: { name: string };
  organization: { name: string } | null;
};

export function RecentActivity({
  recentUsers,
  recentSubscriptions,
}: {
  recentUsers: RecentUser[];
  recentSubscriptions: RecentSubscription[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardBody>
          {recentUsers.length > 0 ? (
            <Stack>
              {recentUsers.map((user, i) => (
                <Fragment key={user.id}>
                  {i > 0 && <Separator />}
                  <Item
                    variant="plain"
                    className={i === recentUsers.length - 1 ? 'rounded-b-xl' : undefined}
                    render={
                      <Link
                        to="/admin/users/$userId"
                        params={{ userId: user.id }}
                      />
                    }
                  >
                    <ItemMedia>
                      <UserAvatar
                        name={user.name}
                        image={user.image || ''}
                      />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{user.name}</ItemTitle>
                      <ItemDescription className="text-sm">
                        {user.email}
                      </ItemDescription>
                    </ItemContent>
                    <ItemAction>
                      <span className="text-muted text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </ItemAction>
                  </Item>
                </Fragment>
              ))}
            </Stack>
          ) : (
            <p className="text-muted text-sm text-center py-4">No users yet</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
        </CardHeader>
        <CardBody>
          {recentSubscriptions.length > 0 ? (
            <Stack>
              {recentSubscriptions.map((sub, i) => (
                <Fragment key={sub.id}>
                  {i > 0 && <Separator />}
                  <Item
                    variant="plain"
                    className={i === recentSubscriptions.length - 1 ? 'rounded-b-xl' : undefined}
                  >
                    <ItemContent>
                      <ItemTitle>{sub.organization?.name ?? sub.user.name}</ItemTitle>
                      <ItemDescription className="text-sm">
                        {sub.plan.name}
                      </ItemDescription>
                    </ItemContent>
                    <ItemAction>
                      <Badge
                        variant={
                          getSubscriptionStatus(sub.status)?.variant ??
                          'secondary'
                        }
                      >
                        {getSubscriptionStatus(sub.status)?.label ??
                          sub.status}
                      </Badge>
                    </ItemAction>
                  </Item>
                </Fragment>
              ))}
            </Stack>
          ) : (
            <p className="text-muted text-sm text-center py-4">
              No subscriptions yet
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
