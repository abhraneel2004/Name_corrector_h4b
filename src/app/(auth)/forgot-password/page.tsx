'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';

const RESEND_COOLDOWN_SECONDS = 30;

// Returns null when the request should be treated as sent
function resetRequestErrorMessage(code: string): string | null {
  switch (code) {
    // Never reveal whether an account exists for an email address
    case 'auth/user-not-found':
      return null;
    case 'auth/invalid-email':
    case 'auth/missing-email':
      return 'Enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many requests. Wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'The reset email could not be sent. Try again later.';
  }
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const markSent = () => {
    setSent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const sendResetEmail = async () => {
    setSending(true);
    setError(null);
    const address = email.trim();

    try {
      try {
        // Bring the officer back to sign-in after resetting (the domain must be authorised in Firebase)
        await sendPasswordResetEmail(auth, address, { url: `${window.location.origin}/signin` });
      } catch (err: any) {
        if (err?.code !== 'auth/unauthorized-continue-uri' && err?.code !== 'auth/invalid-continue-uri') throw err;
        await sendPasswordResetEmail(auth, address);
      }
      markSent();
    } catch (err: any) {
      const message = resetRequestErrorMessage(err?.code ?? '');
      if (message === null) {
        markSent();
      } else {
        setError(message);
      }
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        eyebrow="Account recovery"
        title="Check your email"
        description={
          <>
            If an account exists for <span className="font-medium text-foreground">{email.trim()}</span>, we have
            sent it a link to choose a new password. The link expires in one hour.
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder, or send the email again.
          </p>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={sendResetEmail}
            disabled={sending || cooldown > 0}
          >
            {sending ? (
              <>
                <Icons.spinner className="animate-spin" />
                Sending…
              </>
            ) : cooldown > 0 ? (
              `Resend email in ${cooldown}s`
            ) : (
              'Resend email'
            )}
          </Button>
          <Button asChild className="w-full">
            <Link href="/signin">Back to sign in</Link>
          </Button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
            className="w-full pt-1 text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Use a different email address
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter the email address you sign in with. We will send you a link to choose a new password."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendResetEmail();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'email-error' : undefined}
          />
          {error && (
            <p id="email-error" role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? (
            <>
              <Icons.spinner className="animate-spin" />
              Sending…
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Remembered it?{' '}
          <Link href="/signin" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
