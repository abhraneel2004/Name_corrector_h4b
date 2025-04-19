import './globals.css';
import { FontProvider } from '@/components/font-provider';
import { ClientWrapper } from '@/components/client-wrapper';
import { Footer } from '@/components/footer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="min-h-screen">
        <ClientWrapper>
          <FontProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow flex flex-col">
                {children}
              </div>
              <Footer />
            </div>
          </FontProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}
