'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { PasswordChecklist } from '@/components/password-checklist';
import { STRENGTH_REQUIREMENTS_MESSAGE, passwordMeetsPolicy } from '@/lib/password-policy';

// Handles the links in Firebase's account emails once the console's action URL is set to <site>/reset-password.
// Firebase sends every email action here, so this covers password resets (?mode=resetPassword&oobCode=...)
// and email verification (?mode=verifyEmail&oobCode=...).
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [state, setState] = useState<'checking' | 'ready' | 'invalid' | 'done' | 'verified'>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      applyActionCode(auth, oobCode)
        .then(async () => {
          // If this browser is signed in, refresh so the console sees the verified address
          if (auth.currentUser) {
            await auth.currentUser.reload();
            await auth.currentUser.getIdToken(true);
          }
          setState('verified');
        })
        .catch(() => setState('invalid'));
      return;
    }
    if (mode !== 'resetPassword' || !oobCode) {
      setState('invalid');
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((accountEmail) => {
        setEmail(accountEmail);
        setState('ready');
      })
      .catch(() => setState('invalid'));
  }, [mode, oobCode]);

  const savePassword = async () => {
    setError(null);
    if (!passwordMeetsPolicy(password)) {
      setError(STRENGTH_REQUIREMENTS_MESSAGE);
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await confirmPasswordReset(auth, oobCode!, password);
      setState('done');
    } catch (err: any) {
      switch (err?.code) {
        case 'auth/expired-action-code':
        case 'auth/invalid-action-code':
          setState('invalid');
          break;
        case 'auth/weak-password':
        case 'auth/password-does-not-meet-requirements':
          setError(STRENGTH_REQUIREMENTS_MESSAGE);
          break;
        case 'auth/network-request-failed':
          setError('Network error. Check your connection and try again.');
          break;
        default:
          setError('The password could not be changed. Try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (state === 'checking') {
    return (
      <AuthShell eyebrow={mode === 'verifyEmail' ? 'Email verification' : 'Account recovery'} title="Checking your link">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icons.spinner className="h-4 w-4 animate-spin text-primary" />
          Verifying…
        </div>
      </AuthShell>
    );
  }

  if (state === 'verified') {
    return (
      <AuthShell
        eyebrow="Email verification"
        title="Email address verified"
        description="Your account is active. Continue to the console on a desktop computer."
      >
        <Button asChild className="w-full">
          <Link href="/app">Continue to the console</Link>
        </Button>
      </AuthShell>
    );
  }

  if (state === 'invalid' && mode === 'verifyEmail') {
    return (
      <AuthShell
        eyebrow="Email verification"
        title="This link has expired"
        description="Verification links work once and expire after a while. Sign in to request a new verification email."
      >
        <Button asChild className="w-full">
          <Link href="/app">Sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  if (state === 'invalid') {
    return (
      <AuthShell
        eyebrow="Account recovery"
        title="This link has expired"
        description="Password reset links work once and expire after an hour. Request a new link to continue."
      >
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/signin">Back to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (state === 'done') {
    return (
      <AuthShell
        eyebrow="Account recovery"
        title="Password updated"
        description={
          <>
            The password for <span className="font-medium text-foreground">{email}</span> has been changed. Sign in
            with your new password.
          </>
        }
      >
        <Button asChild className="w-full">
          <Link href={`/signin?email=${encodeURIComponent(email)}`}>Sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description={
        <>
          For <span className="font-medium text-foreground">{email}</span>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          savePassword();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Icons.eye className="h-4 w-4" /> : <Icons.eyeOff className="h-4 w-4" />}
              <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
            </Button>
          </div>
          <PasswordChecklist password={password} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <>
              <Icons.spinner className="animate-spin" />
              Saving…
            </>
          ) : (
            'Update password'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
