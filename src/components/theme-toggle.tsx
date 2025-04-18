'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
    >
      {theme === 'light' ? (
        <Icons.moon className="h-5 w-5" />
      ) : (
        <Icons.sun className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 