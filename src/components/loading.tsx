import { Icons } from '@/components/icons';

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="relative">
        <div className="absolute -inset-4 bg-white rounded-2xl shadow-neu"></div>
        <div className="relative bg-white rounded-xl p-8 shadow-neu-inner">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-white rounded-full shadow-neu"></div>
              <div className="relative bg-white rounded-full p-4 shadow-neu-inner">
                <Icons.spinner className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            </div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 