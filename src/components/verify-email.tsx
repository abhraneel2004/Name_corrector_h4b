'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { sendVerificationEmail } from '@/lib/auth-email';

const RESEND_COOLDOWN_SECONDS = 60;

// Shown instead of the console until the account's email address is verified
export function VerifyEmail({
  user,
  onVerified,
  onSignOut,
}: {
  user: User;
  onVerified: () => void;
  onSignOut: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ text: string; tone: 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const checkVerified = async () => {
    setChecking(true);
    setMessage(null);
    try {
      await user.reload();
      if (user.emailVerified) {
        // Refresh the ID token so the server and Firestore see the verified claim
        await user.getIdToken(true);
        onVerified();
      } else {
        setMessage({ text: 'Your email is not verified yet. Open the link in the email, then try again.', tone: 'info' });
      }
    } catch {
      setMessage({ text: 'Could not check your verification status. Try again.', tone: 'error' });
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    setSending(true);
    setMessage(null);
    try {
      await sendVerificationEmail(user);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setMessage({ text: 'A new verification email is on its way.', tone: 'info' });
    } catch (err: any) {
      setMessage({
        text:
          err?.code === 'auth/too-many-requests'
            ? 'Too many emails requested. Wait a few minutes and try again.'
            : 'The email could not be sent. Try again later.',
        tone: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Verify your email"
      title="Confirm your email address"
      description={
        <>
          We sent a verification link to <span className="font-medium text-foreground">{user.email}</span>. Open it
          to activate your account, then continue to the console.
        </>
      }
    >
      <div className="space-y-3">
        {message && (
          <p role="status" className={message.tone === 'error' ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
            {message.text}
          </p>
        )}
        <Button type="button" className="w-full" onClick={checkVerified} disabled={checking}>
          {checking ? (
            <>
              <Icons.spinner className="animate-spin" />
              Checking…
            </>
          ) : (
            'I have verified my email'
          )}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={resend} disabled={sending || cooldown > 0}>
          {sending ? 'Sending…' : cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend verification email'}
        </Button>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full pt-1 text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Sign out and use a different account
        </button>
      </div>
    </AuthShell>
  );
}
