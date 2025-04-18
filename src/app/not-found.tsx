'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="absolute -inset-4 bg-white rounded-2xl shadow-neu"></div>
          <div className="relative bg-white rounded-xl p-8 shadow-neu-inner">
            <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-6">Page Not Found</h2>
            <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-neu hover:shadow-neu-inner transition-all duration-300"
            >
              <Icons.home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 