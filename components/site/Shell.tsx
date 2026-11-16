import Link from 'next/link';

import AnimatedBackground from './AnimatedBackground';
import { AuthorBar } from './AuthorBar';
import { CommandPalette } from './CommandPalette';
import { Footer } from './Footer';
import { Header } from './Header';
import { Main } from './Main';
import { MenuOverlay } from './MenuOverlay';
import type { Chrome } from './types';

/**
 * Page frame: header on the canvas, content inside the rounded dotted panel
 * (with the animated ZYK trails), footer below — the original layout.
 */
export function Shell({
  chrome,
  menuPages,
  children,
}: {
  chrome: Chrome;
  menuPages: { label: string; url: string }[];
  children: React.ReactNode;
}) {
  const announcement = chrome.announcement;
  return (
    <div className="flex min-h-dvh flex-col px-3 md:px-4">
      <a
        href="#content"
        className="sr-only z-[60] rounded-full bg-fg px-4 py-2 text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {announcement?.enabled && announcement.text && (
        <div className="-mx-3 bg-ember px-4 py-2 text-center text-sm text-white md:-mx-4">
          {announcement.url ? (
            <Link
              href={announcement.url}
              className="underline-offset-4 hover:underline"
            >
              {announcement.text} →
            </Link>
          ) : (
            announcement.text
          )}
        </div>
      )}
      <Header chrome={chrome} />
      <div className="dot-grid relative isolate flex flex-1 flex-col rounded-2xl bg-panel">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        >
          <div className="sticky top-0 h-dvh w-full">
            <AnimatedBackground speed={1.5} opacity={0.35} />
          </div>
        </div>
        <MenuOverlay chrome={chrome} extraLinks={menuPages} />
        <Main>{children}</Main>
      </div>
      <Footer chrome={chrome} />
      <CommandPalette navItems={chrome.navItems} />
      <AuthorBar />
    </div>
  );
}
