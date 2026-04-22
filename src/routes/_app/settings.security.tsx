import { useState } from 'react';
import { Heading } from '@/components/selia/heading';
import { Text } from '@/components/selia/text';
import { Divider } from '@/components/selia/divider';
import { createFileRoute } from '@tanstack/react-router';
import { pageTitle } from '@/lib/utils';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { SetPasswordForm } from '@/components/settings/set-password-form';
import { EnableTwoFactorForm } from '@/components/settings/enable-two-factor-form';
import { DisableTwoFactorForm } from '@/components/settings/disable-two-factor-form';
import { listUserAccounts, listSessions } from '@/functions/auth';
import { SessionsList } from '@/components/settings/sessions-list';

export const Route = createFileRoute('/_app/settings/security')({
  head: () => ({
    meta: [{ title: pageTitle('Security') }],
  }),
  loader: async ({ context }) => {
    const user = context.session?.user || null;
    const currentSessionId = context.session?.session?.id || '';
    const [accounts, sessions] = await Promise.all([
      listUserAccounts(),
      listSessions(),
    ]);
    const hasPassword =
      accounts?.some((account) => account.providerId === 'credential') ?? false;

    return { user, hasPassword, sessions: sessions ?? [], currentSessionId };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user, hasPassword, sessions, currentSessionId } =
    Route.useLoaderData();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    () => user?.twoFactorEnabled ?? false,
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Heading level={2} size="sm">
            Password
          </Heading>
          <Text className="text-muted mt-1">Manage your password.</Text>
          {!hasPassword && (
            <Text className="text-muted mt-2 text-sm">
              Setting a password will also allow you to enable two-factor
              authentication.
            </Text>
          )}
        </div>
        <div>
          {hasPassword ? (
            <ChangePasswordForm />
          ) : (
            <SetPasswordForm email={user?.email || ''} />
          )}
        </div>
      </div>
      {hasPassword && (
        <>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Heading level={2} size="sm">
                Two-Factor Authentication
              </Heading>
              <Text className="text-muted mt-1">
                Add an extra layer of security to your account by requiring a
                code from your authenticator app when signing in.
              </Text>
            </div>
            <div>
              {twoFactorEnabled ? (
                <DisableTwoFactorForm
                  onSuccess={() => setTwoFactorEnabled(false)}
                />
              ) : (
                <EnableTwoFactorForm
                  onSuccess={() => setTwoFactorEnabled(true)}
                />
              )}
            </div>
          </div>
        </>
      )}
      <Divider />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Heading level={2} size="sm">
            Active Sessions
          </Heading>
          <Text className="text-muted mt-1">
            Manage your active sessions. You can revoke any session to sign out
            from that device.
          </Text>
        </div>
        <div>
          <SessionsList
            sessions={sessions}
            currentSessionId={currentSessionId}
          />
        </div>
      </div>
    </div>
  );
}
