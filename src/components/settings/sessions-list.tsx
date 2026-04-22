import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import {
  parseUserAgent,
  formatRelativeDate,
  formatFullDate,
} from '@/lib/utils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
} from '@/components/selia/tooltip';
import { toastManager } from '@/components/selia/toast';
import { Button } from '@/components/selia/button';
import { Badge } from '@/components/selia/badge';
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemAction,
} from '@/components/selia/item';
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from '@/components/selia/alert-dialog';
import { IconBox } from '../selia/icon-box';
import { GlobeIcon } from 'lucide-react';

interface Session {
  id: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  expiresAt: Date;
}

type RevokeTarget =
  | { type: 'single'; token: string; label: string }
  | { type: 'all' };

export function SessionsList({
  sessions,
  currentSessionId,
}: {
  sessions: Session[];
  currentSessionId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<RevokeTarget | null>(null);

  const handleConfirm = async () => {
    if (!revokeTarget) return;
    setPending(true);

    const { error } =
      revokeTarget.type === 'single'
        ? await authClient.revokeSession({ token: revokeTarget.token })
        : await authClient.revokeOtherSessions();

    setPending(false);

    if (error) {
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to revoke session.',
        type: 'error',
      });
      return;
    }

    toastManager.add({
      title:
        revokeTarget.type === 'single' ? 'Session Revoked' : 'Sessions Revoked',
      description:
        revokeTarget.type === 'single'
          ? 'The session has been revoked.'
          : 'All other sessions have been revoked.',
      type: 'success',
    });

    setRevokeTarget(null);
    router.invalidate();
  };

  const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {sessions.map((session) => {
          const { browser, os } = parseUserAgent(session.userAgent);
          const isCurrent = session.id === currentSessionId;

          return (
            <Item key={session.id} size="sm">
              <IconBox variant="secondary">
                <GlobeIcon />
              </IconBox>
              <ItemContent>
                <ItemTitle className="flex items-center gap-2">
                  {browser} on {os}
                  {isCurrent && (
                    <Badge size="sm" variant="info" pill>
                      Current
                    </Badge>
                  )}
                </ItemTitle>
                <ItemDescription>
                  <span className="break-all">
                    {session.ipAddress || 'Unknown IP'}
                  </span>
                  {' · '}
                  <Tooltip>
                    <TooltipTrigger className="cursor-default underline decoration-dotted underline-offset-2">
                      {formatRelativeDate(session.createdAt)}
                    </TooltipTrigger>
                    <TooltipPopup>
                      {formatFullDate(session.createdAt)}
                    </TooltipPopup>
                  </Tooltip>
                </ItemDescription>
              </ItemContent>
              {!isCurrent && (
                <ItemAction>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      setRevokeTarget({
                        type: 'single',
                        token: session.token,
                        label: `${browser} (${os})`,
                      })
                    }
                  >
                    Revoke Session
                  </Button>
                </ItemAction>
              )}
            </Item>
          );
        })}
      </div>
      {otherSessions.length > 0 && (
        <Button
          variant="outline"
          onClick={() => setRevokeTarget({ type: 'all' })}
        >
          Revoke All Other Sessions
        </Button>
      )}

      <AlertDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {revokeTarget?.type === 'all'
                ? 'Revoke All Other Sessions'
                : 'Revoke Session'}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              {revokeTarget?.type === 'all' ? (
                'This will sign out all other sessions except your current one. Are you sure?'
              ) : (
                <>
                  This will sign out the session on{' '}
                  <span className="font-semibold text-foreground">
                    {revokeTarget?.type === 'single' ? revokeTarget.label : ''}
                  </span>
                  . Are you sure?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <Button variant="danger" onClick={handleConfirm} progress={pending}>
              {revokeTarget?.type === 'all' ? 'Revoke All' : 'Revoke'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}
