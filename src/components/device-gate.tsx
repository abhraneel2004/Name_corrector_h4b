'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { UnsupportedDevice } from '@/components/unsupported-device';
import { MOBILE_ALLOWED_PATHS } from '@/lib/device-policy';

// Catches phones and tablets the server-side user-agent check misses,
// e.g. iPads (Safari reports a Mac user agent) and tablets in "desktop site" mode
function isMobileOrTablet(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (nav.userAgentData?.mobile) return true;

  // iPadOS reports "Macintosh", but real Macs have no touch points
  if (/Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1) return true;

  // A touch screen is the only pointer: no mouse or trackpad (touch laptops still pass)
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const anyFinePointer = window.matchMedia('(any-pointer: fine)').matches;
  return coarsePointer && !anyFinePointer;
}

export function DeviceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(!MOBILE_ALLOWED_PATHS.includes(pathname) && isMobileOrTablet());
  }, [pathname]);

  if (blocked) return <UnsupportedDevice />;
  return <>{children}</>;
}
