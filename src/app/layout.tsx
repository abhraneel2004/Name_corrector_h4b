import type { Metadata } from 'next';
import './globals.css';
import { FontProvider } from '@/components/font-provider';
import { ClientWrapper } from '@/components/client-wrapper';
import { DeviceGate } from '@/components/device-gate';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Records Audit Console',
  description: 'Audit, correct and analyse police case records',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning={true} className="min-h-screen bg-background">
        <ClientWrapper>
          <FontProvider>
            <DeviceGate>
              <div className="flex flex-col min-h-screen">
                {children}
              </div>
            </DeviceGate>
            {/* One toaster for every page, including sign-in and sign-up */}
            <Toaster />
          </FontProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}
