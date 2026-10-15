'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'firebase/auth';
import Link from 'next/link';

interface NavBarProps {
  user: User | null;
  onSignOut: () => void;
  title?: string;
  subtitle?: string;
}

export function NavBar({
  user,
  onSignOut,
  title = "Records Audit Console",
  subtitle = ""
}: NavBarProps) {
  if (!user) return null;

  const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Guest User');

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/app" className="shrink-0">
            <img src="/long_logo.png" alt="Logo" className="h-8 w-auto" />
          </Link>
          <div className="hidden h-6 w-px bg-border md:block" />
          <div className="hidden min-w-0 md:block">
            <div className="truncate text-[13px] font-semibold leading-tight">{title}</div>
            {subtitle && (
              <div className="truncate text-[11px] leading-tight text-muted-foreground">{subtitle}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-sm border px-2 py-1 text-[11px] text-muted-foreground lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Secure session
          </div>
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-[13px] font-medium leading-tight">{displayName}</span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              {user.isAnonymous ? 'Guest access' : (user.email || '')}
            </span>
          </div>
          <Avatar className="h-8 w-8 rounded-sm">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User Avatar"} />
            <AvatarFallback className="rounded-sm bg-secondary text-xs font-medium">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <Button onClick={onSignOut} variant="outline" size="sm">
            <Icons.logOut />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
