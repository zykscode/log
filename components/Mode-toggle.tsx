'use client';

import { useTheme } from 'next-themes';

import { Icons } from './Icons';
import { Button } from './ui/button';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="flex h-8 w-8 items-center justify-center rounded-full md:h-12 md:w-12"
      aria-label="Toggle theme"
    >
      <Icons.sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 md:h-6 md:w-6" />
      <Icons.moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 md:h-6 md:w-6" />
    </Button>
  );
}
