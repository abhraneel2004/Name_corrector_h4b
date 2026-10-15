'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Footer } from '@/components/footer';

export default function NotFound() {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-24">
        <div className="w-full max-w-md">
          <img src="/long_logo.png" alt="Logo" className="h-9 w-auto" />
          <div className="mt-10 border-t pt-8">
            <p className="eyebrow">Error 404</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight">Page not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The page you requested does not exist or has been moved. If you believe this is an error, contact support.
            </p>
            <Button onClick={() => router.push('/app')} className="mt-6">
              <Icons.home />
              Return to dashboard
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
