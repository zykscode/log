'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useMenu } from './MenuContext';
import type { Chrome } from './types';

function MenuToggle() {
  const { isOpen, toggle } = useMenu();
  const line = {
    fill: 'transparent',
    strokeWidth: 1.4,
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
  };
  return (
    <button
      type="button"
      onClick={() => {
        if (!isOpen) window.scrollTo({ top: 0, behavior: 'smooth' });
        toggle();
      }}
      aria-expanded={isOpen}
      aria-controls="site-menu"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className="flex w-14 items-center justify-center rounded-full md:w-20"
    >
      <svg className="w-full" viewBox="0 0 48 48" aria-hidden>
        <motion.path
          {...line}
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          transition={{ duration: 0.6 }}
          variants={{
            closed: { d: 'M 10 21 L 46 21' },
            open: { d: 'M 24 10 L 24 38' },
          }}
        />
        <motion.path
          {...line}
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          transition={{ duration: 0.6 }}
          variants={{
            closed: { d: 'M 2 27 L 40 27' },
            open: { d: 'M 10 24 L 38 24' },
          }}
        />
      </svg>
    </button>
  );
}

export function Header({ chrome }: { chrome: Chrome }) {
  const { isOpen, openSearch } = useMenu();
  const pathname = usePathname();
  const links = chrome.navItems.filter((n) => n.inHeader).slice(0, 5);

  return (
    <header className="sticky top-0 z-40 -mx-3 flex h-16 items-center justify-between bg-canvas/80 px-3 backdrop-blur-md backdrop-saturate-150 md:-mx-4 md:h-20 md:px-4">
      <Link
        href="/"
        className="group flex items-center gap-3 rounded-full pr-2"
        aria-label={`${chrome.siteName} — home`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={chrome.avatarUrl}
          alt=""
          width={48}
          height={48}
          className="size-9 rounded-full bg-moss object-cover ring-1 ring-fg/10 transition-transform duration-300 group-hover:rotate-[-8deg] md:size-12"
        />
        <span className="hidden text-[0.95rem] font-medium md:block">
          {chrome.wordmark}
        </span>
      </Link>

      <nav aria-label="Main" className="flex items-center gap-1 md:gap-2">
        <ul
          className={cn(
            'mr-4 hidden items-center gap-8 transition-opacity lg:flex xl:gap-12',
            isOpen && 'opacity-0',
          )}
        >
          {links.map((item, i) => {
            const active =
              pathname === item.url ||
              (item.url !== '/' && pathname.startsWith(`${item.url}/`));
            return (
              <motion.li
                key={item.url}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
              >
                <Link
                  href={item.url}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative py-2 text-[0.8rem] font-medium uppercase tracking-[0.08em]',
                    active ? 'text-fg' : 'text-fg/75 hover:text-fg',
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100',
                      active && 'scale-x-100',
                    )}
                  />
                </Link>
              </motion.li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={openSearch}
          className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-fg/75 transition-colors hover:bg-fg/10 hover:text-fg"
          aria-label="Search (⌘K)"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-[1.15rem]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" strokeLinecap="round" />
          </svg>
          <kbd className="hidden rounded border border-line px-1.5 font-sans text-[0.7rem] text-faint md:inline">
            ⌘K
          </kbd>
        </button>
        <MenuToggle />
      </nav>
    </header>
  );
}
