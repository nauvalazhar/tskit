import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/selia/button';
import { Input } from '@/components/selia/input';
import { Field, FieldError, FieldLabel } from '@/components/selia/field';
import { Form } from '@/components/selia/form';
import { Text } from '@/components/selia/text';
import { Heading } from '@/components/selia/heading';
import { authClient } from '@/lib/auth-client';
import { toastManager } from '@/components/selia/toast';
import { Copy, Check } from 'lucide-react';

type Step = 'password' | 'qr' | 'verify';

export function EnableTwoFactorForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<Step>('password');
  const [pending, setPending] = useState(false);
  const [totpURI, setTotpURI] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const passwordForm = useForm({
    defaultValues: { password: '' },
    onSubmit: async ({ value }) => {
      setPending(true);

      const { data, error } = await authClient.twoFactor.enable({
        password: value.password,
      });

      setPending(false);

      if (error) {
        toastManager.add({
          title: 'Error',
          description: error.message || 'Failed to enable 2FA.',
          type: 'error',
        });
        return;
      }

      setTotpURI(data.totpURI);
      setBackupCodes(data.backupCodes);
      setStep('qr');
    },
  });

  const verifyForm = useForm({
    defaultValues: { code: '' },
    onSubmit: async ({ value }) => {
      setPending(true);

      const { error } = await authClient.twoFactor.verifyTotp({
        code: value.code,
      });

      setPending(false);

      if (error) {
        toastManager.add({
          title: 'Invalid Code',
          description: error.message || 'The code you entered is incorrect.',
          type: 'error',
        });
        return;
      }

      toastManager.add({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled.',
        type: 'success',
      });

      onSuccess();
    },
  });

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'password') {
    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          passwordForm.handleSubmit();
        }}
      >
        <Text className="text-muted mb-2">
          Enter your password to begin setting up two-factor authentication.
        </Text>
        <passwordForm.Field
          name="password"
          validators={{
            onSubmit: ({ value }) =>
              !value ? 'Password is required' : undefined,
            onChange: ({ value }) =>
              !value ? 'Password is required' : undefined,
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor="2fa-password">Password</FieldLabel>
              <Input
                id="2fa-password"
                type="password"
                placeholder="Enter your password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.map((err, i) => (
                <FieldError key={i}>{err}</FieldError>
              ))}
            </Field>
          )}
        </passwordForm.Field>
        <Button variant="primary" progress={pending} type="submit">
          Enable 2FA
        </Button>
      </Form>
    );
  }

  if (step === 'qr') {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <Text className="text-muted">
            Scan this QR code with your authenticator app (Google Authenticator,
            Authy, 1Password, etc.)
          </Text>
        </div>
        <div className="flex justify-center rounded-lg bg-white p-4">
          <QRCodeSVG value={totpURI} size={200} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Heading level={4} size="sm">
              Backup Codes
            </Heading>
            <Button
              type="button"
              variant="plain"
              size="sm"
              onClick={handleCopyBackupCodes}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <Text className="text-muted text-sm mb-2">
            Save these codes in a safe place. You can use them to sign in if you
            lose access to your authenticator app.
          </Text>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-tertiary/5 p-3 font-mono text-sm">
            {backupCodes.map((code) => (
              <span key={code}>{code}</span>
            ))}
          </div>
        </div>
        <Button variant="primary" onClick={() => setStep('verify')}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        verifyForm.handleSubmit();
      }}
    >
      <Text className="text-muted mb-2">
        Enter the 6-digit code from your authenticator app to verify the setup.
      </Text>
      <verifyForm.Field
        name="code"
        validators={{
          onSubmit: ({ value }) => {
            if (!value) return 'Code is required';
            if (!/^[0-9]{6}$/.test(value)) return 'Enter a 6-digit code';
            return undefined;
          },
          onChange: ({ value }) => {
            if (!value) return 'Code is required';
            if (!/^[0-9]{6}$/.test(value)) return 'Enter a 6-digit code';
            return undefined;
          },
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor="totp-code">Verification Code</FieldLabel>
            <Input
              id="totp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              autoComplete="one-time-code"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((err, i) => (
              <FieldError key={i}>{err}</FieldError>
            ))}
          </Field>
        )}
      </verifyForm.Field>
      <Button variant="primary" progress={pending} type="submit">
        Verify & Activate
      </Button>
    </Form>
  );
}
