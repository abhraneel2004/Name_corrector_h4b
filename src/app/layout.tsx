import './globals.css';
import { FontProvider } from '@/components/font-provider';
import { ClientWrapper } from '@/components/client-wrapper';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ClientWrapper>
          <FontProvider>
            {children}
          </FontProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}
