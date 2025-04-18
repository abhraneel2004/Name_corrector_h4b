'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'firebase/auth';

interface NavBarProps {
  user: User | null;
  onSignOut: () => void;
  title?: string;
  subtitle?: string;
}

export function NavBar({ 
  user, 
  onSignOut, 
  title = "Indian Name Corrector", 
  subtitle = "Clean and validate Indian names" 
}: NavBarProps) {
  if (!user) return null;

  return (
    <header className="bg-card border-b border-border p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Icons.file className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:inline-block">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-end mr-2 hidden sm:flex">
          <span className="text-sm font-medium">
            {user.displayName || (user.email ? user.email.split('@')[0] : 'Guest User')}
          </span>
          <span className="text-xs text-muted-foreground">
            {user.isAnonymous ? 'Guest' : (user.email || '')}
          </span>
        </div>
        <Avatar>
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User Avatar"} />
          <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
        </Avatar>
        <Button onClick={onSignOut} variant="outline">Sign Out</Button>
      </div>
    </header>
  );
} 