'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Left side decorative panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/5 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Icons.file className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-6">Indian Name Corrector</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Clean and validate Indian names in your datasets with AI-powered suggestions.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Icons.check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Cultural Awareness</h3>
                <p className="text-sm text-muted-foreground">Respects the cultural integrity of Indian names</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Icons.check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Smart Corrections</h3>
                <p className="text-sm text-muted-foreground">AI-powered suggestions with explanations</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Icons.check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Batch Processing</h3>
                <p className="text-sm text-muted-foreground">Upload and correct thousands of names at once</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side 404 content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center md:hidden mb-6">
              <Icons.file className="h-12 w-12 text-primary" />
            </div>
            <div className="flex justify-center">
              <div className="text-9xl font-bold text-primary opacity-80">404</div>
            </div>
            <CardTitle className="text-3xl font-bold text-center mt-6">Page Not Found</CardTitle>
            <CardDescription className="text-center">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => router.push('/')}
              className="w-full md:w-auto"
            >
              <Icons.home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-xs text-center text-muted-foreground">
              If you believe this is an error, please contact support.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 