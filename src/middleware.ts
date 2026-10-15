import { NextResponse, userAgent, type NextRequest } from 'next/server';
import { MOBILE_ALLOWED_PATHS } from '@/lib/device-policy';

// The console is desktop-only; phones and tablets get the block page
const BLOCKED_DEVICE_TYPES = new Set(['mobile', 'tablet', 'wearable']);
const BLOCK_PAGE = '/unsupported-device';

export function middleware(request: NextRequest) {
  if (MOBILE_ALLOWED_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const { device } = userAgent(request);
  const blocked = device.type !== undefined && BLOCKED_DEVICE_TYPES.has(device.type);
  const onBlockPage = request.nextUrl.pathname === BLOCK_PAGE;

  if (blocked && !onBlockPage) {
    // Rewrite rather than redirect, so the address bar keeps the requested URL
    return NextResponse.rewrite(new URL(BLOCK_PAGE, request.url));
  }
  if (!blocked && onBlockPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Pages only: skip API routes, Next.js assets and static files such as the logos
  matcher: ['/((?!api/|_next/static|_next/image|.*\\.\\w+$).*)'],
};
