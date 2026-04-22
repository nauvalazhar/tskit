import { useRouter } from '@tanstack/react-router';
import { Badge } from '@/components/selia/badge';
import { Button } from '@/components/selia/button';
import { toastManager } from '@/components/selia/toast';
import { revokeInvitation } from '@/functions/team';
import { XIcon } from 'lucide-react';

interface TeamInvitation {
  id: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: string | Date;
}

export function TeamInvitationsList({
  invitations,
  canManage,
}: {
  invitations: TeamInvitation[];
  canManage: boolean;
}) {
  const router = useRouter();
  const pending = invitations.filter((inv) => inv.status === 'pending');

  if (pending.length === 0) {
    return null;
  }

  const handleRevoke = async (invitationId: string) => {
    try {
      await revokeInvitation({ data: { invitationId } });
      await router.invalidate();
      toastManager.add({
        title: 'Invitation revoked',
        type: 'success',
      });
    } catch (err) {
      toastManager.add({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to revoke invitation.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex flex-col divide-y divide-card-border">
      {pending.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="font-medium truncate">{inv.email}</span>
            <span className="text-sm text-muted">
              Expires {new Date(inv.expiresAt).toLocaleDateString()}
            </span>
          </div>
          <Badge variant="secondary">{inv.role}</Badge>
          {canManage && (
            <Button
              variant="danger-light"
              size="xs-icon"
              onClick={() => handleRevoke(inv.id)}
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
