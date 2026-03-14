import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import {
  Alert,
  AlertDescription,
  AlertAction,
  AlertTitle,
} from '@/components/selia/alert';
import { Button } from '@/components/selia/button';
import { toastManager } from '@/components/selia/toast';

export function EmailVerificationBanner() {
  const { data: session } = authClient.useSession();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!session?.user || session.user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0) return;

    setSending(true);
    const { error } = await authClient.sendVerificationEmail({
      email: session.user.email,
      callbackURL: '/dashboard',
    });
    setSending(false);

    if (error) {
      toastManager.add({
        title: 'Error',
        description: error.message || 'Failed to send verification email.',
        type: 'danger',
      });
      return;
    }

    setCooldown(60);
    toastManager.add({
      title: 'Email Sent',
      description: 'Verification email has been sent. Please check your inbox.',
      type: 'success',
    });
  };

  return (
    <Alert variant="warning" className="mb-6">
      <Mail />
      <AlertTitle>Verify Your Email</AlertTitle>
      <AlertDescription>
        Please verify your email address ({session.user.email}). Check your
        inbox for the verification link.
      </AlertDescription>
      <AlertAction>
        <Button
          variant="outline"
          size="sm"
          progress={sending}
          disabled={cooldown > 0}
          onClick={handleResend}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
        </Button>
      </AlertAction>
    </Alert>
  );
}
