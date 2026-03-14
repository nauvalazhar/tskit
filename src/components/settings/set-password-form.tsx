import { useState } from 'react';
import { Text } from '@/components/selia/text';
import { Button } from '@/components/selia/button';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';

export function SetPasswordForm({ email }: { email: string }) {
  const [pending, setPending] = useState(false);

  const handleSendResetEmail = async () => {
    setPending(true);

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    });

    if (error) {
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to send setup email.',
        type: 'error',
      });
    } else {
      toastManager.add({
        title: 'Email Sent',
        description: 'Check your email for a password setup link.',
        type: 'success',
      });
    }

    setPending(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Text className="text-muted">
        You signed in with a social provider. To enable email login, we'll send
        a password setup link to your email.
      </Text>
      <Button
        variant="primary"
        onClick={handleSendResetEmail}
        progress={pending}
      >
        Send Password Setup Email
      </Button>
    </div>
  );
}
