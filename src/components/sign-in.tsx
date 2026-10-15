'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Prefill the email when returning from a password reset (?email=...)
  useEffect(() => {
    const prefill = new URLSearchParams(window.location.search).get('email');
    if (prefill) setEmail(prefill);
  }, []);

  // Check if user is already signed in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/app');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Success',
        description: 'Signed in successfully!',
        variant: 'success',
      });
      router.push('/app');
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.code === 'auth/password-does-not-meet-requirements'
            ? 'Your password no longer meets the security policy. Use "Forgot password?" to set a new one.'
            : error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: 'Success',
        description: 'Signed in with Google successfully!',
        variant: 'success',
      });
      router.push('/app');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 bg-background">
      {/* Left side decorative panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center border-r bg-card p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center space-x-3">
            <Link href="/" className="rounded-md">
              <img src="/long_logo.png" alt="Logo" className="h-12 w-auto" />
            </Link>
          </div>
          <p className="eyebrow mt-10">Records Audit Console</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Accurate case records, verified at source.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Audit and standardise names across police case files with AI-assisted review.</p>
          <div className="mt-10 grid grid-cols-1 gap-5 border-t pt-8 text-left">
            <div className="flex items-start space-x-4">
              <div className="rounded-sm border bg-background p-1.5">
                <Icons.check className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <h3 className="text-[13px] font-medium">Cultural Awareness</h3>
                <p className="text-xs text-muted-foreground">Respects the cultural integrity of Indian names</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="rounded-sm border bg-background p-1.5">
                <Icons.check className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <h3 className="text-[13px] font-medium">Smart Corrections</h3>
                <p className="text-xs text-muted-foreground">AI-powered suggestions with explanations</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="rounded-sm border bg-background p-1.5">
                <Icons.check className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <h3 className="text-[13px] font-medium">Batch Processing</h3>
                <p className="text-xs text-muted-foreground">Upload and correct thousands of names at once</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side sign in form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1.5">
            <div className="flex md:hidden mb-4">
              <img src="/long_logo.png" alt="Logo" className="h-9 w-auto" />
            </div>
            <CardTitle className="text-lg font-semibold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() =>
                      router.push(email ? `/forgot-password?email=${encodeURIComponent(email)}` : '/forgot-password')
                    }
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Icons.eye className="h-4 w-4" />
                    ) : (
                      <Icons.eyeOff className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-card text-[11px] tracking-[0.08em] text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => router.push('/signup')}
              >
                Sign up
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 