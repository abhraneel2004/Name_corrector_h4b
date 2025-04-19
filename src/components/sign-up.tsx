'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from '@/lib/auth-utils';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password should be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Success',
        description: 'Account created successfully!',
        variant: 'success',
      });
      router.push('/');
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
      router.push('/');
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

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await signInAnonymously();
      toast({
        title: 'Success',
        description: 'Signed in as guest!',
        variant: 'success',
      });
      router.push('/');
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
    <div className="flex bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Left side decorative panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/5 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Icons.file className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-6">Indian Name Corrector</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Join us and start cleaning your datasets with AI-powered name validation.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Icons.check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Secure Cloud Storage</h3>
                <p className="text-sm text-muted-foreground">Your data is securely stored and accessible anywhere</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Icons.check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Easy Data Management</h3>
                <p className="text-sm text-muted-foreground">Upload, manage, and export your datasets seamlessly</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Icons.check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground">Get detailed insights and reports on your data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side sign up form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center md:hidden mb-6">
              <Icons.file className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Sign up to get started with Indian Name Corrector
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignUp} className="space-y-4">
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
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
              <Button
                variant="outline"
                onClick={handleAnonymousSignIn}
                disabled={loading}
                className="w-full"
              >
                <Icons.user className="mr-2 h-4 w-4" />
                Continue as Guest
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => router.push('/signin')}
              >
                Sign in
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 