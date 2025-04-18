'use client';

import {Geist, Geist_Mono} from 'next/font/google';
import { GlobalStyles } from '@/components/global-styles';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <GlobalStyles geistSans={geistSans} geistMono={geistMono} />
      {children}
    </div>
  );
} 