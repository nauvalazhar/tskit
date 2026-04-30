import { getRouteApi } from '@tanstack/react-router';
import {
  Card,
  CardBody,
  CardSubsection,
  CardSubsectionTitle,
  CardSubsectionDescription,
} from '@/components/selia/card';
import { Badge } from '@/components/selia/badge';
import { UserAvatar } from '@/components/shared/user-avatar';

const routeApi = getRouteApi('/admin/users/$userId');

export function UserProfile() {
  const { user } = routeApi.useLoaderData();

  return (
    <Card>
      <CardBody>
        <CardSubsection>
          <CardSubsectionTitle>Profile</CardSubsectionTitle>
          <CardSubsectionDescription>
            User account information and status
          </CardSubsectionDescription>
        </CardSubsection>
        <div className="flex items-start gap-4">
          <UserAvatar name={user.name} image={user.image || ''} size="lg" />
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-muted text-sm">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={user.role === 'admin' ? 'primary' : 'secondary'}
              >
                {user.role || 'user'}
              </Badge>
              <Badge variant={user.banned ? 'danger' : 'success'}>
                {user.banned ? 'Banned' : 'Active'}
              </Badge>
              <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                {user.emailVerified ? 'Email verified' : 'Email not verified'}
              </Badge>
              {user.twoFactorEnabled && (
                <Badge variant="info">2FA enabled</Badge>
              )}
            </div>
            <p className="text-muted text-sm">
              Joined {new Date(user.createdAt).toLocaleDateString()} &middot;{' '}
              {user.sessionCount} active session(s)
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
